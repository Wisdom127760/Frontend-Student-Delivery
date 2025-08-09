import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    children,
    disabled,
    ...props
}, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500 shadow-lg hover:shadow-xl',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
        outline: 'border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl',
        clean: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500',
    };

    const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-sm',
        lg: 'px-6 py-4 text-base',
    };

    return (
        <button
            ref={ref}
            className={cn(
                baseClasses,
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}

            {!loading && Icon && iconPosition === 'left' && (
                <Icon className="mr-2 h-4 w-4" />
            )}

            {children}

            {!loading && Icon && iconPosition === 'right' && (
                <Icon className="ml-2 h-4 w-4" />
            )}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
