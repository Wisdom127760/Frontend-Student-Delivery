import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import socketService from '../../services/socketService';
import soundService from '../../services/soundService';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SimpleNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedEmergency, setSelectedEmergency] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
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

        // Connect to socket
        if (!socketService.isConnected()) {
            socketService.connect(user._id || user.id, user.userType);
        }

        // Listen for notifications
        socketService.on('receive_notification', (data) => {
            console.log('🎉 Admin received notification:', data);
            addNotification({
                id: Date.now(),
                message: data.message,
                timestamp: new Date()
            });
        });

        socketService.on('driver-status-changed', (data) => {
            addNotification({
                id: Date.now(),
                message: `Driver ${data.name || 'Unknown'} is now ${data.isOnline ? 'online' : 'offline'}`,
                timestamp: new Date()
            });
        });

        socketService.on('delivery-status-changed', (data) => {
            addNotification({
                id: Date.now(),
                message: `Delivery ${data.deliveryCode} status changed to ${data.status}`,
                timestamp: new Date()
            });
        });

        socketService.on('emergency-alert', (data) => {
            console.log('🚨 Admin received emergency alert:', data);
            console.log('🔍 Emergency alert driver ID:', data.driverId);
            console.log('🔍 Emergency alert driver name:', data.driverName);

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

            // Play emergency sound
            soundService.playSound('alert');

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
        };
    }, [user]);

    const addNotification = (notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only last 10
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };



    return (
        <>
            <div className="relative">
                {/* Notification Bell */}
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="relative p-2 text-gray-600 hover:text-gray-900"
                >
                    <BellIcon className="h-6 w-6" />
                    {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {notifications.length}
                        </span>
                    )}
                    {!isConnected && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    )}
                </button>

                {/* Dropdown */}
                {showDropdown && (
                    <div ref={dropdownRef} className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Notifications</h3>
                                <button onClick={() => setShowDropdown(false)}>
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
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
                                            className={`p-3 border-b last:border-b-0 ${notification.priority === 'high' ? 'bg-red-50' : 'bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="text-sm">{notification.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {notification.timestamp.toLocaleTimeString()}
                                                    </p>

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