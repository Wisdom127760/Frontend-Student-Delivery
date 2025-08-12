import React, { useState, useEffect } from 'react';
import {
    BellIcon,
    CheckIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    ClockIcon,
    UserGroupIcon,
    TruckIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminNotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read, system, admin, driver
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Mock data for now - replace with API call
    useEffect(() => {
        const loadNotifications = async () => {
            setLoading(true);
            try {
                // TODO: Replace with actual API call
                // const response = await fetch('/api/admin/notifications');
                // const data = await response.json();

                // Mock data
                const mockNotifications = [
                    {
                        _id: '1',
                        title: 'New Driver Registration',
                        message: 'Driver John Doe has completed registration and is pending verification.',
                        type: 'driver_registration',
                        priority: 'medium',
                        isRead: false,
                        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                        metadata: {
                            driverId: 'driver123',
                            driverName: 'John Doe',
                            driverEmail: 'john@example.com'
                        }
                    },
                    {
                        _id: '2',
                        title: 'System Maintenance',
                        message: 'Scheduled maintenance will occur tonight at 2 AM. Expected downtime: 30 minutes.',
                        type: 'system',
                        priority: 'high',
                        isRead: true,
                        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                        metadata: {
                            maintenanceType: 'database',
                            duration: '30 minutes',
                            startTime: '2024-01-15T02:00:00Z'
                        }
                    },
                    {
                        _id: '3',
                        title: 'High Delivery Volume',
                        message: 'Unusually high delivery volume detected. Consider adding more drivers.',
                        type: 'analytics',
                        priority: 'medium',
                        isRead: false,
                        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
                        metadata: {
                            currentVolume: 150,
                            averageVolume: 80,
                            increase: '87.5%'
                        }
                    },
                    {
                        _id: '4',
                        title: 'Payment Processing Issue',
                        message: 'Some driver payments failed to process. Please review the payment logs.',
                        type: 'payment',
                        priority: 'high',
                        isRead: false,
                        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
                        metadata: {
                            failedPayments: 5,
                            totalPayments: 50,
                            errorCode: 'PAYMENT_GATEWAY_ERROR'
                        }
                    },
                    {
                        _id: '5',
                        title: 'Document Verification Complete',
                        message: 'All pending driver documents have been verified.',
                        type: 'document_verification',
                        priority: 'low',
                        isRead: true,
                        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
                        metadata: {
                            verifiedDocuments: 12,
                            totalDocuments: 12
                        }
                    }
                ];

                setNotifications(mockNotifications);
            } catch (error) {
                console.error('Error loading notifications:', error);
                toast.error('Failed to load notifications');
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, []);

    const markAsRead = async (notificationId) => {
        try {
            // TODO: Replace with actual API call
            // await fetch(`/api/admin/notifications/${notificationId}/read`, { method: 'PUT' });

            setNotifications(prev =>
                prev.map(notification =>
                    notification._id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );

            toast.success('Notification marked as read');
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            // TODO: Replace with actual API call
            // await fetch('/api/admin/notifications/mark-all-read', { method: 'PUT' });

            setNotifications(prev =>
                prev.map(notification => ({ ...notification, isRead: true }))
            );

            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark all notifications as read');
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            // TODO: Replace with actual API call
            // await fetch(`/api/admin/notifications/${notificationId}`, { method: 'DELETE' });

            setNotifications(prev =>
                prev.filter(notification => notification._id !== notificationId)
            );

            toast.success('Notification deleted');
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'driver_registration':
                return <UserGroupIcon className="h-5 w-5 text-blue-600" />;
            case 'system':
                return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
            case 'analytics':
                return <ChartBarIcon className="h-5 w-5 text-purple-600" />;
            case 'payment':
                return <CurrencyDollarIcon className="h-5 w-5 text-green-600" />;
            case 'document_verification':
                return <DocumentTextIcon className="h-5 w-5 text-orange-600" />;
            case 'delivery':
                return <TruckIcon className="h-5 w-5 text-indigo-600" />;
            default:
                return <BellIcon className="h-5 w-5 text-gray-600" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'driver_registration':
                return 'bg-blue-50 border-blue-200';
            case 'system':
                return 'bg-gray-50 border-gray-200';
            case 'analytics':
                return 'bg-purple-50 border-purple-200';
            case 'payment':
                return 'bg-green-50 border-green-200';
            case 'document_verification':
                return 'bg-orange-50 border-orange-200';
            case 'delivery':
                return 'bg-indigo-50 border-indigo-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (hours < 24) {
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else {
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.isRead;
        if (filter === 'read') return notification.isRead;
        return notification.type === filter;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, index) => (
                                <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <BellIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Notifications</h1>
                            <p className="text-gray-600 mt-1">Manage system notifications and alerts</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
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
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                        {['all', 'unread', 'read', 'driver_registration', 'system', 'analytics', 'payment'].map((filterOption) => (
                            <button
                                key={filterOption}
                                onClick={() => setFilter(filterOption)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === filterOption
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {filterOption.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {filteredNotifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                            <p className="text-gray-600">
                                {filter === 'all'
                                    ? 'No notifications available.'
                                    : `No ${filter.replace('_', ' ')} notifications found.`
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-6 hover:bg-gray-50 transition-colors ${getTypeColor(notification.type)} ${!notification.isRead ? 'border-l-4 border-l-green-500' : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className={`text-lg font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'
                                                        }`}>
                                                        {notification.title}
                                                    </h3>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                                                        {notification.priority}
                                                    </span>
                                                    {!notification.isRead && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-sm mb-3 ${notification.isRead ? 'text-gray-600' : 'text-gray-800'
                                                    }`}>
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                    <span className="flex items-center">
                                                        <ClockIcon className="w-3 h-3 mr-1" />
                                                        {formatTime(notification.createdAt)}
                                                    </span>
                                                    <span className="capitalize">
                                                        {notification.type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedNotification(notification);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <InformationCircleIcon className="h-5 w-5" />
                                            </button>

                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Mark as Read"
                                                >
                                                    <CheckIcon className="h-5 w-5" />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => deleteNotification(notification._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <XMarkIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedNotification && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Notification Details</h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <p className="text-gray-900">{selectedNotification.title}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <p className="text-gray-900">{selectedNotification.message}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <p className="text-gray-900 capitalize">{selectedNotification.type.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <p className="text-gray-900 capitalize">{selectedNotification.priority}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                                <p className="text-gray-900">{selectedNotification.createdAt.toLocaleString()}</p>
                            </div>

                            {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Metadata</label>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                            {JSON.stringify(selectedNotification.metadata, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNotificationsPage;
