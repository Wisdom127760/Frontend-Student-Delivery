// ========================================
// BACKEND DRIVER INVITATION ENDPOINT WITH EMAIL INTEGRATION
// ========================================
// Add this to your backend routes

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { emailService } = require('./email-templates'); // Import email templates

// Driver Invitation Model (add to your models)
const DriverInvitation = require('../models/DriverInvitation');

// POST /api/admin/drivers/invite
router.post('/invite', async (req, res) => {
    try {
        const { name, email, referralCode } = req.body;
        const invitedBy = req.user?.name || 'Admin'; // Get admin who sent invitation

        // Validation
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                error: 'Name and email are required'
            });
        }

        // Check if driver already exists or has pending invitation
        const existingInvitation = await DriverInvitation.findOne({
            email,
            status: { $in: ['pending', 'active'] }
        });

        if (existingInvitation) {
            return res.status(400).json({
                success: false,
                error: 'Driver already has a pending invitation or is already registered'
            });
        }

        // Generate secure activation token
        const activationToken = crypto.randomBytes(32).toString('hex');
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7); // 7 days expiry

        // Create invitation record
        const invitation = await DriverInvitation.create({
            name,
            email,
            referralCode: referralCode || null,
            activationToken,
            expiresAt: expiryDate,
            invitedBy: req.user?.id,
            invitedByName: invitedBy,
            status: 'pending'
        });

        // Generate activation link
        const activationLink = `${process.env.FRONTEND_URL}/driver-activation?token=${activationToken}&email=${encodeURIComponent(email)}`;

        // Send driver invitation email
        try {
            await emailService.sendDriverInvitation({
                name,
                email,
                referralCode,
                activationLink
            });
        } catch (emailError) {
            console.error('❌ Failed to send invitation email:', emailError);
            // Delete the invitation if email fails
            await DriverInvitation.findByIdAndDelete(invitation._id);

            return res.status(500).json({
                success: false,
                error: 'Failed to send invitation email. Please try again.'
            });
        }

        // Send admin notification (non-critical)
        try {
            await emailService.sendAdminNotification(
                req.user?.email || 'admin@greepsds.com',
                { name, email, referralCode },
                invitedBy
            );
        } catch (adminEmailError) {
            console.warn('⚠️ Admin notification failed:', adminEmailError);
            // Continue - this is not critical
        }

        // Log the invitation
        console.log(`✅ Driver invitation sent: ${name} (${email}) by ${invitedBy}`);

        res.json({
            success: true,
            message: 'Driver invitation sent successfully',
            data: {
                invitationId: invitation._id,
                email,
                expiresAt: expiryDate,
                activationLink: process.env.NODE_ENV === 'development' ? activationLink : undefined
            }
        });

    } catch (error) {
        console.error('❌ Driver invitation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/admin/drivers/invitations - Get pending invitations
router.get('/invitations', async (req, res) => {
    try {
        const { page = 1, limit = 20, status = 'pending' } = req.query;

        const invitations = await DriverInvitation.find({ status })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('invitedBy', 'name email');

        const total = await DriverInvitation.countDocuments({ status });

        res.json({
            success: true,
            data: {
                invitations,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('❌ Error fetching invitations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch invitations'
        });
    }
});

// POST /api/admin/drivers/invitations/:id/resend - Resend invitation
router.post('/invitations/:id/resend', async (req, res) => {
    try {
        const { id } = req.params;

        const invitation = await DriverInvitation.findById(id);
        if (!invitation) {
            return res.status(404).json({
                success: false,
                error: 'Invitation not found'
            });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Can only resend pending invitations'
            });
        }

        // Generate new activation token and extend expiry
        const newActivationToken = crypto.randomBytes(32).toString('hex');
        const newExpiryDate = new Date();
        newExpiryDate.setDate(newExpiryDate.getDate() + 7);

        // Update invitation
        invitation.activationToken = newActivationToken;
        invitation.expiresAt = newExpiryDate;
        invitation.resentAt = new Date();
        invitation.resentCount = (invitation.resentCount || 0) + 1;
        await invitation.save();

        // Generate new activation link
        const activationLink = `${process.env.FRONTEND_URL}/driver-activation?token=${newActivationToken}&email=${encodeURIComponent(invitation.email)}`;

        // Resend email
        await emailService.sendDriverInvitation({
            name: invitation.name,
            email: invitation.email,
            referralCode: invitation.referralCode,
            activationLink
        });

        console.log(`✅ Driver invitation resent: ${invitation.name} (${invitation.email})`);

        res.json({
            success: true,
            message: 'Invitation resent successfully',
            data: {
                expiresAt: newExpiryDate,
                resentCount: invitation.resentCount
            }
        });

    } catch (error) {
        console.error('❌ Error resending invitation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to resend invitation'
        });
    }
});

// POST /api/admin/drivers/invitations/:id/cancel - Cancel invitation
router.post('/invitations/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;

        const invitation = await DriverInvitation.findById(id);
        if (!invitation) {
            return res.status(404).json({
                success: false,
                error: 'Invitation not found'
            });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Can only cancel pending invitations'
            });
        }

        // Update invitation status
        invitation.status = 'cancelled';
        invitation.cancelledAt = new Date();
        invitation.cancelledBy = req.user?.id;
        await invitation.save();

        console.log(`✅ Driver invitation cancelled: ${invitation.name} (${invitation.email})`);

        res.json({
            success: true,
            message: 'Invitation cancelled successfully'
        });

    } catch (error) {
        console.error('❌ Error cancelling invitation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel invitation'
        });
    }
});

