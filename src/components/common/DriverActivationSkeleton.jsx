import React from 'react';

const DriverActivationSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header Skeleton */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
                </div>

                {/* Form Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    {/* Status Card Skeleton */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-48 mt-2 animate-pulse"></div>
                    </div>

                    {/* Form Fields Skeleton */}
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((field) => (
                            <div key={field}>
                                <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                                <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                            </div>
                        ))}
                    </div>

                    {/* Submit Button Skeleton */}
                    <div className="mt-6">
                        <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverActivationSkeleton;
