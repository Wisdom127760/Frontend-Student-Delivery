// Backend Leaderboard API Endpoint
// Add this to your backend routes

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Driver = require('../models/Driver');
const Delivery = require('../models/Delivery');

// GET /api/admin/leaderboard
// Get leaderboard data for different categories
router.get('/admin/leaderboard', auth, async (req, res) => {
    try {
        const { category = 'overall', period = 'month', limit = 20 } = req.query;

        console.log('🏆 Leaderboard request:', { category, period, limit });

        // Validate period parameter
        const allowedPeriods = ['today', 'week', 'thisWeek', 'month', 'monthly', 'currentPeriod', 'year', 'all-time', 'allTime', 'custom'];
        if (!allowedPeriods.includes(period)) {
            return res.status(400).json({
                success: false,
                error: 'Query validation failed',
                details: [
                    {
                        field: 'period',
                        message: `"period" must be one of [${allowedPeriods.join(', ')}]`
                    }
                ]
            });
        }

        // Get all active drivers with their stored statistics (consistent with driver leaderboard)
        const drivers = await Driver.find({
            isActive: true,
            isSuspended: false
        }).lean();

        if (!drivers || drivers.length === 0) {
            console.log('⚠️ No drivers found for leaderboard');
            return res.json({
                success: true,
                message: 'No drivers found',
                data: [],
                category,
                period,
                total: 0
            });
        }

        console.log(`✅ Found ${drivers.length} drivers for leaderboard`);

        // Calculate stats for each driver based on the selected period
        const leaderboardData = await Promise.all(drivers.map(async (driver) => {
            let totalDeliveries, totalEarnings, completedDeliveries, completionRate, avgDeliveryTime;
            const rating = driver.rating || 4.5;
            const totalReferrals = driver.referralPoints || 0;

            if (period === 'allTime' || period === 'all-time') {
                // Use stored statistics for all-time data
                totalDeliveries = driver.totalDeliveries || 0;
                totalEarnings = driver.totalEarnings || 0;
                completedDeliveries = driver.completedDeliveries || 0;
                completionRate = driver.completionRate || 0;
                avgDeliveryTime = 25; // Placeholder
            } else {
                // Calculate period-specific data from delivery records
                const deliveryQuery = { driverId: driver._id };
                const now = new Date();
                let startDate;

                switch (period) {
                    case 'today':
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        break;
                    case 'week':
                    case 'thisWeek':
                        const dayOfWeek = now.getDay();
                        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract);
                        break;
                    case 'month':
                    case 'monthly':
                    case 'currentPeriod':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    case 'year':
                        startDate = new Date(now.getFullYear(), 0, 1);
                        break;
                    default:
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                }

                deliveryQuery.createdAt = { $gte: startDate };
                const deliveries = await Delivery.find(deliveryQuery);

                // Calculate period-specific stats
                totalDeliveries = deliveries.length;
                totalEarnings = deliveries.reduce((sum, delivery) => sum + (delivery.fee || 0), 0);
                completedDeliveries = deliveries.filter(d => d.status === 'delivered').length;
                completionRate = totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0;
                avgDeliveryTime = totalDeliveries > 0 ? 25 : 0; // Placeholder calculation
            }

            // Calculate points based on category using the same formula
            const points = calculatePoints({
                totalDeliveries,
                totalEarnings,
                rating,
                totalReferrals,
                avgDeliveryTime,
                completionRate
            }, category);

            return {
                _id: driver._id,
                name: driver.name || driver.fullName || 'Unknown Driver',
                email: driver.email,
                phone: driver.phone,
                totalDeliveries,
                totalEarnings,
                rating: parseFloat(rating.toFixed(1)),
                completionRate: parseFloat(completionRate.toFixed(1)),
                avgDeliveryTime,
                totalReferrals,
                isOnline: driver.isOnline || driver.isActive || false,
                lastActive: driver.lastActive || driver.updatedAt,
                points: Math.round(points),
                profilePicture: driver.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name || 'Driver')}&background=random`
            };
        }));

        // Sort by points for the selected category
        leaderboardData.sort((a, b) => b.points - a.points);

        // Apply limit
        const limitedData = leaderboardData.slice(0, parseInt(limit));

        console.log(`✅ Leaderboard data processed: ${limitedData.length} drivers`);

        res.json({
            success: true,
            message: 'Leaderboard data retrieved successfully',
            data: limitedData,
            category,
            period: period, // Return the actual period parameter
            total: leaderboardData.length,
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('❌ Leaderboard API error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving leaderboard data',
            error: error.message
        });
    }
});

// GET /api/admin/leaderboard/categories
// Get available leaderboard categories
router.get('/admin/leaderboard/categories', auth, async (req, res) => {
    try {
        const categories = [
            { id: 'overall', name: 'Overall Champions', icon: '🏆', description: 'Best overall performance' },
            { id: 'delivery', name: 'Delivery Masters', icon: '📦', description: 'Most deliveries completed' },
            { id: 'earnings', name: 'Top Earners', icon: '💰', description: 'Highest earnings' },
            { id: 'referrals', name: 'Referral Kings', icon: '👥', description: 'Most successful referrals' },
            { id: 'rating', name: 'Rating Stars', icon: '⭐', description: 'Highest customer ratings' },
            { id: 'speed', name: 'Speed Demons', icon: '⚡', description: 'Fastest delivery times' }
        ];

        res.json({
            success: true,
            message: 'Leaderboard categories retrieved successfully',
            data: categories
        });

    } catch (error) {
        console.error('❌ Leaderboard categories API error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving leaderboard categories',
            error: error.message
        });
    }
});

// Helper function to calculate points based on category
function calculatePoints(driver, category) {
    switch (category) {
        case 'overall':
            return (driver.totalDeliveries * 10) +
                (driver.totalEarnings * 0.1) +
                (driver.rating * 10) +
                (driver.totalReferrals * 20) +
                (driver.completionRate * 0.5);
        case 'delivery':
            return driver.totalDeliveries * 10;
        case 'earnings':
            return driver.totalEarnings * 0.1;
        case 'referrals':
            return driver.totalReferrals * 20;
        case 'rating':
            return driver.rating * 10;
        case 'speed':
            return driver.avgDeliveryTime ? (100 - driver.avgDeliveryTime) : 50;
        default:
            return (driver.totalDeliveries * 10) + (driver.totalEarnings * 0.1);
    }
}

module.exports = router;
