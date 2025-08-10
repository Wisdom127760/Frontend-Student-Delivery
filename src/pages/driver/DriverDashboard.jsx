import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import DriverLayout from '../../components/layouts/DriverLayout';
import { DashboardSkeleton } from '../../components/common/SkeletonLoader';
import {
    TruckIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    StarIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Available period options for filtering (moved outside component to avoid dependency warning)
const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'currentPeriod', label: 'This Month' },
    { value: 'allTime', label: 'All Time' }
];

const DashboardContent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const [dashboardData, setDashboardData] = useState(null);

    // Load dashboard data from comprehensive endpoint
    const loadDashboardData = useCallback(async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            console.log('📊 Loading dashboard data for period:', selectedPeriod);
            console.log('🌐 API URL:', `/api/driver/dashboard?period=${selectedPeriod}`);
            console.log('🔑 Token check:', localStorage.getItem('token') ? 'Token exists' : 'No token found');
            console.log('👤 User info:', localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : 'No user info');

            const response = await apiService.getDashboardData(selectedPeriod);

            if (response.success && response.data) {
                console.log('✅ Dashboard data loaded successfully!');
                console.log('📊 Data structure:', {
                    hasQuickStats: !!response.data.quickStats,
                    hasDeliveries: !!response.data.deliveries,
                    hasPerformance: !!response.data.performance,
                    period: selectedPeriod
                });
                console.log('💰 Quick stats for', selectedPeriod, ':', response.data.quickStats?.[selectedPeriod]);
                setDashboardData(response.data);

                // Removed success toast to prevent unwanted notifications
            } else {
                console.warn('⚠️ Invalid dashboard response:', response);
                console.warn('Response structure:', JSON.stringify(response, null, 2));
                throw new Error('Invalid response structure');
            }



        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            console.error('Request URL:', `/api/driver/dashboard?period=${selectedPeriod}`);
            console.error('Full error object:', {
                message: error.message,
                name: error.name,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers
            });

            // Try fallback to "today" if other periods fail (except for auth errors)
            if (selectedPeriod !== 'today' && error.response?.status !== 401) {
                console.log('🔄 Attempting fallback to "today" period...');
                try {
                    const fallbackResponse = await apiService.getDashboardData('today');
                    if (fallbackResponse.success && fallbackResponse.data) {
                        console.log('✅ Fallback to "today" successful');
                        setDashboardData(fallbackResponse.data);
                        if (!silent) {
                            toast(`"${selectedPeriod}" period not supported yet. Showing "Today" data instead.`, {
                                icon: '⚠️',
                                duration: 4000
                            });
                        }
                        return; // Exit successfully with fallback data
                    }
                } catch (fallbackError) {
                    console.error('❌ Fallback to "today" also failed:', fallbackError);
                }
            }

            // Show appropriate error messages
            if (!silent) {
                if (error.response?.status === 400) {
                    toast.error(`Period "${selectedPeriod}" validation failed. Backend may not support this period type yet.`);
                } else if (error.response?.status === 401) {
                    toast.error('Please log in again to view dashboard data.');
                } else if (error.response?.status === 500) {
                    toast.error(`Server error for period "${selectedPeriod}". Backend may need implementation.`);
                } else {
                    toast.error(`Failed to load dashboard data for "${selectedPeriod}": ${error.response?.data?.error || error.message}`);
                }
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, [selectedPeriod]);

    // Period change handler
    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
    };



    useEffect(() => {
        loadDashboardData();

        // Refresh data every 30 seconds (silent refresh)
        const interval = setInterval(() => loadDashboardData(true), 30000);
        return () => clearInterval(interval);
    }, [loadDashboardData]);

    // Get current period data based on selected filter
    const getCurrentPeriodData = () => {
        if (!dashboardData?.quickStats) return null;

        switch (selectedPeriod) {
            case 'today':
                return dashboardData.quickStats.today;
            case 'thisWeek':
                return dashboardData.quickStats.thisWeek;
            case 'currentPeriod':
                return dashboardData.quickStats.currentPeriod;
            case 'allTime':
                return dashboardData.quickStats.allTime;
            default:
                return dashboardData.quickStats.today;
        }
    };

    const currentData = getCurrentPeriodData();
    const rating = dashboardData?.performance?.rating || 4.7;

    // Main dashboard metrics based on the comprehensive payload design
    const dashboardMetrics = [
        {
            title: "Total Deliveries",
            value: currentData?.deliveries || currentData?.totalDeliveries || 0,
            icon: TruckIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Total Completed',
            value: currentData?.completed || Math.floor((currentData?.deliveries || 0) * 0.8) || 0,
            icon: CheckCircleIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Total Earnings',
            value: `₺${(currentData?.earnings || currentData?.totalEarnings || 0).toFixed(2)}`,
            icon: CurrencyDollarIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Algorithm Rating',
            value: rating.toFixed(1),
            icon: StarIcon,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        }
    ];

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
                        <p className="text-gray-600 mt-1">Welcome back! Here's your delivery overview.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/driver/deliveries')}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                            <TruckIcon className="h-5 w-5" />
                            <span>View All Deliveries</span>
                        </button>
                        <button
                            onClick={() => navigate('/driver/earnings')}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                            <CurrencyDollarIcon className="h-5 w-5" />
                            <span>View Earnings</span>
                        </button>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">Filter by Period:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Showing stats for:</span>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            {periodOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {dashboardMetrics.map((metric, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-2">{metric.title}</p>
                                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Current Deliveries */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Current Deliveries</h2>
                                <button
                                    onClick={() => navigate('/driver/deliveries')}
                                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                                >
                                    View all
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {dashboardData?.deliveries?.today?.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.deliveries.today.map((delivery, index) => (
                                        <div key={delivery.id || index} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                                            <div className="p-2 bg-green-50 rounded-lg">
                                                <TruckIcon className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-gray-900">{delivery.code || delivery.id || 'N/A'}</p>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${delivery.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                                        delivery.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                            delivery.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {delivery.status || 'assigned'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">{delivery.customer?.name || delivery.customerName || 'Customer'}</p>
                                                <p className="text-sm text-gray-500">{delivery.deliveryTime || delivery.createdAt || new Date().toLocaleTimeString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">₺{delivery.amount || delivery.price || 150}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <TruckIcon className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-gray-900">wrwrw</p>
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                    assigned
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">GRP-373319</p>
                                            <p className="text-sm text-gray-500">4:04:00 AM</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">₺150</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <TruckIcon className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-gray-900">dgdgdgdg</p>
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                    assigned
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">GRP-621899</p>
                                            <p className="text-sm text-gray-500">4:02:00 AM</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">₺150</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Earnings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Earnings</h2>
                                <button
                                    onClick={() => navigate('/driver/earnings')}
                                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                                >
                                    View all
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Week 31, 2025</p>
                                        <p className="text-sm text-gray-600">4 deliveries</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">₺360</p>
                                        <p className="text-sm text-gray-500">₺360 + ₺0 tips</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
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
    );
};

// Main wrapper component
const DriverDashboard = () => {
    return (
        <DriverLayout>
            <DashboardContent />
        </DriverLayout>
    );
};

export default DriverDashboard;