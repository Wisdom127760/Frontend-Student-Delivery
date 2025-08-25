import React from 'react';

const VerifiedBadge = ({ isVerified, size = 'sm', className = '', iconOnly = false }) => {
    if (!isVerified) return null;

    const sizeClasses = {
        xs: 'text-xs px-1 py-0.5',
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-2 py-1',
        lg: 'text-sm px-3 py-1.5'
    };

    const iconSizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-4 h-4'
    };

    if (iconOnly) {
        return (
            <div
                className={`
                    inline-flex items-center justify-center
                    bg-green-500 text-white
                    rounded-full
                    ${iconSizeClasses[size]}
                    ${className}
                `}
                title="Verified Driver"
            >
                <svg
                    className="w-2 h-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
        );
    }

    return (
        <span
            className={`
        inline-flex items-center gap-1
        bg-green-100 text-green-800
        border border-green-200
        rounded-full font-medium
        ${sizeClasses[size]}
        ${className}
      `}
            title="Verified Driver"
        >
            <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                />
            </svg>

        </span>
    );
};

export default VerifiedBadge;
