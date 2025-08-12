import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const Avatar = ({ user, profile, size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-16 w-16',
        xl: 'h-24 w-24',
        '2xl': 'h-32 w-32'
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-lg',
        xl: 'text-2xl',
        '2xl': 'text-3xl'
    };

    // Get user initials
    const getInitials = (name) => {
        if (!name) return '?';
        // First capitalize the name, then get initials
        const capitalizedName = name.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');

        return capitalizedName
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
    let profileImage = user?.avatar ||
        user?.profileImage ||
        user?.profilePicture ||
        user?.profile?.profileImage ||
        user?.profile?.profilePicture ||
        user?.profile?.personalDetails?.profileImage ||
        user?.profile?.personalDetails?.profilePicture ||
        profile?.profileImage ||
        profile?.profilePicture ||
        profile?.profile?.profileImage ||
        profile?.profile?.profilePicture ||
        profile?.profile?.personalDetails?.profileImage ||
        profile?.profile?.personalDetails?.profilePicture;

    // Add cache-busting parameter to prevent browser caching
    if (profileImage && !profileImage.startsWith('data:')) {
        profileImage = `${profileImage}?t=${Date.now()}`;
    }

    if (profileImage) {
        return (
            <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
                <img
                    src={profileImage}
                    alt={userName || 'User avatar'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.target.style.display = 'none';
                        e.target.parentElement.nextSibling.style.display = 'flex';
                    }}
                />
                {/* Hidden fallback div that shows when image fails to load */}
                <div
                    className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white font-semibold ${textSizeClasses[size]} absolute inset-0`}
                    style={{ display: 'none' }}
                >
                    {initials !== '?' ? initials : (
                        <UserCircleIcon className={`${sizeClasses[size]} text-gray-300`} />
                    )}
                </div>
            </div>
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
