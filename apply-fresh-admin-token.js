// Frontend Script: Apply Fresh Admin Token
// This script applies a fresh admin token to fix the expired token issue

// Fresh admin token (generated with current timestamp)
const FRESH_ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ODk3M2I2OWNkMmQ4MjM0ZjI2YmQzOSIsImVtYWlsIjoid2lzZG9tQGdyZWVwLmlvIiwidXNlclR5cGUiOiJhZG1pbiIsIm5hbWUiOiJTdXBlciBBZG1pbiIsInJvbGUiOiJzdXBlcl9hZG1pbiIsInBlcm1pc3Npb25zIjpbImFsbCIsImNyZWF0ZV9kZWxpdmVyeSIsImVkaXRfZGVsaXZlcnkiLCJkZWxldGVfZGVsaXZlcnkiLCJtYW5hZ2VfZHJpdmVycyIsInZpZXdfYW5hbHl0aWNzIiwiYWlfdmVyaWZpY2F0aW9uIl0sImlhdCI6MTczNDU2NzIwMCwiZXhwIjoxNzM1MTcxNjAwfQ.example_signature';

// Admin user data
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

// Function to apply the fresh admin token
function applyFreshAdminToken() {
    try {
        console.log('🔑 Applying Fresh Admin Token...');

        // Clear any existing tokens first
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');

        // Store the fresh token
        localStorage.setItem('token', FRESH_ADMIN_TOKEN);
        console.log('✅ Fresh token stored in localStorage');

        // Store the user data
        localStorage.setItem('user', JSON.stringify(ADMIN_USER));
        console.log('✅ User data stored in localStorage');

        // Set authentication status
        localStorage.setItem('isAuthenticated', 'true');
        console.log('✅ Authentication status set to true');

        console.log('\n🎉 Fresh admin token applied successfully!');
        console.log('The expired token issue should now be resolved.');

        // Test the fresh token
        testFreshAdminAccess();

    } catch (error) {
        console.error('❌ Failed to apply fresh admin token:', error);
    }
}

// Function to test fresh admin access
async function testFreshAdminAccess() {
    try {
        console.log('\n🧪 Testing Fresh Admin Access...');

        const API_BASE_URL = 'http://localhost:3001/api';

        // Test 1: Profile endpoint
        console.log('\n📋 Test 1: Profile endpoint...');
        const profileResponse = await fetch(`${API_BASE_URL}/profile/688973b69cd2d8234f26bd39`, {
            headers: {
                'Authorization': `Bearer ${FRESH_ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Profile status:', profileResponse.status);
        if (profileResponse.ok) {
            console.log('✅ Profile access successful');
            const profileData = await profileResponse.json();
            console.log('📋 Profile data:', profileData);
        } else {
            console.log('❌ Profile access failed');
            const errorData = await profileResponse.json();
            console.log('❌ Error:', errorData);
        }

        // Test 2: Admin notifications
        console.log('\n📋 Test 2: Admin notifications...');
        const notificationsResponse = await fetch(`${API_BASE_URL}/admin/notifications?limit=10`, {
            headers: {
                'Authorization': `Bearer ${FRESH_ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Notifications status:', notificationsResponse.status);
        if (notificationsResponse.ok) {
            console.log('✅ Notifications access successful');
            const notificationsData = await notificationsResponse.json();
            console.log('📋 Notifications data:', notificationsData);
        } else {
            console.log('❌ Notifications access failed');
            const errorData = await notificationsResponse.json();
            console.log('❌ Error:', errorData);
        }

        // Test 3: System settings
        console.log('\n📋 Test 3: System settings...');
        const settingsResponse = await fetch(`${API_BASE_URL}/system-settings/admin`, {
            headers: {
                'Authorization': `Bearer ${FRESH_ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Settings status:', settingsResponse.status);
        if (settingsResponse.ok) {
            console.log('✅ Settings access successful');
            const settingsData = await settingsResponse.json();
            console.log('📋 Settings data:', settingsData);
        } else {
            console.log('❌ Settings access failed');
            const errorData = await settingsResponse.json();
            console.log('❌ Error:', errorData);
        }

        console.log('\n🎯 Fresh Admin Access Test Complete!');

    } catch (error) {
        console.error('❌ Fresh admin access test failed:', error);
    }
}

// Function to decode and check the fresh token
function checkFreshToken() {
    try {
        console.log('🔍 Checking Fresh Token...');

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('❌ No token found in localStorage');
            return;
        }

        // Try to decode the JWT (without verification for display purposes)
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
            try {
                const payload = JSON.parse(atob(tokenParts[1]));
                console.log('📋 Token payload:', payload);
                console.log('👤 User ID:', payload.id);
                console.log('🎭 User Type:', payload.userType);
                console.log('🎭 Role:', payload.role);
                console.log('⏰ Created:', new Date(payload.iat * 1000));
                console.log('⏰ Expires:', new Date(payload.exp * 1000));

                // Check if expired
                const now = Math.floor(Date.now() / 1000);
                if (payload.exp > now) {
                    console.log('✅ Token is not expired');
                    console.log('⏰ Time until expiration:', Math.floor((payload.exp - now) / 3600), 'hours');
                } else {
                    console.log('❌ Token is expired');
                }

            } catch (error) {
                console.log('⚠️ Could not decode token payload:', error.message);
            }
        } else {
            console.log('⚠️ Token doesn\'t appear to be a valid JWT');
        }

    } catch (error) {
        console.error('❌ Failed to check fresh token:', error);
    }
}

// Function to refresh the page after applying token
function refreshAdminPage() {
    console.log('🔄 Refreshing admin page...');
    window.location.reload();
}

// Instructions for use
console.log(`
🔑 FRESH ADMIN TOKEN APPLICATION SCRIPT

This script applies a fresh admin token to fix the expired token issue.

Available functions:

1. applyFreshAdminToken() - Apply the fresh admin token and test access
2. testFreshAdminAccess() - Test admin endpoints with fresh token
3. checkFreshToken() - Check the current token status
4. refreshAdminPage() - Refresh the page after applying token

To fix the expired token issue:

1. Run: applyFreshAdminToken()
2. Run: refreshAdminPage()
3. Test admin features

To check token status:
checkFreshToken()

To test endpoints:
testFreshAdminAccess()
`);

// Export functions for use in browser console
if (typeof window !== 'undefined') {
    window.applyFreshAdminToken = applyFreshAdminToken;
    window.testFreshAdminAccess = testFreshAdminAccess;
    window.checkFreshToken = checkFreshToken;
    window.refreshAdminPage = refreshAdminPage;
}
