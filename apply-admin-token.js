// Frontend Script: Apply Admin Token
// This script helps you apply the admin token in your frontend

// The recommended admin token (generated with correct userType field)
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ODk3M2I2OWNkMmQ4MjM0ZjI2YmQzOSIsImVtYWlsIjoid2lzZG9tQGdyZWVwLmlvIiwidXNlclR5cGUiOiJhZG1pbiIsIm5hbWUiOiJTdXBlciBBZG1pbiIsInJvbGUiOiJzdXBlcl9hZG1pbiIsInBlcm1pc3Npb25zIjpbImFsbCIsImNyZWF0ZV9kZWxpdmVyeSIsImVkaXRfZGVsaXZlcnkiLCJkZWxldGVfZGVsaXZlcnkiLCJtYW5hZ2VfZHJpdmVycyIsInZpZXdfYW5hbHl0aWNzIiwiYWlfdmVyaWZpY2F0aW9uIl0sImlhdCI6MTc1NTk0NjAzOSwiZXhwIjoxNzU2NTUwODM5fQ.IUEI1LA50soL35odd1LcqsdoITK2um6jZYGEUpkHRDU';

// Admin user data to store in localStorage
const ADMIN_USER = {
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

// Function to apply the admin token
function applyAdminToken() {
    try {
        console.log('🔑 Applying Admin Token...');

        // Store the token
        localStorage.setItem('token', ADMIN_TOKEN);
        console.log('✅ Token stored in localStorage');

        // Store the user data
        localStorage.setItem('user', JSON.stringify(ADMIN_USER));
        console.log('✅ User data stored in localStorage');

        // Set authentication status
        localStorage.setItem('isAuthenticated', 'true');
        console.log('✅ Authentication status set to true');

        console.log('\n🎉 Admin token applied successfully!');
        console.log('You should now have full admin access.');

        // Test the token
        testAdminAccess();

    } catch (error) {
        console.error('❌ Failed to apply admin token:', error);
    }
}

// Function to test admin access
async function testAdminAccess() {
    try {
        console.log('\n🧪 Testing Admin Access...');

        const API_BASE_URL = 'http://localhost:3001/api';

        // Test 1: Profile endpoint
        console.log('\n📋 Test 1: Profile endpoint...');
        const profileResponse = await fetch(`${API_BASE_URL}/profile/688973b69cd2d8234f26bd39`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Profile status:', profileResponse.status);
        if (profileResponse.ok) {
            console.log('✅ Profile access successful');
        } else {
            console.log('❌ Profile access failed');
        }

        // Test 2: Admin notifications
        console.log('\n📋 Test 2: Admin notifications...');
        const notificationsResponse = await fetch(`${API_BASE_URL}/admin/notifications?limit=10`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Notifications status:', notificationsResponse.status);
        if (notificationsResponse.ok) {
            console.log('✅ Notifications access successful');
        } else {
            console.log('❌ Notifications access failed');
        }

        // Test 3: System settings
        console.log('\n📋 Test 3: System settings...');
        const settingsResponse = await fetch(`${API_BASE_URL}/system-settings/admin`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Settings status:', settingsResponse.status);
        if (settingsResponse.ok) {
            console.log('✅ Settings access successful');
        } else {
            console.log('❌ Settings access failed');
        }

        console.log('\n🎯 Admin Access Test Complete!');

    } catch (error) {
        console.error('❌ Admin access test failed:', error);
    }
}

// Function to clear admin token (for testing)
function clearAdminToken() {
    try {
        console.log('🧹 Clearing Admin Token...');

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');

        console.log('✅ Admin token cleared');
        console.log('You will need to log in again.');

    } catch (error) {
        console.error('❌ Failed to clear admin token:', error);
    }
}

// Function to check current token status
function checkTokenStatus() {
    try {
        console.log('🔍 Checking Current Token Status...');

        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isAuthenticated = localStorage.getItem('isAuthenticated');

        console.log('📋 Token exists:', !!token);
        console.log('📋 User data:', user);
        console.log('📋 Is authenticated:', isAuthenticated);

        if (token) {
            console.log('🔑 Token preview:', token.substring(0, 20) + '...');
        }

        if (user.userType) {
            console.log('🎭 User type:', user.userType);
        }

        if (user.role) {
            console.log('🎭 User role:', user.role);
        }

    } catch (error) {
        console.error('❌ Failed to check token status:', error);
    }
}

// Instructions for use
console.log(`
🔑 ADMIN TOKEN APPLICATION SCRIPT

This script helps you apply the admin token to fix the 403 Forbidden errors.

Available functions:

1. applyAdminToken() - Apply the admin token and test access
2. testAdminAccess() - Test admin endpoints
3. clearAdminToken() - Clear the admin token
4. checkTokenStatus() - Check current token status

To fix your admin access:

1. Run: applyAdminToken()
2. Refresh your admin page
3. Test admin features

To check current status:
checkTokenStatus()

To clear and start over:
clearAdminToken()
`);

// Export functions for use in browser console
if (typeof window !== 'undefined') {
    window.applyAdminToken = applyAdminToken;
    window.testAdminAccess = testAdminAccess;
    window.clearAdminToken = clearAdminToken;
    window.checkTokenStatus = checkTokenStatus;
}
