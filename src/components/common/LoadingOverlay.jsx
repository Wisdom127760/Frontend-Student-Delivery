import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingOverlay = ({
    isVisible = false,
    message = "Loading...",
    size = 'lg',
    backdrop = true,
    className = ''
}) => {
    if (!isVisible) return null;

    return (
        <div className={`
            ${backdrop ? 'fixed inset-0 bg-black bg-opacity-50' : 'absolute inset-0 bg-white bg-opacity-90'}
            flex items-center justify-center z-50
            transition-all duration-300 ease-in-out
            ${className}
        `}>
            <div className="
                bg-white rounded-xl shadow-lg p-6
                flex flex-col items-center space-y-4
                max-w-sm mx-4
                transition-all duration-300 ease-in-out
                loading-scale-in
            ">
                <LoadingSpinner size={size} color="green" />
                {message && (
                    <p className="text-gray-600 text-center font-medium loading-fade-in">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoadingOverlay;
