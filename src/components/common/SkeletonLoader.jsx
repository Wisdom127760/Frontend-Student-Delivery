import React from 'react';

const SkeletonLoader = ({
    width = 'w-full',
    height = 'h-4',
    rounded = 'rounded',
    className = '',
    rows = 1,
    spacing = 'space-y-2'
}) => {
    if (rows === 1) {
        return (
            <div className={`animate-pulse bg-gray-200 ${width} ${height} ${rounded} ${className}`}></div>
        );
    }

    return (
        <div className={`animate-pulse ${spacing}`}>
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className={`bg-gray-200 ${width} ${height} ${rounded} ${className}`}></div>
            ))}
        </div>
    );
};

// Pre-built skeleton components for common use cases
export const CardSkeleton = ({ className = '' }) => (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
        <SkeletonLoader width="w-3/4" height="h-6" className="mb-4" />
        <SkeletonLoader rows={3} height="h-4" spacing="space-y-2" />
    </div>
);

export const TableRowSkeleton = ({ columns = 4, className = '' }) => (
    <tr className={className}>
        {Array.from({ length: columns }).map((_, index) => (
            <td key={index} className="px-6 py-4">
                <SkeletonLoader height="h-4" width={index === 0 ? 'w-3/4' : 'w-full'} />
            </td>
        ))}
    </tr>
);

