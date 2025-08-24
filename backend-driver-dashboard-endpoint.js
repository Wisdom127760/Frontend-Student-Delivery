// Backend Driver Dashboard Endpoint
// Add this to your backend routes/driver.js file

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');

// GET /api/driver/dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const driverId = req.user.id;
        const { period = 'today' } = req.query;

        console.log('📊 Driver dashboard requested:', { driverId, period });

        // Calculate date range based on period
        const now = new Date();
        let startDate, endDate;

        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                break;
            case 'thisWeek':
                const dayOfWeek = now.getDay();
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
                endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
                break;
            case 'thisMonth':
            case 'month':
            case 'currentPeriod':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                break;
            case 'allTime':
                startDate = new Date(0);
                endDate = new Date();
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        }

        console.log('📅 Date range:', { startDate, endDate });

        // Get driver's deliveries for the period
        const deliveries = await Delivery.find({
            driver: driverId,
            createdAt: { $gte: startDate, $lt: endDate }
        }).populate('driver', 'name email');

        console.log('📦 Found deliveries:', deliveries.length);

        // Calculate quickStats
        const quickStats = {
            today: calculatePeriodStats(deliveries.filter(d => {
                const deliveryDate = new Date(d.createdAt);
                const today = new Date();
                return deliveryDate.getDate() === today.getDate() &&
                    deliveryDate.getMonth() === today.getMonth() &&
                    deliveryDate.getFullYear() === today.getFullYear();
            })),
            thisWeek: calculatePeriodStats(deliveries.filter(d => {
                const deliveryDate = new Date(d.createdAt);
                const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                return deliveryDate >= weekStart;
            })),
            currentPeriod: calculatePeriodStats(deliveries.filter(d => {
                const deliveryDate = new Date(d.createdAt);
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                return deliveryDate >= monthStart;
            })),
            allTime: calculatePeriodStats(deliveries)
        };

        // Get driver profile
        const driver = await Driver.findById(driverId).select('name email totalEarnings totalDeliveries rating');

        // Calculate analytics
        const analytics = {
            period: period,
            current: {
                stats: {
                    totalDeliveries: quickStats[period]?.deliveries || 0,
                    totalEarnings: quickStats[period]?.earnings || 0,
                    completionRate: quickStats[period]?.completionRate || 0,
                    avgDeliveryTime: 0 // Calculate if needed
                }
            }
        };

        const response = {
            success: true,
            data: {
                quickStats,
                analytics,
                driver: {
                    name: driver?.name || 'Driver',
                    email: driver?.email || '',
                    totalEarnings: driver?.totalEarnings || 0,
                    totalDeliveries: driver?.totalDeliveries || 0,
                    rating: driver?.rating || 0
                },
                recentDeliveries: deliveries.slice(0, 5).map(d => ({
                    id: d._id,
                    pickup: d.pickup,
                    delivery: d.delivery,
                    status: d.status,
                    fee: d.fee,
                    earnings: d.earnings,
                    createdAt: d.createdAt
                }))
            }
        };

        console.log('📊 Dashboard response:', {
            quickStats: response.data.quickStats,
            driverEarnings: response.data.driver.totalEarnings,
            period: period
        });

        res.json(response);

    } catch (error) {
        console.error('❌ Driver dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load dashboard data'
        });
    }
});

// Helper function to calculate period statistics
function calculatePeriodStats(deliveries) {
    const totalDeliveries = deliveries.length;
    const completedDeliveries = deliveries.filter(d => d.status === 'delivered').length;
    const pendingDeliveries = deliveries.filter(d => d.status === 'pending').length;
    const inProgressDeliveries = deliveries.filter(d => d.status === 'in_transit' || d.status === 'picked_up').length;

    // Calculate total earnings from completed deliveries
    const totalEarnings = deliveries
        .filter(d => d.status === 'delivered')
        .reduce((sum, d) => sum + (d.earnings || 0), 0);

    const completionRate = totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0;

    return {
        deliveries: totalDeliveries,
        completed: completedDeliveries,
        pending: pendingDeliveries,
        inProgress: inProgressDeliveries,
        earnings: totalEarnings,
        completionRate: Math.round(completionRate * 100) / 100
    };
}

module.exports = router;
