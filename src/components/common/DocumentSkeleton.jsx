import React from 'react';

const DocumentSkeleton = ({ count = 5 }) => {
    return (
        <div className="divide-y divide-gray-200">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="p-4 animate-pulse">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {/* Document Icon Skeleton */}
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                            </div>

                            {/* Document Info Skeleton */}
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                    <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                        <div className="h-3 w-3 bg-gray-200 rounded"></div>
                                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <div className="h-3 w-3 bg-gray-200 rounded"></div>
                                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Skeleton */}
                        <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DocumentSkeleton;
