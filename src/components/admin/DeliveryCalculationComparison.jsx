import React, { useState, useEffect } from 'react';
import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    CalendarIcon,
    CalculatorIcon
} from '@heroicons/react/24/outline';
import {
    calculateCompletedDeliveries,
    calculateEarnings,
    compareCalculations,
    getDateRange,
    PERIODS,
    CALCULATION_METHODS
} from '../../utils/deliveryCalculations';
import driverService from '../../services/driverService';
import toast from 'react-hot-toast';

const DeliveryCalculationComparison = ({ driverId, driverName }) => {
    const [loading, setLoading] = useState(false);
    const [comparisonData, setComparisonData] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState(PERIODS.ALL_TIME);
    const [customDateRange, setCustomDateRange] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const loadComparisonData = async () => {
        if (!driverId) return;

        setLoading(true);
        try {
            // Get driver statistics with both methods
            const [storedData, calculatedData] = await Promise.all([
                // Get stored field data (from driver profile)
                driverService.getDriver(driverId),
                // Get real-time calculated data
                driverService.getDriverStatistics(driverId, selectedPeriod, customDateRange)
            ]);

            // Get driver's deliveries for detailed calculation
            const deliveriesResponse = await driverService.getDriverDeliveries(driverId, {
                limit: 1000, // Get all deliveries for accurate calculation
                status: 'all'
            });

            const deliveries = deliveriesResponse.deliveries || [];
            const dateRange = customDateRange || getDateRange(selectedPeriod);

            // Calculate using our utility functions
            const calculatedStats = calculateCompletedDeliveries(deliveries, dateRange, CALCULATION_METHODS.REAL_TIME_AGGREGATION);
            const calculatedEarnings = calculateEarnings(deliveries, dateRange);

            // Compare stored vs calculated
            const comparison = compareCalculations(
                {
                    totalDeliveries: storedData.totalDeliveries || 0,
                    completedDeliveries: storedData.completedDeliveries || 0,
                    totalEarnings: storedData.totalEarnings || 0
                },
                {
                    total: calculatedStats.total,
                    completed: calculatedStats.completed,
                    totalEarnings: calculatedEarnings.total
                }
            );

            setComparisonData({
                stored: storedData,
                calculated: {
                    ...calculatedStats,
                    earnings: calculatedEarnings
                },
                comparison,
                dateRange,
                period: selectedPeriod,
                deliveryCount: deliveries.length
            });

        } catch (error) {
            console.error('Error loading comparison data:', error);
            toast.error('Failed to load comparison data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (driverId) {
            loadComparisonData();
        }
    }, [driverId, selectedPeriod, customDateRange]);

    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
        if (period !== PERIODS.CUSTOM) {
            setCustomDateRange(null);
        }
    };

    const handleCustomDateChange = (type, value) => {
        setCustomDateRange(prev => ({
            ...prev,
            [type]: value
        }));
    };

    if (!driverId) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                    <InformationCircleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-yellow-800">Select a driver to view calculation comparison</span>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!comparisonData) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800">Failed to load comparison data</span>
                </div>
            </div>
        );
    }

    const { stored, calculated, comparison, dateRange, period, deliveryCount } = comparisonData;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Delivery Calculation Comparison
                    </h3>
                    <p className="text-sm text-gray-600">
                        Driver: {driverName || 'Unknown'} | {deliveryCount} total deliveries
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <CalculatorIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500">Real-time vs Stored</span>
                </div>
            </div>

            {/* Period Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="w-4 h-4 inline mr-1" />
                    Filter Period
                </label>
                <div className="flex items-center space-x-4">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => handlePeriodChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value={PERIODS.ALL_TIME}>All Time</option>
                        <option value={PERIODS.TODAY}>Today</option>
                        <option value={PERIODS.THIS_WEEK}>This Week</option>
                        <option value={PERIODS.THIS_MONTH}>This Month</option>
                        <option value={PERIODS.CUSTOM}>Custom Range</option>
                    </select>

                    {selectedPeriod === PERIODS.CUSTOM && (
                        <div className="flex items-center space-x-2">
                            <input
                                type="date"
                                value={customDateRange?.startDate || ''}
                                onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                                type="date"
                                value={customDateRange?.endDate || ''}
                                onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Discrepancy Alert */}
            {comparison.hasDiscrepancy && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-red-800">Calculation Discrepancy Detected</h4>
                            <p className="text-sm text-red-700 mt-1">
                                The stored values differ from real-time calculations. This may indicate data inconsistency.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Comparison Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Metric
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stored Value
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Calculated Value
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Difference
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Total Deliveries
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {stored.totalDeliveries || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {calculated.total}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {Math.abs((stored.totalDeliveries || 0) - calculated.total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {(stored.totalDeliveries || 0) === calculated.total ? (
                                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                ) : (
                                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Completed Deliveries
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {stored.completedDeliveries || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {calculated.completed}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {Math.abs((stored.completedDeliveries || 0) - calculated.completed)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {(stored.completedDeliveries || 0) === calculated.completed ? (
                                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                ) : (
                                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Total Earnings
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₺{(stored.totalEarnings || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₺{(calculated.earnings?.total || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₺{Math.abs((stored.totalEarnings || 0) - (calculated.earnings?.total || 0)).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {(stored.totalEarnings || 0) === (calculated.earnings?.total || 0) ? (
                                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                ) : (
                                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Additional Details */}
            {showDetails && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Calculation Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p><strong>Calculation Method:</strong> {calculated.calculationMethod}</p>
                            <p><strong>Period:</strong> {period}</p>
                            <p><strong>Date Range:</strong> {dateRange?.startDate ? `${new Date(dateRange.startDate).toLocaleDateString()} - ${new Date(dateRange.endDate).toLocaleDateString()}` : 'All Time'}</p>
                        </div>
                        <div>
                            <p><strong>Pending Deliveries:</strong> {calculated.pending}</p>
                            <p><strong>In Progress:</strong> {calculated.inProgress}</p>
                            <p><strong>Cancelled:</strong> {calculated.cancelled}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {comparison.recommendations.length > 0 && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Recommendations</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        {comparison.recommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                {recommendation}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Toggle Details Button */}
            <div className="mt-4 flex justify-center">
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
            </div>
        </div>
    );
};

export default DeliveryCalculationComparison;
