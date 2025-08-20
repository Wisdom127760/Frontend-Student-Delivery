// ========================================
// BACKEND REFERRAL ENDPOINTS (CURRENCY-BASED)
// ========================================
// Add these to your backend server

// 1. MODELS
// ========================================

// File: src/models/Referral.js
const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    referred: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    referralCode: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'expired', 'cancelled'],
        default: 'pending'
    },
    progress: {
        deliveriesCompleted: { type: Number, default: 0 },
        totalEarnings: { type: Number, default: 0 },
        daysActive: { type: Number, default: 0 }
    },
    completionCriteria: {
        requiredDeliveries: { type: Number, default: 5 },
        requiredEarnings: { type: Number, default: 500 },
        requiredDays: { type: Number, default: 30 }
    },
    rewards: {
        referrerAmount: { type: Number, default: 1000 },
        referredAmount: { type: Number, default: 500 },
        referrerClaimed: { type: Boolean, default: false },
        referredClaimed: { type: Boolean, default: false }
    },
    startDate: { type: Date, default: Date.now },
    completionDate: { type: Date },
    expiryDate: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);

// File: src/models/DriverReferralEarnings.js
const mongoose = require('mongoose');

const driverReferralEarningsSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true,
        unique: true
    },
    totalEarnings: { type: Number, default: 0 },
    availableEarnings: { type: Number, default: 0 },
    redeemedEarnings: { type: Number, default: 0 },
    earningsHistory: [{
        type: { type: String, enum: ['referral_reward', 'referral_completion', 'bonus', 'redemption', 'expired'] },
        amount: { type: Number, required: true },
        description: { type: String, required: true },
        referralId: { type: mongoose.Schema.Types.ObjectId, ref: 'Referral' },
        timestamp: { type: Date, default: Date.now }
    }],
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DriverReferralEarnings', driverReferralEarningsSchema);

// 2. ROUTES
// ========================================

// File: src/routes/referralRoutes.js
const express = require('express');
const router = express.Router();

// GET /api/referral/driver/:driverId/points (for earnings summary)
router.get('/driver/:driverId/points', async (req, res) => {
    try {
        const { driverId } = req.params;

        // For now, return default earnings data
        // In production, fetch from DriverReferralEarnings model
        res.json({
            success: true,
            message: 'Driver earnings summary retrieved successfully',
            data: {
                totalEarnings: 0,
                availableEarnings: 0,
                redeemedEarnings: 0,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/referral/driver/:driverId/points/history
router.get('/driver/:driverId/points/history', async (req, res) => {
    try {
        const { driverId } = req.params;
        const { limit = 20 } = req.query;

        res.json({
            success: true,
            message: 'Driver earnings history retrieved successfully',
            data: {
                totalEarnings: 0,
                availableEarnings: 0,
                redeemedEarnings: 0,
                earningsHistory: []
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/referral/driver/:driverId/points/redeem
router.post('/driver/:driverId/points/redeem', async (req, res) => {
    try {
        const { driverId } = req.params;
        const { amount, description } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid amount is required'
            });
        }

        if (!description) {
            return res.status(400).json({
                success: false,
                error: 'Description is required'
            });
        }

        // For now, return success response
        // In production, update DriverReferralEarnings model
        res.json({
            success: true,
            message: 'Earnings redeemed successfully',
            data: {
                availableEarnings: 0,
                redeemedEarnings: amount,
                totalEarnings: 0
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/referral/driver/:driverId/stats
router.get('/driver/:driverId/stats', async (req, res) => {
    try {
        const { driverId } = req.params;

        res.json({
            success: true,
            message: 'Driver referral statistics retrieved successfully',
            data: {
                totalReferrals: 0,
                completedReferrals: 0,
                pendingReferrals: 0,
                totalPointsEarned: 0,
                availablePoints: 0,
                referralsAsReferrer: [],
                referralsAsReferred: []
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/referral/driver/:driverId/code
router.get('/driver/:driverId/code', async (req, res) => {
    try {
        const { driverId } = req.params;

        // Generate a simple referral code for now
        const referralCode = `GRP-SDS001-DR`;

        res.json({
            success: true,
            message: 'Referral code retrieved successfully',
            data: {
                referralCode,
                status: 'pending',
                startDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/referral/leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        res.json({
            success: true,
            message: 'Referral leaderboard retrieved successfully',
            data: {
                leaderboard: []
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

// 3. MAIN APP INTEGRATION
// ========================================

// In your main app.js or server.js file, add:
/*
const referralRoutes = require('./routes/referralRoutes');
app.use('/api/referral', referralRoutes);
*/
