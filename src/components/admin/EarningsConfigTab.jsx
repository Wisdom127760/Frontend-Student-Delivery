import React, { useState, useEffect } from 'react';
import {
    CurrencyDollarIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import ConfirmationModal from '../common/ConfirmationModal';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../ui/Button';

const EarningsConfigTab = () => {
    const [configurations, setConfigurations] = useState([]);
    const [activeConfiguration, setActiveConfiguration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState(null);

    useEffect(() => {
        loadConfigurations();
    }, []);

    const loadConfigurations = async () => {
        try {
            setLoading(true);
            const response = await apiService.getEarningsConfigurations();
            if (response.success && response.data) {
                setConfigurations(response.data.configurations || []);
                setActiveConfiguration(response.data.activeConfiguration);
            }
        } catch (error) {
            toast.error('Failed to load earnings configurations');
            console.error('Error loading configurations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateConfiguration = async (configData) => {
        try {
            setSaving(true);
            await apiService.createEarningsConfiguration(configData);
            toast.success('Earnings configuration created successfully');
            setShowCreateModal(false);
            loadConfigurations();
        } catch (error) {
            toast.error('Failed to create earnings configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateConfiguration = async (configData) => {
        try {
            setSaving(true);
            await apiService.updateEarningsConfiguration(selectedConfig.id, configData);
            toast.success('Earnings configuration updated successfully');
            setShowEditModal(false);
            setSelectedConfig(null);
            loadConfigurations();
        } catch (error) {
            toast.error('Failed to update earnings configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteConfiguration = async () => {
        try {
            setSaving(true);
            await apiService.deleteEarningsConfiguration(selectedConfig.id);
            toast.success('Earnings configuration deleted successfully');
            setShowDeleteModal(false);
            setSelectedConfig(null);
            loadConfigurations();
        } catch (error) {
            toast.error('Failed to delete earnings configuration');
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (isActive) => {
        if (isActive) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    Active
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <XCircleIcon className="w-3 h-3 mr-1" />
                Inactive
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading earnings configurations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Earnings Configuration</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage payment rules and earnings structures for drivers
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            New Configuration
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Configuration */}
            {activeConfiguration && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-medium text-gray-900">Active Configuration</h4>
                            {getStatusBadge(true)}
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h5 className="font-medium text-green-900 mb-2">{activeConfiguration.name}</h5>
                            <p className="text-sm text-green-700 mb-3">{activeConfiguration.notes}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeConfiguration.rules.map((rule, index) => (
                                    <div key={`active-rule-${index}-${rule.minFee}-${rule.maxFee}`} className="bg-white rounded border border-green-200 p-3">
                                        <div className="text-sm font-medium text-gray-900 mb-1">
                                            {rule.minFee} - {rule.maxFee === 999999 ? '∞' : rule.maxFee}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {rule.description}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 text-xs text-green-600">
                                <ClockIcon className="w-3 h-3 inline mr-1" />
                                Effective since {new Date(activeConfiguration.effectiveDate).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* All Configurations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">All Configurations</h4>

                    {configurations.length === 0 ? (
                        <div className="text-center py-8">
                            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No earnings configurations found</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Create First Configuration
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {configurations.map((config) => (
                                <div key={config.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <h5 className="font-medium text-gray-900">{config.name}</h5>
                                                <div key={`status-${config.id}`}>
                                                    {getStatusBadge(config.isActive)}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{config.notes}</p>
                                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                <span>Version {config.version}</span>
                                                <span>•</span>
                                                <span>{config.rules.length} rules</span>
                                                <span>•</span>
                                                <span>Effective {new Date(config.effectiveDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedConfig(config);
                                                    setShowEditModal(true);
                                                }}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            {!config.isActive && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedConfig(config);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Rules Preview */}
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {config.rules.slice(0, 3).map((rule, index) => (
                                            <div key={`config-${config.id}-rule-${index}-${rule.minFee}-${rule.maxFee}`} className="bg-gray-50 rounded px-2 py-1 text-xs">
                                                <span className="font-medium">
                                                    {rule.minFee}-{rule.maxFee === 999999 ? '∞' : rule.maxFee}:
                                                </span>
                                                <span className="text-gray-600 ml-1">
                                                    {rule.driverPercentage ? `${rule.driverPercentage}%` : `${rule.driverFixed} fixed`}
                                                </span>
                                            </div>
                                        ))}
                                        {config.rules.length > 3 && (
                                            <div className="bg-gray-50 rounded px-2 py-1 text-xs text-gray-500">
                                                +{config.rules.length - 3} more rules
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Configuration Rules Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">How Earnings Rules Work</h4>
                <div className="text-sm text-blue-700 space-y-1">
                    <p>• Rules are applied based on delivery fee ranges</p>
                    <p>• Driver percentage: Calculates driver share as a percentage of the fee</p>
                    <p>• Driver fixed: Gives driver a fixed amount regardless of fee</p>
                    <p>• Company share is automatically calculated as the remainder</p>
                    <p>• Only one configuration can be active at a time</p>
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <EarningsConfigModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateConfiguration}
                    mode="create"
                    saving={saving}
                />
            )}

            {showEditModal && selectedConfig && (
                <EarningsConfigModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedConfig(null);
                    }}
                    onSubmit={handleUpdateConfiguration}
                    mode="edit"
                    configuration={selectedConfig}
                    saving={saving}
                />
            )}

            {showDeleteModal && selectedConfig && (
                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedConfig(null);
                    }}
                    onConfirm={handleDeleteConfiguration}
                    title="Delete Configuration"
                    message={`Are you sure you want to delete "${selectedConfig.name}"? This action cannot be undone.`}
                    confirmText="Delete"
                    confirmColor="red"
                />
            )}
        </div>
    );
};

// Earnings Configuration Modal Component
const EarningsConfigModal = ({ isOpen, onClose, onSubmit, mode, configuration, saving }) => {
    const [formData, setFormData] = useState({
        name: '',
        notes: '',
        rules: [
            {
                minFee: 0,
                maxFee: 100,
                driverPercentage: 60,
                driverFixed: null,
                companyPercentage: 40,
                companyFixed: null,
                description: ''
            }
        ]
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && configuration) {
                setFormData({
                    name: configuration.name || '',
                    notes: configuration.notes || '',
                    rules: configuration.rules || []
                });
            } else {
                setFormData({
                    name: '',
                    notes: '',
                    rules: [
                        {
                            minFee: 0,
                            maxFee: 100,
                            driverPercentage: 60,
                            driverFixed: null,
                            companyPercentage: 40,
                            companyFixed: null,
                            description: ''
                        }
                    ]
                });
            }
            setErrors({});
        }
    }, [isOpen, mode, configuration]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleRuleChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            rules: prev.rules.map((rule, i) =>
                i === index ? { ...rule, [field]: value } : rule
            )
        }));
    };

    const addRule = () => {
        setFormData(prev => ({
            ...prev,
            rules: [
                ...prev.rules,
                {
                    minFee: 0,
                    maxFee: 100,
                    driverPercentage: null,
                    driverFixed: null,
                    companyPercentage: null,
                    companyFixed: null,
                    description: ''
                }
            ]
        }));
    };

    const removeRule = (index) => {
        if (formData.rules.length > 1) {
            setFormData(prev => ({
                ...prev,
                rules: prev.rules.filter((_, i) => i !== index)
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Configuration name is required';
        }

        if (formData.rules.length === 0) {
            newErrors.rules = 'At least one rule is required';
        }

        // Validate rules
        formData.rules.forEach((rule, index) => {
            if (rule.minFee >= rule.maxFee) {
                newErrors[`rule_${index}`] = 'Min fee must be less than max fee';
            }
            if (!rule.driverPercentage && !rule.driverFixed) {
                newErrors[`rule_${index}`] = 'Either driver percentage or fixed amount is required';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {mode === 'create' ? 'Create Earnings Configuration' : 'Edit Earnings Configuration'}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Configuration Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                                        }`}
                                    placeholder="Enter configuration name"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                    Notes
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    placeholder="Optional notes about this configuration"
                                />
                            </div>

                            {/* Rules */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Earnings Rules *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addRule}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-600 bg-green-100 hover:bg-green-200"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-1" />
                                        Add Rule
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formData.rules.map((rule, index) => (
                                        <div key={`form-rule-${index}-${rule.minFee}-${rule.maxFee}`} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-medium text-gray-900">Rule {index + 1}</h4>
                                                {formData.rules.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRule(index)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Min Fee</label>
                                                    <input
                                                        type="number"
                                                        value={rule.minFee}
                                                        onChange={(e) => handleRuleChange(index, 'minFee', parseInt(e.target.value))}
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                        min="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Max Fee</label>
                                                    <input
                                                        type="number"
                                                        value={rule.maxFee}
                                                        onChange={(e) => handleRuleChange(index, 'maxFee', parseInt(e.target.value))}
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                        min="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Driver Percentage (%)</label>
                                                    <input
                                                        type="number"
                                                        value={rule.driverPercentage || ''}
                                                        onChange={(e) => handleRuleChange(index, 'driverPercentage', e.target.value ? parseInt(e.target.value) : null)}
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                        min="0"
                                                        max="100"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Driver Fixed Amount</label>
                                                    <input
                                                        type="number"
                                                        value={rule.driverFixed || ''}
                                                        onChange={(e) => handleRuleChange(index, 'driverFixed', e.target.value ? parseInt(e.target.value) : null)}
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                                <input
                                                    type="text"
                                                    value={rule.description}
                                                    onChange={(e) => handleRuleChange(index, 'description', e.target.value)}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                    placeholder="e.g., Under 100: 60% driver, 40% company"
                                                />
                                            </div>

                                            {errors[`rule_${index}`] && (
                                                <p className="mt-1 text-sm text-red-600">{errors[`rule_${index}`]}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {errors.rules && <p className="mt-1 text-sm text-red-600">{errors.rules}</p>}
                            </div>
                        </form>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            loading={saving}
                            loadingText="Saving..."
                            className="w-full sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            {mode === 'create' ? 'Create Configuration' : 'Update Configuration'}
                        </Button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EarningsConfigTab;
