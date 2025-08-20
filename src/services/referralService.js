const Referral = require('../models/Referral');
const DriverPoints = require('../models/DriverPoints');
const Driver = require('../models/Driver');

class ReferralService {
    // Generate referral code in GRP-SDS001-AY format
    static async generateReferralCode(driverId) {
        try {
            // Get driver info
            const driver = await Driver.findById(driverId);
            if (!driver) {
                throw new Error('Driver not found');
            }

            // Get next sequential number
            const lastReferral = await Referral.findOne().sort({ referralCode: -1 });
            let nextNumber = 1;

            if (lastReferral && lastReferral.referralCode) {
                const match = lastReferral.referralCode.match(/GRP-SDS(\d+)-/);
                if (match) {
                    nextNumber = parseInt(match[1]) + 1;
                }
            }

            // Generate driver abbreviation (first 2 letters of first name)
            const firstName = driver.name ? driver.name.split(' ')[0] : 'DR';
            const abbreviation = firstName.substring(0, 2).toUpperCase();

            // Format: GRP-SDS001-AY
            const referralCode = `GRP-SDS${nextNumber.toString().padStart(3, '0')}-${abbreviation}`;

            return referralCode;
        } catch (error) {
            throw new Error(`Failed to generate referral code: ${error.message}`);
        }
    }

    // Create a new referral
    static async createReferral(referrerId, referredId, referralCode) {
        try {
            // Check if referral already exists
            const existingReferral = await Referral.findOne({
                $or: [
                    { referrer: referrerId, referred: referredId },
                    { referrer: referredId, referred: referrerId }
                ]
            });

            if (existingReferral) {
                throw new Error('Referral relationship already exists');
            }

            // Create new referral
            const referral = new Referral({
                referrer: referrerId,
                referred: referredId,
                referralCode,
                status: 'pending',
                startDate: new Date(),
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            });

            await referral.save();
            return referral;
        } catch (error) {
            throw new Error(`Failed to create referral: ${error.message}`);
        }
    }

    // Use a referral code
    static async useReferralCode(referralCode, referredDriverId) {
        try {
            // Find referral by code
            const referral = await Referral.findOne({ referralCode });
            if (!referral) {
                throw new Error('Invalid referral code');
            }

            if (referral.status !== 'pending') {
                throw new Error('Referral code is no longer valid');
            }

            if (referral.referrer.toString() === referredDriverId) {
                throw new Error('Cannot use your own referral code');
            }

            // Check if referred driver already has a referral
            const existingReferral = await Referral.findOne({
                referred: referredDriverId,
                status: { $in: ['pending', 'completed'] }
            });

            if (existingReferral) {
                throw new Error('Driver already has an active referral');
            }

            // Update referral with referred driver
            referral.referred = referredDriverId;
            await referral.save();

            return referral;
        } catch (error) {
            throw new Error(`Failed to use referral code: ${error.message}`);
        }
    }

    // Update referral progress
    static async updateReferralProgress(referredDriverId) {
        try {
            const referral = await Referral.findOne({
                referred: referredDriverId,
                status: 'pending'
            });

            if (!referral) {
                return null;
            }

            // Calculate progress based on driver's performance
            const driver = await Driver.findById(referredDriverId);
            if (!driver) {
                return null;
            }

            // Get driver's delivery stats (you'll need to implement this based on your delivery model)
            const deliveriesCompleted = driver.totalDeliveries || 0;
            const totalEarnings = driver.totalEarnings || 0;
            const daysActive = Math.ceil((Date.now() - new Date(driver.createdAt).getTime()) / (1000 * 60 * 60 * 24));

            // Update referral progress
            await referral.updateProgress(deliveriesCompleted, totalEarnings, daysActive);

            // If referral is completed, award points
            if (referral.status === 'completed') {
                await this.awardReferralPoints(referral);
            }

            return referral;
        } catch (error) {
            throw new Error(`Failed to update referral progress: ${error.message}`);
        }
    }

    // Award points for completed referral
    static async awardReferralPoints(referral) {
        try {
            // Award points to referrer
            const referrerPoints = await DriverPoints.getOrCreate(referral.referrer);
            await referrerPoints.addPoints(
                referral.rewards.referrerPoints,
                'referral_completion',
                `Referral completion reward for ${referral.referralCode}`,
                referral._id
            );

            // Award points to referred driver
            const referredPoints = await DriverPoints.getOrCreate(referral.referred);
            await referredPoints.addPoints(
                referral.rewards.referredPoints,
                'referral_completion',
                `Referral completion reward for ${referral.referralCode}`,
                referral._id
            );

            // Mark points as claimed
            referral.rewards.referrerPointsClaimed = true;
            referral.rewards.referredPointsClaimed = true;
            await referral.save();

            return { referrerPoints: referral.rewards.referrerPoints, referredPoints: referral.rewards.referredPoints };
        } catch (error) {
            throw new Error(`Failed to award referral points: ${error.message}`);
        }
    }