// GET /api/driver-activation - Validate activation token
router.get('/driver-activation', async (req, res) => {
    try {
        const { token, email } = req.query;

        if (!token || !email) {
            return res.status(400).json({
                success: false,
                error: 'Token and email are required'
            });
        }

        const invitation = await DriverInvitation.findOne({
            email,
            activationToken: token,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        });

        if (!invitation) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired invitation link'
            });
        }

        res.json({
            success: true,
            message: 'Invitation is valid',
            data: {
                invitation: {
                    name: invitation.name,
                    email: invitation.email,
                    expiresAt: invitation.expiresAt,
                    referralCode: invitation.referralCode
                }
            }
        });

    } catch (error) {
        console.error('❌ Error validating invitation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate invitation'
        });
    }
});

// POST /api/driver-activation - Activate driver account
router.post('/driver-activation', async (req, res) => {
    try {
        const { token, email, driverData } = req.body;

        if (!token || !email) {
            return res.status(400).json({
                success: false,
                error: 'Token and email are required'
            });
        }

        const invitation = await DriverInvitation.findOne({
            email,
            activationToken: token,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        });

        if (!invitation) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired invitation link'
            });
        }

        // Create driver account (implement based on your Driver model)
        const newDriver = await Driver.create({
            name: invitation.name,
            email: invitation.email,
            referralCode: invitation.referralCode,
            invitedBy: invitation.invitedBy,
            status: 'active',
            ...driverData
        });

        // Update invitation status
        invitation.status = 'activated';
        invitation.activatedAt = new Date();
        invitation.driverId = newDriver._id;
        await invitation.save();

        // If there's a referral code, create referral relationship
        if (invitation.referralCode) {
            // Implement referral logic here
            console.log(`🔗 Creating referral relationship for ${email} with code ${invitation.referralCode}`);
        }

        console.log(`✅ Driver account activated: ${invitation.name} (${email})`);

        res.json({
            success: true,
            message: 'Account activated successfully',
            data: {
                driverId: newDriver._id,
                email: newDriver.email,
                name: newDriver.name
            }
        });

    } catch (error) {
        console.error('❌ Error activating driver account:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to activate account'
        });
    }
});

// GET /api/admin/drivers/referral-codes - Get available referral codes
router.get('/referral-codes', async (req, res) => {
    try {
        // For now, return mock data
        // In production, fetch from your referral system
        const referralCodes = [
            {
                referralCode: 'GRP-SDS001-WI',
                driverName: 'Wisdom Agunta',
                driverId: '6890dc5a98ce5bc39c4e92b7',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                referralCode: 'GRP-SDS002-JO',
                driverName: 'John Doe',
                driverId: '6890dc5a98ce5bc39c4e92b8',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                referralCode: 'GRP-SDS003-SA',
                driverName: 'Sarah Smith',
                driverId: '6890dc5a98ce5bc39c4e92b9',
                status: 'active',
                createdAt: new Date().toISOString()
            }
        ];

        console.log('✅ Available referral codes requested and served successfully');

        res.json({
            success: true,
            message: 'Available referral codes retrieved successfully',
            data: {
                referralCodes: referralCodes.filter(code => code.status === 'active')
            }
        });

    } catch (error) {
        console.error('❌ Error serving referral codes:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve referral codes'
        });
    }
});

module.exports = router;

// ========================================
// DRIVER INVITATION MODEL
// ========================================
// Add this to your models/DriverInvitation.js

/*
const mongoose = require('mongoose');

const driverInvitationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    referralCode: {
        type: String,
        default: null
    },
    activationToken: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'activated', 'expired', 'cancelled'],
        default: 'pending'
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    invitedByName: {
        type: String,
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    },
    activatedAt: {
        type: Date,
        default: null
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    resentAt: {
        type: Date,
        default: null
    },
    resentCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for performance
driverInvitationSchema.index({ email: 1, status: 1 });
driverInvitationSchema.index({ activationToken: 1 });
driverInvitationSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('DriverInvitation', driverInvitationSchema);
*/
