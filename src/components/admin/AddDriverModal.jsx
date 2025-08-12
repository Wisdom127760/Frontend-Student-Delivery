import React, { useState } from 'react';
import { XMarkIcon, PlusIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import driverService from '../../services/driverService';
import toast from 'react-hot-toast';

const AddDriverModal = ({ isOpen, onClose, onDriverAdded }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            setIsLoading(true);

            const driverData = {
                name: formData.name,
                email: formData.email
            };

            const response = await driverService.inviteDriver(driverData);
            toast.success('Driver invitation sent successfully!');

            // Reset form
            setFormData({
                name: '',
                email: ''
            });

            onDriverAdded && onDriverAdded(response);
            onClose();
        } catch (error) {
            console.error('Error inviting driver:', error);
            toast.error(error.response?.data?.message || 'Failed to send driver invitation');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setFormData({
                name: '',
                email: ''
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <EnvelopeIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Invite New Driver</h2>
                            <p className="text-sm text-gray-500">Send OTP-based invitation to join Greep SDS</p>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        {/* Information Notice */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <EnvelopeIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-blue-900">Invitation Process</h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        The driver will receive an email invitation to activate their account. They'll use OTP (One-Time Password) for login - no password required.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Driver Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="Enter driver's full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="Enter driver's email address"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Driver will receive an invitation email to join the platform
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* What Happens Next */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">What happens next?</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Driver receives an invitation email</li>
                                <li>• They click the activation link</li>
                                <li>• Complete their profile and verification</li>
                                <li>• Start accepting delivery requests</li>
                            </ul>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Sending Invitation...
                                </>
                            ) : (
                                <>
                                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                                    Send Invitation
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDriverModal;
