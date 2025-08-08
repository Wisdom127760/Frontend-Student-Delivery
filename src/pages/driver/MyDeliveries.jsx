import React, { useState, useEffect, useCallback } from 'react';
import systemSettingsService from '../../services/systemSettings';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';
import {
    TruckIcon,
    MapPinIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    PhoneIcon,
    EyeIcon,
    PlayIcon,
    FunnelIcon,
    ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

const MyDeliveries = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    const loadDeliveries = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/driver/deliveries`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const formattedDeliveries = data.data.deliveries.map(delivery => ({
                        id: delivery._id,
                        deliveryCode: delivery.deliveryCode,
                        customerName: delivery.customerName || 'N/A',
                        customerPhone: delivery.customerPhone || 'N/A',
                        pickupAddress: delivery.pickupLocation,
                        pickupLocationLink: delivery.pickupLocationLink || '',
                        deliveryAddress: delivery.deliveryLocation,
                        deliveryLocationLink: delivery.deliveryLocationLink || '',
                        amount: delivery.fee,
                        status: delivery.status,
                        estimatedTime: delivery.estimatedTime ? new Date(delivery.estimatedTime).toLocaleTimeString() : 'N/A',
                        createdAt: delivery.createdAt,
                        startedAt: delivery.startedAt,
                        completedAt: delivery.completedAt,
                        notes: delivery.notes || ''
                    }));
                    setDeliveries(formattedDeliveries);
                }
            } else {
                // Fallback to mock data if API fails
                const mockDeliveries = [
                    {
                        id: 1,
                        deliveryCode: 'GRP-123456',
                        customerName: 'John Smith',
                        customerPhone: '+1 555-0123',
                        pickupAddress: '123 Main St, Downtown',
                        deliveryAddress: '456 Oak Ave, Uptown',
                        amount: 45.00,
                        status: 'assigned',
                        estimatedTime: '25 min',
                        createdAt: '2024-01-15T10:30:00Z',
                        startedAt: '2024-01-15T10:35:00Z',
                        completedAt: null,
                        notes: 'Customer prefers contactless delivery'
                    },
                    {
                        id: 2,
                        deliveryCode: 'GRP-123457',
                        customerName: 'Sarah Wilson',
                        customerPhone: '+1 555-0456',
                        pickupAddress: '789 Pine St, Midtown',
                        deliveryAddress: '321 Elm St, Westside',
                        amount: 32.50,
                        status: 'pending',
                        estimatedTime: '18 min',
                        createdAt: '2024-01-15T11:00:00Z',
                        startedAt: null,
                        completedAt: null,
                        notes: 'Fragile items - handle with care'
                    },
                    {
                        id: 3,
                        deliveryCode: 'GRP-123458',
                        customerName: 'David Lee',
                        customerPhone: '+1 555-0789',
                        pickupAddress: '654 Maple Dr, Eastside',
                        deliveryAddress: '987 Cedar Ln, Northside',
                        amount: 28.00,
                        status: 'delivered',
                        estimatedTime: '22 min',
                        createdAt: '2024-01-15T09:00:00Z',
                        startedAt: '2024-01-15T09:05:00Z',
                        completedAt: '2024-01-15T09:25:00Z',
                        notes: 'Delivered successfully'
                    }
                ];
                setDeliveries(mockDeliveries);
            }
        } catch (error) {
            console.error('Error loading deliveries:', error);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        loadDeliveries();
    }, [loadDeliveries]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'assigned':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'picked_up':
                return 'text-purple-600 bg-purple-50 border-purple-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <CheckCircleIcon className="w-4 h-4" />;
            case 'assigned':
                return <TruckIcon className="w-4 h-4" />;
            case 'pending':
                return <ExclamationTriangleIcon className="w-4 h-4" />;
            case 'picked_up':
                return <PlayIcon className="w-4 h-4" />;
            default:
                return <ClockIcon className="w-4 h-4" />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'delivered':
                return 'Delivered';
            case 'assigned':
                return 'Assigned';
            case 'pending':
                return 'Pending';
            case 'picked_up':
                return 'In Progress';
            default:
                return 'Unknown';
        }
    };

    const filteredDeliveries = deliveries.filter(delivery => {
        return statusFilter === 'all' || delivery.status === statusFilter;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDeliveries = filteredDeliveries.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page
    };

    const handleStartDelivery = async (deliveryId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/driver/deliveries/${deliveryId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'picked_up' })
            });

            if (response.ok) {
                setDeliveries(prev => prev.map(d =>
                    d.id === deliveryId
                        ? { ...d, status: 'picked_up', startedAt: new Date().toISOString() }
                        : d
                ));
            } else {
                const errorData = await response.json();
                console.error('Failed to update delivery status:', errorData.error);
            }
        } catch (error) {
            console.error('Error updating delivery status:', error);
        }
    };

    const handleCompleteDelivery = async (deliveryId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/driver/deliveries/${deliveryId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'delivered' })
            });

            if (response.ok) {
                setDeliveries(prev => prev.map(d =>
                    d.id === deliveryId
                        ? { ...d, status: 'delivered', completedAt: new Date().toISOString() }
                        : d
                ));
            } else {
                const errorData = await response.json();
                console.error('Failed to update delivery status:', errorData.error);
            }
        } catch (error) {
            console.error('Error updating delivery status:', error);
        }
    };

    const stats = {
        total: deliveries.length,
        pending: deliveries.filter(d => d.status === 'pending').length,
        assigned: deliveries.filter(d => d.status === 'assigned').length,
        delivered: deliveries.filter(d => d.status === 'delivered').length,
        inProgress: deliveries.filter(d => d.status === 'picked_up').length
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Deliveries</h1>
                        <p className="text-gray-600">Track and manage your delivery assignments</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                                <div className="ml-4 flex-1">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Deliveries</h1>
                    <p className="text-gray-600">Track and manage your delivery assignments</p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'grid'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'list'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            List
                        </button>
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                        >
                            <option value="all">All Deliveries</option>
                            <option value="pending">Pending</option>
                            <option value="assigned">Assigned</option>
                            <option value="picked_up">In Progress</option>
                            <option value="delivered">Delivered</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <TruckIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <TruckIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Assigned</p>
                            <p className="text-xl font-bold text-gray-900">{stats.assigned}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <PlayIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">In Progress</p>
                            <p className="text-xl font-bold text-gray-900">{stats.inProgress}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Delivered</p>
                            <p className="text-xl font-bold text-gray-900">{stats.delivered}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deliveries Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedDeliveries.map((delivery) => (
                        <div key={delivery.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(delivery.deliveryCode);
                                            toast.success('Delivery code copied to clipboard!');
                                        }}
                                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 hover:underline cursor-pointer flex items-center"
                                        title="Click to copy delivery code"
                                    >
                                        {delivery.deliveryCode}
                                        <ClipboardDocumentIcon className="w-4 h-4 ml-1 opacity-50 hover:opacity-100" />
                                    </button>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(delivery.status)}`}>
                                        {getStatusIcon(delivery.status)}
                                        <span className="ml-1">{getStatusLabel(delivery.status)}</span>
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">{delivery.customerName}</p>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Amount:</span>
                                    <span className="text-lg font-bold text-gray-900">{systemSettingsService.formatCurrency(delivery.amount)}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-start space-x-2">
                                        <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Pickup</p>
                                            <div className="flex items-center space-x-2">
                                                {delivery.pickupLocationLink ? (
                                                    <a
                                                        href={delivery.pickupLocationLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-gray-900 truncate flex-1 hover:text-blue-600 hover:underline cursor-pointer"
                                                        title="Open pickup location in maps"
                                                    >
                                                        {delivery.pickupAddress}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm text-gray-900 truncate flex-1">{delivery.pickupAddress}</p>
                                                )}
                                                {delivery.pickupLocationLink && (
                                                    <a
                                                        href={delivery.pickupLocationLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                        title="Open pickup location in maps"
                                                    >
                                                        <MapPinIcon className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Delivery</p>
                                            <div className="flex items-center space-x-2">
                                                {delivery.deliveryLocationLink ? (
                                                    <a
                                                        href={delivery.deliveryLocationLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-gray-900 truncate flex-1 hover:text-blue-600 hover:underline cursor-pointer"
                                                        title="Open delivery location in maps"
                                                    >
                                                        {delivery.deliveryAddress}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm text-gray-900 truncate flex-1">{delivery.deliveryAddress}</p>
                                                )}
                                                {delivery.deliveryLocationLink && (
                                                    <a
                                                        href={delivery.deliveryLocationLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                        title="Open delivery location in maps"
                                                    >
                                                        <MapPinIcon className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Est. Time:</span>
                                    <span className="font-medium">{delivery.estimatedTime}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 border-t border-gray-100 space-y-2">
                                {(delivery.status === 'assigned' || delivery.status === 'pending') && (
                                    <button
                                        onClick={() => handleStartDelivery(delivery.id)}
                                        className="w-full bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center"
                                    >
                                        <PlayIcon className="w-4 h-4 mr-1" />
                                        Start Delivery
                                    </button>
                                )}
                                {(delivery.status === 'picked_up' || delivery.status === 'in_progress') && (
                                    <button
                                        onClick={() => handleCompleteDelivery(delivery.id)}
                                        className="w-full bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center"
                                    >
                                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                                        Complete Delivery
                                    </button>
                                )}
                                <button
                                    onClick={() => window.open(`/track/${delivery.deliveryCode}`, '_blank')}
                                    className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
                                >
                                    <EyeIcon className="w-4 h-4 mr-1" />
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {paginatedDeliveries.map((delivery) => (
                        <div key={delivery.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-full border ${getStatusColor(delivery.status)}`}>
                                        {getStatusIcon(delivery.status)}
                                    </div>
                                    <div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(delivery.deliveryCode);
                                                toast.success('Delivery code copied to clipboard!');
                                            }}
                                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 hover:underline cursor-pointer flex items-center"
                                            title="Click to copy delivery code"
                                        >
                                            {delivery.deliveryCode}
                                            <ClipboardDocumentIcon className="w-4 h-4 ml-1 opacity-50 hover:opacity-100" />
                                        </button>
                                        <p className="text-sm text-gray-500">{delivery.customerName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">{systemSettingsService.formatCurrency(delivery.amount)}</p>
                                    <p className="text-sm text-gray-500">{delivery.estimatedTime}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-sm">
                                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                                        <div className="flex items-center space-x-2">
                                            {delivery.pickupLocationLink ? (
                                                <a
                                                    href={delivery.pickupLocationLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-600 hover:text-blue-600 hover:underline cursor-pointer"
                                                    title="Open pickup location in maps"
                                                >
                                                    Pickup: {delivery.pickupAddress}
                                                </a>
                                            ) : (
                                                <span className="text-gray-600">Pickup: {delivery.pickupAddress}</span>
                                            )}
                                            {delivery.pickupLocationLink && (
                                                <a
                                                    href={delivery.pickupLocationLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                    title="Open pickup location in maps"
                                                >
                                                    <MapPinIcon className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                                        <div className="flex items-center space-x-2">
                                            {delivery.deliveryLocationLink ? (
                                                <a
                                                    href={delivery.deliveryLocationLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-600 hover:text-blue-600 hover:underline cursor-pointer"
                                                    title="Open delivery location in maps"
                                                >
                                                    Delivery: {delivery.deliveryAddress}
                                                </a>
                                            ) : (
                                                <span className="text-gray-600">Delivery: {delivery.deliveryAddress}</span>
                                            )}
                                            {delivery.deliveryLocationLink && (
                                                <a
                                                    href={delivery.deliveryLocationLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                    title="Open delivery location in maps"
                                                >
                                                    <MapPinIcon className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{delivery.customerPhone}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Created:</span>
                                        <span className="font-medium">
                                            {new Date(delivery.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    {delivery.notes && (
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">Notes:</span> {delivery.notes}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                {(delivery.status === 'assigned' || delivery.status === 'pending') && (
                                    <button
                                        onClick={() => handleStartDelivery(delivery.id)}
                                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center"
                                    >
                                        <PlayIcon className="w-4 h-4 mr-1" />
                                        Start Delivery
                                    </button>
                                )}
                                {(delivery.status === 'picked_up' || delivery.status === 'in_progress') && (
                                    <button
                                        onClick={() => handleCompleteDelivery(delivery.id)}
                                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center"
                                    >
                                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                                        Complete Delivery
                                    </button>
                                )}
                                <button
                                    onClick={() => window.open(`/track/${delivery.deliveryCode}`, '_blank')}
                                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
                                >
                                    <EyeIcon className="w-4 h-4 mr-1" />
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredDeliveries.length === 0 && (
                <div className="text-center py-12">
                    <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries found</h3>
                    <p className="text-gray-500">You don't have any deliveries matching your current filter.</p>
                </div>
            )}

            {/* Pagination */}
            {filteredDeliveries.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    totalItems={filteredDeliveries.length}
                    startIndex={startIndex}
                    endIndex={endIndex}
                />
            )}
        </div>
    );
};

export default MyDeliveries;
