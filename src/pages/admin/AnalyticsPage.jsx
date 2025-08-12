import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, PieChart } from '../../components/charts';
import { formatCurrency } from '../../services/systemSettings';
import toast from 'react-hot-toast';

const AnalyticsPage = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

    const loadAnalyticsData = useCallback(async () => {
        try {
            setIsLoading(true);

            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/admin/analytics?period=${selectedPeriod}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Analytics API error: ${response.status}`);
            }

            const data = await response.json();
            setAnalyticsData(data);
        } catch (error) {
            console.error('Error loading analytics data:', error);
            toast.error('Failed to load analytics data');
            // Set null data instead of mock data
            setAnalyticsData(null);
        } finally {
            setIsLoading(false);
        }
    }, [selectedPeriod]);

    useEffect(() => {
        loadAnalyticsData();
    }, [loadAnalyticsData]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
                            <p className="mt-2 text-gray-600">Detailed performance metrics and trends</p>
                        </div>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="today">Today</option>
                            <option value="thisWeek">This Week</option>
                            <option value="thisMonth">This Month</option>
                            <option value="thisYear">This Year</option>
                        </select>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Delivery Trends */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Trends</h2>
                        {analyticsData?.deliveryTrends ? (
                            <LineChart
                                data={analyticsData.deliveryTrends}
                                xKey="date"
                                yKey="deliveries"
                                color="blue"
                            />
                        ) : (
                            <div className="text-center py-8 text-gray-500">No data available</div>
                        )}
                    </div>

                    {/* Revenue Trends */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h2>
                        {analyticsData?.deliveryTrends ? (
                            <LineChart
                                data={analyticsData.deliveryTrends}
                                xKey="date"
                                yKey="revenue"
                                color="green"
                            />
                        ) : (
                            <div className="text-center py-8 text-gray-500">No data available</div>
                        )}
                    </div>
                </div>

                {/* Additional Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Driver Performance */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Driver Performance</h2>
                        {analyticsData?.driverPerformance ? (
                            <div className="space-y-4">
                                {analyticsData.driverPerformance.map((driver, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{driver.name}</p>
                                            <p className="text-sm text-gray-600">{driver.deliveries} deliveries</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-green-600">{formatCurrency(driver.earnings)}</p>
                                            <p className="text-sm text-gray-600">Rating: {driver.rating}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">No data available</div>
                        )}
                    </div>

                    {/* Delivery Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Status</h2>
                        {analyticsData?.deliveryStatus ? (
                            <PieChart
                                data={analyticsData.deliveryStatus}
                                dataKey="count"
                                nameKey="status"
                            />
                        ) : (
                            <div className="text-center py-8 text-gray-500">No data available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;

