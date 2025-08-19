import React, { useState, useEffect, useRef } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import socketService from '../../services/socketService';
import apiService from '../../services/api';
import NotificationsDropdownSkeleton from '../common/NotificationsDropdownSkeleton';

const NotificationsDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [markingAsRead, setMarkingAsRead] = useState(new Set());

    useEffect(() => {
        fetchUnreadCount();
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await apiService.getDriverNotifications({ limit: 5 });

            if (response.success) {
                setNotifications(response.data.notifications || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await apiService.getDriverUnreadNotificationsCount();

            if (response.success) {
                setUnreadCount(response.data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            console.log('📖 NotificationsDropdown: Marking notification as read:', notificationId);

            // Validate notification ID
            if (!notificationId || typeof notificationId !== 'string') {
                console.warn('📖 NotificationsDropdown: Invalid notification ID:', notificationId);
                return;
            }

            // Check if already marking this notification as read
            if (markingAsRead.has(notificationId)) {
                console.log('📖 NotificationsDropdown: Already marking notification as read:', notificationId);
                return;
            }

            // Add to marking set
            setMarkingAsRead(prev => new Set(prev).add(notificationId));

            const response = await apiService.markNotificationAsRead(notificationId);

            if (response.success) {
                setNotifications(prev =>
                    prev.map(notification =>
                        notification._id === notificationId
                            ? { ...notification, isRead: true }
                            : notification
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } else {
                // Always fallback to local update for any API failure
                setNotifications(prev =>
                    prev.map(notification =>
                        notification._id === notificationId
                            ? { ...notification, isRead: true }
                            : notification
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Fallback to local update
            setNotifications(prev =>
                prev.map(notification =>
                    notification._id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } finally {
            // Remove from marking set
            setMarkingAsRead(prev => {
                const newSet = new Set(prev);
                newSet.delete(notificationId);
                return newSet;
            });
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>
                        {unreadCount > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <NotificationsDropdownSkeleton />
                        ) : notifications.length === 0 ? (
                            <div className="p-4 text-center">
                                <BellIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">No notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`p-4 transition-colors ${markingAsRead.has(notification._id)
                                            ? 'cursor-not-allowed opacity-75'
                                            : 'hover:bg-gray-50 cursor-pointer'
                                            } ${!notification.isRead ? 'bg-blue-50' : ''}`}
                                        onClick={() => {
                                            if (!notification.isRead && notification._id && !markingAsRead.has(notification._id)) {
                                                markAsRead(notification._id);
                                            }
                                        }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-sm font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'
                                                    }`}>
                                                    {notification.title}
                                                </h4>
                                                <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-600' : 'text-gray-800'
                                                    }`}>
                                                    {notification.message}
                                                </p>
                                                <span className="text-xs text-gray-500 mt-2 block">
                                                    {formatDate(notification.createdAt)}
                                                </span>
                                            </div>

                                            {!notification.isRead && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (notification._id && !markingAsRead.has(notification._id)) {
                                                            markAsRead(notification._id);
                                                        }
                                                    }}
                                                    disabled={markingAsRead.has(notification._id)}
                                                    className={`ml-2 p-1 ${markingAsRead.has(notification._id)
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-gray-400 hover:text-gray-600'
                                                        }`}
                                                    title={markingAsRead.has(notification._id) ? 'Marking as read...' : 'Mark as read'}
                                                >
                                                    {markingAsRead.has(notification._id) ? (
                                                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                                    ) : (
                                                        <XMarkIcon className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-4 border-t border-gray-200">
                            <a
                                href="/driver/notifications"
                                className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                                View all notifications →
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