export const StatCardSkeleton = ({ className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <div className="flex items-center justify-between">
            <div className="flex-1 space-y-3">
                <SkeletonLoader width="w-24" height="h-4" />
                <SkeletonLoader width="w-16" height="h-8" />
                <SkeletonLoader width="w-20" height="h-3" />
            </div>
            <SkeletonLoader width="w-12" height="h-12" rounded="rounded-lg" />
        </div>
    </div>
);

// Enhanced earnings card skeleton
export const EarningsCardSkeleton = ({ className = '' }) => (
    <div className={`bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl p-6 animate-pulse ${className}`}>
        <div className="flex items-center justify-between">
            <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-10 bg-gray-300 rounded w-28"></div>
                <div className="h-3 bg-gray-300 rounded w-24"></div>
            </div>
            <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
        </div>
    </div>
);

// Delivery card skeleton
export const DeliveryCardSkeleton = ({ className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <SkeletonLoader width="w-8" height="h-8" rounded="rounded-full" />
                    <div className="space-y-2">
                        <SkeletonLoader width="w-32" height="h-4" />
                        <SkeletonLoader width="w-24" height="h-3" />
                    </div>
                </div>
                <SkeletonLoader width="w-20" height="h-6" rounded="rounded-full" />
            </div>
            <div className="space-y-2">
                <SkeletonLoader width="w-full" height="h-3" />
                <SkeletonLoader width="w-3/4" height="h-3" />
            </div>
            <div className="flex items-center justify-between pt-2">
                <SkeletonLoader width="w-24" height="h-4" />
                <SkeletonLoader width="w-16" height="h-4" />
            </div>
        </div>
    </div>
);

// Profile header skeleton
export const ProfileHeaderSkeleton = ({ className = '' }) => (
    <div className={`bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl p-6 animate-pulse ${className}`}>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
            <div className="flex-1 text-center sm:text-left space-y-3">
                <div className="h-6 bg-gray-300 rounded w-48 mx-auto sm:mx-0"></div>
                <div className="h-4 bg-gray-300 rounded w-36 mx-auto sm:mx-0"></div>
                <div className="flex items-center justify-center sm:justify-start space-x-4">
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 rounded w-18"></div>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-24 h-8 bg-gray-300 rounded-lg"></div>
                <div className="w-20 h-8 bg-gray-300 rounded-lg"></div>
            </div>
        </div>
    </div>
);

// Form field skeleton
export const FormFieldSkeleton = ({ className = '' }) => (
    <div className={`space-y-2 ${className}`}>
        <SkeletonLoader width="w-24" height="h-4" />
        <SkeletonLoader width="w-full" height="h-12" rounded="rounded-lg" />
    </div>
);

// Form section skeleton
export const FormSectionSkeleton = ({ className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <SkeletonLoader width="w-48" height="h-6" className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
        </div>
        <div className="mt-6">
            <FormFieldSkeleton />
        </div>
    </div>
);

// Chart skeleton
export const ChartSkeleton = ({ height = 'h-64', className = '' }) => (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${height} ${className}`}>
        <div className="space-y-4">
            <SkeletonLoader width="w-32" height="h-5" />
            <div className="flex items-end justify-between h-48 space-x-2">
                {Array.from({ length: 7 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-gray-200 rounded-t animate-pulse w-full"
                        style={{ height: `${Math.random() * 80 + 20}%` }}
                    ></div>
                ))}
            </div>
        </div>
    </div>
);

// List item skeleton
export const ListItemSkeleton = ({ className = '' }) => (
    <div className={`bg-white rounded-lg border border-gray-100 p-4 ${className}`}>
        <div className="flex items-center space-x-4">
            <SkeletonLoader width="w-10" height="h-10" rounded="rounded-full" />
            <div className="flex-1 space-y-2">
                <SkeletonLoader width="w-3/4" height="h-4" />
                <SkeletonLoader width="w-1/2" height="h-3" />
            </div>
            <SkeletonLoader width="w-20" height="h-6" />
        </div>
    </div>
);

// Remittance item skeleton
export const RemittanceItemSkeleton = ({ className = '' }) => (
    <div className={`bg-white rounded-lg border border-gray-100 p-4 ${className}`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <SkeletonLoader width="w-8" height="h-8" rounded="rounded-full" />
                <div className="space-y-2">
                    <SkeletonLoader width="w-32" height="h-4" />
                    <SkeletonLoader width="w-20" height="h-3" />
                </div>
            </div>
            <div className="text-right space-y-2">
                <SkeletonLoader width="w-20" height="h-4" />
                <SkeletonLoader width="w-16" height="h-6" rounded="rounded-full" />
            </div>
        </div>
    </div>
);

// Grid layout skeleton
export const GridSkeleton = ({ items = 6, CardComponent = StatCardSkeleton, className = '' }) => (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: items }).map((_, index) => (
            <CardComponent key={index} />
        ))}
    </div>
);

// Full page skeleton for dashboard
export const DashboardSkeleton = ({ className = '' }) => (
    <div className={`space-y-6 ${className}`}>
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
                <StatCardSkeleton key={index} />
            ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton />
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <ListItemSkeleton key={index} />
                ))}
            </div>
        </div>
    </div>
);

// Earnings page skeleton
export const EarningsPageSkeleton = ({ className = '' }) => (
    <div className={`space-y-6 ${className}`}>
        {/* Hero card */}
        <EarningsCardSkeleton />

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
        </div>

        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
        </div>
    </div>
);

// Deliveries page skeleton
export const DeliveriesPageSkeleton = ({ className = '' }) => (
    <div className={`space-y-6 ${className}`}>
        {/* Filter bar */}
        <div className="bg-white rounded-lg border border-gray-100 p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <SkeletonLoader width="w-48" height="h-10" rounded="rounded-lg" />
                <div className="flex space-x-2">
                    <SkeletonLoader width="w-20" height="h-10" rounded="rounded-lg" />
                    <SkeletonLoader width="w-20" height="h-10" rounded="rounded-lg" />
                </div>
            </div>
        </div>

        {/* Deliveries grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
                <DeliveryCardSkeleton key={index} />
            ))}
        </div>
    </div>
);

// Profile page skeleton
export const ProfilePageSkeleton = ({ className = '' }) => (
    <div className={`space-y-6 ${className}`}>
        {/* Profile header */}
        <ProfileHeaderSkeleton />

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form section */}
            <div className="lg:col-span-2">
                <FormSectionSkeleton />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <SkeletonLoader width="w-32" height="h-5" className="mb-4" />
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <SkeletonLoader width="w-8" height="h-8" rounded="rounded-lg" />
                                    <div className="space-y-1">
                                        <SkeletonLoader width="w-24" height="h-4" />
                                        <SkeletonLoader width="w-20" height="h-3" />
                                    </div>
                                </div>
                                <SkeletonLoader width="w-5" height="h-5" rounded="rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <SkeletonLoader width="w-28" height="h-5" className="mb-4" />
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <SkeletonLoader width="w-20" height="h-4" />
                                <SkeletonLoader width="w-16" height="h-4" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default SkeletonLoader;