    // Get driver's referral statistics
    static async getDriverReferralStats(driverId) {
        try {
            const [referralsAsReferrer, referralsAsReferred, driverPoints] = await Promise.all([
                Referral.find({ referrer: driverId }).populate('referred', 'name email'),
                Referral.find({ referred: driverId }).populate('referrer', 'name email'),
                DriverPoints.getOrCreate(driverId)
            ]);

            const completedReferrals = referralsAsReferrer.filter(r => r.status === 'completed').length;
            const pendingReferrals = referralsAsReferrer.filter(r => r.status === 'pending').length;
            const totalPointsEarned = driverPoints.totalPoints;
            const availablePoints = driverPoints.availablePoints;

            return {
                totalReferrals: referralsAsReferrer.length,
                completedReferrals,
                pendingReferrals,
                totalPointsEarned,
                availablePoints,
                referralsAsReferrer,
                referralsAsReferred
            };
        } catch (error) {
            throw new Error(`Failed to get driver referral stats: ${error.message}`);
        }
    }

    // Get referral leaderboard
    static async getReferralLeaderboard(limit = 10) {
        try {
            const leaderboard = await DriverPoints.aggregate([
                {
                    $lookup: {
                        from: 'drivers',
                        localField: 'driver',
                        foreignField: '_id',
                        as: 'driverInfo'
                    }
                },
                {
                    $unwind: '$driverInfo'
                },
                {
                    $project: {
                        driverId: '$driver',
                        name: '$driverInfo.name',
                        email: '$driverInfo.email',
                        totalPoints: '$totalPoints',
                        availablePoints: '$availablePoints',
                        completedReferrals: {
                            $size: {
                                $filter: {
                                    input: '$pointsHistory',
                                    cond: { $eq: ['$$this.type', 'referral_completion'] }
                                }
                            }
                        }
                    }
                },
                {
                    $sort: { totalPoints: -1 }
                },
                {
                    $limit: limit
                }
            ]);

            return leaderboard;
        } catch (error) {
            throw new Error(`Failed to get referral leaderboard: ${error.message}`);
        }
    }

    // Get admin statistics
    static async getAdminStatistics() {
        try {
            const [
                totalReferrals,
                completedReferrals,
                pendingReferrals,
                totalPointsAwarded,
                totalDriversWithPoints
            ] = await Promise.all([
                Referral.countDocuments(),
                Referral.countDocuments({ status: 'completed' }),
                Referral.countDocuments({ status: 'pending' }),
                DriverPoints.aggregate([
                    { $group: { _id: null, total: { $sum: '$totalPoints' } } }
                ]),
                DriverPoints.countDocuments({ totalPoints: { $gt: 0 } })
            ]);

            return {
                totalReferrals,
                completedReferrals,
                pendingReferrals,
                totalPointsAwarded: totalPointsAwarded[0]?.total || 0,
                totalDriversWithPoints,
                completionRate: totalReferrals > 0 ? (completedReferrals / totalReferrals * 100).toFixed(2) : 0
            };
        } catch (error) {
            throw new Error(`Failed to get admin statistics: ${error.message}`);
        }
    }

    // Redeem points
    static async redeemPoints(driverId, amount, description) {
        try {
            const driverPoints = await DriverPoints.getOrCreate(driverId);
            await driverPoints.redeemPoints(amount, description);
            return driverPoints;
        } catch (error) {
            throw new Error(`Failed to redeem points: ${error.message}`);
        }
    }

    // Get driver's points history
    static async getDriverPointsHistory(driverId, limit = 20) {
        try {
            const driverPoints = await DriverPoints.findOne({ driver: driverId })
                .populate('pointsHistory.referralId', 'referralCode status');

            if (!driverPoints) {
                return { pointsHistory: [] };
            }

            // Sort history by timestamp (newest first) and limit
            const sortedHistory = driverPoints.pointsHistory
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, limit);

            return {
                totalPoints: driverPoints.totalPoints,
                availablePoints: driverPoints.availablePoints,
                redeemedPoints: driverPoints.redeemedPoints,
                pointsHistory: sortedHistory
            };
        } catch (error) {
            throw new Error(`Failed to get driver points history: ${error.message}`);
        }
    }
}

module.exports = ReferralService;
