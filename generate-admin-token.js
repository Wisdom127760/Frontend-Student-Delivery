// Generate Admin Token Script
// This script creates a proper JWT token for admin access

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

// Generate the token
const generateAdminToken = () => {
    const payload = {
        id: adminUser._id,
        email: adminUser.email,
        userType: adminUser.userType, // This is the key field that was missing
        name: adminUser.name,
        role: adminUser.role,
        permissions: adminUser.permissions,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };

    const token = jwt.sign(payload, JWT_SECRET);

    console.log('🔑 Generated Admin JWT Token:');
    console.log('=====================================');
    console.log(token);
    console.log('=====================================');

    console.log('\n📋 Token Details:');
    console.log('User ID:', payload.id);
    console.log('Email:', payload.email);
    console.log('User Type:', payload.userType);
    console.log('Role:', payload.role);
    console.log('Permissions:', payload.permissions);
    console.log('Expires:', new Date(payload.exp * 1000));

    console.log('\n🎯 How to Use:');
    console.log('1. Copy the token above');
    console.log('2. In your frontend, set the Authorization header:');
    console.log('   Authorization: Bearer ' + token);
    console.log('3. Or update localStorage:');
    console.log('   localStorage.setItem("token", "' + token + '")');

    return token;
};

// Test the token
const testToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('\n✅ Token Verification Successful:');
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

    } catch (error) {
        console.error('❌ Token verification failed:', error.message);
    }
};

// Generate and test the token
console.log('🚀 Generating Admin JWT Token...\n');
const adminToken = generateAdminToken();
testToken(adminToken);

console.log('\n🎉 Token generation complete!');
console.log('Use this token in your frontend to access admin features.');
