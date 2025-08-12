import React, { useState, useEffect, useCallback } from 'react';
// import { useAuth } from '../../context/AuthContext';
import {
    CurrencyDollarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    PlusIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import Pagination from '../../components/common/Pagination';

const RemittancePage = () => {
    // const { user } = useAuth();
    const [remittances, setRemittances] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [driversLoading, setDriversLoading] = useState(false);
    const [stats, setStats] = useState({});
    const [filters, setFilters] = useState({
        status: '',
        driverId: '',
        startDate: '',
        endDate: ''
    });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedRemittance, setSelectedRemittance] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [formData, setFormData] = useState({
        driverId: '',
        notes: ''
    });
    const [unsettledDeliveries, setUnsettledDeliveries] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const fetchRemittances = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) params.append(key, filters[key]);
            });

            // Add pagination parameters
            params.append('page', currentPage.toString());
            params.append('limit', itemsPerPage.toString());

            const response = await api.get(`/remittance?${params}`);
            if (response.data && response.data.remittances) {
                setRemittances(response.data.remittances);
                setTotalPages(response.data.totalPages || 1);
                setTotalItems(response.data.totalItems || response.data.remittances.length);
            } else {
                setRemittances([]);
                setTotalPages(1);
                setTotalItems(0);
            }
        } catch (error) {
            console.error('Error fetching remittances:', error);
            setRemittances([]);
            setTotalPages(1);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    }, [filters, currentPage, itemsPerPage]);

    const fetchDrivers = useCallback(async () => {
        try {
            setDriversLoading(true);
            console.log('Fetching drivers...');

            // Try the admin drivers endpoint first
            let response;
            try {
                response = await api.get('/admin/drivers');
                console.log('Admin drivers response:', response);
            } catch (error) {
                console.log('Admin drivers endpoint failed, trying alternative...');
                // Fallback to a different endpoint if admin/drivers fails
                response = await api.get('/driver/all');
                console.log('Alternative drivers response:', response);
            }

            if (response.data && response.data.drivers) {
                console.log('Setting drivers:', response.data.drivers);
                setDrivers(response.data.drivers);
            } else if (response.data && Array.isArray(response.data)) {
                console.log('Setting drivers from array:', response.data);
                setDrivers(response.data);
            } else {
                console.log('No drivers data in response');
                setDrivers([]);
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
            console.error('Error details:', error.response?.data);
            setDrivers([]);
        } finally {
            setDriversLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const response = await api.get('/remittance/stats');
            if (response.data && response.data.stats) {
                setStats(response.data.stats);
            } else {
                setStats({});
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats({});
        }
    }, []);

    useEffect(() => {
        fetchRemittances();
        fetchDrivers();
        fetchStats();
    }, [fetchRemittances, fetchDrivers, fetchStats]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const fetchUnsettledDeliveries = async (driverId) => {
        try {
            const response = await api.get(`/remittance/unsettled/${driverId}`);
            if (response.data && response.data.deliveries) {
                setUnsettledDeliveries(response.data.deliveries);
                return response.data;
            } else {
                setUnsettledDeliveries([]);
                return { deliveries: [], totalAmount: 0, deliveryCount: 0 };
            }
        } catch (error) {
            console.error('Error fetching unsettled deliveries:', error);
            setUnsettledDeliveries([]);
            return { deliveries: [], totalAmount: 0, deliveryCount: 0 };
        }
    };

    const handleCreateRemittance = async (e) => {
        e.preventDefault();
        if (!formData.driverId) {
            setToast({ show: true, message: 'Please select a driver', type: 'error' });
            return;
        }

        try {
            const response = await api.post(`/remittance/calculate/${formData.driverId}`, {
                notes: formData.notes
            });

            if (response.data.success) {
                setToast({
                    show: true,
                    message: `Remittance calculated successfully! Amount: ₺${response.data.totalAmount} for ${response.data.deliveryCount} deliveries`,
                    type: 'success'
                });
            }

            setShowCreateModal(false);
            setFormData({
                driverId: '',
                notes: ''
            });
            setUnsettledDeliveries([]);
            setSelectedDriver(null);
            fetchRemittances();
        } catch (error) {
            console.error('Error calculating remittance:', error);
            setToast({
                show: true,
                message: error.response?.data?.message || 'Error calculating remittance',
                type: 'error'
            });
        }
    };

    const handleCompleteRemittance = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/remittance/${selectedRemittance._id}/complete`, {
                notes: formData.notes
            });
            setShowCompleteModal(false);
            setSelectedRemittance(null);
            setFormData({ ...formData, notes: '' });
            fetchRemittances();
            fetchStats();
        } catch (error) {
            console.error('Error completing remittance:', error);
        }
    };

    const handleCancelRemittance = async (remittanceId, reason) => {
        try {
            await api.patch(`/remittance/${remittanceId}/cancel`, { reason });
            fetchRemittances();
            fetchStats();
        } catch (error) {
            console.error('Error cancelling remittance:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <ClockIcon className="h-4 w-4" />;
            case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
            case 'cancelled': return <XCircleIcon className="h-4 w-4" />;
            default: return <ClockIcon className="h-4 w-4" />;
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${toast.type === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}>
                    <div className="flex items-center">
                        <span className="mr-2">
                            {toast.type === 'success' ? '✅' : '❌'}
                        </span>
                        <span>{toast.message}</span>
                        <button
                            onClick={() => setToast({ ...toast, show: false })}
                            className="ml-4 text-white hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Remittance Management</h1>
                    <p className="text-gray-600">Automatically calculate remittances from completed deliveries</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => {
                            console.log('Manual refresh of drivers...');
                            fetchDrivers();
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        🔄 Refresh Drivers
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Calculate Remittance
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <ClockIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completed || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <XCircleIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Cancelled</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.cancelled || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900">₺{stats.totalAmount || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                    <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                        value={filters.driverId}
                        onChange={(e) => setFilters({ ...filters, driverId: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={driversLoading}
                    >
                        <option value="">All Drivers</option>
                        {driversLoading ? (
                            <option value="" disabled>Loading...</option>
                        ) : drivers && drivers.length > 0 ? (
                            drivers.map(driver => (
                                <option key={driver._id} value={driver._id}>{driver.name}</option>
                            ))
                        ) : (
                            <option value="" disabled>No drivers found</option>
                        )}
                    </select>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
            </div>

            {/* Remittances Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Remittances</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reference
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Driver
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Handled By
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {remittances.map((remittance) => (
                                <tr key={remittance._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {remittance.referenceNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {remittance.driverId?.name || remittance.driverName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {remittance.driverId?.email || remittance.driverEmail}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₺{remittance.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(remittance.status)}`}>
                                            {getStatusIcon(remittance.status)}
                                            <span className="ml-1">{remittance.status}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {remittance.handledBy?.name || remittance.handledByName || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(remittance.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {remittance.status === 'pending' && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRemittance(remittance);
                                                        setShowCompleteModal(true);
                                                    }}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Complete
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedRemittance(remittance);
                                                        setCancelReason('');
                                                        setShowCancelModal(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
            </div>

            {/* Calculate Remittance Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculate Remittance</h3>
                        <form onSubmit={handleCreateRemittance}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Driver
                                    </label>
                                    <select
                                        value={formData.driverId}
                                        onChange={async (e) => {
                                            const driverId = e.target.value;
                                            setFormData({ ...formData, driverId });
                                            if (driverId) {
                                                await fetchUnsettledDeliveries(driverId);
                                                setSelectedDriver(drivers.find(d => d._id === driverId));
                                            } else {
                                                setUnsettledDeliveries([]);
                                                setSelectedDriver(null);
                                            }
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                        disabled={driversLoading}
                                    >
                                        <option value="">{driversLoading ? 'Loading drivers...' : 'Select Driver'}</option>
                                        {driversLoading ? (
                                            <option value="" disabled>Loading...</option>
                                        ) : drivers && drivers.length > 0 ? (
                                            drivers.map(driver => (
                                                <option key={driver._id} value={driver._id}>{driver.name}</option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No drivers found</option>
                                        )}
                                    </select>
                                </div>

                                {selectedDriver && unsettledDeliveries.length > 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="text-sm font-medium text-blue-900 mb-2">Unsettled Deliveries</h4>
                                        <div className="space-y-2">
                                            <p className="text-sm text-blue-800">
                                                <strong>Driver:</strong> {selectedDriver.name}
                                            </p>
                                            <p className="text-sm text-blue-800">
                                                <strong>Unsettled Deliveries:</strong> {unsettledDeliveries.length}
                                            </p>
                                            <p className="text-sm text-blue-800">
                                                <strong>Total Amount:</strong> ₺{unsettledDeliveries.reduce((sum, d) => sum + (d.companyEarning || 50), 0)}
                                            </p>
                                        </div>
                                        <div className="mt-3 max-h-32 overflow-y-auto">
                                            {unsettledDeliveries.slice(0, 5).map((delivery, index) => (
                                                <div key={delivery._id} className="text-xs text-blue-700 bg-blue-100 p-2 rounded mb-1">
                                                    <div><strong>Delivery {index + 1}:</strong> {delivery.deliveryCode}</div>
                                                    <div>Amount: ₺{delivery.companyEarning || 50}</div>
                                                    <div>Delivered: {new Date(delivery.deliveredAt).toLocaleDateString()}</div>
                                                </div>
                                            ))}
                                            {unsettledDeliveries.length > 5 && (
                                                <div className="text-xs text-blue-600 italic">
                                                    +{unsettledDeliveries.length - 5} more deliveries
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedDriver && unsettledDeliveries.length === 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-sm text-yellow-800">
                                            No unsettled deliveries found for {selectedDriver.name}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        rows="3"
                                        placeholder="Add any notes about this remittance..."
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setFormData({ driverId: '', notes: '' });
                                        setUnsettledDeliveries([]);
                                        setSelectedDriver(null);
                                    }}
                                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!formData.driverId || unsettledDeliveries.length === 0}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Calculate & Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Complete Remittance Modal */}
            {showCompleteModal && selectedRemittance && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Remittance</h3>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Reference:</strong> {selectedRemittance.referenceNumber}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Driver:</strong> {selectedRemittance.driverId?.name || selectedRemittance.driverName}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Amount:</strong> ₺{selectedRemittance.amount}
                            </p>
                        </div>
                        <form onSubmit={handleCompleteRemittance}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Completion Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    rows="3"
                                    placeholder="Add any notes about the completion..."
                                />
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCompleteModal(false)}
                                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Complete
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cancel Remittance Modal */}
            {showCancelModal && selectedRemittance && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Remittance</h3>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Reference:</strong> {selectedRemittance.referenceNumber}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Driver:</strong> {selectedRemittance.driverId?.name || selectedRemittance.driverName}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Amount:</strong> ₺{selectedRemittance.amount}
                            </p>
                            <p className="text-sm text-red-600 mb-4">
                                ⚠️ This action cannot be undone. The remittance will be marked as cancelled.
                            </p>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (cancelReason.trim()) {
                                handleCancelRemittance(selectedRemittance._id, cancelReason);
                                setShowCancelModal(false);
                                setCancelReason('');
                                setSelectedRemittance(null);
                            }
                        }}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cancellation Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    rows="3"
                                    placeholder="Please provide a reason for cancelling this remittance..."
                                    required
                                />
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setCancelReason('');
                                        setSelectedRemittance(null);
                                    }}
                                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!cancelReason.trim()}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirm Cancellation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RemittancePage; 