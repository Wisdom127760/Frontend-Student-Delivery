import React from 'react';
import { cn } from '../../utils/cn';
import LottieLoader from './LottieLoader';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    loading = false,
    loadingText = 'Loading...',
    className = '',
    type = 'button',
    fullWidth = false,
    useLottie = true,
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500 shadow-sm hover:shadow-md',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
        outline: 'bg-transparent text-green-600 border border-green-600 hover:bg-green-50 focus:ring-green-500',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm h-[36px]',
        md: 'px-4 py-2 text-sm h-[44px]',
        lg: 'px-6 py-3 text-base h-[52px]'
    };

    const lottieSizes = {
        sm: 'xs',
        md: 'sm',
        lg: 'md',
    };

    const widthClasses = fullWidth ? 'w-full' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                baseClasses,
                variantClasses[variant],
                sizeClasses[size],
                widthClasses,
                className
            )}
            {...props}
        >
            {loading ? (
                useLottie ? (
                    <LottieLoader
                        size={lottieSizes[size]}
                        showText={true}
                        text={loadingText}
                        textColor="text-current"
                        layout="horizontal"
                    />
                ) : (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {loadingText}
                    </>
                )
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
