import React from 'react';

const BroadcastSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Location Info Skeleton */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-blue-200 rounded animate-pulse"></div>
                        <div className="h-4 w-48 bg-blue-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-24 bg-blue-200 rounded animate-pulse"></div>
                </div>
            </div>

            {/* Broadcast Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header Skeleton */}
                        <div className="px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                                <div className="flex items-center space-x-1">
                                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                                <div className="flex items-center space-x-1">
                                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Content Skeleton */}
                        <div className="px-6 py-4 space-y-4">
                            {/* Route Skeleton */}
                            <div>
                                <div className="flex items-start space-x-2 mb-2">
                                    <div className="w-2 h-2 bg-gray-200 rounded-full mt-2 animate-pulse"></div>
                                    <div className="flex-1">
                                        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mb-1"></div>
                                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-gray-200 rounded-full mt-2 animate-pulse"></div>
                                    <div className="flex-1">
                                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info Skeleton */}
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>

                            {/* Notes Skeleton */}
                            <div>
                                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            {/* Action Button Skeleton */}
                            <div className="pt-2">
                                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BroadcastSkeleton;

