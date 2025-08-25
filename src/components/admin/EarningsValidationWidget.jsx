import React, { useState } from 'react';
import {
    WrenchScrewdriverIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import EarningsValidationService from '../../services/earningsValidationService';

const EarningsValidationWidget = () => {
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState(null);

    const validateAllDrivers = async () => {
        try {
            setIsValidating(true);
            console.log('🔍 Starting earnings validation for all drivers...');

            const result = await EarningsValidationService.validateAllDriversEarnings();
            setValidationStatus(result);

            console.log('✅ Earnings validation completed:', result);
            toast.success(`Validation complete: ${result.validDrivers} valid, ${result.invalidDrivers} invalid`);

        } catch (error) {
            console.error('❌ Earnings validation failed:', error);
            toast.error('Earnings validation failed: ' + error.message);
        } finally {
            setIsValidating(false);
        }
    };

    const getValidationStatus = async () => {
        try {
            const status = await EarningsValidationService.getEarningsValidationStatus();
            setValidationStatus(status);
            console.log('📊 Earnings validation status:', status);
        } catch (error) {
            console.error('❌ Failed to get validation status:', error);
            toast.error('Failed to get validation status');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <WrenchScrewdriverIcon className="w-5 h-5 text-orange-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Earnings Validation</h3>
                </div>
                <button
                    onClick={getValidationStatus}
                    className="text-xs text-gray-500 hover:text-gray-700"
                    title="Refresh status"
                >
                    <ArrowPathIcon className="w-3 h-3" />
                </button>
            </div>

            {validationStatus && (
                <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Total Drivers:</span>
                        <span className="font-medium">{validationStatus.totalDrivers}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Valid:</span>
                        <span className="text-green-600 font-medium flex items-center">
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            {validationStatus.validDrivers}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Invalid:</span>
                        <span className="text-red-600 font-medium flex items-center">
                            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                            {validationStatus.invalidDrivers}
                        </span>
                    </div>
                    {validationStatus.validationRate > 0 && (
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Validation Rate:</span>
                            <span className="font-medium">{validationStatus.validationRate.toFixed(1)}%</span>
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={validateAllDrivers}
                disabled={isValidating}
                className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-medium py-2 px-3 rounded-md border border-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
                {isValidating ? (
                    <>
                        <ArrowPathIcon className="w-3 h-3 animate-spin" />
                        <span>Validating...</span>
                    </>
                ) : (
                    <>
                        <WrenchScrewdriverIcon className="w-3 h-3" />
                        <span>Validate All Drivers</span>
                    </>
                )}
            </button>

            {validationStatus?.needsAttention && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-700">
                        ⚠️ Earnings issues detected. Some drivers may have incorrect earnings data.
                    </p>
                </div>
            )}
        </div>
    );
};

export default EarningsValidationWidget;
