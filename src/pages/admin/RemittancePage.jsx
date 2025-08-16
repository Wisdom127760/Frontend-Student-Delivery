import React, { useState, useEffect, useCallback } from 'react';
import {
    PlusIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    CurrencyDollarIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import Pagination from '../../components/common/Pagination';
import apiService from '../../services/api';

const RemittancePage = () => {
    const [remittances, setRemittances] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [stats, setStats] = useState({
        pending: 0,
        completed: 0,
        cancelled: 0,
        totalAmount: 0
    });
    const [filters, setFilters] = useState({
        status: '',
        driverId: '',
        startDate: '',
        endDate: ''
    });
    const [selectedDriverForDetails, setSelectedDriverForDetails] = useState(null);
    const [driverRemittanceDetails, setDriverRemittanceDetails] = useState(null);
    const [loadingDriverDetails, setLoadingDriverDetails] = useState(false);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showBulkGenerateModal, setShowBulkGenerateModal] = useState(false);
    const [selectedRemittance, setSelectedRemittance] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

    // Form states
    const [formData, setFormData] = useState({
        driverId: '',
        notes: ''
    });
    const [bulkFormData, setBulkFormData] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        dueDateDays: 7
    });


    // Toast notification
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const loadRemittances = useCallback(async () => {
        try {
            setLoading(true);
            console.log('💰 RemittancePage: Loading remittances with params:', {
                page: currentPage,
                limit: itemsPerPage,
                ...filters
            });

            const response = await apiService.getRemittances({
                page: currentPage,
                limit: itemsPerPage,
                ...filters
            });

            console.log('💰 RemittancePage: Remittances API response:', response);

            if (response && response.success) {
                // Parse the correct response structure
                const remittancesData = response.data?.remittances || response.remittances || [];
                const remittancesArray = Array.isArray(remittancesData) ? remittancesData : [];
                console.log('💰 RemittancePage: Setting remittances array:', remittancesArray);
                setRemittances(remittancesArray);

                // Parse pagination from the correct structure
                const pagination = response.data?.pagination || response.pagination || {};
                setTotalPages(pagination.pages || 1);
                setTotalItems(pagination.total || 0);

                // Don't calculate stats here - we get them from the dedicated statistics API
                console.log('💰 RemittancePage: Remittances loaded, stats will come from dedicated API');
            } else {
                console.warn('💰 RemittancePage: Backend returned unsuccessful response:', response);
                setRemittances([]);
                setTotalPages(1);
                setTotalItems(0);
                // Don't reset stats here - keep the ones from the statistics API
            }
        } catch (error) {
            console.error('❌ RemittancePage: Error loading remittances:', error);
            console.error('❌ RemittancePage: Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });

            // Show user-friendly error message
            if (error.response?.status === 400) {
                toast.error('Remittances failed: Invalid parameters.');
            } else if (error.response?.status === 401) {
                toast.error('Remittances failed: Authentication required.');
            } else if (error.response?.status === 403) {
                toast.error('Remittances failed: Permission denied.');
            } else if (error.response?.status === 404) {
                toast.error('Remittances failed: Endpoint not found.');
            } else if (error.response?.status === 500) {
                toast.error('Remittances failed: Server error. Please try again later.');
                toast.error('Failed to load remittances');
            }

            setRemittances([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, filters]);

    const fetchDrivers = useCallback(async () => {
        try {
            console.log('🚗 RemittancePage: Loading drivers...');
            const response = await apiService.getDrivers();

            // Enhanced parsing to handle different response structures
            let driversArray = [];
            if (response && response.success && response.data && response.data.drivers) {
                // Backend returns: { success: true, data: { drivers: [...] } }
                driversArray = response.data.drivers;
            } else if (response && response.data && response.data.drivers) {
                // Alternative structure: { data: { drivers: [...] } }
                driversArray = response.data.drivers;
            } else if (response && response.drivers) {
                // Direct structure: { drivers: [...] }
                driversArray = response.drivers;
            } else if (Array.isArray(response)) {
                // Array structure: [...]
                driversArray = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                // Data array structure: { data: [...] }
                driversArray = response.data;
            }

            console.log('🚗 RemittancePage: Loaded', driversArray.length, 'drivers');
            setDrivers(driversArray);
        } catch (error) {
            console.error('❌ RemittancePage: Error loading drivers:', error);
            setDrivers([]);
        }
    }, []);

    // Load comprehensive remittance statistics
    const loadRemittanceStats = useCallback(async () => {
        try {
            console.log('💰 RemittancePage: Loading remittance statistics...');
            const response = await apiService.getRemittanceStats();
            console.log('💰 RemittancePage: Statistics response:', response);

            if (response && response.success) {
                // Parse the correct nested structure from your backend
                const statsData = response.data?.statistics || response.statistics || {};
                console.log('💰 RemittancePage: Parsed statistics data:', statsData);

                setStats({
                    pending: statsData.pendingRemittances || 0,
                    completed: statsData.completedRemittances || 0,
                    cancelled: statsData.cancelledRemittances || 0,
                    totalAmount: statsData.totalAmount || 0,
                    totalPaid: statsData.totalPaid || 0,
                    totalPending: statsData.totalPending || 0,
                    totalOverdue: statsData.totalOverdue || 0,
                    completionRate: statsData.completionRate || 0
                });
                console.log('✅ RemittancePage: Statistics loaded successfully');
            }
        } catch (error) {
            console.error('❌ RemittancePage: Error loading statistics:', error);
        }
    }, []);

    // Load data on component mount
    useEffect(() => {
        console.log('🔄 RemittancePage: Component mounted, loading data...');
        loadRemittances();
        fetchDrivers();
        loadRemittanceStats();
    }, [loadRemittances, fetchDrivers, loadRemittanceStats]);

    // Load detailed remittance information for a specific driver
    const loadDriverRemittanceDetails = useCallback(async (driverId) => {
        if (!driverId) return;

        try {
            setLoadingDriverDetails(true);
            console.log('🚗 RemittancePage: Loading remittance details for driver:', driverId);

            // Get driver remittance summary
            const summaryResponse = await apiService.getDriverRemittanceSummary(driverId);
            console.log('🚗 RemittancePage: Driver remittance summary:', summaryResponse);

            // Get driver's remittances
            const remittancesResponse = await apiService.getDriverRemittancesForDetails(driverId);
            console.log('🚗 RemittancePage: Driver remittances:', remittancesResponse);

            // Get payment structure for calculations
            const paymentStructureResponse = await apiService.getPaymentStructure();
            console.log('🚗 RemittancePage: Payment structure:', paymentStructureResponse);

            setDriverRemittanceDetails({
                summary: summaryResponse.data || summaryResponse,
                remittances: remittancesResponse.data?.remittances || remittancesResponse.remittances || [],
                paymentStructure: paymentStructureResponse.data || paymentStructureResponse
            });

            console.log('✅ RemittancePage: Driver remittance details loaded successfully');
        } catch (error) {
            console.error('❌ RemittancePage: Error loading driver remittance details:', error);
            setDriverRemittanceDetails(null);
        } finally {
            setLoadingDriverDetails(false);
        }
    }, []);

    const handleBulkGenerateRemittances = async () => {
        try {
            console.log('💰 RemittancePage: Bulk generating remittances:', bulkFormData);
            await apiService.bulkGenerateRemittances(bulkFormData);
            setToast({
                show: true,
                message: 'Bulk remittance generation completed successfully!',
                type: 'success'
            });
            setShowBulkGenerateModal(false);
            setBulkFormData({
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                dueDateDays: 7
            });
            loadRemittances();
            loadRemittanceStats();
        } catch (error) {
            console.error('❌ RemittancePage: Error bulk generating remittances:', error);
            toast.error('Bulk generation failed. Please try again.');
        }
    };

    const handleCreateRemittance = async () => {
        try {
            console.log('💰 RemittancePage: Creating remittance:', formData);
            await apiService.createRemittance(formData);
            setToast({
                show: true,
                message: 'Remittance created successfully',
                type: 'success'
            });
            setShowCreateModal(false);
            setFormData({ driverId: '', notes: '' });
            loadRemittances();
        } catch (error) {
            console.error('❌ RemittancePage: Error creating remittance:', error);
            console.error('❌ RemittancePage: Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });

            // Show user-friendly error message
            if (error.response?.status === 400) {
                toast.error('Remittance creation failed: Invalid data.');
            } else if (error.response?.status === 401) {
                toast.error('Remittance creation failed: Authentication required.');
            } else if (error.response?.status === 403) {
                toast.error('Remittance creation failed: Permission denied.');
            } else if (error.response?.status === 404) {
                toast.error('Remittance creation failed: Endpoint not found.');
            } else if (error.response?.status === 500) {
                toast.error('Remittance creation failed: Server error. Please try again later.');
            } else {
                toast.error('Failed to create remittance');
            }
        }
    };

    const handleCompleteRemittance = async () => {
        try {
            console.log('💰 RemittancePage: Completing remittance:', selectedRemittance._id);
            await apiService.completeRemittance(selectedRemittance._id);
            setToast({
                show: true,
                message: 'Remittance completed successfully',
                type: 'success'
            });
            setShowCompleteModal(false);
            setSelectedRemittance(null);
            loadRemittances();
        } catch (error) {
            console.error('❌ RemittancePage: Error completing remittance:', error);
            console.error('❌ RemittancePage: Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });

            // Show user-friendly error message
            if (error.response?.status === 400) {
                toast.error('Remittance completion failed: Invalid data.');
            } else if (error.response?.status === 401) {
                toast.error('Remittance completion failed: Authentication required.');
            } else if (error.response?.status === 403) {
                toast.error('Remittance completion failed: Permission denied.');
            } else if (error.response?.status === 404) {
                toast.error('Remittance completion failed: Endpoint not found.');
            } else if (error.response?.status === 500) {
                toast.error('Remittance completion failed: Server error. Please try again later.');
            } else {
                toast.error('Failed to complete remittance');
            }
        }
    };

    const handleCancelRemittance = async () => {
        try {
            console.log('💰 RemittancePage: Cancelling remittance:', selectedRemittance._id, 'with reason:', cancelReason);
            await apiService.cancelRemittance(selectedRemittance._id, cancelReason);
            setToast({
                show: true,
                message: 'Remittance cancelled successfully',
                type: 'success'
            });
            setShowCancelModal(false);
            setSelectedRemittance(null);
            setCancelReason('');
            loadRemittances();
        } catch (error) {
            console.error('❌ RemittancePage: Error cancelling remittance:', error);
            console.error('❌ RemittancePage: Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });

            // Show user-friendly error message
            if (error.response?.status === 400) {
                toast.error('Remittance cancellation failed: Invalid data.');
            } else if (error.response?.status === 401) {
                toast.error('Remittance cancellation failed: Authentication required.');
            } else if (error.response?.status === 403) {
                toast.error('Remittance cancellation failed: Permission denied.');
            } else if (error.response?.status === 404) {
                toast.error('Remittance cancellation failed: Endpoint not found.');
            } else if (error.response?.status === 500) {
                toast.error('Remittance cancellation failed: Server error. Please try again later.');
            } else {
                toast.error('Failed to cancel remittance');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-50';
            case 'completed':
                return 'text-green-600 bg-green-50';
            case 'cancelled':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <ClockIcon className="w-3 h-3" />;
            case 'completed':
                return <CheckCircleIcon className="w-3 h-3" />;
            case 'cancelled':
                return <XCircleIcon className="w-3 h-3" />;
            default:
                return <ClockIcon className="w-3 h-3" />;
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('tr-TR', {
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="space-y-4">
                        {/* Toast Notification */}
                        {toast.show && (
                            <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg text-xs ${toast.type === 'success'
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
                                        className="ml-3 text-white hover:text-gray-200"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Remittance Management</h1>
                                <p className="text-sm text-gray-600">Automatically calculate remittances from completed deliveries</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        console.log('Manual refresh of drivers...');
                                        fetchDrivers();
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-500"
                                >
                                    🔄 Refresh Drivers
                                </button>

                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                                >
                                    <PlusIcon className="h-3 w-3 mr-1" />
                                    Calculate Remittance
                                </button>
                                <button
                                    onClick={() => setShowBulkGenerateModal(true)}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    📊 Bulk Generate
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <ClockIcon className="h-4 w-4 text-yellow-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-xs font-medium text-gray-600">Pending</p>
                                        <p className="text-lg font-bold text-gray-900">{stats.pending || 0}</p>
                                        <p className="text-xs text-gray-500">₺{(stats.totalPending || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-xs font-medium text-gray-600">Completed</p>
                                        <p className="text-lg font-bold text-gray-900">{stats.completed || 0}</p>
                                        <p className="text-xs text-gray-500">₺{(stats.totalPaid || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex items-center">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <XCircleIcon className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-xs font-medium text-gray-600">Cancelled</p>
                                        <p className="text-lg font-bold text-gray-900">{stats.cancelled || 0}</p>
                                        <p className="text-xs text-gray-500">Cancelled remittances</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-xs font-medium text-gray-600">Total Amount</p>
                                        <p className="text-lg font-bold text-gray-900">₺{(stats.totalAmount || 0).toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">{stats.completionRate || 0}% completion rate</p>
                                    </div>
                                </div>
                            </div>
                        </div>



                        {/* Driver Selection and Details */}
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-900">Driver Remittance Details</h3>
                                <select
                                    value={selectedDriverForDetails || ''}
                                    onChange={(e) => {
                                        const driverId = e.target.value;
                                        setSelectedDriverForDetails(driverId);
                                        if (driverId) {
                                            loadDriverRemittanceDetails(driverId);
                                        } else {
                                            setDriverRemittanceDetails(null);
                                        }
                                    }}
                                    className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">Select a driver to view details</option>
                                    {drivers.map(driver => (
                                        <option key={driver._id || driver.id} value={driver._id || driver.id}>
                                            {driver.name} ({driver.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Driver Details Panel */}
                            {selectedDriverForDetails && (
                                <div className="border-t border-gray-200 pt-4">
                                    {loadingDriverDetails ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                                            <span className="ml-2 text-sm text-gray-600">Loading driver details...</span>
                                        </div>
                                    ) : driverRemittanceDetails ? (
                                        <div className="space-y-4">
                                            {/* Driver Summary Cards */}
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="bg-blue-50 rounded-lg p-3">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-xs font-medium text-blue-800">Total Earnings</p>
                                                            <p className="text-lg font-bold text-blue-900">
                                                                ₺{(driverRemittanceDetails.summary?.totalEarnings || 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-green-50 rounded-lg p-3">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-xs font-medium text-green-800">Driver Share</p>
                                                            <p className="text-lg font-bold text-green-900">
                                                                ₺{(driverRemittanceDetails.summary?.driverShare || 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-orange-50 rounded-lg p-3">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-orange-100 rounded-lg">
                                                            <CurrencyDollarIcon className="h-4 w-4 text-orange-600" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-xs font-medium text-orange-800">Company Share</p>
                                                            <p className="text-lg font-bold text-orange-900">
                                                                ₺{(driverRemittanceDetails.summary?.companyShare || 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-purple-50 rounded-lg p-3">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-purple-100 rounded-lg">
                                                            <ClockIcon className="h-4 w-4 text-purple-600" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-xs font-medium text-purple-800">Cash Deliveries</p>
                                                            <p className="text-lg font-bold text-purple-900">
                                                                {driverRemittanceDetails.summary?.cashDeliveryCount || 0}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payment Structure Info */}
                                            {driverRemittanceDetails.paymentStructure && (
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Payment Structure Applied</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                                                        <div className="bg-white rounded p-2">
                                                            <span className="font-medium">₺0-100:</span> 60% Driver, 40% Company
                                                        </div>
                                                        <div className="bg-white rounded p-2">
                                                            <span className="font-medium">₺101-150:</span> ₺100 flat for Driver
                                                        </div>
                                                        <div className="bg-white rounded p-2">
                                                            <span className="font-medium">₺151+:</span> 60% Driver, 40% Company
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Driver's Remittances Table */}
                                            <div>
                                                <h4 className="text-xs font-semibold text-gray-700 mb-2">Remittance History</h4>
                                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {driverRemittanceDetails.remittances.map((remittance) => (
                                                                    <tr key={remittance._id} className="hover:bg-gray-50">
                                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                                            <div className="text-sm font-medium text-gray-900">
                                                                                ₺{remittance.amount?.toLocaleString() || '0'}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500">
                                                                                {remittance.deliveryIds?.length || 0} deliveries
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(remittance.status)}`}>
                                                                                {getStatusIcon(remittance.status)}
                                                                                <span className="ml-1 capitalize">{remittance.status}</span>
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                                            {remittance.startDate && remittance.endDate ? (
                                                                                <div>
                                                                                    <div className="text-xs">{formatDate(remittance.startDate)}</div>
                                                                                    <div className="text-xs text-gray-500">to {formatDate(remittance.endDate)}</div>
                                                                                </div>
                                                                            ) : '-'}
                                                                        </td>
                                                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                                            {formatDate(remittance.createdAt)}
                                                                        </td>
                                                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                                            {remittance.dueDate ? formatDate(remittance.dueDate) : '-'}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    {driverRemittanceDetails.remittances.length === 0 && (
                                                        <div className="text-center py-4 text-sm text-gray-500">
                                                            No remittances found for this driver
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-sm text-gray-500">
                                            No driver details available
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex items-center space-x-3">
                                <FunnelIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-xs font-medium text-gray-700">Filters:</span>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <select
                                    value={filters.driverId}
                                    onChange={(e) => setFilters({ ...filters, driverId: e.target.value })}
                                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">All Drivers</option>
                                    {drivers.map(driver => (
                                        <option key={driver._id || driver.id} value={driver._id || driver.id}>{driver.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                />
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                        </div>

                        {/* Remittances Table */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Driver
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {/* Ensure remittances is always an array */}
                                        {(Array.isArray(remittances) ? remittances : []).map((remittance) => (
                                            <tr key={remittance._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {remittance.driverName || remittance.driver?.name || 'Unknown Driver'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {remittance.driverEmail || remittance.driver?.email || 'No email'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        ₺{remittance.amount?.toLocaleString() || '0'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {remittance.deliveryIds?.length || 0} deliveries
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(remittance.status)}`}>
                                                        {getStatusIcon(remittance.status)}
                                                        <span className="ml-1 capitalize">{remittance.status}</span>
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(remittance.createdAt)}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-1">
                                                        {remittance.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedRemittance(remittance);
                                                                        setShowCompleteModal(true);
                                                                    }}
                                                                    className="text-green-600 hover:text-green-900 p-1"
                                                                    title="Complete"
                                                                >
                                                                    <CheckCircleIcon className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedRemittance(remittance);
                                                                        setShowCancelModal(true);
                                                                    }}
                                                                    className="text-red-600 hover:text-red-900 p-1"
                                                                    title="Cancel"
                                                                >
                                                                    <XCircleIcon className="w-3 h-3" />
                                                                </button>

                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {Array.isArray(remittances) && remittances.length > 0 && (
                                <div className="px-4 py-3 border-t border-gray-200">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        itemsPerPage={itemsPerPage}
                                        onItemsPerPageChange={setItemsPerPage}
                                        totalItems={totalItems}
                                        startIndex={(currentPage - 1) * itemsPerPage + 1}
                                        endIndex={Math.min(currentPage * itemsPerPage, totalItems)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Remittance Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900">Create Remittance</h3>
                        </div>
                        <div className="p-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Driver</label>
                                    <select
                                        value={formData.driverId}
                                        onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">Select Driver</option>
                                        {drivers.map(driver => (
                                            <option key={driver._id || driver.id} value={driver._id || driver.id}>{driver.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-3 py-1.5 text-gray-600 border border-gray-300 rounded text-xs hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateRemittance}
                                className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Remittance Modal */}
            {showCompleteModal && selectedRemittance && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900">Complete Remittance</h3>
                        </div>
                        <div className="p-4">
                            <p className="text-xs text-gray-600">
                                Are you sure you want to mark this remittance as completed?
                            </p>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                            <button
                                onClick={() => setShowCompleteModal(false)}
                                className="px-3 py-1.5 text-gray-600 border border-gray-300 rounded text-xs hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCompleteRemittance}
                                className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                            >
                                Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Remittance Modal */}
            {showCancelModal && selectedRemittance && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900">Cancel Remittance</h3>
                        </div>
                        <div className="p-4">
                            <div className="space-y-3">
                                <p className="text-xs text-gray-600">
                                    Are you sure you want to cancel this remittance?
                                </p>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                                    <textarea
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                        rows={3}
                                        placeholder="Enter cancellation reason..."
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="px-3 py-1.5 text-gray-600 border border-gray-300 rounded text-xs hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCancelRemittance}
                                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                                Cancel Remittance
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Generate Remittances Modal */}
            {showBulkGenerateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900">Bulk Generate Remittances</h3>
                        </div>
                        <div className="p-4">
                            <div className="space-y-3">
                                <p className="text-xs text-gray-600">
                                    Generate remittances for all drivers based on cash deliveries in the specified period.
                                </p>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={bulkFormData.startDate}
                                        onChange={(e) => setBulkFormData({ ...bulkFormData, startDate: e.target.value })}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={bulkFormData.endDate}
                                        onChange={(e) => setBulkFormData({ ...bulkFormData, endDate: e.target.value })}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Due Date (Days)</label>
                                    <input
                                        type="number"
                                        value={bulkFormData.dueDateDays}
                                        onChange={(e) => setBulkFormData({ ...bulkFormData, dueDateDays: parseInt(e.target.value) })}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                        placeholder="7"
                                        min="1"
                                        max="30"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                            <button
                                onClick={() => setShowBulkGenerateModal(false)}
                                className="px-3 py-1.5 text-gray-600 border border-gray-300 rounded text-xs hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkGenerateRemittances}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                            >
                                Generate for All Drivers
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RemittancePage; 