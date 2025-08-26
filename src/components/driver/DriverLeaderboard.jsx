import React, { useState, useEffect } from 'react';
import {
    TrophyIcon,
    StarIcon,
    TruckIcon,
    ArrowUpIcon
} from '@heroicons/react/24/outline';
import { capitalizeName } from '../../utils/nameUtils';
import apiService from '../../services/api';
import VerifiedBadge from '../common/VerifiedBadge';
import { isDriverVerified } from '../../utils/verificationHelpers';
import toast from 'react-hot-toast';

const DriverLeaderboard = ({ currentDriverId, dashboardPeriod = 'today' }) => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('overall');
    const [selectedPeriod, setSelectedPeriod] = useState(dashboardPeriod); // Use dashboard period as default
    const [currentDriverRank, setCurrentDriverRank] = useState(null);

    const categories = [
        { id: 'overall', name: 'Overall', icon: '🏆' },
        { id: 'delivery', name: 'Deliveries', icon: '📦' },
        { id: 'earnings', name: 'Earnings', icon: '💰' },
        { id: 'rating', name: 'Rating', icon: '⭐' }
    ];

    const periods = [
        { id: 'today', name: 'Today' },
        { id: 'thisWeek', name: 'This Week' },
        { id: 'month', name: 'This Month' },
        { id: 'allTime', name: 'All Time' }
    ];

    const loadLeaderboardData = async () => {
        try {
            setLoading(true);
            console.log('🏆 Leaderboard: Loading data for category:', selectedCategory, 'period:', selectedPeriod);

            // Use driver-specific endpoint since drivers cannot access admin endpoints
            const response = await apiService.getDriverLeaderboard(selectedCategory, selectedPeriod, 10);

            if (response.success && response.data?.leaderboard) {
                const data = response.data.leaderboard;
                console.log('✅ Leaderboard: Data loaded successfully:', data);
                setLeaderboardData(data);

                // Find current driver's rank
                const driverIndex = data.findIndex(driver => driver._id === currentDriverId);
                if (driverIndex !== -1) {
                    setCurrentDriverRank(driverIndex + 1);
                } else {
                    setCurrentDriverRank(null);
                }
            } else {
                console.warn('⚠️ Leaderboard: Invalid response structure:', response);

                // Try to extract data from different response structures
                let fallbackData = [];
                if (response.data && Array.isArray(response.data)) {
                    fallbackData = response.data;
                } else if (response.leaderboard && Array.isArray(response.leaderboard)) {
                    fallbackData = response.leaderboard;
                } else if (Array.isArray(response)) {
                    fallbackData = response;
                }

                if (fallbackData.length > 0) {
                    console.log('✅ Leaderboard: Using fallback data structure:', fallbackData);
                    setLeaderboardData(fallbackData);

                    // Find current driver's rank in fallback data
                    const driverIndex = fallbackData.findIndex(driver => driver._id === currentDriverId);
                    if (driverIndex !== -1) {
                        setCurrentDriverRank(driverIndex + 1);
                    } else {
                        setCurrentDriverRank(null);
                    }
                } else {
                    setLeaderboardData([]);
                    setCurrentDriverRank(null);
                    toast.error('No leaderboard data available');
                }
            }
        } catch (error) {
            console.error('❌ Error loading leaderboard:', error);

            // Provide specific error messages based on error type
            if (error.response?.status === 403) {
                toast.error('Access denied. Please contact support if this persists.');
            } else if (error.response?.status === 401) {
                toast.error('Please log in again to view leaderboard data.');
            } else if (error.response?.status >= 500) {
                toast.error('Server error. Please try again later.');
            } else if (error.message?.includes('Network Error')) {
                toast.error('Network error. Please check your connection.');
            } else {
                toast.error('Failed to load leaderboard data. Please try again.');
            }

            // Set fallback data to prevent UI from breaking
            setLeaderboardData([]);
            setCurrentDriverRank(null);
        } finally {
            setLoading(false);
        }
    };

    // Update leaderboard period when dashboard period changes
    useEffect(() => {
        console.log('🏆 Leaderboard: Dashboard period changed to:', dashboardPeriod);

        // Map dashboard period to leaderboard period for consistency
        let mappedPeriod = dashboardPeriod;
        if (dashboardPeriod === 'currentPeriod') {
            mappedPeriod = 'month'; // Map currentPeriod to month for consistency
        }

        setSelectedPeriod(mappedPeriod);
    }, [dashboardPeriod]);

    useEffect(() => {
        loadLeaderboardData();
    }, [selectedCategory, selectedPeriod, currentDriverId]);

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    };

    const getRankColor = (rank) => {
        switch (rank) {
            case 1: return 'from-yellow-400 to-orange-500';
            case 2: return 'from-gray-300 to-gray-400';
            case 3: return 'from-orange-400 to-amber-600';
            default: return 'from-blue-500 to-indigo-600';
        }
    };

    const getMetricValue = (driver) => {
        switch (selectedCategory) {
            case 'delivery':
                return `${driver.totalDeliveries || 0} deliveries`;
            case 'earnings':
                return `₺${(driver.totalEarnings || 0).toLocaleString()}`;
            case 'rating':
                return `${(driver.rating || 0).toFixed(1)} rating`;
            default:
                return `${Math.round(driver.points || driver.overallScore || 0)} points`;
        }
    };

    const getMotivationalMessage = () => {
        if (!currentDriverRank) return "Keep delivering to join the leaderboard!";

        if (currentDriverRank === 1) return "🏆 You're the champion! Keep up the amazing work!";
        if (currentDriverRank <= 3) return "🔥 You're in the top 3! Amazing performance!";
        if (currentDriverRank <= 5) return "⭐ You're in the top 5! Keep pushing!";
        if (currentDriverRank <= 10) return "💪 You're in the top 10! Great job!";

        return `🎯 You're ranked #${currentDriverRank}. Keep going to climb higher!`;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/3 mt-1"></div>
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                            <TrophyIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Leaderboard</h2>
                            <p className="text-xs sm:text-sm text-gray-600">Stay motivated, stay on top!</p>
                        </div>
                    </div>
                </div>

                {/* Motivational Message */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                    <p className="text-xs sm:text-sm font-medium text-blue-900 text-center">
                        {getMotivationalMessage()}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 overflow-x-auto scrollbar-hide w-full sm:w-auto">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-all flex-shrink-0 min-w-[60px] ${selectedCategory === category.id
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <span className="mr-1">{category.icon}</span>
                                <span className="hidden md:inline">{category.name}</span>
                                <span className="hidden sm:inline md:hidden">{category.name === 'Overall' ? 'Overall' : category.name === 'Delivery' ? 'Deliveries' : category.name}</span>
                                <span className="sm:hidden">{category.name === 'Overall' ? 'Overall' : category.name === 'Delivery' ? 'Del' : category.name === 'Earnings' ? 'Earn' : category.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 overflow-x-auto scrollbar-hide w-full sm:w-auto">
                        {periods.map(period => (
                            <button
                                key={period.id}
                                onClick={() => setSelectedPeriod(period.id)}
                                className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-all flex-shrink-0 min-w-[60px] ${selectedPeriod === period.id
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <span className="hidden md:inline">{period.name}</span>
                                <span className="hidden sm:inline md:hidden">{period.name === 'This Week' ? 'This Week' : period.name === 'This Month' ? 'This Month' : period.name}</span>
                                <span className="sm:hidden">{period.name === 'This Week' ? 'Week' : period.name === 'This Month' ? 'Month' : period.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Leaderboard List */}
            <div className="p-4 sm:p-6">
                {leaderboardData.length > 0 ? (
                    <div className="space-y-3">
                        {leaderboardData.slice(0, 8).map((driver, index) => {
                            const rank = index + 1;
                            const isCurrentDriver = driver._id === currentDriverId;

                            return (
                                <div
                                    key={driver._id}
                                    className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl transition-all ${isCurrentDriver
                                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                >
                                    {/* Rank Badge */}
                                    <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white bg-gradient-to-r ${getRankColor(rank)}`}>
                                        {getRankIcon(rank)}
                                    </div>

                                    {/* Driver Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-1 sm:space-x-2">
                                            <p className={`font-semibold truncate text-sm sm:text-base ${isCurrentDriver ? 'text-blue-900' : 'text-gray-900'
                                                }`}>
                                                {capitalizeName(driver.name || driver.fullNameComputed || 'Unknown Driver')}
                                            </p>
                                            <VerifiedBadge
                                                isVerified={isDriverVerified(driver)}
                                                size="xs"
                                                className="flex-shrink-0"
                                            />
                                            {isCurrentDriver && (
                                                <span className="inline-flex items-center px-1 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                                            {driver.email}
                                        </p>
                                    </div>

                                    {/* Metric Value */}
                                    <div className="flex-shrink-0 text-right">
                                        <p className={`font-bold text-sm sm:text-lg ${isCurrentDriver ? 'text-blue-900' : 'text-gray-900'
                                            }`}>
                                            {getMetricValue(driver)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {selectedCategory === 'delivery' ? 'deliveries' :
                                                selectedCategory === 'earnings' ? 'earnings' :
                                                    selectedCategory === 'rating' ? 'rating' : 'points'}
                                        </p>
                                    </div>

                                    {/* Achievement Icons */}
                                    <div className="flex-shrink-0 flex items-center space-x-1">
                                        {rank === 1 && <TrophyIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />}
                                        {driver.rating >= 4.8 && <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />}
                                        {driver.totalDeliveries >= 50 && <TruckIcon className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <TrophyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No leaderboard data available</p>
                    </div>
                )}

                {/* Current Driver Status */}
                {currentDriverRank && currentDriverRank > 8 && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-900">
                                        Your current rank: #{currentDriverRank}
                                    </p>
                                    <p className="text-xs text-purple-700 mt-1">
                                        Keep delivering to climb the leaderboard!
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <ArrowUpIcon className="h-4 w-4 text-purple-500" />
                                    <span className="text-sm font-medium text-purple-900">
                                        {currentDriverRank - 8} spots to top 8
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverLeaderboard;
