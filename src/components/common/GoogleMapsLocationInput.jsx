import React, { useState, useCallback } from 'react';
import { LinkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';

const GoogleMapsLocationInput = ({
    value,
    onChange,
    placeholder,
    label,
    onLocationSelect,
    className = "",
    required = false
}) => {
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    const [showValidation, setShowValidation] = useState(false);

    const handleInputChange = (e) => {
        const link = e.target.value;
        onChange(link);

        // Clear validation when user starts typing
        if (validationResult) {
            setValidationResult(null);
            setShowValidation(false);
        }
    };

    const validateGoogleMapsLink = useCallback(async (link) => {
        if (!link || !link.trim()) {
            setValidationResult(null);
            return;
        }

        setIsValidating(true);
        setShowValidation(true);

        try {
            const response = await apiService.testGoogleMapsLink(link);

            if (response.success && response.data.isValid) {
                setValidationResult({
                    isValid: true,
                    coordinates: response.data.coordinates,
                    message: '✅ Valid Google Maps link'
                });

                // Call onLocationSelect with the extracted coordinates
                if (onLocationSelect) {
                    onLocationSelect({
                        address: link, // Use the link as the address for now
                        lat: response.data.coordinates.lat,
                        lng: response.data.coordinates.lng
                    });
                }
            } else {
                setValidationResult({
                    isValid: false,
                    message: response.data?.message || '❌ Invalid Google Maps link'
                });
            }
        } catch (error) {
            console.error('Error validating Google Maps link:', error);
            setValidationResult({
                isValid: false,
                message: '❌ Error validating link'
            });
        } finally {
            setIsValidating(false);
        }
    }, [onLocationSelect]);

    const handleBlur = () => {
        if (value && value.trim()) {
            validateGoogleMapsLink(value);
        }
    };

    const handleFocus = () => {
        setShowValidation(true);
    };

    const getInputBorderColor = () => {
        if (!showValidation) return 'border-gray-300';
        if (isValidating) return 'border-yellow-400';
        if (validationResult?.isValid) return 'border-green-500';
        if (validationResult && !validationResult.isValid) return 'border-red-500';
        return 'border-gray-300';
    };

    const getInputFocusColor = () => {
        if (validationResult?.isValid) return 'focus:ring-green-500 focus:border-green-500';
        if (validationResult && !validationResult.isValid) return 'focus:ring-red-500 focus:border-red-500';
        return 'focus:ring-blue-500 focus:border-blue-500';
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="relative">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LinkIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="url"
                        value={value}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        onFocus={handleFocus}
                        placeholder={placeholder}
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg transition-all duration-200 ${getInputBorderColor()} ${getInputFocusColor()} focus:outline-none`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {isValidating && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                        )}
                        {!isValidating && validationResult?.isValid && (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        )}
                        {!isValidating && validationResult && !validationResult.isValid && (
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                        )}
                    </div>
                </div>

                {showValidation && validationResult && (
                    <div className={`mt-2 text-sm ${validationResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
                        {validationResult.message}
                        {validationResult.isValid && validationResult.coordinates && (
                            <div className="text-xs text-gray-500 mt-1">
                                Coordinates: {validationResult.coordinates.lat.toFixed(6)}, {validationResult.coordinates.lng.toFixed(6)}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="text-xs text-gray-500">
                💡 Paste any Google Maps link (place, search, or coordinate URLs)
            </div>
        </div>
    );
};

export default GoogleMapsLocationInput;
