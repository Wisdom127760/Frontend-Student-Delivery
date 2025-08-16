import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import socketService from '../../services/socketService';
import soundService from '../../services/soundService';
import apiService from '../../services/api';
import { BellIcon, XMarkIcon, EyeIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { useSnackbar } from '../common/SnackbarProvider';

const SimpleNotifications = () => {
    console.log('🔔 SimpleNotifications: Component is being rendered');
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedEmergency, setSelectedEmergency] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [selectedNotification, setSelectedNotification] = useState(null);
    const dropdownRef = useRef(null);

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    useEffect(() => {
        if (!user) return;

        console.log('🔌 SimpleNotifications: Setting up socket event listeners for user:', user._id || user.id);

        // Load existing notifications from API
        const loadExistingNotifications = async () => {
            try {
                const response = await apiService.getAdminNotifications({ limit: 10 });
                if (response && response.success && response.data?.notifications) {
                    const existingNotifications = response.data.notifications.map(notification => ({
                        id: notification._id,
                        message: notification.title || notification.message,
                        timestamp: new Date(notification.createdAt),
                        type: notification.type,
                        priority: notification.priority || 'medium',
                        isRead: notification.isRead,
                        sender: notification.sender || notification.senderName || notification.from || null,
                        emergencyData: notification.emergencyData || null
                    }));
                    setNotifications(existingNotifications);
                }
            } catch (error) {
                console.error('Error loading existing notifications:', error);
            }
        };

        loadExistingNotifications();

        // Connect to socket
        if (!socketService.isConnected()) {
            console.log('🔌 SimpleNotifications: Connecting to socket...');
            socketService.connect(user._id || user.id, user.userType);
        } else {
            console.log('🔌 SimpleNotifications: Socket already connected');
        }

        // Listen for notifications
        socketService.on('receive_notification', (data) => {
            console.log('🎉 Admin received notification:', data);
            const notification = {
                id: Date.now(),
                message: data.message,
                timestamp: new Date(),
                type: 'notification'
            };

            // Play notification sound
            soundService.playSound('notification');
            addNotification(notification);
        });

        socketService.on('driver-status-changed', (data) => {
            const notification = {
                id: Date.now(),
                message: `Driver ${data.name || 'Unknown'} is now ${data.isOnline ? 'online' : 'offline'}`,
                timestamp: new Date(),
                type: 'driver-status'
            };

            // Play notification sound
            soundService.playSound('notification');
            addNotification(notification);
        });

        socketService.on('delivery-status-changed', (data) => {
            const notification = {
                id: Date.now(),
                message: `Delivery ${data.deliveryCode} status changed to ${data.status}`,
                timestamp: new Date(),
                type: 'delivery-status'
            };

            // Play delivery sound
            soundService.playSound('delivery');
            addNotification(notification);
        });

        console.log('🔌 SimpleNotifications: Setting up emergency-alert listener');
        socketService.on('emergency-alert', (data) => {
            console.log('🚨 Admin received emergency alert:', data);
            console.log('🔍 Emergency alert driver ID:', data.driverId);
            console.log('🔍 Emergency alert driver name:', data.driverName);
            console.log('🔍 Emergency alert message:', data.message);
            console.log('🔍 Emergency alert timestamp:', data.timestamp);

            // Create detailed emergency notification
            const emergencyMessage = `🚨 EMERGENCY from ${data.driverName || 'Unknown Driver'} (${data.driverArea || 'Unknown Area'}): ${data.message}`;

            const notification = {
                id: Date.now(),
                message: emergencyMessage,
                timestamp: new Date(),
                priority: 'high',
                type: 'emergency',
                emergencyData: {
                    driverId: data.driverId,
                    driverName: data.driverName,
                    driverPhone: data.driverPhone,
                    driverEmail: data.driverEmail,
                    driverArea: data.driverArea,
                    message: data.message,
                    contactInfo: data.contactInfo,
                    responseInstructions: data.responseInstructions,
                    socketId: data.socketId
                }
            };

            // Play emergency sound with higher volume
            soundService.playSound('alert');

            addNotification(notification);
        });

        // Listen for new notification events from API
        socketService.on('new-notification', (data) => {
            console.log('🔔 Admin received new notification from API:', data);
            const notification = {
                id: Date.now(),
                message: data.message || data.title || 'New notification received',
                timestamp: new Date(),
                type: data.type || 'notification',
                priority: data.priority || 'medium'
            };

            // Play appropriate sound based on notification type
            if (data.type === 'emergency-alert') {
                soundService.playSound('alert');
            } else if (data.type === 'delivery') {
                soundService.playSound('delivery');
            } else {
                soundService.playSound('notification');
            }

            addNotification(notification);
        });

        // Check connection status
        const checkConnection = () => {
            setIsConnected(socketService.isConnected());
        };
        checkConnection();
        const interval = setInterval(checkConnection, 5000);

        return () => {
            clearInterval(interval);
            socketService.off('receive_notification');
            socketService.off('driver-status-changed');
            socketService.off('delivery-status-changed');
            socketService.off('emergency-alert');
            socketService.off('new-notification');
        };
    }, [user]);

    const addNotification = (notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only last 10

        // Show snackbar notification for important alerts
        if (notification.type === 'emergency' || notification.priority === 'high') {
            showError(notification.message, 5000);
        } else {
            // Show regular snackbar for other notifications
            showSuccess(notification.message, 3000);
        }

        // Add visual feedback - briefly highlight the bell
        const bell = document.querySelector('.notification-bell');
        if (bell) {
            bell.classList.add('notification-pulse');
            setTimeout(() => {
                bell.classList.remove('notification-pulse');
            }, 1000);
        }
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const markAsRead = async (notificationId) => {
        try {
            await apiService.markAdminNotificationAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiService.markAllAdminNotificationsAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
            showSuccess('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - timestamp) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return timestamp.toLocaleDateString();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'emergency-alert':
            case 'emergency':
                return '🚨';
            case 'delivery':
            case 'delivery-status-changed':
                return '📦';
            case 'driver':
            case 'driver-status-changed':
            case 'new_driver_registered':
                return '👤';
            case 'system':
                return '⚙️';
            case 'payment':
                return '💰';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type, priority) => {
        if (type === 'emergency' || type === 'emergency-alert' || priority === 'high') {
            return 'text-red-600';
        }
        if (type === 'delivery') {
            return 'text-green-600';
        }
        if (type === 'driver') {
            return 'text-green-600';
        }
        return 'text-gray-600';
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        setSelectedNotification(notification);
    };

    const handleViewAllNotifications = () => {
        setShowDropdown(false);
        navigate('/admin/notifications');
    };



    return (
        <>
            <div className="relative">
                {/* Notification Bell */}
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="notification-bell relative p-2 text-gray-600 hover:text-green-600 transition-all duration-200 hover:bg-green-50 rounded-lg"
                >
                    <BellIcon className="h-6 w-6" />
                    {notifications.filter(n => !n.isRead).length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                            {notifications.filter(n => !n.isRead).length > 99 ? '99+' : notifications.filter(n => !n.isRead).length}
                        </span>
                    )}
                    {!isConnected && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    )}
                </button>

                {/* Dropdown */}
                {showDropdown && (
                    <div ref={dropdownRef} className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleViewAllNotifications}
                                        className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center"
                                    >
                                        <EyeIcon className="h-3 w-3 mr-1" />
                                        View All
                                    </button>
                                    {notifications.filter(n => !n.isRead).length > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-green-600 hover:text-green-700 font-medium"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setShowDropdown(false)}>
                                        <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <span className="text-xs text-gray-500">
                                    {isConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    No notifications
                                </div>
                            ) : (
                                notifications.map((notification) => {
                                    return (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${notification.priority === 'high' ? 'bg-red-50' :
                                                !notification.isRead ? 'bg-green-50' : 'bg-gray-50'
                                                } ${!notification.isRead ? 'hover:bg-green-100' : 'hover:bg-gray-100'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-start space-x-3">
                                                        {!notification.isRead && (
                                                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                                                <p className={`text-sm font-medium ${getNotificationColor(notification.type, notification.priority)}`}>
                                                                    {notification.message}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-gray-500 flex items-center">
                                                                    <ClockIcon className="h-3 w-3 mr-1" />
                                                                    {formatTimeAgo(notification.timestamp)}
                                                                </span>
                                                                {notification.sender && (
                                                                    <span className="text-xs text-gray-500 flex items-center">
                                                                        <UserIcon className="h-3 w-3 mr-1" />
                                                                        {notification.sender}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Enhanced Emergency Alert Information */}
                                                    {(() => {
                                                        if (notification.type === 'emergency' && notification.emergencyData) {
                                                            return (
                                                                <div className="mt-2 p-2 bg-red-100 rounded border border-red-200">
                                                                    <div className="text-xs space-y-1">
                                                                        <div className="flex items-center space-x-2">
                                                                            <span className="font-medium text-red-800">Driver:</span>
                                                                            <span className="text-red-700">{notification.emergencyData.driverName}</span>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            <span className="font-medium text-red-800">Phone:</span>
                                                                            <span className="text-red-700">{notification.emergencyData.driverPhone}</span>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            <span className="font-medium text-red-800">Email:</span>
                                                                            <span className="text-red-700">{notification.emergencyData.driverEmail}</span>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            <span className="font-medium text-red-800">Area:</span>
                                                                            <span className="text-red-700">{notification.emergencyData.driverArea}</span>
                                                                        </div>
                                                                        <div className="mt-2 pt-2 border-t border-red-200">
                                                                            <p className="text-xs font-medium text-red-800 mb-1">Quick Actions:</p>
                                                                            <div className="space-y-1">
                                                                                <button
                                                                                    onClick={() => window.open(`tel:${notification.emergencyData.driverPhone}`, '_blank')}
                                                                                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                                                                    disabled={!notification.emergencyData.driverPhone || notification.emergencyData.driverPhone === 'No phone available'}
                                                                                >
                                                                                    📞 Call Driver
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => window.open(`mailto:${notification.emergencyData.driverEmail}`, '_blank')}
                                                                                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 ml-1"
                                                                                    disabled={!notification.emergencyData.driverEmail || notification.emergencyData.driverEmail === 'No email available'}
                                                                                >
                                                                                    📧 Email Driver
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setSelectedEmergency(notification.emergencyData);
                                                                                        setReplyMessage('');
                                                                                        setShowReplyModal(true);
                                                                                    }}
                                                                                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 ml-1"
                                                                                >
                                                                                    💬 Reply
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                                <button
                                                    onClick={() => removeNotification(notification.id)}
                                                    className="text-gray-400 hover:text-gray-600 ml-2"
                                                >
                                                    <XMarkIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Notification Detail Modal */}
            {selectedNotification && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4 max-h-96 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <span className="text-2xl mr-2">{getNotificationIcon(selectedNotification.type)}</span>
                                Notification Details
                            </h3>
                            <button
                                onClick={() => setSelectedNotification(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                                    {selectedNotification.message}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <p className="text-sm text-gray-900">
                                        {selectedNotification.type ? selectedNotification.type.replace(/_/g, ' ') : 'General'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <p className="text-sm text-gray-900">
                                        {selectedNotification.priority || 'Medium'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <p className="text-sm text-gray-900 flex items-center">
                                    <ClockIcon className="h-4 w-4 mr-2" />
                                    {selectedNotification.timestamp.toLocaleString()}
                                </p>
                            </div>

                            {selectedNotification.sender && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sender</label>
                                    <p className="text-sm text-gray-900 flex items-center">
                                        <UserIcon className="h-4 w-4 mr-2" />
                                        {selectedNotification.sender}
                                    </p>
                                </div>
                            )}

                            {selectedNotification.emergencyData && (
                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-red-800 mb-2">Emergency Contact Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Driver:</span>
                                            <span className="font-medium">{selectedNotification.emergencyData.driverName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Phone:</span>
                                            <span className="font-medium">{selectedNotification.emergencyData.driverPhone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Email:</span>
                                            <span className="font-medium">{selectedNotification.emergencyData.driverEmail}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Area:</span>
                                            <span className="font-medium">{selectedNotification.emergencyData.driverArea}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => navigate('/admin/notifications')}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                View All Notifications
                            </button>
                            <button
                                onClick={() => setSelectedNotification(null)}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Emergency Reply Modal */}
            {showReplyModal && selectedEmergency && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Reply to Emergency Alert
                            </h3>
                            <button
                                onClick={() => setShowReplyModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mb-4 p-3 bg-red-50 rounded border border-red-200">
                            <p className="text-sm text-red-800 mb-2">
                                <strong>Driver:</strong> {selectedEmergency.driverName}
                            </p>
                            <p className="text-sm text-red-700">
                                <strong>Message:</strong> {selectedEmergency.message}
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Reply:
                            </label>
                            <textarea
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Enter your reply to the driver..."
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowReplyModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (replyMessage.trim()) {
                                        console.log('📞 Sending emergency reply:', {
                                            driverId: selectedEmergency.driverId,
                                            message: replyMessage,
                                            adminName: user?.name || 'Admin'
                                        });

                                        socketService.emit('admin-emergency-reply', {
                                            driverId: selectedEmergency.driverId,
                                            message: replyMessage,
                                            adminName: user?.name || 'Admin'
                                        });

                                        setShowReplyModal(false);
                                        setReplyMessage('');
                                        setSelectedEmergency(null);
                                    }
                                }}
                                disabled={!replyMessage.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send Reply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SimpleNotifications; 