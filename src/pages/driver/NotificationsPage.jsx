import React, { useState, useEffect } from 'react';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import DriverLayout from '../../components/layouts/DriverLayout';
import NotificationsSkeleton from '../../components/common/NotificationsSkeleton';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await apiService.getDriverNotifications();

            if (response.success) {
                setNotifications(response.data.notifications || []);
            } else {
                toast.error('Failed to load notifications');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
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
                toast.success('Notification marked as read');
            } else {
                toast.error('Failed to mark notification as read');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await apiService.markAllNotificationsAsRead();

            if (response.success) {
                setNotifications(prev =>
                    prev.map(notification => ({ ...notification, isRead: true }))
                );
                setUnreadCount(0);
                toast.success('All notifications marked as read');
            } else {
                toast.error('Failed to mark all notifications as read');
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark all notifications as read');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes} minutes ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hours ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    if (loading) {
        return (
            <DriverLayout>
                <NotificationsSkeleton />
            </DriverLayout>
        );
    }

    return (
        <DriverLayout>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <BellIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                                <p className="text-gray-600 mt-1">Stay updated with your delivery activities</p>
                            </div>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                            >
                                <CheckIcon className="w-4 h-4" />
                                <span>Mark all as read</span>
                            </button>
                        )}
                    </div>

                    {/* Unread Count Badge */}
                    {unreadCount > 0 && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                <span className="text-blue-800 font-medium">
                                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Notifications List */}
                    <div className="space-y-4">
                        {notifications.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <BellIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                                <p className="text-gray-600">You'll see notifications here when you have new deliveries, payments, or important updates.</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-sm ${notification.isRead ? 'bg-gray-50 border-gray-200' : 'bg-white border-green-200'
                                        }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className={`text-sm font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <span className="text-xs text-gray-500 mt-2 block">
                                                        {formatDate(notification.createdAt)}
                                                    </span>
                                                </div>

                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notification._id)}
                                                        className="ml-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <CheckIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DriverLayout>
    );
};

export default NotificationsPage;
