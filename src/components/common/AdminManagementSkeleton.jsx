import React from 'react';

const AdminManagementSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Skeleton */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation Skeleton */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        {[1, 2, 3, 4].map((index) => (
                            <div key={index} className="py-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-32 mt-1 animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content Skeleton */}
            <div className="px-4 py-6 sm:px-6 lg:px-8">
                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map((index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                                    <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                                </div>
                                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search and Filters Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="flex-1">
                            <div className="h-10 bg-gray-200 rounded-lg w-full max-w-md animate-pulse"></div>
                        </div>
                        <div className="flex space-x-3">
                            <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
                            <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
                            <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Table Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map((index) => (
                            <div key={index} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                                        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                                        <div className="flex space-x-2">
                                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination Skeleton */}
                <div className="mt-6 flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((index) => (
                            <div key={index} className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminManagementSkeleton;
