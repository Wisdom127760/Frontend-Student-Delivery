import React, { useState, useEffect } from 'react';
import { XMarkIcon, PencilIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { formatDateTime } from '../../services/systemSettings';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import driverService from '../../services/driverService';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Button from '../common/Button';

const DriverDetailsModal = ({ driver, isOpen, onClose, onDriverUpdate }) => {
    const { formatCurrency } = useSystemSettings();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [driverData, setDriverData] = useState(driver || {});
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
        if (!driver) return;

        console.log('🔍 Driver data loaded:', driver);

        // No need to make separate API calls since we have all the data
        // The driver object contains all the necessary information
        setIsLoading(false);
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
        try {
            setIsLoading(true);
            await driverService.suspendDriver(driver.id, 'Driver suspended');
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

    const getStatusColor = (driver) => {
        // Check if driver is online/active
        if (driver?.isOnline) return 'bg-green-100 text-green-800';
        if (driver?.isActive && !driver?.isSuspended) return 'bg-blue-100 text-blue-800';
        if (driver?.isSuspended) return 'bg-red-100 text-red-800';

        // Check multiple possible status fields
        const status = driver?.status || driver?.verificationStatus?.status || driver?.accountStatus?.status;

        switch (status) {
            case 'online':
            case 'active':
            case 'verified': return 'bg-green-100 text-green-800';
            case 'busy': return 'bg-yellow-100 text-yellow-800';
            case 'offline':
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-blue-100 text-blue-800';
            case 'partial': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (driver) => {
        // Check multiple possible status fields
        const status = driver?.status || driver?.verificationStatus?.status || driver?.accountStatus?.status;

        // Check if driver is online/active
        if (driver?.isOnline) return 'Online';
        if (driver?.isActive && !driver?.isSuspended) return 'Active';
        if (driver?.isSuspended) return 'Suspended';

        switch (status) {
            case 'online':
            case 'active':
            case 'verified': return 'Active';
            case 'busy': return 'Busy';
            case 'offline':
            case 'inactive': return 'Inactive';
            case 'suspended': return 'Suspended';
            case 'pending': return 'Pending';
            case 'partial': return 'Partially Verified';
            default: return 'Unknown';
        }
    };

    // Don't render if driver is null
    if (!driver) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {driver?.profileImage ? (
                            <img
                                src={driver.profileImage}
                                alt={driver?.name || 'Driver'}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-base font-medium text-gray-600">
                                {driver?.name?.charAt(0)?.toUpperCase() || 'D'}
                            </span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{driver?.name || 'Unknown Driver'}</h2>
                        <p className="text-xs text-gray-500">ID: {driver?.id || driver?._id || 'N/A'}</p>
                    </div>
                    <div className="ml-auto">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(driver)}`}>
                            {getStatusText(driver)}
                        </span>
                    </div>
                </div>
            }
            size="xl"
            showCloseButton={true}
            className="max-h-screen overflow-hidden"
        >

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-6 px-4">
                    {['details', 'analytics', 'deliveries', 'earnings'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 px-1 border-b-2 font-medium text-xs capitalize ${activeTab === tab
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
            <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Details Tab */}
                        {activeTab === 'details' && (
                            <div className="space-y-3">
                                {/* Basic Information */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Basic Information</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                                            <p className="text-sm text-gray-900">{driver?.name || driver?.fullNameComputed || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                            <p className="text-sm text-gray-900">{driver?.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                                            <p className="text-sm text-gray-900">{driver?.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Student ID</label>
                                            <p className="text-sm text-gray-900">{driver?.studentId || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Address Information</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                                            <p className="text-sm text-gray-900">{driver?.address || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Area</label>
                                            <p className="text-sm text-gray-900">{driver?.area || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Metrics */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Performance Metrics</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-green-600">{driver?.totalDeliveries || 0}</p>
                                            <p className="text-xs text-gray-600">Deliveries</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-green-600">{formatCurrency(driver?.totalEarnings || 0)}</p>
                                            <p className="text-xs text-gray-600">Earnings</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-green-600">{driver?.rating || 0}</p>
                                            <p className="text-xs text-gray-600">Rating</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-green-600">{driver?.lastLogin ? new Date(driver.lastLogin).toLocaleDateString() : 'Never'}</p>
                                            <p className="text-xs text-gray-600">Last Login</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Document Status */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Document Status</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(driver?.documents || {}).map(([docType, docInfo]) => (
                                            <div key={docType} className="flex items-center justify-between p-2 bg-white rounded border">
                                                <div>
                                                    <p className="text-xs font-medium text-gray-900 capitalize">
                                                        {docType.replace(/([A-Z])/g, ' $1')}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 text-xs rounded-full ${docInfo.status === 'verified' ? 'bg-green-100 text-green-800' :
                                                    docInfo.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        docInfo.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {docInfo.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        {driver?.status === 'suspended' ? (
                                            <Button
                                                onClick={handleUnsuspend}
                                                disabled={isLoading}
                                                variant="primary"
                                            >
                                                <CheckIcon className="w-4 h-4 mr-2" />
                                                Unsuspend Driver
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleSuspend}
                                                disabled={isLoading}
                                                variant="danger"
                                            >
                                                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                                                Suspend Driver
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {isEditing ? (
                                            <>
                                                <Button
                                                    onClick={() => setIsEditing(false)}
                                                    variant="secondary"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleSave}
                                                    disabled={isLoading}
                                                    variant="primary"
                                                >
                                                    <CheckIcon className="w-4 h-4 mr-2" />
                                                    Save Changes
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                onClick={() => setIsEditing(true)}
                                                variant="primary"
                                            >
                                                <PencilIcon className="w-4 h-4 mr-2" />
                                                Edit Driver
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Analytics Tab */}
                        {activeTab === 'analytics' && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-green-50 rounded-lg p-3">
                                        <h3 className="text-xs font-semibold text-green-800 mb-1">Total Deliveries</h3>
                                        <p className="text-lg font-bold text-green-600">
                                            {driver?.totalDeliveries || driver?.accountStatus?.deliveries?.total || 0}
                                        </p>
                                        <p className="text-xs text-green-600">Completed: {driver?.completedDeliveries || driver?.accountStatus?.deliveries?.completed || 0}</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3">
                                        <h3 className="text-xs font-semibold text-blue-800 mb-1">Total Earnings</h3>
                                        <p className="text-lg font-bold text-blue-600">
                                            {formatCurrency(driver?.totalEarnings || 0)}
                                        </p>
                                        <p className="text-xs text-blue-600">Avg: {formatCurrency(driver?.averageEarningsPerDelivery || 0)}</p>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-3">
                                        <h3 className="text-xs font-semibold text-purple-800 mb-1">Rating</h3>
                                        <p className="text-lg font-bold text-purple-600">
                                            {driver?.rating || driver?.accountStatus?.deliveries?.rating || 0}
                                        </p>
                                        <p className="text-xs text-purple-600">Rate: {driver?.completionRate || driver?.accountStatus?.deliveries?.completionRate || 0}%</p>
                                    </div>
                                </div>

                                {/* Profile Completion */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Profile Completion</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-700">Overall Progress</span>
                                            <span className="text-xs font-semibold text-gray-900">
                                                {driver?.profileCompletion?.overall || driver?.accountStatus?.completion?.overall || 0}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1">
                                            <div
                                                className="bg-green-600 h-1 rounded-full transition-all duration-300"
                                                style={{ width: `${driver?.profileCompletion?.overall || driver?.accountStatus?.completion?.overall || 0}%` }}
                                            ></div>
                                        </div>
                                        <div className="grid grid-cols-5 gap-2">
                                            {['personalDetails', 'studentInfo', 'transportation', 'verification', 'documents'].map((section) => (
                                                <div key={section} className="text-center">
                                                    <p className="text-xs text-gray-600 capitalize">{section.replace(/([A-Z])/g, ' $1')}</p>
                                                    <p className="text-xs font-semibold text-gray-900">
                                                        {driver?.profileCompletion?.sections?.[section]?.percentage ||
                                                            driver?.accountStatus?.completion?.sections?.[section]?.percentage || 0}%
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Verification Status */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Verification Status</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Email</span>
                                                <span className={`px-1 py-0.5 text-xs rounded-full ${driver?.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {driver?.isEmailVerified ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Phone</span>
                                                <span className={`px-1 py-0.5 text-xs rounded-full ${driver?.isPhoneVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {driver?.isPhoneVerified ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Documents</span>
                                                <span className={`px-1 py-0.5 text-xs rounded-full ${driver?.isDocumentVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {driver?.isDocumentVerified ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Student</span>
                                                <span className={`px-1 py-0.5 text-xs rounded-full ${driver?.accountStatus?.verification?.studentVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {driver?.accountStatus?.verification?.studentVerified ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Profile</span>
                                                <span className={`px-1 py-0.5 text-xs rounded-full ${driver?.accountStatus?.verification?.profileComplete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {driver?.accountStatus?.verification?.profileComplete ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Ready</span>
                                                <span className={`px-1 py-0.5 text-xs rounded-full ${driver?.profileCompletion?.readyForDeliveries ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {driver?.profileCompletion?.readyForDeliveries ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Deliveries Tab */}
                        {activeTab === 'deliveries' && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900">Delivery Summary</h3>

                                {/* Delivery Statistics */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-green-50 rounded-lg p-3">
                                        <h3 className="text-xs font-semibold text-green-800 mb-1">Total Deliveries</h3>
                                        <p className="text-lg font-bold text-green-600">
                                            {driver?.totalDeliveries || driver?.accountStatus?.deliveries?.total || 0}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3">
                                        <h3 className="text-xs font-semibold text-blue-800 mb-1">Completed</h3>
                                        <p className="text-lg font-bold text-blue-600">
                                            {driver?.completedDeliveries || driver?.accountStatus?.deliveries?.completed || 0}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-3">
                                        <h3 className="text-xs font-semibold text-purple-800 mb-1">Cancelled</h3>
                                        <p className="text-lg font-bold text-purple-600">
                                            {driver?.accountStatus?.deliveries?.cancelled || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* Delivery Details */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Delivery Details</h3>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">Completion Rate</span>
                                            <span className="text-xs font-semibold text-gray-900">
                                                {driver?.completionRate || driver?.accountStatus?.deliveries?.completionRate || 0}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">Average Rating</span>
                                            <span className="text-xs font-semibold text-gray-900">
                                                {driver?.rating || driver?.accountStatus?.deliveries?.rating || 0}/5
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">Avg Earnings per Delivery</span>
                                            <span className="text-xs font-semibold text-gray-900">
                                                {formatCurrency(driver?.averageEarningsPerDelivery || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Recent Activity</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600">Last Login</span>
                                            <span className="text-gray-900">
                                                {driver?.lastLogin ? new Date(driver.lastLogin).toLocaleDateString() : 'Never'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600">Online Status</span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${driver?.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {driver?.isOnline ? 'Online' : 'Offline'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600">Account Status</span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${driver?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {driver?.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600">Suspension Status</span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${driver?.isSuspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {driver?.isSuspended ? 'Suspended' : 'Not Suspended'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* Earnings Tab */}
                        {activeTab === 'earnings' && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-green-50 rounded-lg p-3">
                                        <h3 className="text-xs font-semibold text-green-800 mb-1">Total Earnings</h3>
                                        <p className="text-lg font-bold text-green-600">
                                            {formatCurrency(driver?.totalEarnings || 0)}
                                        </p>
                                        <p className="text-xs text-green-600">All time</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3">
                                        <h3 className="text-xs font-semibold text-blue-800 mb-1">Avg per Delivery</h3>
                                        <p className="text-lg font-bold text-blue-600">
                                            {formatCurrency(driver?.averageEarningsPerDelivery || 0)}
                                        </p>
                                        <p className="text-xs text-blue-600">Per delivery</p>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-3">
                                        <h3 className="text-xs font-semibold text-purple-800 mb-1">Completion Rate</h3>
                                        <p className="text-lg font-bold text-purple-600">
                                            {driver?.completionRate || driver?.accountStatus?.deliveries?.completionRate || 0}%
                                        </p>
                                        <p className="text-xs text-purple-600">Success rate</p>
                                    </div>
                                </div>

                                {/* Account Information */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Account Information</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Member Since</span>
                                                <span className="text-xs font-medium text-gray-900">
                                                    {driver?.memberSince ? new Date(driver.memberSince).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Account Age</span>
                                                <span className="text-xs font-medium text-gray-900">
                                                    {driver?.accountAge || 0} days
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Last Login</span>
                                                <span className="text-xs font-medium text-gray-900">
                                                    {driver?.lastLogin ? new Date(driver.lastLogin).toLocaleDateString() : 'Never'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Transportation</span>
                                                <span className="text-xs font-medium text-gray-900 capitalize">
                                                    {driver?.transportationType || driver?.accountStatus?.profile?.transportation?.method || 'Other'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Area</span>
                                                <span className="text-xs font-medium text-gray-900">
                                                    {driver?.area || driver?.accountStatus?.profile?.transportation?.area || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">University</span>
                                                <span className="text-xs font-medium text-gray-900">
                                                    {driver?.university || driver?.accountStatus?.profile?.studentInfo?.university || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
};

export default DriverDetailsModal;
