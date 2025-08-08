import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TruckIcon,
    CurrencyDollarIcon,
    ClockIcon,
    MapPinIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

const DriverDashboard = () => {
    const navigate = useNavigate();

    const stats = [
        {
            title: 'Today\'s Deliveries',
            value: '8',
            change: '+2',
            icon: TruckIcon,
            color: 'bg-blue-500'
        },
        {
            title: 'Today\'s Earnings',
            value: '₺240',
            change: '+₺30',
            icon: CurrencyDollarIcon,
            color: 'bg-green-500'
        },
        {
            title: 'Active Time',
            value: '6h 30m',
            change: '+45m',
            icon: ClockIcon,
            color: 'bg-yellow-500'
        },
        {
            title: 'Current Location',
            value: 'Famagusta',
            change: 'Online',
            icon: MapPinIcon,
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
                            <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
                        </div>
                        <div className="text-sm text-gray-500">
                            Welcome back, Driver
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

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                            <TruckIcon className="w-8 h-8 text-blue-500 mb-2" />
                            <h3 className="font-medium text-gray-900">My Deliveries</h3>
                            <p className="text-sm text-gray-600">View your assigned deliveries</p>
                        </button>
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                            <CurrencyDollarIcon className="w-8 h-8 text-green-500 mb-2" />
                            <h3 className="font-medium text-gray-900">My Earnings</h3>
                            <p className="text-sm text-gray-600">View your earnings and statistics</p>
                        </button>
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                            <MapPinIcon className="w-8 h-8 text-purple-500 mb-2" />
                            <h3 className="font-medium text-gray-900">Update Location</h3>
                            <p className="text-sm text-gray-600">Update your current location</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;