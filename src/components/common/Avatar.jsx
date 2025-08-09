import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const Avatar = ({ user, size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-16 w-16',
        xl: 'h-24 w-24'
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-lg',
        xl: 'text-2xl'
    };

    // Get user initials
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const initials = getInitials(user?.name || user?.email);

    if (user?.avatar || user?.profileImage) {
        return (
            <img
                src={user.avatar || user.profileImage}
                alt={user.name || 'User avatar'}
                className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
            />
        );
    }

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white font-semibold ${textSizeClasses[size]} ${className}`}>
            {initials !== '?' ? initials : (
                <UserCircleIcon className={`${sizeClasses[size]} text-gray-300`} />
            )}
        </div>
    );
};

export default Avatar;
