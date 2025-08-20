const mongoose = require('mongoose');

const driverReferralEarningsSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true,
        unique: true
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    availableEarnings: {
        type: Number,
        default: 0
    },
    redeemedEarnings: {
        type: Number,
        default: 0
    },
    earningsHistory: [{
        type: {
            type: String,
            enum: ['referral_reward', 'referral_completion', 'bonus', 'redemption', 'expired'],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        referralId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Referral'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
driverReferralEarningsSchema.index({ driver: 1 });
driverReferralEarningsSchema.index({ totalEarnings: -1 }); // For leaderboards

// Method to add earnings
driverReferralEarningsSchema.methods.addEarnings = function (amount, type, description, referralId = null) {
    this.totalEarnings += amount;
    this.availableEarnings += amount;
    this.lastUpdated = new Date();

    this.earningsHistory.push({
        type,
        amount,
        description,
        referralId,
        timestamp: new Date()
    });

    return this.save();
};

// Method to redeem earnings
driverReferralEarningsSchema.methods.redeemEarnings = function (amount, description) {
    if (this.availableEarnings < amount) {
        throw new Error('Insufficient available earnings');
    }

    this.availableEarnings -= amount;
    this.redeemedEarnings += amount;
    this.lastUpdated = new Date();

    this.earningsHistory.push({
        type: 'redemption',
        amount: -amount, // Negative to indicate deduction
        description,
        timestamp: new Date()
    });

    return this.save();
};

// Method to expire earnings (if needed)
driverReferralEarningsSchema.methods.expireEarnings = function (amount, description) {
    if (this.availableEarnings < amount) {
        amount = this.availableEarnings; // Expire all available earnings
    }

    this.availableEarnings -= amount;
    this.lastUpdated = new Date();

    this.earningsHistory.push({
        type: 'expired',
        amount: -amount,
        description,
        timestamp: new Date()
    });

    return this.save();
};

// Static method to get or create driver earnings
driverReferralEarningsSchema.statics.getOrCreate = async function (driverId) {
    let driverEarnings = await this.findOne({ driver: driverId });

    if (!driverEarnings) {
        driverEarnings = new this({
            driver: driverId,
            totalEarnings: 0,
            availableEarnings: 0,
            redeemedEarnings: 0,
            earningsHistory: []
        });
        await driverEarnings.save();
    }

    return driverEarnings;
};

module.exports = mongoose.model('DriverReferralEarnings', driverReferralEarningsSchema);
