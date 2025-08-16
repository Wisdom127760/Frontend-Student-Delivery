import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// import SimpleDriverNotifications from '../driver/SimpleDriverNotifications'; // Unused import
import SimpleEmergencyAlert from '../driver/SimpleEmergencyAlert';
import NotificationsDropdown from '../driver/NotificationsDropdown';
import Avatar from '../common/Avatar';
import SoundPermissionModal from '../common/SoundPermissionModal';
import GlobalSearch from '../common/GlobalSearch';
import socketService from '../../services/socketService';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import {
    TruckIcon,
    UserCircleIcon,
    HomeIcon,
    CurrencyDollarIcon,
    XMarkIcon,
    ChevronDownIcon,
    ArrowRightOnRectangleIcon,
    DocumentTextIcon,
    MagnifyingGlassIcon,
    CommandLineIcon,
    BellIcon
} from '@heroicons/react/24/outline';

// Create context for driver status
const DriverStatusContext = createContext();

// Hook to use driver status
export const useDriverStatus = () => {
    const context = useContext(DriverStatusContext);
    if (!context) {
        throw new Error('useDriverStatus must be used within DriverLayout');
    }
    return context;
};

const DriverLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    // Removed unused statusVersion state
    const [showSoundPermission, setShowSoundPermission] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, profile, logout, updateProfile } = useAuth();

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    // Load driver profile data
    const loadDriverProfile = useCallback(async () => {
        if (!user?.id) return;

        try {
            console.log('🔄 Loading driver profile data...');
            const data = await apiService.getDriverProfile();

            if (data.success && data.data) {
                console.log('✅ Driver profile loaded:', data.data);
                console.log('🔍 Profile structure:', {
                    profileImage: data.data.profileImage,
                    profilePicture: data.data.profilePicture,
                    fullName: data.data.profile?.personalDetails?.fullName,
                    personalDetails: data.data.profile?.personalDetails,
                    profile: data.data.profile
                });
                updateProfile(data.data);
            } else {
                console.warn('⚠️ Failed to load driver profile:', data);
            }
        } catch (error) {
            console.error('❌ Error loading driver profile:', error);
        }
    }, [user?.id, updateProfile]);

    const loadDriverStatus = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');

            console.log('🔍 Loading driver status from database...');

            const response = await fetch(`${API_BASE_URL}/driver/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Profile API response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('📊 Profile API result:', result);

                if (result.success && result.data) {
                    // Check multiple possible field names for status
                    let statusValue = null;

                    if (result.data.isOnline !== undefined) {
                        statusValue = result.data.isOnline;
                        console.log('✅ Found isOnline field:', statusValue);
                    } else if (result.data.isActive !== undefined) {
                        statusValue = result.data.isActive;
                        console.log('✅ Found isActive field:', statusValue);
                    } else if (result.data.status !== undefined) {
                        statusValue = result.data.status === 'online' || result.data.status === 'active';
                        console.log('✅ Found status field:', result.data.status, '-> converted to:', statusValue);
                    } else {
                        console.log('⚠️ No status field found in response. Available fields:', Object.keys(result.data));
                        // Default to false if no status found
                        statusValue = false;
                    }

                    console.log('🎯 Setting isOnline status to:', statusValue);
                    setIsOnline(statusValue);
                } else {
                    console.log('❌ API returned unsuccessful response or no data');
                    // Try fallback approach with mock data
                    console.log('🔄 Using fallback status (offline)');
                    setIsOnline(false);
                }
            } else {
                console.log('❌ Profile API request failed with status:', response.status);
                const errorText = await response.text();
                console.log('Error response:', errorText);
                // Default to offline if API fails
                setIsOnline(false);
            }
        } catch (error) {
            console.error('💥 Error loading driver status:', error);
            // Default to offline on error
            setIsOnline(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        if (user?.id) {
            loadDriverProfile(); // Load profile data
            loadDriverStatus(); // Call loadDriverStatus on component mount
        }

        // Sync status with database every 30 seconds
        const statusSyncInterval = setInterval(() => {
            console.log('🔄 Syncing status with database...');
            loadDriverStatus();
        }, 30000);

        // Check if sound permission has been requested before
        const soundPermissionRequested = localStorage.getItem('soundPermissionRequested');
        if (!soundPermissionRequested) {
            // Show sound permission modal after a short delay
            setTimeout(() => {
                setShowSoundPermission(true);
            }, 2000);
        }

        // Cleanup interval on unmount
        return () => {
            clearInterval(statusSyncInterval);
        };
    }, [user?.id, loadDriverProfile, loadDriverStatus]);



    const navigation = [
        { name: 'Dashboard', href: '/driver', icon: HomeIcon },
        { name: 'My Deliveries', href: '/driver/deliveries', icon: TruckIcon },
        { name: 'Earnings', href: '/driver/earnings', icon: CurrencyDollarIcon },
        { name: 'Remittances', href: '/driver/remittances', icon: DocumentTextIcon },
        { name: 'Notifications', href: '/driver/notifications', icon: BellIcon },
        { name: 'Profile', href: '/driver/profile', icon: UserCircleIcon },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const toggleActiveStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = !isOnline;

            console.log('Toggling active status from', isOnline, 'to', newStatus);

            // Show immediate visual feedback (optimistic update)
            setIsOnline(newStatus);

            // Emit status change via socket.io immediately
            if (socketService.isConnected()) {
                socketService.emit('driver-status-change', {
                    driverId: user?.id,
                    status: newStatus ? 'online' : 'offline',
                    timestamp: new Date().toISOString(),
                    action: 'toggle-active'
                });
                console.log('📡 Socket status update sent:', newStatus ? 'online' : 'offline');
            } else {
                console.log('⚠️ Socket.io not connected - status update not sent in real-time');
                toast.warning('Status updated (real-time sync unavailable)');
            }

            // Try to update backend
            try {
                console.log('📡 Sending status update to backend...');

                const response = await fetch(`${API_BASE_URL}/driver/toggle-active`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        isActive: newStatus,
                        status: newStatus ? 'online' : 'offline'
                    })
                });

                console.log('📊 Backend response status:', response.status);

                if (response.ok) {
                    const result = await response.json();
                    console.log('📊 Backend toggle result:', result);

                    if (result.success) {
                        // Update the local state with the actual status from backend
                        if (result.data && result.data.isActive !== undefined) {
                            console.log('✅ Backend confirmed status:', result.data.isActive);
                            setIsOnline(result.data.isActive);
                        } else if (result.data && result.data.isOnline !== undefined) {
                            console.log('✅ Backend confirmed status (isOnline):', result.data.isOnline);
                            setIsOnline(result.data.isOnline);
                        }

                        // Show success toast
                        if (newStatus) {
                            toast.success('🟢 You are now active and visible to customers');
                        } else {
                            toast.success('🔴 You are now inactive and hidden from customers');
                        }

                        console.log('✅ Status successfully updated in database');

                        // Reload status from database to confirm
                        setTimeout(() => {
                            loadDriverStatus();
                        }, 1000);
                    } else {
                        // Revert local state if API fails
                        setIsOnline(!newStatus);
                        toast.error('Failed to update status');

                        // Emit revert via socket.io
                        if (socketService.isConnected()) {
                            socketService.emit('driver-status-change', {
                                driverId: user?.id,
                                status: !newStatus ? 'online' : 'offline',
                                timestamp: new Date().toISOString(),
                                action: 'revert-toggle'
                            });
                        }
                    }
                } else {
                    const errorText = await response.text();
                    console.log('❌ Backend update failed:', response.status, errorText);
                    toast.warning('Status updated locally (backend unavailable)');
                }
            } catch (backendError) {
                console.log('Backend unavailable, but keeping local state change');
                toast.warning('Status updated locally (backend unavailable)');
            }
        } catch (error) {
            // Revert local state if there's a critical error
            setIsOnline(!isOnline);
            toast.error('Failed to update status');
            console.error('Critical error updating driver status:', error);

            // Emit revert via socket.io
            if (socketService.isConnected()) {
                socketService.emit('driver-status-change', {
                    driverId: user?.id,
                    status: isOnline ? 'online' : 'offline',
                    timestamp: new Date().toISOString(),
                    action: 'error-revert'
                });
            }
        }
    };



    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
                    <div className="flex items-center">
                        <img
                            src="/White.png"
                            alt="Student Delivery Logo"
                            className="w-10 h-10 object-contain rounded-xl shadow-lg"
                        />
                        <h1 className="ml-3 text-xl font-bold text-gray-900">Driver Panel</h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Nav Menu */}
                <nav className="flex-1 mt-8 px-4 overflow-y-auto">
                    <div className="space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${active
                                        ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-l-4 border-primary-600 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                                        }`}
                                >
                                    <Icon className={`mr-3 h-5 w-5 transition-colors ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                                        }`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer Toggle (STAYS at Bottom Now) */}
                {/* <div className="px-4 pb-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {isOnline ? 'Active' : 'Inactive'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {isOnline ? 'Available for deliveries' : 'Not receiving requests'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    console.log('Status toggle clicked, current state:', isOnline);
                                    toggleActiveStatus();
                                }}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${isOnline
                                    ? 'bg-green-500 focus:ring-green-500'
                                    : 'bg-gray-300 focus:ring-gray-400'
                                    }`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${isOnline ? 'translate-x-7' : 'translate-x-1'
                                    }`} />
                                <span className="absolute inset-0 flex items-center justify-between px-1.5">
                                    <span className="text-xs font-medium text-white">ON</span>
                                    <span className="text-xs font-medium text-gray-600">OFF</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div> */}
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 lg:ml-0">
                {/* Top Navigation */}
                <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Global Search Trigger */}
                        <button
                            onClick={() => {
                                // Check authentication before opening search
                                const token = localStorage.getItem('token');
                                if (token) {
                                    // This will be handled by the GlobalSearch component's keyboard listener
                                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
                                } else {
                                    toast.error('Please log in to use search');
                                }
                            }}
                            className="group flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 border border-gray-200/50 hover:border-gray-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <MagnifyingGlassIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            <span className="hidden sm:inline">Search</span>
                            <div className="hidden sm:flex items-center space-x-1 text-xs bg-gray-100 px-2 py-1 rounded-md">
                                <CommandLineIcon className="h-3 w-3" />
                                <span className="font-medium">K</span>
                            </div>
                        </button>

                        {/* Notifications */}
                        <NotificationsDropdown />

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Avatar user={user} profile={profile} size="md" />
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-semibold text-gray-900 capitalize">
                                        {profile?.profile?.personalDetails?.fullName ||
                                            profile?.personalDetails?.fullName ||
                                            profile?.fullName ||
                                            user?.name ||
                                            user?.fullName ||
                                            'Driver User'}
                                    </p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* User Dropdown Menu */}
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900 capitalize">
                                            {profile?.profile?.personalDetails?.fullName ||
                                                profile?.personalDetails?.fullName ||
                                                profile?.fullName ||
                                                user?.name ||
                                                user?.fullName ||
                                                'Driver User'}
                                        </p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                navigate('/driver/profile');
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <UserCircleIcon className="mr-3 h-4 w-4" />
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                navigate('/driver/earnings');
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <CurrencyDollarIcon className="mr-3 h-4 w-4" />
                                            Earnings
                                        </button>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        <DriverStatusContext.Provider value={{
                            isOnline,
                            setIsOnline,
                            toggleActiveStatus,
                            loadDriverStatus
                        }}>
                            {children}
                        </DriverStatusContext.Provider>
                    </div>
                </main>
            </div>

            {/* Click outside to close user menu */}
            {userMenuOpen && (
                <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
            )}

            {/* Emergency Alert */}
            <SimpleEmergencyAlert />

            {/* Sound Permission Modal */}
            <SoundPermissionModal
                isOpen={showSoundPermission}
                onClose={() => {
                    setShowSoundPermission(false);
                    localStorage.setItem('soundPermissionRequested', 'true');
                }}
                onPermissionGranted={() => {
                    localStorage.setItem('soundPermissionRequested', 'true');
                    console.log('🎵 Sound permission granted!');
                }}
            />

            {/* Global Search Modal */}
            <GlobalSearch />

            {/* Fixed Bottom Left Active Status Button */}
            <div className="fixed bottom-6 left-6 z-50">
                <button
                    onClick={() => {
                        console.log('Bottom status toggle clicked, current state:', isOnline);
                        toggleActiveStatus();
                    }}
                    className={`group relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-offset-2 ${isOnline
                        ? 'bg-gradient-to-r from-green-400 to-green-600 focus:ring-green-500 shadow-green-200'
                        : 'bg-gradient-to-r from-gray-400 to-gray-600 focus:ring-gray-500 shadow-gray-200'
                        }`}
                >
                    {/* Pulsing effect when online */}
                    {isOnline && (
                        <div className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ping"></div>
                    )}

                    {/* Icon */}
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 text-white font-bold text-sm">
                        {isOnline ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>

                    {/* Tooltip */}
                    <div className={`absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap ${isOnline ? 'bg-green-800' : 'bg-gray-800'
                        }`}>
                        {isOnline ? 'Active - Click to go offline' : 'Inactive - Click to go active'}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                </button>

                {/* Status Text */}
                <div className="mt-2 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isOnline
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                        }`}>
                        {isOnline ? 'ACTIVE' : 'OFFLINE'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DriverLayout; 