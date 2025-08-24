import React from 'react';
import { XMarkIcon, CurrencyDollarIcon, CalendarIcon, UserIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const RemittanceDetailsModal = ({ isOpen, onClose, remittance }) => {
    if (!isOpen || !remittance) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusConfig = (status) => {
        const configs = {
            completed: {
                color: 'bg-green-500',
                bgColor: 'bg-green-50',
                textColor: 'text-green-700',
                borderColor: 'border-green-200',
                label: 'Completed'
            },
            pending: {
                color: 'bg-yellow-500',
                bgColor: 'bg-yellow-50',
                textColor: 'text-yellow-700',
                borderColor: 'border-yellow-200',
                label: 'Pending'
            },
            cancelled: {
                color: 'bg-red-500',
                bgColor: 'bg-red-50',
                textColor: 'text-red-700',
                borderColor: 'border-red-200',
                label: 'Cancelled'
            },
            overdue: {
                color: 'bg-orange-500',
                bgColor: 'bg-orange-50',
                textColor: 'text-orange-700',
                borderColor: 'border-orange-200',
                label: 'Overdue'
            }
        };
        return configs[status] || configs.pending;
    };

    const statusConfig = getStatusConfig(remittance.status);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Remittance Details</h2>
                            <p className="text-sm text-gray-600">View complete remittance information</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Reference & Amount */}
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Reference Number</span>
                                </div>
                                <p className="text-lg font-mono text-gray-900">
                                    {remittance.referenceNumber || remittance.reference || 'N/A'}
                                </p>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CurrencyDollarIcon className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium text-blue-700">Amount</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-900">
                                    ₺{remittance.amount?.toLocaleString() || '0'}
                                </p>
                            </div>
                        </div>

                        {/* Status & Payment Method */}
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-sm font-medium text-gray-700">Status</span>
                                </div>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                                    <div className={`w-2 h-2 rounded-full ${statusConfig.color} mr-2`}></div>
                                    {statusConfig.label}
                                </span>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-sm font-medium text-gray-700">Payment Method</span>
                                </div>
                                <p className="text-lg font-medium text-gray-900">
                                    {remittance.paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
                                        remittance.paymentMethod === 'mobile_money' ? 'Mobile Money' :
                                            remittance.paymentMethod === 'cash' ? 'Cash' : 'Other'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Created Date</span>
                            </div>
                            <p className="text-sm text-gray-900">
                                {formatDate(remittance.createdAt)}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Due Date</span>
                            </div>
                            <p className="text-sm text-gray-900">
                                {remittance.dueDate ? formatDate(remittance.dueDate) : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Description</span>
                        </div>
                        <p className="text-sm text-gray-900">
                            {remittance.description || 'No description provided'}
                        </p>
                    </div>

                    {/* Delivery Information */}
                    {remittance.deliveryCount > 0 && (
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-green-700">Delivery Information</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-green-600 font-medium">Deliveries:</span>
                                    <span className="ml-2 text-green-900">{remittance.deliveryCount}</span>
                                </div>
                                <div>
                                    <span className="text-green-600 font-medium">Total Fees:</span>
                                    <span className="ml-2 text-green-900">₺{remittance.totalDeliveryFees?.toLocaleString() || '0'}</span>
                                </div>
                                <div>
                                    <span className="text-green-600 font-medium">Driver Earnings:</span>
                                    <span className="ml-2 text-green-900">₺{remittance.totalDriverEarnings?.toLocaleString() || '0'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Period Information */}
                    {remittance.period && (
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <CalendarIcon className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium text-blue-700">Period</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-blue-600 font-medium">Start Date:</span>
                                    <span className="ml-2 text-blue-900">{formatDate(remittance.period.startDate)}</span>
                                </div>
                                <div>
                                    <span className="text-blue-600 font-medium">End Date:</span>
                                    <span className="ml-2 text-blue-900">{formatDate(remittance.period.endDate)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {remittance.notes && (
                        <div className="bg-yellow-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <DocumentTextIcon className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium text-yellow-700">Notes</span>
                            </div>
                            <p className="text-sm text-yellow-900">
                                {remittance.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RemittanceDetailsModal;
