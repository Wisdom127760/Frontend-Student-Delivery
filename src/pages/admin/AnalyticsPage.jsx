import React, { useState, useEffect, useCallback } from 'react';
import { capitalizeName } from '../../utils/nameUtils';
import { LineChart, PieChart } from '../../components/charts';
import { formatCurrency } from '../../services/systemSettings';
import toast from 'react-hot-toast';
import apiService from '../../services/api';

// Skeleton Components
const ChartSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="space-y-2">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="flex space-x-2">
                    <div className="h-2 bg-gray-200 rounded flex-1"></div>
                    <div className="h-2 bg-gray-200 rounded flex-1"></div>
                    <div className="h-2 bg-gray-200 rounded flex-1"></div>
                </div>
            </div>
        </div>
    </div>
);

const DriverPerformanceSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div>
                                <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                                <div className="h-2 bg-gray-200 rounded w-16"></div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                            <div className="h-2 bg-gray-200 rounded w-12"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const DeliveryStatusSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="flex items-center justify-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
            </div>
            <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded w-14"></div>
                </div>
            </div>
        </div>
    </div>
);

const AnalyticsPage = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('month');

    const loadAnalyticsData = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log('📊 AnalyticsPage: Loading analytics data for period:', selectedPeriod);

            // Use the enhanced analytics service
            const response = await apiService.getEnhancedAnalytics(selectedPeriod);
            console.log('📊 AnalyticsPage: Enhanced Analytics API response:', response);

            // Handle the backend response structure
            if (response && response.success) {
                setAnalyticsData(response.data);
            } else {
                console.warn('📊 AnalyticsPage: Backend returned unsuccessful response:', response);
                setAnalyticsData(null);
            }
        } catch (error) {
            console.error('❌ AnalyticsPage: Error loading analytics data:', error);
            console.error('❌ AnalyticsPage: Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });

            // Show user-friendly error message
            if (error.response?.status === 400) {
                toast.error('Analytics failed: Invalid period parameter. Please try a different time period.');
            } else if (error.response?.status === 401) {
                toast.error('Analytics failed: Authentication required.');
            } else if (error.response?.status === 403) {
                toast.error('Analytics failed: Permission denied.');
            } else if (error.response?.status === 404) {
                toast.error('Analytics failed: Analytics endpoint not found.');
            } else if (error.response?.status === 500) {
                toast.error('Analytics failed: Server error. Please try again later.');
            } else {
                toast.error('Failed to load analytics data');
            }

            setAnalyticsData(null);
        } finally {
            setIsLoading(false);
        }
    }, [selectedPeriod]);

    useEffect(() => {
        loadAnalyticsData();
    }, [loadAnalyticsData]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics & Insights</h1>
                            <p className="mt-1 text-sm text-gray-600">Detailed performance metrics and trends</p>
                        </div>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Delivery Trends */}
                    {isLoading ? (
                        <ChartSkeleton />
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h2 className="text-sm font-semibold text-gray-900 mb-3">Delivery Trends</h2>
                            {analyticsData?.deliveryTrends ? (
                                <LineChart
                                    data={analyticsData.deliveryTrends}
                                    xKey="date"
                                    yKey="deliveries"
                                    color="blue"
                                />
                            ) : (
                                <div className="text-center py-6 text-sm text-gray-500">No data available</div>
                            )}
                        </div>
                    )}

                    {/* Revenue Trends */}
                    {isLoading ? (
                        <ChartSkeleton />
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h2 className="text-sm font-semibold text-gray-900 mb-3">Revenue Trends</h2>
                            {analyticsData?.deliveryTrends ? (
                                <LineChart
                                    data={analyticsData.deliveryTrends}
                                    xKey="date"
                                    yKey="revenue"
                                    color="green"
                                />
                            ) : (
                                <div className="text-center py-6 text-sm text-gray-500">No data available</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Additional Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Driver Performance */}
                    {isLoading ? (
                        <DriverPerformanceSkeleton />
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h2 className="text-sm font-semibold text-gray-900 mb-3">Driver Performance</h2>
                            {analyticsData?.driverPerformance ? (
                                <div className="space-y-3">
                                    {analyticsData.driverPerformance.map((driver, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{capitalizeName(driver.name)}</p>
                                                <p className="text-xs text-gray-600">{driver.deliveries} deliveries</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-green-600">{formatCurrency(driver.earnings)}</p>
                                                <p className="text-xs text-gray-600">Rating: {driver.rating}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-sm text-gray-500">No data available</div>
                            )}
                        </div>
                    )}

                    {/* Delivery Status */}
                    {isLoading ? (
                        <DeliveryStatusSkeleton />
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h2 className="text-sm font-semibold text-gray-900 mb-3">Delivery Status</h2>
                            {analyticsData?.deliveryStatus ? (
                                <PieChart
                                    data={analyticsData.deliveryStatus}
                                    dataKey="count"
                                    nameKey="status"
                                />
                            ) : (
                                <div className="text-center py-6 text-sm text-gray-500">No data available</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;

