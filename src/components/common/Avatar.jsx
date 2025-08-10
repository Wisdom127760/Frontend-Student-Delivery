import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const Avatar = ({ user, profile, size = 'md', className = '' }) => {
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

    // Get the best available name for initials
    const userName = user?.name ||
        user?.profile?.personalDetails?.fullName ||
        profile?.profile?.personalDetails?.fullName ||
        user?.email;

    const initials = getInitials(userName);

    // Check for profile image in various possible locations
    const profileImage = user?.avatar ||
        user?.profileImage ||
        user?.profile?.profileImage ||
        user?.profile?.personalDetails?.profileImage ||
        profile?.profileImage ||
        profile?.profile?.profileImage;

    if (profileImage) {
        return (
            <img
                src={profileImage}
                alt={userName || 'User avatar'}
                className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
                onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                }}
            />
        );
    }

    return (
        <>
            {/* Hidden fallback div that shows when image fails to load */}
            <div
                className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white font-semibold ${textSizeClasses[size]} ${className}`}
                style={{ display: profileImage ? 'none' : 'flex' }}
            >
                {initials !== '?' ? initials : (
                    <UserCircleIcon className={`${sizeClasses[size]} text-gray-300`} />
                )}
            </div>
        </>
    );
};

export default Avatar;
