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
import apiService from '../../services/api';
import soundService from '../../services/soundService';
import socketService from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';
import NotificationsSkeleton from '../../components/common/NotificationsSkeleton';
import Pagination from '../../components/common/Pagination';

const NotificationsPage = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState('all');
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [markingAsRead, setMarkingAsRead] = useState(new Set());
    const itemsPerPage = 10;

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, [currentPage, filter]);

    // Socket connection and real-time notifications
    useEffect(() => {
        if (!user) return;

        console.log('🔌 DriverNotificationsPage: Setting up socket connection for user:', user._id || user.id);

        // Connect to socket if not already connected
        if (!socketService.isConnected()) {
            socketService.connect(user._id || user.id, user.userType || user.role);
        }

        // Check connection status
        const checkConnection = () => {
            setIsConnected(socketService.isConnected());
        };
        checkConnection();
        const connectionInterval = setInterval(checkConnection, 5000);

        // Listen for new notifications
        socketService.on('new-notification', (data) => {
            console.log('🔔 DriverNotificationsPage: Received new notification:', data);

            // Play sound for new notifications
            soundService.playSound('notification');

            // Add new notification to the top of the list
            const newNotification = {
                _id: Date.now().toString(),
                title: data.title || 'New Notification',
                message: data.message || 'You have a new notification',
                type: data.type || 'notification',
                priority: data.priority || 'medium',
                isRead: false,
                createdAt: new Date().toISOString(),
                metadata: data.metadata || {}
            };

            setNotifications(prev => [newNotification, ...prev.slice(0, -1)]);
            setUnreadCount(prev => prev + 1);
        });

        // Listen for delivery assignments
        socketService.on('delivery-assigned', (data) => {
            console.log('🚚 DriverNotificationsPage: Received delivery assignment:', data);

            // Play delivery sound
            soundService.playSound('delivery');

            const deliveryNotification = {
                _id: Date.now().toString(),
                title: 'New Delivery Assigned',
                message: `You have been assigned delivery ${data.deliveryCode || 'Unknown'}`,
                type: 'delivery',
                priority: 'high',
                isRead: false,
                createdAt: new Date().toISOString(),
                metadata: data
            };

            setNotifications(prev => [deliveryNotification, ...prev.slice(0, -1)]);
            setUnreadCount(prev => prev + 1);
        });

        // Listen for admin messages
        socketService.on('admin-message', (data) => {
            console.log('💬 DriverNotificationsPage: Received admin message:', data);

            // Play notification sound
            soundService.playSound('notification');

            const messageNotification = {
                _id: Date.now().toString(),
                title: 'Message from Admin',
                message: data.message || 'You have a new message from admin',
                type: 'message',
                priority: 'medium',
                isRead: false,
                createdAt: new Date().toISOString(),
                metadata: data
            };

            setNotifications(prev => [messageNotification, ...prev.slice(0, -1)]);
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            clearInterval(connectionInterval);
            socketService.off('new-notification');
            socketService.off('delivery-assigned');
            socketService.off('admin-message');
        };
    }, [user]);

    // Silent refresh every 30 seconds
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            fetchNotifications(true); // Silent refresh
            fetchUnreadCount(true); // Silent refresh
        }, 30000);

        return () => clearInterval(refreshInterval);
    }, [currentPage, filter]);

    const fetchNotifications = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            console.log('🔔 DriverNotificationsPage: Fetching notifications with params:', {
                page: currentPage,
                limit: itemsPerPage,
                status: filter === 'all' ? undefined : filter
            });

            const response = await apiService.getDriverNotifications({
                page: currentPage,
                limit: itemsPerPage,
                status: filter === 'all' ? undefined : filter
            });

            console.log('🔔 DriverNotificationsPage: API response:', response);

            if (response && response.success) {
                const notificationsData = response.data?.notifications || response.data || [];
                const notificationsArray = Array.isArray(notificationsData) ? notificationsData : [];

                console.log('🔔 DriverNotificationsPage: Setting notifications:', notificationsArray.length);
                console.log('🔔 DriverNotificationsPage: Sample notification structure:', notificationsArray[0]);
                console.log('🔔 DriverNotificationsPage: All notification IDs:', notificationsArray.map(n => ({ id: n._id, type: typeof n._id, length: n._id?.length })));

                setNotifications(notificationsArray);
                setTotalPages(response.data?.totalPages || 1);
                setTotalItems(response.data?.totalItems || notificationsArray.length);
            } else {
                console.warn('🔔 DriverNotificationsPage: API returned unsuccessful response:', response);
                if (!silent) {
                    toast.error('Failed to load notifications. Please try again.');
                }
                setNotifications([]);
            }
        } catch (error) {
            console.error('❌ DriverNotificationsPage: Error fetching notifications:', error);
            if (!silent) {
                toast.error('Failed to load notifications. Please check your connection.');
            }
            setNotifications([]);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Mock data function removed - using real API data now

    const fetchUnreadCount = async (silent = false) => {
        try {
            const response = await apiService.getDriverUnreadNotificationsCount();

            if (response.success) {
                setUnreadCount(response.data.unreadCount || 0);
            } else {
                // Fallback to mock count
                setUnreadCount(notifications.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
            setUnreadCount(notifications.filter(n => !n.isRead).length);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            console.log('📖 NotificationsPage: Marking notification as read:', notificationId);
            console.log('📖 NotificationsPage: Notification ID type:', typeof notificationId);
            console.log('📖 NotificationsPage: Notification ID length:', notificationId?.length);
            console.log('📖 NotificationsPage: Full notification object:', notifications.find(n => n._id === notificationId));

            // Validate notification ID
            if (!notificationId || typeof notificationId !== 'string') {
                console.warn('📖 NotificationsPage: Invalid notification ID:', notificationId);
                toast.error('Invalid notification ID');
                return;
            }

            // Check if already marking this notification as read
            if (markingAsRead.has(notificationId)) {
                console.log('📖 NotificationsPage: Already marking notification as read:', notificationId);
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
                toast.success('Notification marked as read');
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
                toast.success('Notification marked as read');
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
            toast.success('Notification marked as read');
        } finally {
            // Remove from marking set
            setMarkingAsRead(prev => {
                const newSet = new Set(prev);
                newSet.delete(notificationId);
                return newSet;
            });
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
                // Fallback to local update
                setNotifications(prev =>
                    prev.map(notification => ({ ...notification, isRead: true }))
                );
                setUnreadCount(0);
                toast.success('All notifications marked as read');
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            // Fallback to local update
            setNotifications(prev =>
                prev.map(notification => ({ ...notification, isRead: true }))
            );
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            // Check if this is a real notification from the database (has a MongoDB-style ID)
            const notification = notifications.find(n => n._id === notificationId);
            const isRealNotification = notification && notification._id && notification._id.length > 10;

            if (isRealNotification) {
                // This is a real notification from the database, try to delete via API
                const response = await apiService.deleteNotification(notificationId);

                if (response.success) {
                    setNotifications(prev =>
                        prev.filter(notification => notification._id !== notificationId)
                    );
                    toast.success('Notification deleted');
                } else {
                    // Fallback to local update
                    setNotifications(prev =>
                        prev.filter(notification => notification._id !== notificationId)
                    );
                    toast.success('Notification deleted');
                }
            } else {
                // This is a socket-generated notification or local notification, just remove locally
                setNotifications(prev =>
                    prev.filter(notification => notification._id !== notificationId)
                );
                toast.success('Notification removed');
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            // Fallback to local update
            setNotifications(prev =>
                prev.filter(notification => notification._id !== notificationId)
            );
            toast.success('Notification removed');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'delivery':
                return <TruckIcon className="h-6 w-6" />;
            case 'payment':
                return <CurrencyDollarIcon className="h-6 w-6" />;
            case 'earnings':
                return <ChartBarIcon className="h-6 w-6" />;
            case 'account':
                return <UserGroupIcon className="h-6 w-6" />;
            case 'document':
                return <DocumentTextIcon className="h-6 w-6" />;
            case 'message':
                return <InformationCircleIcon className="h-6 w-6" />;
            default:
                return <BellIcon className="h-6 w-6" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'text-red-600';
            case 'medium':
                return 'text-yellow-600';
            case 'low':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'delivery':
                return 'border-l-green-500';
            case 'payment':
                return 'border-l-blue-500';
            case 'earnings':
                return 'border-l-purple-500';
            case 'account':
                return 'border-l-gray-500';
            case 'document':
                return 'border-l-orange-500';
            default:
                return 'border-l-gray-400';
        }
    };

    const formatTime = (dateString) => {
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

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        return notification.type === filter;
    });

    const paginatedNotifications = filteredNotifications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return <NotificationsSkeleton />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                        <p className="mt-2 text-gray-600">
                            Stay updated with your delivery activities and account information
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Connection Status */}
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-gray-600">
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>

                        {/* Sound Test Button */}


                        {unreadCount > 0 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                {unreadCount} unread
                            </span>
                        )}
                        <button
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${unreadCount === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            <CheckIcon className="h-4 w-4 mr-2" />
                            Mark all as read
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                    {['all', 'delivery', 'payment', 'earnings', 'account', 'document'].map((filterOption) => (
                        <button
                            key={filterOption}
                            onClick={() => setFilter(filterOption)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === filterOption
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {paginatedNotifications.length === 0 ? (
                    <div className="text-center py-12">
                        <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
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
                        {paginatedNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-6 hover:bg-gray-50 transition-colors ${getTypeColor(notification.type)} ${!notification.isRead ? 'border-l-4 border-l-green-500' : ''
                                    } w-full`}
                            >
                                <div className="flex items-start justify-between w-full">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div className={`flex-shrink-0 ${getPriorityColor(notification.priority)}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className={`text-lg font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'
                                                    }`}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.isRead && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        New
                                                    </span>
                                                )}
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                    notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {notification.priority}
                                                </span>
                                            </div>
                                            <p className={`text-sm mb-3 ${notification.isRead ? 'text-gray-600' : 'text-gray-800'
                                                }`}>
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                    <span className="flex items-center">
                                                        <ClockIcon className="h-3 w-3 mr-1" />
                                                        {formatTime(notification.createdAt)}
                                                    </span>
                                                    <span className="capitalize">{notification.type}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 ml-auto">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedNotification(notification);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                                                    >
                                                        View Details
                                                    </button>
                                                    {!notification.isRead && notification._id && (
                                                        <button
                                                            onClick={() => markAsRead(notification._id)}
                                                            disabled={markingAsRead.has(notification._id)}
                                                            className={`text-sm ${markingAsRead.has(notification._id)
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-gray-600 hover:text-gray-700'
                                                                }`}
                                                        >
                                                            {markingAsRead.has(notification._id) ? 'Marking...' : 'Mark as read'}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notification._id)}
                                                        className="text-sm text-red-600 hover:text-red-700"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {/* Notification Details Modal */}
            {showDetailsModal && selectedNotification && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`${getPriorityColor(selectedNotification.priority)}`}>
                                        {getNotificationIcon(selectedNotification.type)}
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {selectedNotification.title}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Message</h3>
                                    <p className="text-gray-900">{selectedNotification.message}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
                                        <p className="text-gray-900 capitalize">{selectedNotification.type}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Priority</h3>
                                        <p className="text-gray-900 capitalize">{selectedNotification.priority}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                                        <p className="text-gray-900">
                                            {selectedNotification.isRead ? 'Read' : 'Unread'}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Time</h3>
                                        <p className="text-gray-900">{formatTime(selectedNotification.createdAt)}</p>
                                    </div>
                                </div>

                                {selectedNotification.metadata && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Details</h3>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                                {JSON.stringify(selectedNotification.metadata, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                {!selectedNotification.isRead && (
                                    <button
                                        onClick={() => {
                                            markAsRead(selectedNotification._id);
                                            setShowDetailsModal(false);
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Mark as Read
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;

