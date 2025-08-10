import React from 'react';

const NotificationsSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-200 rounded-lg animate-pulse">
                            <div className="w-6 h-6 bg-gray-300 rounded"></div>
                        </div>
                        <div>
                            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                    <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>

                {/* Unread Count Badge Skeleton */}
                <div className="mb-6 p-4 bg-gray-200 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                </div>

                {/* Notifications List Skeleton */}
                <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                        <div
                            key={index}
                            className="p-4 rounded-lg border border-gray-200 bg-white animate-pulse"
                        >
                            <div className="flex items-start space-x-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {/* Title Skeleton */}
                                            <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>

                                            {/* Message Skeleton */}
                                            <div className="space-y-2">
                                                <div className="h-3 w-full bg-gray-200 rounded"></div>
                                                <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
                                            </div>

                                            {/* Date Skeleton */}
                                            <div className="h-3 w-20 bg-gray-200 rounded mt-3"></div>
                                        </div>

                                        {/* Mark as read button skeleton */}
                                        <div className="ml-4 w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More Skeleton */}
                <div className="mt-8 text-center">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsSkeleton;
