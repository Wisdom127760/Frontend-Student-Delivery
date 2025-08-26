import React, { useState, useEffect, useCallback } from 'react';
import {
    BellIcon,
    MegaphoneIcon,
    UserGroupIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    PlayIcon,
    StopIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import { StatCardSkeleton } from '../common/SkeletonLoader';
import Button from '../ui/Button';

const BroadcastMonitor = () => {
    const [broadcastStats, setBroadcastStats] = useState({
        byStatus: [],
        activeCount: 0,
        expiredCount: 0,
        totalBroadcasts: 0
    });
    const [backgroundJobStatus, setBackgroundJobStatus] = useState({
        expiredBroadcastHandler: { status: 'unknown', lastRun: null },
        broadcastProcessor: { status: 'unknown', lastRun: null }
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Load broadcast statistics
    const loadBroadcastStats = useCallback(async () => {
        try {
            const response = await apiService.getBroadcastStats();
            if (response.success) {
                setBroadcastStats(response.data);
            } else {
                console.error('Failed to load broadcast stats:', response);
                toast.error('Failed to load broadcast statistics');
            }
        } catch (error) {
            console.error('Error loading broadcast stats:', error);
            toast.error('Failed to load broadcast statistics');
        }
    }, []);

    // Load background job status
    const loadBackgroundJobStatus = useCallback(async () => {
        try {
            const response = await apiService.getBackgroundJobStatus();
            if (response.success) {
                setBackgroundJobStatus(response.data);
            } else {
                console.error('Failed to load background job status:', response);
            }
        } catch (error) {
            console.error('Error loading background job status:', error);
        }
    }, []);

    // Handle expired broadcasts
    const handleExpiredBroadcasts = async () => {
        try {
            setProcessing(true);
            const response = await apiService.handleExpiredBroadcasts();
            if (response.success) {
                toast.success('Expired broadcasts processed successfully');
                // Refresh data after successful operation
                await refreshData();
            } else {
                toast.error(response.message || 'Failed to process expired broadcasts');
            }
        } catch (error) {
            console.error('Error handling expired broadcasts:', error);
            toast.error('Failed to process expired broadcasts');
        } finally {
            setProcessing(false);
        }
    };

    // Trigger broadcast processing
    const triggerBroadcastProcessing = async () => {
        try {
            setProcessing(true);
            const response = await apiService.triggerBroadcastProcessing();
            if (response.success) {
                toast.success('Broadcast processing triggered successfully');
                // Refresh data after successful operation
                await refreshData();
            } else {
                toast.error(response.message || 'Failed to trigger broadcast processing');
            }
        } catch (error) {
            console.error('Error triggering broadcast processing:', error);
            toast.error('Failed to trigger broadcast processing');
        } finally {
            setProcessing(false);
        }
    };

    // Refresh all data
    const refreshData = async () => {
        setRefreshing(true);
        await Promise.all([
            loadBroadcastStats(),
            loadBackgroundJobStatus()
        ]);
        setRefreshing(false);
        toast.success('Broadcast monitor refreshed!');
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                loadBroadcastStats(),
                loadBackgroundJobStatus()
            ]);
            setLoading(false);
        };

        loadData();

        // Auto-refresh every 60 seconds (reduced from 30)
        const interval = setInterval(() => {
            loadBroadcastStats();
            loadBackgroundJobStatus();
        }, 60000);

        return () => clearInterval(interval);
    }, []); // Empty dependency array to run only once on mount

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'running':
                return 'text-green-600 bg-green-100';
            case 'stopped':
                return 'text-red-600 bg-red-100';
            case 'error':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'running':
                return <PlayIcon className="w-4 h-4" />;
            case 'stopped':
                return <StopIcon className="w-4 h-4" />;
            case 'error':
                return <ExclamationTriangleIcon className="w-4 h-4" />;
            default:
                return <ClockIcon className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                            </div>
                            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Statistics Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>

                {/* Status Breakdown Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                        <div className="h-6 bg-gray-200 rounded w-8 animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Background Job Status Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-4"></div>
                        <div className="space-y-4">
                            {Array.from({ length: 2 }).map((_, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                                        <div className="ml-3 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Auto-refresh notice skeleton */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-200 rounded animate-pulse mr-2"></div>
                        <div className="h-4 bg-blue-200 rounded w-64 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Broadcast Monitor</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Monitor delivery broadcasts and background job status
                            </p>
                        </div>
                        {/* Refresh button removed - WebSocket provides real-time updates */}
                    </div>
                </div>
            </div>

            {/* Broadcast Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <MegaphoneIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Total Broadcasts</p>
                            <p className="text-lg font-semibold text-gray-900">{broadcastStats?.totalBroadcasts || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <PlayIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Active</p>
                            <p className="text-lg font-semibold text-gray-900">{broadcastStats?.activeCount || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Expired</p>
                            <p className="text-lg font-semibold text-gray-900">{broadcastStats?.expiredCount || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <CheckCircleIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Accepted</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {broadcastStats?.byStatus?.find(s => s._id === 'accepted')?.count || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Broadcast Status Breakdown</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {broadcastStats.byStatus?.map((status) => (
                            <div key={status._id || 'unknown'} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 capitalize">
                                        {status._id ? status._id.replace('_', ' ') : 'Unknown'}
                                    </span>
                                    <span className="text-lg font-bold text-gray-900">{status.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Background Job Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Background Job Status</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className={`p-2 rounded-lg ${getStatusColor(backgroundJobStatus?.expiredBroadcastHandler?.status || 'unknown')}`}>
                                    {getStatusIcon(backgroundJobStatus?.expiredBroadcastHandler?.status || 'unknown')}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">Expired Broadcast Handler</p>
                                    <p className="text-xs text-gray-500">
                                        Last run: {backgroundJobStatus?.expiredBroadcastHandler?.lastRun
                                            ? new Date(backgroundJobStatus.expiredBroadcastHandler.lastRun).toLocaleString()
                                            : 'Never'}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={handleExpiredBroadcasts}
                                loading={processing}
                                loadingText="Processing..."
                                variant="outline"
                                size="sm"
                                className="px-3 py-1 text-xs"
                            >
                                Run Now
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className={`p-2 rounded-lg ${getStatusColor(backgroundJobStatus?.broadcastProcessor?.status || 'unknown')}`}>
                                    {getStatusIcon(backgroundJobStatus?.broadcastProcessor?.status || 'unknown')}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">Broadcast Processor</p>
                                    <p className="text-xs text-gray-500">
                                        Last run: {backgroundJobStatus?.broadcastProcessor?.lastRun
                                            ? new Date(backgroundJobStatus.broadcastProcessor.lastRun).toLocaleString()
                                            : 'Never'}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={triggerBroadcastProcessing}
                                loading={processing}
                                loadingText="Processing..."
                                variant="outline"
                                size="sm"
                                className="px-3 py-1 text-xs"
                            >
                                Run Now
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auto-refresh notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                    <ArrowPathIcon className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-800">
                        Broadcast monitor automatically refreshes every 30 seconds
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BroadcastMonitor;
