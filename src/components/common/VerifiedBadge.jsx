import React from 'react';

const VerifiedBadge = ({ isVerified, size = 'sm', className = '' }) => {
    if (!isVerified) return null;

    const sizeClasses = {
        xs: 'text-xs px-1 py-0.5',
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-2 py-1',
        lg: 'text-sm px-3 py-1.5'
    };

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
            <span>Verified</span>
        </span>
    );
};

export default VerifiedBadge;
