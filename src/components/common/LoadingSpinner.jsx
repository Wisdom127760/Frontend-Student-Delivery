import React from 'react';

const LoadingSpinner = ({
    size = 'md',
    color = 'green',
    className = '',
    showText = false,
    text = 'Loading...'
}) => {
    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    };

    const colorClasses = {
        green: 'border-green-500',
        blue: 'border-blue-500',
        red: 'border-red-500',
        gray: 'border-gray-500',
        white: 'border-white'
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full animate-spin`}
            />
            {showText && (
                <span className="ml-2 text-sm text-gray-600 animate-pulse">
                    {text}
                </span>
            )}
        </div>
    );
};

export default LoadingSpinner;
