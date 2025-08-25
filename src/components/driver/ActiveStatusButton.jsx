import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import socketService from '../../services/socketService';
import { useToast } from '../common/ToastProvider';
import LottieLoader from '../common/LottieLoader';

const ActiveStatusButton = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();
    const [isActive, setIsActive] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // Load initial status
    useEffect(() => {
        const loadStatus = async () => {
            try {
                const response = await apiService.getDriverProfile();
                if (response.success && response.data) {
                    const status = response.data.isOnline || response.data.isActive || response.data.status === 'active';
                    setIsActive(status);
                }
            } catch (error) {
                console.error('Error loading driver status:', error);
            }
        };

        loadStatus();
    }, []);

    const handleToggleStatus = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const newStatus = !isActive;
            console.log('🔄 Toggling ACTIVE status to:', newStatus ? 'active' : 'inactive');

            // Update status via API
            await apiService.updateDriverStatus(newStatus ? 'active' : 'offline');

            // Force socket connection if going active
            if (newStatus && user) {
                socketService.ensureInitialized(user._id || user.id, user.userType || user.role);
            }

            // Update local state
            setIsActive(newStatus);

            // Emit socket event to notify admin panel
            socketService.emit('driver-status-changed', {
                driverId: user._id || user.id,
                driverName: user.name || user.fullName,
                isOnline: newStatus,
                isActive: newStatus,
                timestamp: new Date()
            });

            // Show success message
            showSuccess(newStatus ? 'You are now ACTIVE and can receive deliveries!' : 'You are now INACTIVE');

            console.log('✅ ACTIVE status updated successfully');
        } catch (error) {
            console.error('❌ Error toggling ACTIVE status:', error);

            // Even if API fails, update local state for better UX
            // The user can see the button change immediately
            const fallbackStatus = !isActive;
            setIsActive(fallbackStatus);

            // Emit socket event even on API failure for consistency
            socketService.emit('driver-status-changed', {
                driverId: user._id || user.id,
                driverName: user.name || user.fullName,
                isOnline: fallbackStatus,
                isActive: fallbackStatus,
                timestamp: new Date()
            });

            // Show a warning instead of error
            showError('Status updated locally, but server sync failed. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-50">
            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span>{isActive ? 'Click to go INACTIVE' : 'Click to go ACTIVE'}</span>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
            )}

            {/* Main Button */}
            <button
                onClick={handleToggleStatus}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                disabled={isLoading}
                className={`
                    group relative flex flex-col items-center justify-center
                    w-20 h-20 rounded-full shadow-xl
                    transition-all duration-300 ease-in-out
                    transform hover:scale-105 active:scale-95
                    ${isActive
                        ? 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                        : 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                    }
                    ${isLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
                    border-2 border-white
                `}
            >
                {/* Icon */}
                <div className="relative">
                    {isActive ? (
                        <CheckIcon className="w-7 h-7 mb-1" />
                    ) : (
                        <XMarkIcon className="w-7 h-7 mb-1" />
                    )}

                    {/* Loading Spinner */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <LottieLoader size="xs" showText={false} />
                        </div>
                    )}
                </div>

                {/* Status Text */}
                <span className="text-xs font-bold tracking-wide">
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>

                {/* Pulse Ring Effect */}
                {isActive && (
                    <>
                        <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30"></div>
                        <div className="absolute inset-0 rounded-full bg-green-300 animate-pulse opacity-20"></div>
                    </>
                )}
            </button>

            {/* Status Indicator Dot */}
            <div className="absolute -top-1 -right-1">
                <div className={`w-4 h-4 rounded-full border-2 border-white ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
        </div>
    );
};

export default ActiveStatusButton;
