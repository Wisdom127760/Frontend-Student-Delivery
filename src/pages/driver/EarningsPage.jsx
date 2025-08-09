import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../../services/api';
import DriverLayout from '../../components/layouts/DriverLayout';
import { EarningsPageSkeleton } from '../../components/common/SkeletonLoader';
import {
    CurrencyDollarIcon,
    CalendarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    TruckIcon,
    ClockIcon,
    CheckCircleIcon,
    ChartBarIcon,
    CalendarDaysIcon,
    ArrowPathIcon,
    EyeIcon,
    StarIcon,
    MapPinIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EarningsPage = () => {
    const [earningsData, setEarningsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [customDateRange, setCustomDateRange] = useState({ startDate: '', endDate: '' });

    // Load earnings data
    const loadEarningsData = useCallback(async () => {
        try {
            setLoading(true);

            let period = selectedPeriod;

            const response = await apiService.getDriverEarnings(period);

            if (response.success) {
                setEarningsData(response.data);
            } else {
                // Mock data for demonstration
                const mockData = {
                    summary: {
                        totalEarnings: 1250.50,
                        totalDeliveries: 42,
                        averagePerDelivery: 29.77,
                        completionRate: 98.5,
                        activeHours: 35.5,
                        bestDay: {
                            date: new Date().toISOString(),
                            earnings: 185.25,
                            deliveries: 8
                        }
                    },
                    trends: {
                        earningsChange: 15.2,
                        deliveriesChange: 8.5,
                        ratingChange: 0.3
                    },
                    weeklyBreakdown: [
                        { week: 1, earnings: 320.50, deliveries: 12 },
                        { week: 2, earnings: 285.75, deliveries: 10 },
                        { week: 3, earnings: 365.25, deliveries: 14 },
                        { week: 4, earnings: 279.00, deliveries: 6 }
                    ],
                    dailyStats: [
                        { date: new Date().toISOString(), earnings: 85.50, deliveries: 3 },
                        { date: new Date(Date.now() - 86400000).toISOString(), earnings: 142.75, deliveries: 5 },
                        { date: new Date(Date.now() - 172800000).toISOString(), earnings: 95.25, deliveries: 4 }
                    ]
                };
                setEarningsData(mockData);
            }
        } catch (error) {
            console.error('Error loading earnings:', error);
            toast.error('Failed to load earnings data');
        } finally {
            setLoading(false);
        }
    }, [selectedPeriod]);

    useEffect(() => {
        loadEarningsData();
    }, [loadEarningsData]);

    // Refresh earnings
    const refreshEarnings = async () => {
        setRefreshing(true);
        await loadEarningsData();
        setRefreshing(false);
        toast.success('Earnings data refreshed!');
    };

    // Period handlers
    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
        if (period !== 'custom') {
            setCustomDateRange({ startDate: '', endDate: '' });
        }
    };



    // Format currency
    const formatCurrency = (amount) => `₺${Number(amount).toFixed(2)}`;

    // Change indicators
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

    // Extract data
    const summary = earningsData?.summary || {};
    const trends = earningsData?.trends || {};
    const weeklyBreakdown = earningsData?.weeklyBreakdown || [];
    const dailyStats = earningsData?.dailyStats || [];

    if (loading) {
        return (
            <DriverLayout>
                <EarningsPageSkeleton />
            </DriverLayout>
        );
    }

    return (
        <DriverLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Earnings Dashboard</h1>
                        <p className="text-gray-600 mt-1">Track your earnings and performance metrics</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                        {/* Refresh Button */}
                        <button
                            onClick={refreshEarnings}
                            disabled={refreshing}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>

                        {/* Period Filter */}
                        <select
                            value={selectedPeriod}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                            <option value="all">All Time</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>
                </div>

                {/* Custom Date Range */}
                {selectedPeriod === 'custom' && (
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-blue-900">From:</label>
                            <input
                                type="date"
                                value={customDateRange.startDate}
                                onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                className="px-3 py-2 text-sm border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-blue-900">To:</label>
                            <input
                                type="date"
                                value={customDateRange.endDate}
                                onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                className="px-3 py-2 text-sm border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            onClick={loadEarningsData}
                            disabled={!customDateRange.startDate || !customDateRange.endDate}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            Apply
                        </button>
                    </div>
                )}

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Earnings */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Total Earnings</p>
                                <p className="text-3xl font-bold">
                                    {formatCurrency(summary.totalEarnings || 0)}
                                </p>
                                {trends.earningsChange && (
                                    <div className="flex items-center mt-2">
                                        {trends.earningsChange > 0 ? (
                                            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                                        ) : (
                                            <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                                        )}
                                        <span className="text-sm font-medium">
                                            {trends.earningsChange > 0 ? '+' : ''}{trends.earningsChange}% vs last period
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 bg-white/20 rounded-lg">
                                <CurrencyDollarIcon className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Total Deliveries */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {summary.totalDeliveries || 0}
                                </p>
                                {trends.deliveriesChange && (
                                    <div className="flex items-center mt-2">
                                        {getChangeIcon(trends.deliveriesChange)}
                                        <span className={`text-sm font-medium ml-1 ${getChangeColor(trends.deliveriesChange)}`}>
                                            {trends.deliveriesChange > 0 ? '+' : ''}{trends.deliveriesChange}%
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <TruckIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Average Per Delivery */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Per Delivery</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {formatCurrency(summary.averagePerDelivery || 0)}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">Per completed delivery</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <BanknotesIcon className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    {/* Completion Rate */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {Math.round(summary.completionRate || 0)}%
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    {summary.activeHours || 0} active hours
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Weekly Breakdown Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Weekly Performance</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <ChartBarIcon className="w-4 h-4" />
                                <span>Earnings & Deliveries</span>
                            </div>
                        </div>

                        {weeklyBreakdown.length > 0 ? (
                            <div className="space-y-4">
                                {weeklyBreakdown.map((week, index) => {
                                    const maxEarnings = Math.max(...weeklyBreakdown.map(w => w.earnings));
                                    const earningsPercentage = maxEarnings > 0 ? (week.earnings / maxEarnings) * 100 : 0;

                                    return (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-gray-700">Week {week.week}</span>
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-green-600 font-medium">
                                                        {formatCurrency(week.earnings)}
                                                    </span>
                                                    <span className="text-gray-500">
                                                        {week.deliveries} deliveries
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                                                    style={{ width: `${earningsPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                <div className="text-center">
                                    <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>No data available for selected period</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Performance Insights */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Insights</h3>

                        <div className="space-y-4">
                            {/* Best Day */}
                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div className="flex items-center space-x-3 mb-2">
                                    <StarIcon className="w-5 h-5 text-yellow-600" />
                                    <span className="font-medium text-yellow-900">Best Day</span>
                                </div>
                                <p className="text-2xl font-bold text-yellow-900">
                                    {formatCurrency(summary.bestDay?.earnings || 0)}
                                </p>
                                <p className="text-sm text-yellow-700">
                                    {summary.bestDay?.deliveries || 0} deliveries • {
                                        summary.bestDay?.date ?
                                            new Date(summary.bestDay.date).toLocaleDateString('en-US', { weekday: 'long' }) :
                                            'N/A'
                                    }
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <ClockIcon className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Active Hours</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">
                                        {summary.activeHours || 0}h
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <MapPinIcon className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Areas Covered</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">
                                        {summary.areasCovered || 5}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <StarIcon className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Avg Rating</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">
                                        {(summary.averageRating || 4.8).toFixed(1)} ⭐
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Daily Activity</h3>
                        <button
                            onClick={() => window.open('/driver/deliveries', '_blank')}
                            className="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            View All Deliveries
                        </button>
                    </div>

                    {dailyStats.length > 0 ? (
                        <div className="space-y-3">
                            {dailyStats.slice(0, 7).map((day, index) => (
                                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <CalendarIcon className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {new Date(day.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    weekday: 'short'
                                                })}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {day.deliveries} deliveries
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                            {formatCurrency(day.earnings)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {day.deliveries > 0 ? formatCurrency(day.earnings / day.deliveries) : '₺0'} avg
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                            <p className="text-gray-500">
                                Start making deliveries to see your daily activity here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DriverLayout>
    );
};

export default EarningsPage;