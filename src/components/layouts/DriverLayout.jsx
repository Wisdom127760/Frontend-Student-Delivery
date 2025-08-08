import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SimpleDriverNotifications from '../driver/SimpleDriverNotifications';
import SimpleEmergencyAlert from '../driver/SimpleEmergencyAlert';
import Avatar from '../common/Avatar';
import SoundPermissionModal from '../common/SoundPermissionModal';
import GlobalSearch from '../common/GlobalSearch';
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
    CommandLineIcon
} from '@heroicons/react/24/outline';

const DriverLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    // Removed unused statusVersion state
    const [showSoundPermission, setShowSoundPermission] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    const loadDriverStatus = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/driver/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data.isOnline !== undefined) {
                    setIsOnline(result.data.isOnline);
                }
            }
        } catch (error) {
            console.error('Error loading driver status:', error);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        loadDriverStatus(); // Call loadDriverStatus on component mount

        // Check if sound permission has been requested before
        const soundPermissionRequested = localStorage.getItem('soundPermissionRequested');
        if (!soundPermissionRequested) {
            // Show sound permission modal after a short delay
            setTimeout(() => {
                setShowSoundPermission(true);
            }, 2000);
        }
    }, [loadDriverStatus]);



    const navigation = [
        { name: 'Dashboard', href: '/driver', icon: HomeIcon },
        { name: 'My Deliveries', href: '/driver/deliveries', icon: TruckIcon },
        { name: 'Earnings', href: '/driver/earnings', icon: CurrencyDollarIcon },
        { name: 'Remittances', href: '/driver/remittances', icon: DocumentTextIcon },
        { name: 'Profile', href: '/driver/profile', icon: UserCircleIcon },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const toggleActiveStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = !isOnline;

            console.log('Toggling active status from', isOnline, 'to', newStatus);

            // Show immediate visual feedback
            setIsOnline(newStatus);

            // Try to update backend
            try {
                const response = await fetch(`${API_BASE_URL}/driver/toggle-active`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Response status:', response.status);

                if (response.ok) {
                    const result = await response.json();
                    console.log('Response data:', result);

                    if (result.success) {
                        // Status updated successfully in database
                        console.log(`Driver is now ${newStatus ? 'active' : 'inactive'}`);

                        // Update the local state with the actual status from backend
                        if (result.data && result.data.isActive !== undefined) {
                            setIsOnline(result.data.isActive);
                            console.log('Updated local state to:', result.data.isActive);
                        }

                        // Show success message
                        if (newStatus) {
                            console.log('✅ You are now active and visible to customers');
                        } else {
                            console.log('🔴 You are now inactive and hidden from customers');
                        }
                    } else {
                        // Revert local state if API fails
                        setIsOnline(!newStatus);
                        console.error('Failed to update status:', result.error);
                    }
                } else {
                    const errorText = await response.text();
                    console.error('HTTP Error:', response.status, errorText);

                    // Keep the local state change for better UX
                    console.log('Backend update failed, but keeping local state change');
                }
            } catch (backendError) {
                console.error('Backend error:', backendError);
                // Keep the local state change for better UX
                console.log('Backend unavailable, but keeping local state change');
            }
        } catch (error) {
            // Revert local state if there's a critical error
            setIsOnline(!isOnline);
            console.error('Critical error updating driver status:', error);
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
                            src="/White.svg"
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
                <div className="px-4 pb-4">
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
                </div>
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
                                // This will be handled by the GlobalSearch component's keyboard listener
                                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
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
                        <SimpleDriverNotifications />

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Avatar user={user} size="md" />
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-semibold text-gray-900 capitalize">{user?.name || 'Driver User'}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* User Dropdown Menu */}
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900 capitalize">{user?.name || 'Driver User'}</p>
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
                        {children}
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
        </div>
    );
};

export default DriverLayout; 