const express = require('express');
const router = express.Router();
const ReferralController = require('../controllers/referralController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateReferralCode } = require('../middleware/validation');

// Middleware to validate referral code format
const validateReferralCodeFormat = (req, res, next) => {
    const { referralCode } = req.body;
    if (referralCode && !/^GRP-SDS\d{3}-[A-Z]{2}$/.test(referralCode)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid referral code format. Expected format: GRP-SDS001-XX'
        });
    }
    next();
};

// Driver routes
router.post('/driver/:driverId/generate', authenticateToken, ReferralController.generateReferralCode);
router.get('/driver/:driverId/code', authenticateToken, ReferralController.getDriverReferralCode);
router.post('/driver/:driverId/use', authenticateToken, validateReferralCodeFormat, ReferralController.useReferralCode);
router.get('/driver/:driverId/stats', authenticateToken, ReferralController.getDriverReferralStats);
router.post('/driver/:driverId/progress/update', authenticateToken, ReferralController.updateReferralProgress);

// Points routes
router.get('/driver/:driverId/points', authenticateToken, ReferralController.getDriverPointsSummary);
router.get('/driver/:driverId/points/history', authenticateToken, ReferralController.getDriverPointsHistory);
router.post('/driver/:driverId/points/redeem', authenticateToken, ReferralController.redeemPoints);

// Public routes
router.get('/leaderboard', ReferralController.getReferralLeaderboard);

// Admin routes
router.get('/admin/statistics', authenticateToken, authorizeRoles(['admin']), ReferralController.getAdminStatistics);
router.get('/admin/referrals', authenticateToken, authorizeRoles(['admin']), ReferralController.getAllReferrals);
router.put('/admin/referrals/:referralId/cancel', authenticateToken, authorizeRoles(['admin']), ReferralController.cancelReferral);

module.exports = router;
