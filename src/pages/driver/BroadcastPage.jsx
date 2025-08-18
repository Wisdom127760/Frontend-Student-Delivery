import React, { useState, useEffect, useCallback } from 'react';
import {
    MegaphoneIcon,
    ClockIcon,
    MapPinIcon,
    UserIcon,
    PhoneIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    TruckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import socketService from '../../services/socketService';
import soundService from '../../services/soundService';
import { useToast } from '../../components/common/ToastProvider';

import { formatCurrency } from '../../services/systemSettings';
import BroadcastSkeleton from '../../components/common/BroadcastSkeleton';
import { useDeliveryBroadcast } from '../../components/driver/DeliveryBroadcastProvider';

const BroadcastPage = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();
    const { testModal } = useDeliveryBroadcast();
    const [broadcasts, setBroadcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [accepting, setAccepting] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [isOnline, setIsOnline] = useState(true);
    const [locationError, setLocationError] = useState(null);
    const [locationPermission, setLocationPermission] = useState('prompt');
    const [locationResolved, setLocationResolved] = useState(false);

    // Location handling with retry limits - COMPLETELY REWRITTEN
    const getLocation = useCallback(() => {
        // If we've already resolved location, don't try again
        if (locationResolved) {
            return Promise.resolve({ lat: 35.1255, lng: 33.3095 });
        }

        return new Promise((resolve) => {
            // Check if geolocation is supported
            if (!navigator.geolocation) {
                console.log('📍 Geolocation not supported, using default coordinates');
                setLocationResolved(true);
                setLocationError('Location services not supported by your browser');
                resolve({ lat: 35.1255, lng: 33.3095 });
                return;
            }

            // Check if we're in a browser environment that supports geolocation
            if (typeof navigator === 'undefined' || !navigator.geolocation) {
                console.log('📍 Geolocation not available in this environment');
                setLocationResolved(true);
                setLocationError('Location services not available in this environment');
                resolve({ lat: 35.1255, lng: 33.3095 });
                return;
            }

            // Single location attempt with immediate fallback
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('📍 Location obtained successfully:', {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLocationResolved(true);
                    setLocationError(null);
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.log('📍 Location failed, using default coordinates:', error.message);
                    setLocationResolved(true);

                    // Handle CoreLocationProvider error specifically
                    let errorMessage = 'Using default location. Enable location services for better results.';

                    if (error.message.includes('CoreLocationProvider') || error.message.includes('kCLErrorLocationUnknown')) {
                        errorMessage = 'Location services unavailable. Using default coordinates.';
                        console.log('📍 CoreLocationProvider error detected - using default coordinates');
                    } else {
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = 'Location permission denied. Please enable location services.';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = 'Location unavailable. Using default coordinates.';
                                break;
                            case error.TIMEOUT:
                                errorMessage = 'Location request timed out. Using default coordinates.';
                                break;
                            default:
                                errorMessage = 'Location error occurred. Using default coordinates.';
                        }
                    }

                    setLocationError(errorMessage);
                    resolve({ lat: 35.1255, lng: 33.3095 }); // Use default immediately
                },
                {
                    enableHighAccuracy: false,
                    timeout: 3000, // Reduced timeout to 3 seconds
                    maximumAge: 600000 // 10 minutes cache
                }
            );
        });
    }, [locationResolved]);

    // Broadcast fetching
    const fetchBroadcasts = useCallback(async (location, silent = false) => {
        try {
            console.log('📡 Fetching broadcasts for location:', location);
            const response = await apiService.getActiveBroadcasts(location.lat, location.lng);

            if (response.success) {
                const broadcasts = response.data.broadcasts || [];
                console.log('📡 Received broadcasts:', broadcasts.length);

                // Transform backend data to match our frontend format
                const transformedBroadcasts = broadcasts.map(broadcast => ({
                    id: broadcast.deliveryId || broadcast._id,
                    deliveryId: broadcast.deliveryId || broadcast._id,
                    deliveryCode: broadcast.deliveryCode,
                    pickupLocation: broadcast.pickupLocation,
                    deliveryLocation: broadcast.deliveryLocation,
                    customerName: broadcast.customerName,
                    customerPhone: broadcast.customerPhone,
                    fee: broadcast.fee,
                    driverEarning: broadcast.driverEarning,
                    companyEarning: broadcast.companyEarning,
                    paymentMethod: broadcast.paymentMethod,
                    priority: broadcast.priority,
                    notes: broadcast.notes,
                    estimatedTime: broadcast.estimatedTime,
                    pickupCoordinates: broadcast.pickupCoordinates,
                    deliveryCoordinates: broadcast.deliveryCoordinates,
                    broadcastEndTime: broadcast.broadcastEndTime,
                    broadcastDuration: broadcast.broadcastDuration,
                    distance: broadcast.distance,
                    createdAt: broadcast.createdAt
                }));

                setBroadcasts(transformedBroadcasts);
            } else {
                console.log('📡 No broadcasts received or error:', response);
                setBroadcasts([]);
            }
        } catch (error) {
            console.error('📡 Error fetching broadcasts:', error);
            setBroadcasts([]);
            if (!silent) {
                showError('Failed to load available deliveries. Please try again.');
            }
        }
    }, [showError]);

    // Load available broadcasts
    const loadBroadcasts = useCallback(async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            // Get location (this will handle all retries internally)
            const location = await getLocation();
            setDriverLocation(location);

            // Location error is now handled in getLocation function
            // No need to set it here as it's already set appropriately

            console.log('📍 Using location:', location);

            // Fetch broadcasts with debouncing
            fetchBroadcasts(location, silent);

        } catch (error) {
            console.error('Error in loadBroadcasts:', error);
            if (!silent) {
                showError('Failed to load available deliveries');
            }
        } finally {
            if (!silent) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    }, [getLocation, fetchBroadcasts, showError]);

    // Accept a delivery broadcast
    const acceptBroadcast = async (deliveryId) => {
        try {
            setAccepting(deliveryId);

            const response = await apiService.acceptBroadcastDelivery(deliveryId);

            if (response.success) {
                showSuccess('Delivery accepted successfully!');

                // Remove the accepted delivery from the list
                setBroadcasts(prev => prev.filter(b => b.id !== deliveryId));

                // Play success sound
                soundService.playSound('success');

                // Navigate to driver's deliveries page
                setTimeout(() => {
                    window.location.href = '/driver/deliveries';
                }, 1500);
            } else {
                showError(response.message || 'Failed to accept delivery');
            }
        } catch (error) {
            console.error('Error accepting broadcast:', error);
            showError('Failed to accept delivery');
        } finally {
            setAccepting(null);
        }
    };



    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'urgent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'normal':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'low':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };



    // Socket.IO event listeners for real-time updates
    useEffect(() => {
        if (!user) return;

        const socket = socketService.getSocket();
        if (!socket || !socketService.isConnected()) {
            console.log('⚠️ BroadcastPage: Socket not available for real-time updates');
            return;
        }

        console.log('🔌 BroadcastPage: Setting up socket event listeners');

        // Listen for new delivery broadcasts
        const handleNewBroadcast = (data) => {
            console.log('📡 BroadcastPage: New broadcast received:', data);

            // Add new broadcast to the list
            setBroadcasts(prev => [data, ...prev]);

            // Play notification sound
            soundService.playSound('notification');

            // Show snackbar notification
            showSuccess(`New delivery available: ${data.pickupLocation} → ${data.deliveryLocation}`);
        };

        // Listen for broadcast removal (when accepted by another driver)
        const handleBroadcastRemoved = (data) => {
            console.log('📡 BroadcastPage: Broadcast removed:', data);

            // Remove the broadcast from the list
            setBroadcasts(prev => prev.filter(b => b.id !== data.deliveryId));

            // Show snackbar notification
            showSuccess('A delivery was accepted by another driver');
        };

        // Listen for broadcast expiration
        const handleBroadcastExpired = (data) => {
            console.log('📡 BroadcastPage: Broadcast expired:', data);

            // Remove the expired broadcast from the list
            setBroadcasts(prev => prev.filter(b => b.id !== data.deliveryId));

            // Show snackbar notification
            showSuccess('A delivery broadcast has expired');
        };

        // Set up event listeners
        socket.on('delivery-broadcast', handleNewBroadcast);
        socket.on('delivery-accepted-by-other', handleBroadcastRemoved);
        socket.on('broadcast-expired', handleBroadcastExpired);

        console.log('✅ BroadcastPage: Socket event listeners set up successfully');

        return () => {
            if (socket) {
                console.log('🧹 BroadcastPage: Cleaning up socket event listeners');
                socket.off('delivery-broadcast', handleNewBroadcast);
                socket.off('delivery-accepted-by-other', handleBroadcastRemoved);
                socket.off('broadcast-expired', handleBroadcastExpired);
            }
        };
    }, [user, showSuccess]);

    // Load initial data and set up auto-refresh
    useEffect(() => {
        loadBroadcasts();

        // Auto-refresh every 60 seconds (reduced frequency to avoid rate limiting)
        const interval = setInterval(() => {
            if (!loading) {
                loadBroadcasts(true);
            }
        }, 60000);

        return () => {
            clearInterval(interval);
        };
    }, [loadBroadcasts, loading]);

    // Request location permission
    const requestLocationPermission = async () => {
        try {
            setLocationError(null);
            setLocationPermission('requesting');
            setLocationResolved(false); // Reset location resolution

            const location = await getLocation();
            setDriverLocation(location);
            setLocationPermission('granted');
            setLocationError(null);
            console.log('📍 Location permission granted:', location);

            // Reload broadcasts with new location
            loadBroadcasts(true);
        } catch (error) {
            console.log('📍 Location permission denied:', error.message);
            setLocationPermission('denied');
            setLocationError('Location permission denied. Please enable location services.');
        }
    };

    // Check if driver is online and ensure socket connection
    useEffect(() => {
        const checkOnlineStatus = async () => {
            try {
                // First, ensure socket is connected
                if (user && !socketService.isConnected()) {
                    console.log('🔌 Attempting to connect socket for user:', user._id || user.id);
                    socketService.ensureInitialized(user._id || user.id, user.userType || user.role);
                }

                // Check API status
                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/driver/status`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const apiOnline = data.data?.isOnline || false;
                    const socketOnline = socketService.isConnected();

                    // Consider online if either API or socket is working
                    setIsOnline(apiOnline || socketOnline);

                    console.log('🔍 Online status check:', {
                        apiOnline,
                        socketOnline,
                        finalStatus: apiOnline || socketOnline
                    });
                } else {
                    // If API fails, check socket connection
                    const socketOnline = socketService.isConnected();
                    setIsOnline(socketOnline);
                    console.log('🔍 API failed, using socket status:', socketOnline);
                }
            } catch (error) {
                console.error('Error checking online status:', error);
                // Fallback to socket connection status
                const socketOnline = socketService.isConnected();
                setIsOnline(socketOnline);
                console.log('🔍 Error occurred, using socket status:', socketOnline);
            }
        };

        // Initial check
        checkOnlineStatus();

        // Check every 10 seconds
        const interval = setInterval(checkOnlineStatus, 10000);

        return () => clearInterval(interval);
    }, [user]);

    if (loading) {
        return <BroadcastSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
                    <div className="p-3 sm:p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <MegaphoneIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Available Deliveries</h1>
                                    <p className="text-sm sm:text-base text-gray-600">Accept deliveries near your location</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                {/* Online Status Indicator */}
                                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-xs sm:text-sm font-medium">
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>

                                </div>

                                <button
                                    onClick={() => loadBroadcasts(true)}
                                    disabled={refreshing}
                                    className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    <ArrowPathIcon className={`w-4 h-4 mr-1 sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                    {refreshing ? 'Refreshing...' : 'Refresh'}
                                </button>

                                {/* Test Modal Button */}
                                <button
                                    onClick={testModal}
                                    className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    🧪 Test Modal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-2">
                            <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            <span className="text-xs sm:text-sm text-blue-800">
                                {driverLocation ? (
                                    `Your location: ${driverLocation.lat.toFixed(4)}, ${driverLocation.lng.toFixed(4)}`
                                ) : (
                                    'Location not available'
                                )}
                            </span>
                        </div>

                        {locationError && (
                            <button
                                onClick={requestLocationPermission}
                                disabled={locationPermission === 'requesting'}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {locationPermission === 'requesting' ? 'Requesting...' : 'Enable Location'}
                            </button>
                        )}
                    </div>

                    {locationError && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                            ⚠️ {locationError}
                            {locationError.includes('CoreLocationProvider') && (
                                <div className="mt-1 text-xs">
                                    <strong>macOS/iOS Users:</strong> This is a known issue. Try:
                                    <ul className="mt-1 ml-4 list-disc">
                                        <li>Enable Location Services in System Preferences</li>
                                        <li>Grant location permission to your browser</li>
                                        <li>Try refreshing the page</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Broadcasts Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <BroadcastSkeleton key={i} />
                        ))}
                    </div>
                ) : broadcasts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <MegaphoneIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries available</h3>
                        <p className="text-gray-600 mb-4">There are currently no deliveries in your area.</p>
                        <button
                            onClick={() => loadBroadcasts(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <ArrowPathIcon className="w-4 h-4 mr-2" />
                            Refresh
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {broadcasts.map((broadcast) => (
                            <div key={broadcast._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 sm:p-4 text-white">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <TruckIcon className="w-5 h-5" />
                                            <span className="text-sm sm:text-base font-semibold">New Delivery</span>
                                        </div>
                                        <div className="flex items-center space-x-1 bg-white bg-opacity-20 px-2 py-1 rounded">
                                            <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="text-xs sm:text-sm font-medium">
                                                {broadcast.timeRemaining ? `${Math.floor(broadcast.timeRemaining / 60)}:${(broadcast.timeRemaining % 60).toString().padStart(2, '0')}` : '--:--'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-3 sm:p-4 space-y-3">
                                    {/* Delivery Code and Priority */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-mono text-xs sm:text-sm bg-gray-100 px-2 py-1 rounded">
                                                {broadcast.deliveryCode}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(broadcast.priority)}`}>
                                                {broadcast.priority}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg sm:text-xl font-bold text-green-600">
                                                {formatCurrency(broadcast.fee)}
                                            </div>
                                            {broadcast.driverEarning && (
                                                <div className="text-xs sm:text-sm text-blue-600 font-medium">
                                                    Your Earning: {formatCurrency(broadcast.driverEarning)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                            <span className="text-sm sm:text-base font-semibold text-gray-900">{broadcast.customerName}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <PhoneIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                            <span className="text-xs sm:text-sm text-gray-600">{broadcast.customerPhone}</span>
                                        </div>
                                    </div>

                                    {/* Locations */}
                                    <div className="space-y-2">
                                        <div className="flex items-start space-x-2">
                                            <div className="bg-green-100 p-1 sm:p-2 rounded-lg">
                                                <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Pickup</div>
                                                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">{broadcast.pickupLocation}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="bg-red-100 p-1 sm:p-2 rounded-lg">
                                                <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Delivery</div>
                                                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">{broadcast.deliveryLocation}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => acceptBroadcast(broadcast._id)}
                                        disabled={accepting === broadcast._id}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                                    >
                                        {accepting === broadcast._id ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Accepting...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircleIcon className="w-4 h-4 mr-2" />
                                                Accept Delivery
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Timer Progress Bar */}
                                <div className="h-1 bg-gray-200">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-1000 ease-linear"
                                        style={{
                                            width: `${broadcast.timeRemaining ? ((broadcast.broadcastDuration || 60) - broadcast.timeRemaining) / (broadcast.broadcastDuration || 60) * 100 : 0}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BroadcastPage;
