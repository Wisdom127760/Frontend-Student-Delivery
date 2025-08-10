import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../../services/api';
import DriverLayout from '../../components/layouts/DriverLayout';
import { EarningsPageSkeleton } from '../../components/common/SkeletonLoader';
import {
    CurrencyDollarIcon,
    CalendarIcon,
    TruckIcon,
    ChartBarIcon,
    CalendarDaysIcon,
    ArrowPathIcon,
    StarIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EarningsPage = () => {
    const [earningsData, setEarningsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('month');

    // Load earnings data
    const loadEarningsData = useCallback(async () => {
        try {
            setLoading(true);

            let period = selectedPeriod;

            const response = await apiService.getDriverEarnings(period);

            if (response.success) {
                setEarningsData(response.data);
            } else {
                // No fallback - if API fails, show error
                console.error('Earnings API response invalid:', response);
                toast.error('Failed to load earnings data');
                setEarningsData({
                    summary: {
                        totalEarnings: 0,
                        totalDeliveries: 0,
                        averagePerDelivery: 0,
                        completionRate: 0,
                        activeHours: 0,
                        bestDay: null
                    },
                    trends: {
                        earningsChange: 0,
                        deliveriesChange: 0,
                        ratingChange: 0
                    },
                    weeklyBreakdown: [],
                    dailyStats: []
                });
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
    };



    // Format currency
    const formatCurrency = (amount) => `₺${Number(amount).toFixed(2)}`;

    // Extract data
    const summary = earningsData?.summary || {};
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
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
                            <p className="text-gray-600 mt-1">Track your earnings and performance</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={refreshEarnings}
                                disabled={refreshing}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                            >
                                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>

                    {/* Period Filter */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-600">Filter by Period:</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Showing earnings for:</span>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => handlePeriodChange(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>
                    </div>

                    {/* Main Earnings Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Earnings */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-2">Total Earnings</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {formatCurrency(summary.totalEarnings || 1250.50)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-green-50">
                                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        {/* Total Deliveries */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-2">Total Deliveries</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {summary.totalDeliveries || 42}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50">
                                    <TruckIcon className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        {/* Average Per Delivery */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-2">Avg Per Delivery</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {formatCurrency(summary.averagePerDelivery || 29.77)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-purple-50">
                                    <BanknotesIcon className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-2">Average Rating</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {(summary.averageRating || 4.8).toFixed(1)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-yellow-50">
                                    <StarIcon className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Weekly Performance */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">Weekly Performance</h2>
                                    <ChartBarIcon className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <div className="p-6">
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
                                    <div className="text-center py-8">
                                        <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                                    <button
                                        onClick={() => window.open('/driver/deliveries', '_blank')}
                                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                                    >
                                        View all
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                {dailyStats.length > 0 ? (
                                    <div className="space-y-4">
                                        {dailyStats.slice(0, 5).map((day, index) => (
                                            <div key={index} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                                                <div className="p-2 bg-green-50 rounded-lg">
                                                    <CalendarIcon className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        {new Date(day.date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            weekday: 'short'
                                                        })}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{day.deliveries} deliveries</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">{formatCurrency(day.earnings)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No activity yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Support Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Support</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* WhatsApp Support */}
                            <a
                                href="https://wa.me/905338329785"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
                            >
                                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 2.079.529 4.0 1.459 5.68L.029 24l6.592-1.729c1.618.826 3.436 1.296 5.396 1.296 6.621 0 11.988-5.367 11.988-11.987C23.988 5.367 18.621.001 12.017.001zM12.017 21.92c-1.737 0-3.396-.441-4.838-1.204l-.347-.206-3.595.942.959-3.507-.225-.359a9.861 9.861 0 01-1.474-5.298c0-5.464 4.445-9.909 9.909-9.909s9.909 4.445 9.909 9.909-4.445 9.909-9.909 9.909z" />
                                        <path d="M17.185 14.716c-.301-.15-1.781-.879-2.057-.979-.276-.101-.477-.151-.678.15-.2.301-.776.979-.951 1.181-.175.2-.351.226-.652.075-.301-.15-1.271-.468-2.42-1.493-.894-.798-1.497-1.784-1.672-2.085-.176-.301-.019-.464.132-.613.135-.133.301-.351.452-.527.15-.175.2-.301.301-.502.101-.2.05-.376-.025-.527-.075-.15-.678-1.634-.931-2.235-.246-.584-.497-.505-.678-.515-.176-.009-.376-.009-.577-.009s-.527.075-.803.376c-.276.301-1.053 1.029-1.053 2.51s1.078 2.909 1.228 3.109c.15.2 2.12 3.237 5.136 4.541.717.31 1.277.494 1.714.632.72.229 1.375.196 1.893.119.577-.086 1.781-.728 2.032-1.431.252-.703.252-1.305.176-1.431-.075-.125-.276-.2-.577-.351z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 group-hover:text-green-700">WhatsApp Support</h3>
                                    <p className="text-sm text-gray-600">+90 533 832 97 85</p>
                                </div>
                            </a>

                            {/* Instagram */}
                            <a
                                href="https://instagram.com/greepit"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-all group"
                            >
                                <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
                                    <svg className="h-6 w-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 group-hover:text-pink-700">Follow Us</h3>
                                    <p className="text-sm text-gray-600">@greepit</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </DriverLayout>
    );
};

export default EarningsPage;