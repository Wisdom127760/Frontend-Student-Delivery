import React from 'react';

const NotificationsDropdownSkeleton = () => {
    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {/* Header Skeleton */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-2"></div>
            </div>

            {/* Notifications List Skeleton */}
            <div className="max-h-96 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="p-4 animate-pulse">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    {/* Title Skeleton */}
                                    <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>

                                    {/* Message Skeleton */}
                                    <div className="space-y-1">
                                        <div className="h-3 w-full bg-gray-200 rounded"></div>
                                        <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
                                    </div>

                                    {/* Date Skeleton */}
                                    <div className="h-3 w-16 bg-gray-200 rounded mt-2"></div>
                                </div>

                                {/* Mark as read button skeleton */}
                                <div className="ml-2 w-4 h-4 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Skeleton */}
            <div className="p-4 border-t border-gray-200">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
        </div>
    );
};

export default NotificationsDropdownSkeleton;
