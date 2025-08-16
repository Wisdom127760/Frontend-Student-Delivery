import React, { useState, useEffect, useCallback } from 'react';
import {
    MegaphoneIcon,
    ClockIcon,
    MapPinIcon,
    UserIcon,
    PhoneIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    TruckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import socketService from '../../services/socketService';
import soundService from '../../services/soundService';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../services/systemSettings';

const BroadcastPage = () => {
    const { user } = useAuth();
    const [broadcasts, setBroadcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [accepting, setAccepting] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [isOnline, setIsOnline] = useState(true);

    // Load available broadcasts
    const loadBroadcasts = useCallback(async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            // Get driver's current location
            let lat = 35.1255; // Default Famagusta coordinates
            let lng = 33.3095;

            if (navigator.geolocation) {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 300000 // 5 minutes
                        });
                    });

                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                    setDriverLocation({ lat, lng });
                } catch (error) {
                    console.log('Geolocation error:', error);
                    toast.error('Unable to get your location. Using default coordinates.');
                }
            }

            const response = await apiService.getActiveBroadcasts(lat, lng);

            if (response.success) {
                setBroadcasts(response.data.broadcasts || []);
            } else {
                console.error('Failed to load broadcasts:', response);
                if (!silent) {
                    toast.error('Failed to load available deliveries');
                }
            }
        } catch (error) {
            console.error('Error loading broadcasts:', error);
            if (!silent) {
                toast.error('Failed to load available deliveries');
            }
        } finally {
            if (!silent) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    }, []);

    // Accept a delivery broadcast
    const acceptBroadcast = async (deliveryId) => {
        try {
            setAccepting(deliveryId);

            const response = await apiService.acceptBroadcastDelivery(deliveryId);

            if (response.success) {
                toast.success('Delivery accepted successfully!');

                // Remove the accepted delivery from the list
                setBroadcasts(prev => prev.filter(b => b.id !== deliveryId));

                // Play success sound
                soundService.playSound('success');

                // Navigate to driver's deliveries page
                setTimeout(() => {
                    window.location.href = '/driver/deliveries';
                }, 1500);
            } else {
                toast.error(response.message || 'Failed to accept delivery');
            }
        } catch (error) {
            console.error('Error accepting broadcast:', error);
            toast.error('Failed to accept delivery');
        } finally {
            setAccepting(null);
        }
    };

    // Calculate time remaining for broadcast
    const getTimeRemaining = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end - now;

        if (diff <= 0) return 'Expired';

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

    // Calculate distance from driver to pickup
    const calculateDistance = (pickupLat, pickupLng) => {
        if (!driverLocation) return 'Unknown';

        const R = 6371; // Earth's radius in kilometers
        const dLat = (pickupLat - driverLocation.lat) * Math.PI / 180;
        const dLon = (pickupLng - driverLocation.lng) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(driverLocation.lat * Math.PI / 180) * Math.cos(pickupLat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return `${distance.toFixed(1)} km`;
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

            // Show toast notification
            toast.success(`New delivery available: ${data.pickupLocation} → ${data.deliveryLocation}`);
        };

        // Listen for broadcast removal (when accepted by another driver)
        const handleBroadcastRemoved = (data) => {
            console.log('📡 BroadcastPage: Broadcast removed:', data);

            // Remove the broadcast from the list
            setBroadcasts(prev => prev.filter(b => b.id !== data.deliveryId));

            // Show toast notification
            toast.info('A delivery was accepted by another driver');
        };

        // Listen for broadcast expiration
        const handleBroadcastExpired = (data) => {
            console.log('📡 BroadcastPage: Broadcast expired:', data);

            // Remove the expired broadcast from the list
            setBroadcasts(prev => prev.filter(b => b.id !== data.deliveryId));

            // Show toast notification
            toast.info('A delivery broadcast has expired');
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
    }, [user]);

    // Load initial data and set up auto-refresh
    useEffect(() => {
        loadBroadcasts();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            if (!loading) {
                loadBroadcasts(true);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [loadBroadcasts, loading]);

    // Check if driver is online
    useEffect(() => {
        const checkOnlineStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/driver/status`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsOnline(data.data?.isOnline || false);
                }
            } catch (error) {
                console.error('Error checking online status:', error);
            }
        };

        checkOnlineStatus();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading available deliveries...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <MegaphoneIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Available Deliveries</h1>
                                    <p className="text-gray-600">Accept deliveries near your location</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {/* Online Status Indicator */}
                                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-sm font-medium">
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>
                                </div>

                                <button
                                    onClick={() => loadBroadcasts(true)}
                                    disabled={refreshing}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                    {refreshing ? 'Refreshing...' : 'Refresh'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Info */}
                {driverLocation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center space-x-2">
                            <MapPinIcon className="w-5 h-5 text-blue-600" />
                            <span className="text-sm text-blue-800">
                                Your location: {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Broadcasts List */}
                {broadcasts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <MegaphoneIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Deliveries</h3>
                        <p className="text-gray-600 mb-6">
                            There are currently no delivery requests in your area.
                            Stay online to receive notifications when new deliveries become available.
                        </p>
                        <button
                            onClick={() => loadBroadcasts(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <ArrowPathIcon className="w-4 h-4 mr-2" />
                            Check Again
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {broadcasts.map((broadcast) => (
                            <div key={broadcast.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Header with Priority */}
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(broadcast.priority)}`}>
                                            {broadcast.priority.charAt(0).toUpperCase() + broadcast.priority.slice(1)} Priority
                                        </span>
                                        <div className="flex items-center space-x-1 text-orange-600">
                                            <ClockIcon className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {getTimeRemaining(broadcast.broadcastEndTime)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {formatCurrency(broadcast.fee)}
                                        </h3>
                                        <div className="flex items-center space-x-1 text-gray-600">
                                            <MapPinIcon className="w-4 h-4" />
                                            <span className="text-sm">
                                                {calculateDistance(broadcast.pickupCoordinates?.lat, broadcast.pickupCoordinates?.lng)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Details */}
                                <div className="px-6 py-4 space-y-4">
                                    {/* Route */}
                                    <div>
                                        <div className="flex items-start space-x-2 mb-2">
                                            <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pickup</p>
                                                <p className="text-sm text-gray-900">{broadcast.pickupLocation}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Delivery</p>
                                                <p className="text-sm text-gray-900">{broadcast.deliveryLocation}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <UserIcon className="w-4 h-4 text-gray-500" />
                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">{broadcast.customerName}</p>
                                        <div className="flex items-center space-x-1 mt-1">
                                            <PhoneIcon className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-600">{broadcast.customerPhone}</span>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <div className="flex items-center space-x-1 mb-1">
                                                <TruckIcon className="w-3 h-3 text-blue-600" />
                                                <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Distance</span>
                                            </div>
                                            <p className="text-sm font-bold text-blue-600">{broadcast.distance || 'N/A'}</p>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-3">
                                            <div className="flex items-center space-x-1 mb-1">
                                                <ClockIcon className="w-3 h-3 text-purple-600" />
                                                <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">Est. Time</span>
                                            </div>
                                            <p className="text-sm font-bold text-purple-600">
                                                {broadcast.estimatedTime ? new Date(broadcast.estimatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {broadcast.notes && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                            <div className="flex items-start space-x-2">
                                                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs font-medium text-yellow-800 mb-1">Special Instructions</p>
                                                    <p className="text-xs text-yellow-700 leading-relaxed">{broadcast.notes}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => acceptBroadcast(broadcast.id)}
                                            disabled={accepting === broadcast.id}
                                            className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            {accepting === broadcast.id ? (
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
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Auto-refresh notice */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <ArrowPathIcon className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm text-blue-800">
                            Available deliveries automatically refresh every 30 seconds. Stay online to receive real-time notifications.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BroadcastPage;
