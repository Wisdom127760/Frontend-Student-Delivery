const ReferralService = require('../services/referralService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class ReferralController {
    // Generate referral code for a driver
    static async generateReferralCode(req, res) {
        try {
            const { driverId } = req.params;

            const referralCode = await ReferralService.generateReferralCode(driverId);

            return successResponse(res, {
                message: 'Referral code generated successfully',
                data: { referralCode }
            });
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }

    // Get driver's referral code
    static async getDriverReferralCode(req, res) {
        try {
            const { driverId } = req.params;

            // First try to find existing referral code
            const Referral = require('../models/Referral');
            let referral = await Referral.findOne({ referrer: driverId });

            if (!referral) {
                // Generate new referral code if none exists
                const referralCode = await ReferralService.generateReferralCode(driverId);
                referral = await ReferralService.createReferral(driverId, null, referralCode);
            }

            return successResponse(res, {
                message: 'Referral code retrieved successfully',
                data: {
                    referralCode: referral.referralCode,
                    status: referral.status,
                    startDate: referral.startDate,
                    expiryDate: referral.expiryDate
                }
            });
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }

    // Use a referral code
    static async useReferralCode(req, res) {
        try {
            const { referralCode } = req.body;
            const { driverId } = req.params;

            if (!referralCode) {
                return errorResponse(res, 'Referral code is required', 400);
            }

            const referral = await ReferralService.useReferralCode(referralCode, driverId);

            return successResponse(res, {
                message: 'Referral code used successfully',
                data: {
                    referralId: referral._id,
                    referrerId: referral.referrer,
                    status: referral.status
                }
            });
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }

    // Get driver's referral statistics
    static async getDriverReferralStats(req, res) {
        try {
            const { driverId } = req.params;

            const stats = await ReferralService.getDriverReferralStats(driverId);

            return successResponse(res, {
                message: 'Driver referral statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }

    // Get referral leaderboard
    static async getReferralLeaderboard(req, res) {
        try {
            const { limit = 10 } = req.query;

            const leaderboard = await ReferralService.getReferralLeaderboard(parseInt(limit));

            return successResponse(res, {
                message: 'Referral leaderboard retrieved successfully',
                data: { leaderboard }
            });
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }

    // Get admin statistics
    static async getAdminStatistics(req, res) {
        try {
            const stats = await ReferralService.getAdminStatistics();

            return successResponse(res, {
                message: 'Admin referral statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }

    // Redeem points
    static async redeemPoints(req, res) {
        try {
            const { driverId } = req.params;
            const { amount, description } = req.body;

            if (!amount || amount <= 0) {
                return errorResponse(res, 'Valid amount is required', 400);
            }

            if (!description) {
                return errorResponse(res, 'Description is required', 400);
            }

            const driverPoints = await ReferralService.redeemPoints(driverId, amount, description);

            return successResponse(res, {
                message: 'Points redeemed successfully',
                data: {
                    availablePoints: driverPoints.availablePoints,
                    redeemedPoints: driverPoints.redeemedPoints,
                    totalPoints: driverPoints.totalPoints
                }
            });
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }

    // Get driver's points history
    static async getDriverPointsHistory(req, res) {
        try {
            const { driverId } = req.params;
            const { limit = 20 } = req.query;

            const history = await ReferralService.getDriverPointsHistory(driverId, parseInt(limit));

            return successResponse(res, {
                message: 'Driver points history retrieved successfully',
                data: history
            });
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }

    // Get driver's points summary
    static async getDriverPointsSummary(req, res) {
        try {
            const { driverId } = req.params;

            const DriverPoints = require('../models/DriverPoints');
            const driverPoints = await DriverPoints.getOrCreate(driverId);

            return successResponse(res, {
                message: 'Driver points summary retrieved successfully',
                data: {
                    totalPoints: driverPoints.totalPoints,
                    availablePoints: driverPoints.availablePoints,
                    redeemedPoints: driverPoints.redeemedPoints,
                    lastUpdated: driverPoints.lastUpdated
                }
            });
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }

    // Update referral progress (called when delivery is completed)
    static async updateReferralProgress(req, res) {
        try {
            const { driverId } = req.params;

            const referral = await ReferralService.updateReferralProgress(driverId);

            if (!referral) {
                return successResponse(res, {
                    message: 'No active referral found for driver',
                    data: { updated: false }
                });
            }

            return successResponse(res, {
                message: 'Referral progress updated successfully',
                data: {
                    updated: true,
                    referralId: referral._id,
                    status: referral.status,
                    progress: referral.progress,
                    completionPercentage: referral.getCompletionPercentage()
                }
            });
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }

    // Get all referrals (admin only)
    static async getAllReferrals(req, res) {
        try {
            const { page = 1, limit = 20, status } = req.query;
            const skip = (page - 1) * limit;

            const Referral = require('../models/Referral');
            const query = status ? { status } : {};

            const [referrals, total] = await Promise.all([
                Referral.find(query)
                    .populate('referrer', 'name email')
                    .populate('referred', 'name email')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(parseInt(limit)),
                Referral.countDocuments(query)
            ]);

            return successResponse(res, {
                message: 'Referrals retrieved successfully',
                data: {
                    referrals,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }

    // Cancel a referral (admin only)
    static async cancelReferral(req, res) {
        try {
            const { referralId } = req.params;

            const Referral = require('../models/Referral');
            const referral = await Referral.findById(referralId);

            if (!referral) {
                return errorResponse(res, 'Referral not found', 404);
            }

            if (referral.status !== 'pending') {
                return errorResponse(res, 'Only pending referrals can be cancelled', 400);
            }

            referral.status = 'cancelled';
            await referral.save();

            return successResponse(res, {
                message: 'Referral cancelled successfully',
                data: { referralId: referral._id, status: referral.status }
            });
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }
}

module.exports = ReferralController;
