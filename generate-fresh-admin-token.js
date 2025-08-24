// Generate Fresh Admin Token Script
// This script creates a new JWT token with current timestamp

const jwt = require('jsonwebtoken');

// Admin user data
const adminUser = {
    _id: '688973b69cd2d8234f26bd39',
    email: 'wisdom@greep.io',
    name: 'Super Admin',
    userType: 'admin',
    role: 'super_admin',
    permissions: [
        'all',
        'create_delivery',
        'edit_delivery',
        'delete_delivery',
        'manage_drivers',
        'view_analytics',
        'ai_verification'
    ]
};

// JWT Secret (use your actual secret)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate the fresh token with current timestamp
const generateFreshAdminToken = () => {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds

    const payload = {
        id: adminUser._id,
        email: adminUser.email,
        userType: adminUser.userType, // This is the key field
        name: adminUser.name,
        role: adminUser.role,
        permissions: adminUser.permissions,
        iat: now,
        exp: now + expiresIn
    };

    const token = jwt.sign(payload, JWT_SECRET);

    console.log('🔑 Fresh Admin JWT Token Generated:');
    console.log('=====================================');
    console.log(token);
    console.log('=====================================');

    console.log('\n📋 Token Details:');
    console.log('User ID:', payload.id);
    console.log('Email:', payload.email);
    console.log('User Type:', payload.userType);
    console.log('Role:', payload.role);
    console.log('Permissions:', payload.permissions);
    console.log('Created:', new Date(payload.iat * 1000));
    console.log('Expires:', new Date(payload.exp * 1000));
    console.log('Valid for:', expiresIn / (24 * 60 * 60), 'days');

    console.log('\n🎯 How to Use:');
    console.log('1. Copy the token above');
    console.log('2. In your browser console, run:');
    console.log('   applyFreshAdminToken()');

    return token;
};

// Test the fresh token
const testFreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('\n✅ Fresh Token Verification Successful:');
        console.log('Decoded payload:', JSON.stringify(decoded, null, 2));

        // Check if it has the required fields
        if (decoded.userType === 'admin') {
            console.log('✅ userType field is correct: admin');
        } else {
            console.log('❌ userType field is missing or incorrect');
        }

        if (decoded.role === 'super_admin') {
            console.log('✅ role field is correct: super_admin');
        } else {
            console.log('❌ role field is missing or incorrect');
        }

        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp > now) {
            console.log('✅ Token is not expired');
            console.log('⏰ Time until expiration:', Math.floor((decoded.exp - now) / 3600), 'hours');
        } else {
            console.log('❌ Token is expired');
        }

    } catch (error) {
        console.error('❌ Fresh token verification failed:', error.message);
    }
};

// Generate and test the fresh token
console.log('🚀 Generating Fresh Admin JWT Token...\n');
const freshAdminToken = generateFreshAdminToken();
testFreshToken(freshAdminToken);

console.log('\n🎉 Fresh token generation complete!');
console.log('Use this token to fix the expired token issue.');
