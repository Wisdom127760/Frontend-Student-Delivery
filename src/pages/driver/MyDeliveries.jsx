import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../../services/api';
import DriverLayout from '../../components/layouts/DriverLayout';
import Pagination from '../../components/common/Pagination';
import { DeliveriesPageSkeleton } from '../../components/common/SkeletonLoader';
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
    ClipboardDocumentIcon,
    ArrowPathIcon,
    Squares2X2Icon,
    ListBulletIcon,
    CalendarDaysIcon,
    UserIcon
} from '@heroicons/react/24/outline';

const MyDeliveries = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);

    // Load deliveries data
    const loadDeliveries = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiService.getDriverDeliveries({
                limit: 100,
                page: 1
            });

            if (response.success) {
                const formattedDeliveries = response.data.deliveries?.map(delivery => ({
                    id: delivery._id || delivery.id,
                    deliveryCode: delivery.deliveryCode || delivery.code || `DEL-${delivery.id}`,
                    customerName: delivery.customerName || delivery.customer?.name || 'N/A',
                    customerPhone: delivery.customerPhone || delivery.customer?.phone || 'N/A',
                    pickupAddress: delivery.pickupLocation || delivery.pickupAddress || 'Pickup location',
                    pickupLocationLink: delivery.pickupLocationLink || '',
                    deliveryAddress: delivery.deliveryLocation || delivery.deliveryAddress || 'Delivery location',
                    deliveryLocationLink: delivery.deliveryLocationLink || '',
                    amount: delivery.fee || delivery.amount || 0,
                    status: delivery.status || 'pending',
                    estimatedTime: delivery.estimatedTime || '25 min',
                    createdAt: delivery.createdAt || new Date().toISOString(),
                    startedAt: delivery.startedAt,
                    completedAt: delivery.completedAt,
                    notes: delivery.notes || ''
                })) || [];

                setDeliveries(formattedDeliveries);
            } else {
                // Fallback to mock data for demonstration
                const mockDeliveries = [
                    {
                        id: 1,
                        deliveryCode: 'GRP-001',
                        customerName: 'Alice Johnson',
                        customerPhone: '+90 533 123 4567',
                        pickupAddress: 'EMU Campus, Famagusta',
                        deliveryAddress: 'Near EMU Dormitories, Famagusta',
                        amount: 35.00,
                        status: 'assigned',
                        estimatedTime: '15 min',
                        createdAt: new Date().toISOString(),
                        notes: 'Please call when you arrive'
                    },
                    {
                        id: 2,
                        deliveryCode: 'GRP-002',
                        customerName: 'John Smith',
                        customerPhone: '+90 533 987 6543',
                        pickupAddress: 'Salamis Road, Famagusta',
                        deliveryAddress: 'City Center, Famagusta',
                        amount: 42.50,
                        status: 'pending',
                        estimatedTime: '20 min',
                        createdAt: new Date().toISOString(),
                        notes: 'Handle with care - fragile items'
                    }
                ];
                setDeliveries(mockDeliveries);
            }
        } catch (error) {
            console.error('Error loading deliveries:', error);
            toast.error('Failed to load deliveries');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDeliveries();
    }, [loadDeliveries]);

    // Refresh deliveries
    const refreshDeliveries = async () => {
        setRefreshing(true);
        await loadDeliveries();
        setRefreshing(false);
        toast.success('Deliveries refreshed!');
    };

    // Status helpers
    const getStatusConfig = (status) => {
        const configs = {
            delivered: {
                color: 'bg-green-500',
                bgColor: 'bg-green-50',
                textColor: 'text-green-700',
                borderColor: 'border-green-200',
                icon: CheckCircleIcon,
                label: 'Delivered'
            },
            assigned: {
                color: 'bg-blue-500',
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-700',
                borderColor: 'border-blue-200',
                icon: TruckIcon,
                label: 'Assigned'
            },
            pending: {
                color: 'bg-yellow-500',
                bgColor: 'bg-yellow-50',
                textColor: 'text-yellow-700',
                borderColor: 'border-yellow-200',
                icon: ExclamationTriangleIcon,
                label: 'Pending'
            },
            picked_up: {
                color: 'bg-purple-500',
                bgColor: 'bg-purple-50',
                textColor: 'text-purple-700',
                borderColor: 'border-purple-200',
                icon: PlayIcon,
                label: 'In Progress'
            },
            in_progress: {
                color: 'bg-purple-500',
                bgColor: 'bg-purple-50',
                textColor: 'text-purple-700',
                borderColor: 'border-purple-200',
                icon: PlayIcon,
                label: 'In Progress'
            }
        };
        return configs[status] || configs.pending;
    };

    // Action handlers
    const handleStartDelivery = async (deliveryId) => {
        try {
            const response = await apiService.updateDeliveryStatus(deliveryId, 'picked_up');
            if (response.success) {
                setDeliveries(prev => prev.map(d =>
                    d.id === deliveryId
                        ? { ...d, status: 'picked_up', startedAt: new Date().toISOString() }
                        : d
                ));
                toast.success('Delivery started!');
            }
        } catch (error) {
            console.error('Error starting delivery:', error);
            toast.error('Failed to start delivery');
        }
    };

    const handleCompleteDelivery = async (deliveryId) => {
        try {
            const response = await apiService.updateDeliveryStatus(deliveryId, 'delivered');
            if (response.success) {
                setDeliveries(prev => prev.map(d =>
                    d.id === deliveryId
                        ? { ...d, status: 'delivered', completedAt: new Date().toISOString() }
                        : d
                ));
                toast.success('Delivery completed!');
            }
        } catch (error) {
            console.error('Error completing delivery:', error);
            toast.error('Failed to complete delivery');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    // Calculate stats
    const stats = {
        total: deliveries.length,
        pending: deliveries.filter(d => d.status === 'pending').length,
        assigned: deliveries.filter(d => d.status === 'assigned').length,
        delivered: deliveries.filter(d => d.status === 'delivered').length,
        inProgress: deliveries.filter(d => ['picked_up', 'in_progress'].includes(d.status)).length
    };

    // Filter deliveries
    const filteredDeliveries = deliveries.filter(delivery => {
        return statusFilter === 'all' || delivery.status === statusFilter;
    });

    // Pagination
    const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDeliveries = filteredDeliveries.slice(startIndex, endIndex);

    if (loading) {
        return (
            <DriverLayout>
                <DeliveriesPageSkeleton />
            </DriverLayout>
        );
    }

    return (
        <DriverLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Deliveries</h1>
                        <p className="text-gray-600 mt-1">Track and manage your delivery assignments</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                        {/* Refresh Button */}
                        <button
                            onClick={refreshDeliveries}
                            disabled={refreshing}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>

                        {/* View Mode Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'grid'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Squares2X2Icon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'list'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <ListBulletIcon className="w-4 h-4" />
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
                                <option value="all">All Status</option>
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
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <TruckIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <TruckIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Assigned</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.assigned}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <PlayIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Delivered</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deliveries Content */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedDeliveries.map((delivery) => {
                            const statusConfig = getStatusConfig(delivery.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div key={delivery.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
                                    {/* Header */}
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <button
                                                onClick={() => copyToClipboard(delivery.deliveryCode)}
                                                className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors flex items-center group"
                                            >
                                                {delivery.deliveryCode}
                                                <ClipboardDocumentIcon className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <UserIcon className="w-4 h-4" />
                                            <span>{delivery.customerName}</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-4">
                                        {/* Amount */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Amount:</span>
                                            <span className="text-xl font-bold text-green-600">₺{delivery.amount}</span>
                                        </div>

                                        {/* Locations */}
                                        <div className="space-y-3">
                                            <div className="flex items-start space-x-3">
                                                <div className="p-1 bg-blue-100 rounded-lg mt-0.5">
                                                    <MapPinIcon className="w-3 h-3 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500 mb-1">Pickup</p>
                                                    <p className="text-sm text-gray-900 truncate">{delivery.pickupAddress}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="p-1 bg-green-100 rounded-lg mt-0.5">
                                                    <MapPinIcon className="w-3 h-3 text-green-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500 mb-1">Delivery</p>
                                                    <p className="text-sm text-gray-900 truncate">{delivery.deliveryAddress}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Time & Details */}
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center space-x-1 text-gray-600">
                                                <ClockIcon className="w-4 h-4" />
                                                <span>{delivery.estimatedTime}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-gray-600">
                                                <CalendarDaysIcon className="w-4 h-4" />
                                                <span>{new Date(delivery.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {delivery.notes && (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-600 mb-1">Notes:</p>
                                                <p className="text-sm text-gray-900">{delivery.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="p-6 border-t border-gray-100 space-y-2">
                                        {(delivery.status === 'assigned' || delivery.status === 'pending') && (
                                            <button
                                                onClick={() => handleStartDelivery(delivery.id)}
                                                className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                                            >
                                                <PlayIcon className="w-4 h-4 mr-2" />
                                                Start Delivery
                                            </button>
                                        )}
                                        {(delivery.status === 'picked_up' || delivery.status === 'in_progress') && (
                                            <button
                                                onClick={() => handleCompleteDelivery(delivery.id)}
                                                className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                                            >
                                                <CheckCircleIcon className="w-4 h-4 mr-2" />
                                                Complete Delivery
                                            </button>
                                        )}
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => window.open(`tel:${delivery.customerPhone}`)}
                                                className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center"
                                            >
                                                <PhoneIcon className="w-4 h-4 mr-1" />
                                                Call
                                            </button>
                                            <button
                                                onClick={() => window.open(`/track/${delivery.deliveryCode}`, '_blank')}
                                                className="flex-1 bg-gray-50 text-gray-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center"
                                            >
                                                <EyeIcon className="w-4 h-4 mr-1" />
                                                Track
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // List View
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedDeliveries.map((delivery) => {
                                        const statusConfig = getStatusConfig(delivery.status);
                                        const StatusIcon = statusConfig.icon;

                                        return (
                                            <tr key={delivery.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => copyToClipboard(delivery.deliveryCode)}
                                                        className="text-sm font-medium text-gray-900 hover:text-green-600 transition-colors"
                                                    >
                                                        {delivery.deliveryCode}
                                                    </button>
                                                    <p className="text-xs text-gray-500">{delivery.estimatedTime}</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{delivery.customerName}</div>
                                                    <div className="text-xs text-gray-500">{delivery.customerPhone}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-gray-900 max-w-xs">
                                                        <div className="truncate mb-1">📍 {delivery.pickupAddress}</div>
                                                        <div className="truncate">🏁 {delivery.deliveryAddress}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">₺{delivery.amount}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                                                        <StatusIcon className="w-3 h-3 mr-1" />
                                                        {statusConfig.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        {(delivery.status === 'assigned' || delivery.status === 'pending') && (
                                                            <button
                                                                onClick={() => handleStartDelivery(delivery.id)}
                                                                className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors"
                                                            >
                                                                Start
                                                            </button>
                                                        )}
                                                        {(delivery.status === 'picked_up' || delivery.status === 'in_progress') && (
                                                            <button
                                                                onClick={() => handleCompleteDelivery(delivery.id)}
                                                                className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors"
                                                            >
                                                                Complete
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => window.open(`tel:${delivery.customerPhone}`)}
                                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                                                        >
                                                            Call
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {filteredDeliveries.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries found</h3>
                        <p className="text-gray-500 mb-4">
                            {statusFilter === 'all'
                                ? "You don't have any deliveries yet."
                                : `No deliveries with "${statusFilter}" status.`
                            }
                        </p>
                        <button
                            onClick={refreshDeliveries}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <ArrowPathIcon className="w-4 h-4 mr-2" />
                            Refresh Deliveries
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {filteredDeliveries.length > itemsPerPage && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredDeliveries.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        className="mt-6"
                    />
                )}
            </div>
        </DriverLayout>
    );
};

export default MyDeliveries;