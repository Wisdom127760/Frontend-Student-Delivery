import React, { useState, useEffect, useCallback } from 'react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import {
    CurrencyDollarIcon,
    CalendarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    TruckIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline';
import systemSettingsService from '../../services/systemSettings';

const EarningsPage = () => {
    const [earningsData, setEarningsData] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [customDateRange, setCustomDateRange] = useState({ startDate: '', endDate: '' });

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            window.location.href = '/login';
        }
    }, [isAuthenticated]);

    const loadEarningsData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let token = localStorage.getItem('token');
            // For testing purposes, if no token, use a test token
            if (!token) {
                token = 'test-token-for-demo';
                // Don't set error, continue with test token
            }

            // Construct URLs with period and custom date parameters
            let earningsUrl = `${API_BASE_URL}/driver/earnings?period=${selectedPeriod}`;
            let analyticsUrl = `${API_BASE_URL}/driver/analytics?period=${selectedPeriod}`;

            if (selectedPeriod === 'custom' && customDateRange.startDate && customDateRange.endDate) {
                earningsUrl += `&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
                analyticsUrl += `&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
            }

            console.log('💰 Loading earnings data from:', earningsUrl);
            console.log('📊 Loading analytics data from:', analyticsUrl);



            const [earningsResponse, analyticsResponse] = await Promise.all([
                fetch(earningsUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(analyticsUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);



            if (!earningsResponse.ok) {
                throw new Error(`Earnings API error: ${earningsResponse.status}`);
            }

            if (!analyticsResponse.ok) {
                throw new Error(`Analytics API error: ${analyticsResponse.status}`);
            }

            const earningsResult = await earningsResponse.json();
            const analyticsResult = await analyticsResponse.json();



            // Handle API responses


            if (earningsResult.success) {
                setEarningsData(earningsResult.data);
            } else {
                console.error('💰 Earnings API failed:', earningsResult.error);
                setEarningsData(null);
            }

            if (analyticsResult.success) {
                setAnalyticsData(analyticsResult.data);
            } else {
                console.error('📊 Analytics API failed:', analyticsResult.error);
                setAnalyticsData(null);
            }

        } catch (error) {
            console.error('Error loading earnings data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, selectedPeriod, customDateRange]);

    useEffect(() => {
        loadEarningsData();
    }, [loadEarningsData]);

    const handlePeriodChange = (period) => {
        console.log('🔄 Period change:', period);
        setSelectedPeriod(period);

        // If custom period, validate date range
        if (period === 'custom') {
            if (!customDateRange.startDate || !customDateRange.endDate) {
                console.log('🔄 Custom period selected but no dates chosen yet');
                return; // Don't load data until both dates are selected
            }
            if (new Date(customDateRange.startDate) > new Date(customDateRange.endDate)) {
                // Show validation error in the UI instead of alert
                setError('Start date must be before end date');
                return;
            }
            console.log('🔄 Custom period with valid dates, loading data...');
        }

        loadEarningsData();
    };

    const getPeriodLabel = (period) => {
        const labels = {
            'today': 'Today',
            'week': 'This Week',
            'month': 'This Month',
            'year': 'This Year',
            'all-time': 'All Time',
            'custom': 'Custom Range'
        };
        return labels[period] || period;
    };

    const formatCurrency = (amount) => {
        return systemSettingsService.formatCurrency(amount);
    };



    const getChangeIcon = (change) => {
        if (change > 0) {
            return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
        } else if (change < 0) {
            return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
        }
        return null;
    };

    const getChangeColor = (change) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    // Show loading or redirect if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="space-y-6">
                <SkeletonLoader type="card" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SkeletonLoader type="stats" />
                    <SkeletonLoader type="stats" />
                    <SkeletonLoader type="stats" />
                    <SkeletonLoader type="stats" />
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
                    </div>
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
                            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error Loading Earnings</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                            {error.includes('authentication') || error.includes('token') ? (
                                <button
                                    onClick={() => window.location.href = '/login'}
                                    className="mt-3 text-sm text-red-600 hover:text-red-500 font-medium"
                                >
                                    Go to Login
                                </button>
                            ) : (
                                <button
                                    onClick={loadEarningsData}
                                    className="mt-3 text-sm text-red-600 hover:text-red-500 font-medium"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Extract data from API responses
    const earnings = earningsData?.summary || {};
    const weeklyBreakdown = earningsData?.earnings || [];
    const analytics = analyticsData || {};
    const dailyStats = analytics.dailyStats || [];
    const trends = analytics.trends || {};

    // Calculate additional metrics
    const totalEarnings = earnings.totalEarnings || 0;
    const totalDeliveries = earnings.totalDeliveries || 0;
    const averagePerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;
    const completionRate = analytics.stats?.completionRate || 0;
    const averageDeliveryTime = analytics.stats?.averageEarningsPerDelivery || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
                    <p className="text-gray-600">Track your earnings and performance</p>
                </div>

                {/* Period Filter */}
                <div className="flex items-center space-x-3">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => handlePeriodChange(e.target.value)}
                        disabled={loading}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                        <option value="all-time">All Time</option>
                        <option value="custom">Custom Range</option>
                    </select>

                    {/* Custom Date Range Picker */}
                    {selectedPeriod === 'custom' && (
                        <div className="flex items-center space-x-2">
                            <input
                                type="date"
                                value={customDateRange.startDate}
                                onChange={(e) => {
                                    const newStartDate = e.target.value;
                                    setCustomDateRange(prev => ({ ...prev, startDate: newStartDate }));
                                    if (customDateRange.endDate && newStartDate && new Date(newStartDate) <= new Date(customDateRange.endDate)) {
                                        setTimeout(() => handlePeriodChange('custom'), 100);
                                    }
                                }}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                                type="date"
                                value={customDateRange.endDate}
                                onChange={(e) => {
                                    const newEndDate = e.target.value;
                                    setCustomDateRange(prev => ({ ...prev, endDate: newEndDate }));
                                    if (customDateRange.startDate && newEndDate && new Date(customDateRange.startDate) <= new Date(newEndDate)) {
                                        setTimeout(() => handlePeriodChange('custom'), 100);
                                    }
                                }}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                            <button
                                onClick={() => handlePeriodChange('custom')}
                                disabled={!customDateRange.startDate || !customDateRange.endDate || loading}
                                className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Apply
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Period Display */}
            <div className="text-sm text-gray-500">
                Showing stats for: <span className="font-medium">{getPeriodLabel(selectedPeriod)}</span>
                {selectedPeriod === 'custom' && customDateRange.startDate && customDateRange.endDate && (
                    <span className="ml-2">
                        {(() => {
                            const startDate = new Date(customDateRange.startDate);
                            const endDate = new Date(customDateRange.endDate);
                            return `(${isNaN(startDate.getTime()) ? 'Invalid' : startDate.toLocaleDateString()} - ${isNaN(endDate.getTime()) ? 'Invalid' : endDate.toLocaleDateString()})`;
                        })()}
                    </span>
                )}
                {selectedPeriod === 'custom' && (!customDateRange.startDate || !customDateRange.endDate) && (
                    <span className="ml-2 text-orange-600">
                        (Please select start and end dates)
                    </span>
                )}
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Earnings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatCurrency(totalEarnings)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    {trends.earningsTrend !== undefined && (
                        <div className="mt-4 flex items-center">
                            {getChangeIcon(trends.earningsTrend)}
                            <span className={`text-sm font-medium ml-1 ${getChangeColor(trends.earningsTrend)}`}>
                                {trends.earningsTrend > 0 ? '+' : ''}{Math.round(trends.earningsTrend * 10) / 10}% from last period
                            </span>
                        </div>
                    )}
                </div>

                {/* Total Deliveries */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {totalDeliveries}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <TruckIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    {trends.deliveryTrend !== undefined && (
                        <div className="mt-4 flex items-center">
                            {getChangeIcon(trends.deliveryTrend)}
                            <span className={`text-sm font-medium ml-1 ${getChangeColor(trends.deliveryTrend)}`}>
                                {trends.deliveryTrend > 0 ? '+' : ''}{Math.round(trends.deliveryTrend * 10) / 10}% from last period
                            </span>
                        </div>
                    )}
                </div>

                {/* Average Per Delivery */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Per Delivery</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatCurrency(averagePerDelivery)}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-sm text-gray-600">
                            Average per delivery
                        </span>
                    </div>
                </div>

                {/* Completion Rate */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {Math.round(completionRate)}%
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-sm text-gray-600">
                            {analytics.stats?.completedDeliveries || 0} completed
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Earnings Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Earnings Breakdown</h3>
                    {weeklyBreakdown.length > 0 ? (
                        <div className="h-64 flex items-end justify-between space-x-2">
                            {weeklyBreakdown.map((week, index) => {
                                const maxEarnings = Math.max(...weeklyBreakdown.map(w => w.earnings));
                                const height = maxEarnings > 0 ? (week.earnings / maxEarnings) * 200 : 0;

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-green-500 rounded-t"
                                            style={{ height: `${height}px` }}
                                        ></div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Week {week.week}
                                        </p>
                                        <p className="text-xs text-gray-600">{formatCurrency(week.earnings)}</p>
                                        <p className="text-xs text-gray-400">{week.deliveries} deliveries</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>No earnings data for this period</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Performance Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">{Math.round(completionRate)}%</p>
                                <p className="text-xs text-gray-500">
                                    {analytics.stats?.completedDeliveries || 0}/{analytics.stats?.totalDeliveries || 0}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <ClockIcon className="w-5 h-5 text-blue-500" />
                                <span className="text-sm font-medium text-gray-700">Avg Delivery Time</span>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">{averageDeliveryTime} min</p>
                                <p className="text-xs text-gray-500">Per delivery</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CalendarDaysIcon className="w-5 h-5 text-purple-500" />
                                <span className="text-sm font-medium text-gray-700">Best Day</span>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">
                                    {analytics.bestDay?.date ? (() => {
                                        const date = new Date(analytics.bestDay.date);
                                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', { weekday: 'short' });
                                    })() : 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {analytics.bestDay?.deliveries || 0} deliveries
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity</h3>
                {dailyStats.length > 0 ? (
                    <div className="space-y-3">
                        {dailyStats.slice(0, 7).map((day, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {(() => {
                                                const date = new Date(day.date);
                                                return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    weekday: 'short'
                                                });
                                            })()}
                                        </p>
                                        <p className="text-sm text-gray-500">{day.deliveries} deliveries</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">{formatCurrency(day.earnings)}</p>
                                    <p className="text-sm text-gray-500">
                                        {day.deliveries > 0 ? formatCurrency(day.earnings / day.deliveries) : '₺0'} avg
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No activity data for this period</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default EarningsPage;
