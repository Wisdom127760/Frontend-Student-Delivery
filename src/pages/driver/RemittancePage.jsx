import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DriverLayout from '../../components/layouts/DriverLayout';
import { StatCardSkeleton, RemittanceItemSkeleton } from '../../components/common/SkeletonLoader';
import Pagination from '../../components/common/Pagination';
import {
    CurrencyDollarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    PlusIcon,
    BanknotesIcon,
    InformationCircleIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const RemittancePage = () => {
    const { user } = useAuth();
    const [remittances, setRemittances] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestAmount, setRequestAmount] = useState('');
    const [filters, setFilters] = useState({
        status: ''
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const fetchRemittances = useCallback(async () => {
        try {
            setLoading(true);
            const driverId = user._id || user.id;
            if (!driverId) {
                console.error('No driver ID available');
                return;
            }

            // Mock data for demonstration
            const mockRemittances = [
                {
                    id: 1,
                    amount: 450.75,
                    status: 'completed',
                    requestDate: new Date(Date.now() - 86400000 * 3).toISOString(),
                    completedDate: new Date(Date.now() - 86400000 * 1).toISOString(),
                    method: 'bank_transfer',
                    reference: 'REF-001',
                    description: 'Weekly earnings payout'
                },
                {
                    id: 2,
                    amount: 285.50,
                    status: 'pending',
                    requestDate: new Date(Date.now() - 86400000 * 1).toISOString(),
                    method: 'bank_transfer',
                    reference: 'REF-002',
                    description: 'Mid-week payout request'
                },
                {
                    id: 3,
                    amount: 125.25,
                    status: 'processing',
                    requestDate: new Date(Date.now() - 86400000 * 2).toISOString(),
                    method: 'mobile_money',
                    reference: 'REF-003',
                    description: 'Emergency payout'
                }
            ];

            const mockSummary = {
                totalEarnings: 1250.50,
                availableBalance: 285.75,
                pendingAmount: 410.75,
                totalPaidOut: 2850.25,
                lastPayout: {
                    amount: 450.75,
                    date: new Date(Date.now() - 86400000 * 1).toISOString()
                }
            };

            setRemittances(mockRemittances);
            setSummary(mockSummary);
        } catch (error) {
            console.error('Error fetching remittances:', error);
            toast.error('Failed to load remittances');
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchSummary = useCallback(async () => {
        try {
            const driverId = user._id || user.id;
            if (!driverId) {
                console.error('No driver ID available');
                return;
            }
            // Summary is loaded with remittances in this implementation
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchRemittances();
            fetchSummary();
        }
    }, [user, fetchRemittances, fetchSummary]);

    // Refresh data
    const refreshData = async () => {
        setRefreshing(true);
        await fetchRemittances();
        await fetchSummary();
        setRefreshing(false);
        toast.success('Data refreshed!');
    };

    // Request new remittance
    const handleRequestRemittance = async () => {
        if (!requestAmount || parseFloat(requestAmount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (parseFloat(requestAmount) > summary.availableBalance) {
            toast.error('Amount exceeds available balance');
            return;
        }

        try {
            // Mock successful request
            const newRemittance = {
                id: Date.now(),
                amount: parseFloat(requestAmount),
                status: 'pending',
                requestDate: new Date().toISOString(),
                method: 'bank_transfer',
                reference: `REF-${Date.now()}`,
                description: 'Payout request'
            };

            setRemittances(prev => [newRemittance, ...prev]);
            setSummary(prev => ({
                ...prev,
                availableBalance: prev.availableBalance - parseFloat(requestAmount),
                pendingAmount: prev.pendingAmount + parseFloat(requestAmount)
            }));

            setShowRequestModal(false);
            setRequestAmount('');
            toast.success('Remittance request submitted successfully!');
        } catch (error) {
            console.error('Error requesting remittance:', error);
            toast.error('Failed to submit remittance request');
        }
    };

    // Status helpers
    const getStatusConfig = (status) => {
        const configs = {
            completed: {
                color: 'bg-green-500',
                bgColor: 'bg-green-50',
                textColor: 'text-green-700',
                borderColor: 'border-green-200',
                icon: CheckCircleIcon,
                label: 'Completed'
            },
            pending: {
                color: 'bg-yellow-500',
                bgColor: 'bg-yellow-50',
                textColor: 'text-yellow-700',
                borderColor: 'border-yellow-200',
                icon: ClockIcon,
                label: 'Pending'
            },
            processing: {
                color: 'bg-blue-500',
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-700',
                borderColor: 'border-blue-200',
                icon: ArrowPathIcon,
                label: 'Processing'
            },
            rejected: {
                color: 'bg-red-500',
                bgColor: 'bg-red-50',
                textColor: 'text-red-700',
                borderColor: 'border-red-200',
                icon: XCircleIcon,
                label: 'Rejected'
            }
        };
        return configs[status] || configs.pending;
    };

    // Filter remittances
    const filteredRemittances = remittances.filter(remittance => {
        return !filters.status || remittance.status === filters.status;
    });

    // Pagination
    const totalPages = Math.ceil(filteredRemittances.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRemittances = filteredRemittances.slice(startIndex, endIndex);

    // Format currency
    const formatCurrency = (amount) => `₺${Number(amount).toFixed(2)}`;

    if (loading) {
        return (
            <DriverLayout>
                <div className="space-y-6">
                    {/* Balance Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </div>

                    {/* Remittances List Skeleton */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                                <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <RemittanceItemSkeleton key={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </DriverLayout>
        );
    }

    return (
        <DriverLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Remittances</h1>
                        <p className="text-gray-600 mt-1">Manage your payout requests and payment history</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                        {/* Refresh Button */}
                        <button
                            onClick={refreshData}
                            disabled={refreshing}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>

                        {/* Request Remittance Button */}
                        <button
                            onClick={() => setShowRequestModal(true)}
                            disabled={summary.availableBalance <= 0}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Request Payout
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Available Balance */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Available Balance</p>
                                <p className="text-3xl font-bold">
                                    {formatCurrency(summary.availableBalance || 0)}
                                </p>
                                <p className="text-green-100 text-sm mt-1">Ready for payout</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-lg">
                                <BanknotesIcon className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Pending Amount */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {formatCurrency(summary.pendingAmount || 0)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Being processed</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <ClockIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    {/* Total Paid Out */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Paid Out</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {formatCurrency(summary.totalPaidOut || 0)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">All time</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Last Payout */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Last Payout</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {formatCurrency(summary.lastPayout?.amount || 0)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {summary.lastPayout?.date ?
                                        new Date(summary.lastPayout.date).toLocaleDateString() :
                                        'No payouts yet'
                                    }
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-4">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {/* Remittances List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {paginatedRemittances.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Reference
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Method
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Request Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedRemittances.map((remittance) => {
                                        const statusConfig = getStatusConfig(remittance.status);
                                        const StatusIcon = statusConfig.icon;

                                        return (
                                            <tr key={remittance.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {remittance.reference}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {remittance.description}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {formatCurrency(remittance.amount)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                                                        <StatusIcon className="w-3 h-3 mr-1" />
                                                        {statusConfig.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {remittance.method === 'bank_transfer' ? 'Bank Transfer' :
                                                        remittance.method === 'mobile_money' ? 'Mobile Money' :
                                                            'Other'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(remittance.requestDate).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(remittance.requestDate).toLocaleTimeString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button className="text-green-600 hover:text-green-900 flex items-center">
                                                        <EyeIcon className="w-4 h-4 mr-1" />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No remittances found</h3>
                            <p className="text-gray-500 mb-6">
                                {filters.status ?
                                    `No remittances with "${filters.status}" status.` :
                                    "You haven't made any payout requests yet."
                                }
                            </p>
                            {summary.availableBalance > 0 && (
                                <button
                                    onClick={() => setShowRequestModal(true)}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Request Your First Payout
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {filteredRemittances.length > itemsPerPage && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredRemittances.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                        <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Payout Information</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Payouts are processed within 1-3 business days</li>
                                    <li>Minimum payout amount is ₺50</li>
                                    <li>You can request payouts when your balance reaches ₺25</li>
                                    <li>All transactions are secure and encrypted</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Request Remittance Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Request Payout</h3>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">Available Balance:</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(summary.availableBalance || 0)}
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payout Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-500">₺</span>
                                    <input
                                        type="number"
                                        value={requestAmount}
                                        onChange={(e) => setRequestAmount(e.target.value)}
                                        placeholder="0.00"
                                        max={summary.availableBalance}
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Maximum: {formatCurrency(summary.availableBalance || 0)}
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500">
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="mobile_money">Mobile Money</option>
                                </select>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowRequestModal(false)}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRequestRemittance}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Request Payout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DriverLayout>
    );
};

export default RemittancePage; 