import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChartBarIcon,
    TruckIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    ArrowLeftIcon,
    UsersIcon,
    CogIcon
} from '@heroicons/react/24/outline';
import { getDashboardData, getRecentDeliveries, getTopDrivers } from '../../services/dashboardService';
import { formatCurrency } from '../../services/systemSettings';
import RealTimeDriverStatus from '../../components/admin/RealTimeDriverStatus';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [recentDeliveries, setRecentDeliveries] = useState([]);
    const [topDrivers, setTopDrivers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [dashboard, deliveries, drivers] = await Promise.all([
                    getDashboardData(),
                    getRecentDeliveries(),
                    getTopDrivers()
                ]);

                setDashboardData(dashboard);
                setRecentDeliveries(deliveries);
                setTopDrivers(drivers);
            } catch (error) {
                toast.error('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: 'Total Deliveries',
            value: dashboardData?.totalDeliveries?.toLocaleString() || '1,234',
            change: '+12%',
            icon: TruckIcon,
            color: 'bg-blue-500'
        },
        {
            title: 'Active Drivers',
            value: dashboardData?.activeDrivers || '45',
            change: '+5%',
            icon: UserGroupIcon,
            color: 'bg-green-500'
        },
        {
            title: 'Revenue',
            value: formatCurrency(dashboardData?.totalRevenue || 12450),
            change: '+8%',
            icon: CurrencyDollarIcon,
            color: 'bg-yellow-500'
        },
        {
            title: 'Success Rate',
            value: `${dashboardData?.successRate || 98.5}%`,
            change: '+2%',
            icon: ChartBarIcon,
            color: 'bg-purple-500'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        </div>
                        <div className="text-sm text-gray-500">
                            Welcome back, Administrator
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-sm text-green-600">{stat.change}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.color}`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Real-time Driver Status */}
                <div className="mb-8">
                    <RealTimeDriverStatus />
                </div>

                {/* Recent Deliveries */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Deliveries</h2>
                    <div className="space-y-4">
                        {recentDeliveries.slice(0, 5).map((delivery) => (
                            <div key={delivery.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <TruckIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{delivery.customerName}</p>
                                        <p className="text-sm text-gray-600">{delivery.pickupLocation} → {delivery.deliveryLocation}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">{formatCurrency(delivery.amount)}</p>
                                    <p className="text-sm text-gray-500">{new Date(delivery.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Drivers */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Drivers</h2>
                    <div className="space-y-4">
                        {topDrivers.slice(0, 5).map((driver) => (
                            <div key={driver.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <UsersIcon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{driver.name}</p>
                                        <p className="text-sm text-gray-600">{driver.deliveries} deliveries</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">{formatCurrency(driver.earnings)}</p>
                                    <p className="text-sm text-gray-500">Rating: {driver.rating}/5</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/admin/drivers')}
                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                            <UserGroupIcon className="w-8 h-8 text-green-500 mb-2" />
                            <h3 className="font-medium text-gray-900">Manage Drivers</h3>
                            <p className="text-sm text-gray-600">View and manage drivers</p>
                        </button>
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                            <TruckIcon className="w-8 h-8 text-blue-500 mb-2" />
                            <h3 className="font-medium text-gray-900">Manage Deliveries</h3>
                            <p className="text-sm text-gray-600">View and manage all deliveries</p>
                        </button>
                        <button
                            onClick={() => navigate('/admin/profile')}
                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                            <CogIcon className="w-8 h-8 text-purple-500 mb-2" />
                            <h3 className="font-medium text-gray-900">Profile Settings</h3>
                            <p className="text-sm text-gray-600">Manage your account</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

