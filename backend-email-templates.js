// ========================================
// PROFESSIONAL EMAIL TEMPLATES FOR GREEP SDS
// ========================================
// Add these email templates to your backend email service

// 1. DRIVER INVITATION EMAIL TEMPLATE
// ========================================

const generateDriverInvitationEmail = (driverData, activationLink) => {
    const { name, email, referralCode } = driverData;
    const referrerInfo = referralCode ? `<p style="margin: 16px 0; color: #059669; font-weight: 500;">🎉 You were referred by a fellow driver! This means you'll have extra support getting started.</p>` : '';

    return {
        to: email,
        subject: '🚗 Welcome to Greep SDS - Your Driver Account Awaits!',
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Greep SDS</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0D965E 0%, #00683F 100%); padding: 32px; text-align: center;">
            <div style="background-color: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 36px; font-weight: bold; color: #0D965E;">G</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to Greep SDS!</h1>
            <p style="color: #e6fffa; margin: 8px 0 0; font-size: 16px;">Your journey as a delivery driver starts here</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="background-color: #0D965E; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px;">
                    👋
                </div>
                <h2 style="color: #1f2937; margin: 0; font-size: 24px;">Hello ${name}!</h2>
                <p style="color: #6b7280; margin: 8px 0 0; font-size: 16px;">You've been invited to join our delivery driver network</p>
            </div>

            ${referrerInfo}

            <div style="background-color: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="color: #166534; margin: 0 0 12px; font-size: 18px; display: flex; align-items: center;">
                    🚀 Get Started in 3 Easy Steps
                </h3>
                <ol style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.6;">
                    <li style="margin-bottom: 8px;"><strong>Activate your account</strong> - Click the button below</li>
                    <li style="margin-bottom: 8px;"><strong>Complete your profile</strong> - Add personal details and documents</li>
                    <li style="margin-bottom: 8px;"><strong>Start earning</strong> - Begin accepting delivery requests</li>
                </ol>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
                <a href="${activationLink}" style="display: inline-block; background: linear-gradient(135deg, #0D965E 0%, #00683F 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    🔗 Activate My Account
                </a>
                <p style="color: #6b7280; font-size: 14px; margin: 12px 0 0;">This link expires in 7 days for security</p>
            </div>

            <!-- Benefits Section -->
            <div style="background-color: #fefce8; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="color: #92400e; margin: 0 0 16px; font-size: 18px;">💰 What You'll Earn</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #92400e;">80%</div>
                        <div style="font-size: 14px; color: #78716c;">Delivery Fee</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #92400e;">100%</div>
                        <div style="font-size: 14px; color: #78716c;">Tips & Bonuses</div>
                    </div>
                </div>
            </div>

            <!-- Support Section -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
                <h3 style="color: #1f2937; margin: 0 0 16px; font-size: 18px;">📞 Need Help?</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; text-align: center;">
                    <div>
                        <div style="font-weight: 600; color: #1f2937;">WhatsApp Support</div>
                        <div style="color: #0D965E; font-weight: 500;">+90 533 832 97 85</div>
                    </div>
                    <div>
                        <div style="font-weight: 600; color: #1f2937;">Follow Us</div>
                        <div style="color: #0D965E; font-weight: 500;">@greepit</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
                This invitation was sent to <strong>${email}</strong><br>
                If you didn't expect this email, you can safely ignore it.
            </p>
            <p style="color: #9ca3af; margin: 16px 0 0; font-size: 12px;">
                © 2024 Greep SDS. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
Welcome to Greep SDS, ${name}!

You've been invited to join our delivery driver network. ${referralCode ? 'You were referred by a fellow driver, which means you\'ll have extra support getting started!' : ''}

To activate your account:
1. Click this link: ${activationLink}
2. Complete your profile setup
3. Start earning money with deliveries

Benefits:
- Earn 80% of delivery fees
- Keep 100% of tips and bonuses
- Flexible working hours
- Professional support

Need help?
- WhatsApp: +90 533 832 97 85
- Instagram: @greepit

This link expires in 7 days for security.

If you didn't expect this email, you can safely ignore it.

© 2024 Greep SDS. All rights reserved.
        `
    };
};

// 2. ADMIN NOTIFICATION EMAIL TEMPLATE
// ========================================

const generateAdminNotificationEmail = (adminEmail, driverData, invitedBy) => {
    const { name, email, referralCode } = driverData;
    const referralInfo = referralCode ? `
        <div style="background-color: #fef3c7; border-radius: 6px; padding: 12px; margin: 12px 0;">
            <span style="color: #92400e; font-weight: 500;">🔗 Referral Code:</span>
            <span style="color: #78716c;">${referralCode}</span>
        </div>
    ` : '';

    return {
        to: adminEmail,
        subject: `🚗 New Driver Invitation Sent - ${name}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Driver Invitation Sent</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb;">
    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 24px; text-align: center;">
            <div style="background-color: white; width: 50px; height: 50px; border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 20px;">👨‍💼</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 600;">Driver Invitation Sent</h1>
        </div>

        <!-- Content -->
        <div style="padding: 24px;">
            <div style="background-color: #f0f9ff; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <h3 style="color: #1e40af; margin: 0 0 12px; font-size: 16px;">✅ Invitation Successfully Sent</h3>
                <div style="color: #1f2937;">
                    <div style="margin-bottom: 8px;">
                        <span style="font-weight: 500;">Driver:</span> ${name}
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span style="font-weight: 500;">Email:</span> ${email}
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span style="font-weight: 500;">Invited by:</span> ${invitedBy}
                    </div>
                    <div>
                        <span style="font-weight: 500;">Date:</span> ${new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}
                    </div>
                </div>
                ${referralInfo}
            </div>

            <div style="background-color: #fefce8; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <h4 style="color: #92400e; margin: 0 0 8px; font-size: 14px;">📋 Next Steps</h4>
                <ul style="color: #78716c; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
                    <li>Driver will receive activation email</li>
                    <li>Monitor pending invitations in admin panel</li>
                    <li>Follow up if no response in 24-48 hours</li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
                Greep SDS Admin Notification System
            </p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
Driver Invitation Sent Successfully

Driver: ${name}
Email: ${email}
Invited by: ${invitedBy}
Date: ${new Date().toLocaleDateString()}
${referralCode ? `Referral Code: ${referralCode}` : ''}

Next Steps:
- Driver will receive activation email
- Monitor pending invitations in admin panel
- Follow up if no response in 24-48 hours

Greep SDS Admin Notification System
        `
    };
};

// 3. EMAIL SERVICE INTEGRATION
// ========================================

const emailService = {
    // Send driver invitation email
    async sendDriverInvitation(driverData) {
        try {
            // Generate secure activation link
            const activationToken = generateSecureToken();
            const activationLink = `${process.env.FRONTEND_URL}/driver-activation?token=${activationToken}&email=${encodeURIComponent(driverData.email)}`;

            // Store activation token in database with expiry (7 days)
            await storeActivationToken(driverData.email, activationToken, 7);

            // Generate and send email
            const emailContent = generateDriverInvitationEmail(driverData, activationLink);
            await sendEmail(emailContent);

            console.log(`✅ Driver invitation sent to ${driverData.email}`);
            return { success: true, message: 'Invitation sent successfully' };

        } catch (error) {
            console.error('❌ Failed to send driver invitation:', error);
            throw new Error('Failed to send invitation email');
        }
    },

    // Send admin notification
    async sendAdminNotification(adminEmail, driverData, invitedBy) {
        try {
            const emailContent = generateAdminNotificationEmail(adminEmail, driverData, invitedBy);
            await sendEmail(emailContent);

            console.log(`✅ Admin notification sent to ${adminEmail}`);
            return { success: true, message: 'Admin notification sent' };

        } catch (error) {
            console.error('❌ Failed to send admin notification:', error);
            // Don't throw error for admin notifications - it's not critical
            return { success: false, message: 'Admin notification failed' };
        }
    }
};

// 4. HELPER FUNCTIONS
// ========================================

function generateSecureToken() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}

async function storeActivationToken(email, token, expiryDays) {
    // Store in database with expiry
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    // Example database storage (adapt to your DB)
    /*
    await DriverInvitation.create({
        email,
        activationToken: token,
        expiresAt: expiryDate,
        status: 'pending'
    });
    */
}

async function sendEmail(emailContent) {
    // Integrate with your email service (SendGrid, AWS SES, etc.)
    // Example with nodemailer:
    /*
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
        // Your email service config
    });
    
    await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        ...emailContent
    });
    */
}

// 5. USAGE EXAMPLE
// ========================================

/*
// In your driver invitation route:
app.post('/api/admin/drivers/invite', async (req, res) => {
    try {
        const { name, email, referralCode } = req.body;
        const invitedBy = req.user.name; // Admin who sent invitation
        
        // Send driver invitation
        await emailService.sendDriverInvitation({ name, email, referralCode });
        
        // Send admin notification
        await emailService.sendAdminNotification(req.user.email, { name, email, referralCode }, invitedBy);
        
        res.json({ 
            success: true, 
            message: 'Driver invitation sent successfully' 
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});
*/

module.exports = {
    generateDriverInvitationEmail,
    generateAdminNotificationEmail,
    emailService
};

