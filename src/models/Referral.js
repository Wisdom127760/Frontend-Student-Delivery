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
        deliveriesCompleted: {
            type: Number,
            default: 0
        },
        totalEarnings: {
            type: Number,
            default: 0
        },
        daysActive: {
            type: Number,
            default: 0
        }
    },
    completionCriteria: {
        requiredDeliveries: {
            type: Number,
            default: 5
        },
        requiredEarnings: {
            type: Number,
            default: 500
        },
        requiredDays: {
            type: Number,
            default: 30
        }
    },
    rewards: {
        referrerPoints: {
            type: Number,
            default: 1000
        },
        referredPoints: {
            type: Number,
            default: 500
        },
        referrerClaimed: {
            type: Boolean,
            default: false
        },
        referredClaimed: {
            type: Boolean,
            default: false
        }
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    completionDate: {
        type: Date
    },
    expiryDate: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        }
    }
}, {
    timestamps: true
});

// Index for efficient queries
referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referred: 1, status: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ status: 1, expiryDate: 1 });

// Method to check if referral is completed
referralSchema.methods.isCompleted = function () {
    return this.progress.deliveriesCompleted >= this.completionCriteria.requiredDeliveries &&
        this.progress.totalEarnings >= this.completionCriteria.requiredEarnings &&
        this.progress.daysActive >= this.completionCriteria.requiredDays;
};

// Method to calculate completion percentage
referralSchema.methods.getCompletionPercentage = function () {
    const deliveryProgress = Math.min(this.progress.deliveriesCompleted / this.completionCriteria.requiredDeliveries, 1);
    const earningsProgress = Math.min(this.progress.totalEarnings / this.completionCriteria.requiredEarnings, 1);
    const daysProgress = Math.min(this.progress.daysActive / this.completionCriteria.requiredDays, 1);

    return Math.round((deliveryProgress + earningsProgress + daysProgress) / 3 * 100);
};

// Method to update progress
referralSchema.methods.updateProgress = function (deliveriesCompleted, totalEarnings, daysActive) {
    this.progress.deliveriesCompleted = deliveriesCompleted;
    this.progress.totalEarnings = totalEarnings;
    this.progress.daysActive = daysActive;

    // Check if completed
    if (this.isCompleted() && this.status === 'pending') {
        this.status = 'completed';
        this.completionDate = new Date();
    }

    return this.save();
};

module.exports = mongoose.model('Referral', referralSchema);
