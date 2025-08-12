import React, { useState, useEffect } from 'react';
import { XMarkIcon, PencilIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatDateTime } from '../../services/systemSettings';
import driverService from '../../services/driverService';
import toast from 'react-hot-toast';

const DriverDetailsModal = ({ driver, isOpen, onClose, onDriverUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [driverData, setDriverData] = useState(driver);
    const [activeTab, setActiveTab] = useState('details');
    const [driverAnalytics, setDriverAnalytics] = useState(null);
    const [driverDeliveries, setDriverDeliveries] = useState([]);
    const [driverEarnings, setDriverEarnings] = useState(null);

    useEffect(() => {
        if (driver && isOpen) {
            setDriverData(driver);
            loadDriverData();
        }
    }, [driver, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadDriverData = async () => {
        if (!driver?.id) return;

        try {
            setIsLoading(true);

            // Load analytics, deliveries, and earnings in parallel
            const [analytics, deliveries, earnings] = await Promise.all([
                driverService.getDriverAnalytics(driver.id),
                driverService.getDriverDeliveries(driver.id, { limit: 10 }),
                driverService.getDriverEarnings(driver.id)
            ]);

            setDriverAnalytics(analytics);
            setDriverDeliveries(deliveries.deliveries || deliveries);
            setDriverEarnings(earnings);
        } catch (error) {
            console.error('Error loading driver data:', error);
            toast.error('Failed to load driver details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setDriverData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            await driverService.updateDriver(driver.id, driverData);
            toast.success('Driver updated successfully');
            setIsEditing(false);
            onDriverUpdate && onDriverUpdate(driverData);
        } catch (error) {
            toast.error('Failed to update driver');
            console.error('Error updating driver:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuspend = async () => {
        const reason = prompt('Enter suspension reason (optional):');
        if (reason === null) return; // User cancelled

        try {
            setIsLoading(true);
            await driverService.suspendDriver(driver.id, reason);
            toast.success('Driver suspended successfully');
            setDriverData(prev => ({ ...prev, status: 'suspended' }));
            onDriverUpdate && onDriverUpdate(driverData);
        } catch (error) {
            toast.error('Failed to suspend driver');
            console.error('Error suspending driver:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnsuspend = async () => {
        try {
            setIsLoading(true);
            await driverService.unsuspendDriver(driver.id);
            toast.success('Driver unsuspended successfully');
            setDriverData(prev => ({ ...prev, status: 'active' }));
            onDriverUpdate && onDriverUpdate(driverData);
        } catch (error) {
            toast.error('Failed to unsuspend driver');
            console.error('Error unsuspending driver:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'bg-green-100 text-green-800';
            case 'busy': return 'bg-yellow-100 text-yellow-800';
            case 'offline': return 'bg-gray-100 text-gray-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'online': return 'Online';
            case 'busy': return 'Busy';
            case 'offline': return 'Offline';
            case 'suspended': return 'Suspended';
            default: return 'Unknown';
        }
    };

    if (!isOpen || !driver) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            {driver.profileImage ? (
                                <img
                                    src={driver.profileImage}
                                    alt={driver.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-lg font-medium text-gray-600">
                                    {driver.name?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{driver.name}</h2>
                            <p className="text-sm text-gray-500">Driver ID: {driver.id}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(driver.status)}`}>
                            {getStatusText(driver.status)}
                        </span>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {['details', 'analytics', 'deliveries', 'earnings'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        </div>
                    ) : (
                        <>
                            {/* Details Tab */}
                            {activeTab === 'details' && (
                                <div className="space-y-6">
                                    {/* Basic Information */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={driverData.name || ''}
                                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{driver.name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                {isEditing ? (
                                                    <input
                                                        type="email"
                                                        value={driverData.email || ''}
                                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{driver.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                {isEditing ? (
                                                    <input
                                                        type="tel"
                                                        value={driverData.phone || ''}
                                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{driver.phone}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                                                <p className="text-gray-900">{driver.studentId || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Information */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                                {isEditing ? (
                                                    <textarea
                                                        value={driverData.address || ''}
                                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                                        rows={3}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{driver.address || 'N/A'}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                                                <p className="text-gray-900">{driver.area || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Performance Metrics */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-green-600">{driver.deliveries || 0}</p>
                                                <p className="text-sm text-gray-600">Total Deliveries</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-green-600">{formatCurrency(driver.earnings || 0)}</p>
                                                <p className="text-sm text-gray-600">Total Earnings</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-green-600">{driver.rating || 0}</p>
                                                <p className="text-sm text-gray-600">Rating</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-green-600">{driver.lastActive ? formatDateTime(driver.lastActive) : 'Never'}</p>
                                                <p className="text-sm text-gray-600">Last Active</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                        <div className="flex items-center space-x-4">
                                            {driver.status === 'suspended' ? (
                                                <button
                                                    onClick={handleUnsuspend}
                                                    disabled={isLoading}
                                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    <CheckIcon className="w-4 h-4 mr-2" />
                                                    Unsuspend Driver
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleSuspend}
                                                    disabled={isLoading}
                                                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                                                    Suspend Driver
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={() => setIsEditing(false)}
                                                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleSave}
                                                        disabled={isLoading}
                                                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        <CheckIcon className="w-4 h-4 mr-2" />
                                                        Save Changes
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                >
                                                    <PencilIcon className="w-4 h-4 mr-2" />
                                                    Edit Driver
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Analytics Tab */}
                            {activeTab === 'analytics' && (
                                <div className="space-y-6">
                                    {driverAnalytics ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-green-50 rounded-lg p-6">
                                                <h3 className="text-lg font-semibold text-green-800 mb-2">This Month</h3>
                                                <p className="text-3xl font-bold text-green-600">{driverAnalytics.monthly?.deliveries || 0}</p>
                                                <p className="text-sm text-green-600">Deliveries</p>
                                            </div>
                                            <div className="bg-blue-50 rounded-lg p-6">
                                                <h3 className="text-lg font-semibold text-blue-800 mb-2">Earnings</h3>
                                                <p className="text-3xl font-bold text-blue-600">{formatCurrency(driverAnalytics.monthly?.earnings || 0)}</p>
                                                <p className="text-sm text-blue-600">This Month</p>
                                            </div>
                                            <div className="bg-purple-50 rounded-lg p-6">
                                                <h3 className="text-lg font-semibold text-purple-800 mb-2">Rating</h3>
                                                <p className="text-3xl font-bold text-purple-600">{driverAnalytics.rating || 0}</p>
                                                <p className="text-sm text-purple-600">Average</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500">No analytics data available</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Deliveries Tab */}
                            {activeTab === 'deliveries' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Deliveries</h3>
                                    {driverDeliveries.length > 0 ? (
                                        <div className="space-y-3">
                                            {driverDeliveries.map((delivery) => (
                                                <div key={delivery.id} className="bg-gray-50 rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-gray-900">#{delivery.id}</p>
                                                            <p className="text-sm text-gray-600">{delivery.customerName}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-green-600">{formatCurrency(delivery.amount)}</p>
                                                            <p className="text-sm text-gray-600">{delivery.status}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500">No deliveries found</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Earnings Tab */}
                            {activeTab === 'earnings' && (
                                <div className="space-y-6">
                                    {driverEarnings ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-green-50 rounded-lg p-6">
                                                <h3 className="text-lg font-semibold text-green-800 mb-2">This Month</h3>
                                                <p className="text-3xl font-bold text-green-600">{formatCurrency(driverEarnings.monthly || 0)}</p>
                                            </div>
                                            <div className="bg-blue-50 rounded-lg p-6">
                                                <h3 className="text-lg font-semibold text-blue-800 mb-2">Total</h3>
                                                <p className="text-3xl font-bold text-blue-600">{formatCurrency(driverEarnings.total || 0)}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500">No earnings data available</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriverDetailsModal;
