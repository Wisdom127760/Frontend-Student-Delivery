import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({
    className,
    label,
    error,
    icon: Icon,
    iconPosition = 'left',
    helperText,
    id,
    ...props
}, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="space-y-2">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">
                    {label}
                </label>
            )}

            <div className="relative group">
                {Icon && iconPosition === 'left' && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-green-600">
                        <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-green-600" />
                    </div>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        'block w-full rounded-xl border-2 border-gray-200 bg-white shadow-sm',
                        'focus:border-green-600 focus:ring-2 focus:ring-green-500/20 focus:outline-none',
                        'transition-all duration-200 ease-in-out',
                        'hover:border-gray-300 hover:shadow-md',
                        'placeholder:text-gray-400 placeholder:text-sm',
                        Icon && iconPosition === 'left' ? 'pl-10' : 'pl-4',
                        Icon && iconPosition === 'right' ? 'pr-10' : 'pr-4',
                        error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
                        'py-4 text-sm font-medium text-gray-900',
                        className
                    )}
                    {...props}
                />

                {Icon && iconPosition === 'right' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-green-600">
                        <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-green-600" />
                    </div>
                )}

                {/* Subtle bottom border accent */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-green-600 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
            </div>

            {error && (
                <p className="text-sm text-red-600 font-medium flex items-center mt-2">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
