// Backend Endpoint: Driver Earnings Calculation
// This endpoint should be called after a delivery is marked as "delivered"

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Driver = require('../models/Driver');
const Delivery = require('../models/Delivery');

// POST /api/driver/earnings/calculate
// Calculate and update driver earnings for all completed deliveries
router.post('/earnings/calculate', auth, async (req, res) => {
    try {
        const driverId = req.user.id;

        console.log('💰 Backend: Calculating earnings for driver:', driverId);

        // Get all completed deliveries for this driver that haven't been calculated yet
        const completedDeliveries = await Delivery.find({
            assignedTo: driverId,
            status: 'delivered',
            earningsCalculated: { $ne: true } // Only calculate for deliveries not yet processed
        });

        console.log('💰 Backend: Found', completedDeliveries.length, 'deliveries to process');

        let totalEarnings = 0;
        let processedDeliveries = 0;

        // Calculate earnings for each completed delivery
        for (const delivery of completedDeliveries) {
            let deliveryEarnings = 0;
            let bonuses = 0;

            // Calculate base earnings using business rules
            if (delivery.fee) {
                const fee = delivery.fee;
                let baseEarnings = 0;

                // Apply business rules
                if (fee <= 100) {
                    // ₺0-₺100: 60% to driver
                    baseEarnings = fee * 0.6;
                } else if (fee <= 150) {
                    // ₺101-₺150: ₺100 fixed to driver
                    baseEarnings = 100;
                } else {
                    // ₺151+: 60% to driver
                    baseEarnings = fee * 0.6;
                }

                deliveryEarnings = baseEarnings;

                // Calculate bonuses
                if (delivery.priority === 'high') {
                    bonuses += 10; // Priority bonus
                }

                // Speed bonus (completion < 2 hours)
                if (delivery.completedAt && delivery.createdAt) {
                    const completionTime = new Date(delivery.completedAt) - new Date(delivery.createdAt);
                    const hoursToComplete = completionTime / (1000 * 60 * 60);

                    if (hoursToComplete < 2) {
                        bonuses += 5; // Speed bonus
                    }
                }

                // Rating bonus (if driver has high rating)
                if (delivery.driverRating && delivery.driverRating >= 4.5) {
                    bonuses += 2; // Rating bonus
                }

                deliveryEarnings += bonuses;

                console.log('💰 Backend: Delivery', delivery._id, 'calculation:', {
                    fee: fee,
                    baseEarnings: baseEarnings,
                    bonuses: bonuses,
                    totalEarnings: deliveryEarnings
                });

                // Update delivery with calculated earnings
                await Delivery.findByIdAndUpdate(delivery._id, {
                    driverEarnings: deliveryEarnings,
                    driverBaseEarnings: baseEarnings,
                    driverBonuses: bonuses,
                    earningsCalculated: true,
                    earningsCalculatedAt: new Date()
                }, { validateBeforeSave: false }); // Skip validation for existing records

                totalEarnings += deliveryEarnings;
                processedDeliveries++;
            }
        }

        // Update driver's total earnings
        if (processedDeliveries > 0) {
            await Driver.findByIdAndUpdate(driverId, {
                $inc: {
                    totalEarnings: totalEarnings,
                    totalDeliveries: processedDeliveries
                },
                lastEarningsUpdate: new Date()
            }, { validateBeforeSave: false });

            console.log('💰 Backend: Updated driver earnings - Total:', totalEarnings, 'Processed:', processedDeliveries);
        }

        res.json({
            success: true,
            message: 'Earnings calculated successfully',
            data: {
                totalEarningsCalculated: totalEarnings,
                deliveriesProcessed: processedDeliveries,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('❌ Backend: Earnings calculation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate earnings',
            error: error.message
        });
    }
});

// GET /api/driver/earnings/summary
// Get driver earnings summary
router.get('/earnings/summary', auth, async (req, res) => {
    try {
        const driverId = req.user.id;
        const period = req.query.period || 'today';

        // Calculate date range based on period
        const now = new Date();
        let startDate;

        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                startDate = new Date(0); // All time
        }

        // Get completed deliveries in the period
        const deliveries = await Delivery.find({
            assignedTo: driverId,
            status: 'delivered',
            completedAt: { $gte: startDate }
        });

        const totalEarnings = deliveries.reduce((sum, delivery) => sum + (delivery.driverEarnings || 0), 0);
        const totalDeliveries = deliveries.length;
        const averagePerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

        res.json({
            success: true,
            data: {
                period,
                totalEarnings,
                totalDeliveries,
                averagePerDelivery,
                deliveries: deliveries.map(d => ({
                    id: d._id,
                    fee: d.fee,
                    driverEarnings: d.driverEarnings,
                    driverBaseEarnings: d.driverBaseEarnings,
                    driverBonuses: d.driverBonuses,
                    completedAt: d.completedAt,
                    priority: d.priority
                }))
            }
        });

    } catch (error) {
        console.error('❌ Backend: Earnings summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get earnings summary',
            error: error.message
        });
    }
});

module.exports = router;
