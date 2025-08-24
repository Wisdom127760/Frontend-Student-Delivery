// Fix Frontend API Calls Script
// This script helps update frontend API calls to use the correct routes

// The correct admin token
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ODk3M2I2OWNkMmQ4MjM0ZjI2YmQzOSIsImVtYWlsIjoid2lzZG9tQGdyZWVwLmlvIiwidXNlclR5cGUiOiJhZG1pbiIsIm5hbWUiOiJTdXBlciBBZG1pbiIsInJvbGUiOiJzdXBlcl9hZG1pbiIsInBlcm1pc3Npb25zIjpbImFsbCIsImNyZWF0ZV9kZWxpdmVyeSIsImVkaXRfZGVsaXZlcnkiLCJkZWxldGVfZGVsaXZlcnkiLCJtYW5hZ2VfZHJpdmVycyIsInZpZXdfYW5hbHl0aWNzIiwiYWlfdmVyaWZpY2F0aW9uIl0sImlhdCI6MTc1NTk0NjAzOSwiZXhwIjoxNzU2NTUwODM5fQ.IUEI1LA50soL35odd1LcqsdoITK2um6jZYGEUpkHRDU';

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

// Function to apply the correct admin token and test routes
function fixAdminAccess() {
    try {
        console.log('🔧 Fixing Admin Access...');

        // Apply the correct admin token
        localStorage.setItem('token', ADMIN_TOKEN);
        localStorage.setItem('user', JSON.stringify(ADMIN_USER));
        localStorage.setItem('isAuthenticated', 'true');

        console.log('✅ Admin token applied');
        console.log('✅ User data stored');
        console.log('✅ Authentication status set');

        // Test the correct routes
        testCorrectRoutes();

    } catch (error) {
        console.error('❌ Failed to fix admin access:', error);
    }
}

// Function to test the correct API routes
async function testCorrectRoutes() {
    try {
        console.log('\n🧪 Testing Correct API Routes...');

        const API_BASE_URL = 'http://localhost:3001/api';

        // Test 1: Correct profile route
        console.log('\n📋 Test 1: Correct profile route...');
        const profileResponse = await fetch(`${API_BASE_URL}/auth/profile/688973b69cd2d8234f26bd39`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Profile route status:', profileResponse.status);
        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('✅ Profile access successful');
            console.log('📋 Profile data:', profileData);
        } else {
            const errorData = await profileResponse.json();
            console.log('❌ Profile access failed:', errorData);
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
            const notificationsData = await notificationsResponse.json();
            console.log('✅ Notifications access successful');
            console.log('📋 Notifications data:', notificationsData);
        } else {
            const errorData = await notificationsResponse.json();
            console.log('❌ Notifications access failed:', errorData);
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
            const settingsData = await settingsResponse.json();
            console.log('✅ Settings access successful');
            console.log('📋 Settings data:', settingsData);
        } else {
            const errorData = await settingsResponse.json();
            console.log('❌ Settings access failed:', errorData);
        }

        console.log('\n🎯 All API Routes Tested!');

    } catch (error) {
        console.error('❌ API route testing failed:', error);
    }
}

// Function to show the correct API endpoints
function showCorrectEndpoints() {
    console.log(`
📋 CORRECT API ENDPOINTS

The issue was that your frontend was using the wrong route. Here are the correct endpoints:

✅ WORKING ENDPOINTS:

1. Admin Profile:
   GET /api/auth/profile/688973b69cd2d8234f26bd39
   (NOT /api/profile/688973b69cd2d8234f26bd39)

2. Admin Notifications:
   GET /api/admin/notifications?limit=10

3. System Settings:
   GET /api/system-settings/admin

❌ WRONG ENDPOINTS (that were causing 404):

1. /api/profile/688973b69cd2d8234f26bd39
2. /api/notifications
3. Any route without proper authentication

🔧 FRONTEND FIXES NEEDED:

1. Update profileService.js:
   Change from: /api/profile/${userId}
   Change to: /api/auth/profile/${userId}

2. Update api.js:
   Change any /api/profile calls to /api/auth/profile

3. Update any other services that use the wrong routes
`);
}

// Function to refresh the page after applying fixes
function refreshPage() {
    console.log('🔄 Refreshing page to apply changes...');
    window.location.reload();
}

// Function to check current token status
function checkCurrentStatus() {
    try {
        console.log('🔍 Checking Current Status...');

        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        console.log('📋 Token exists:', !!token);
        console.log('📋 User data:', user);
        console.log('📋 User type:', user.userType);
        console.log('📋 User role:', user.role);

        if (token) {
            console.log('🔑 Token preview:', token.substring(0, 20) + '...');
        }

    } catch (error) {
        console.error('❌ Failed to check status:', error);
    }
}

// Instructions for use
console.log(`
🔧 FRONTEND API FIX SCRIPT

This script fixes the admin access by using the correct API routes.

Available functions:

1. fixAdminAccess() - Apply correct token and test routes
2. testCorrectRoutes() - Test all working API endpoints
3. showCorrectEndpoints() - Show the correct API endpoints
4. refreshPage() - Refresh the page after applying fixes
5. checkCurrentStatus() - Check current token and user status

To fix your admin access:

1. Run: fixAdminAccess()
2. Run: refreshPage()
3. Test admin features

To see correct endpoints:
showCorrectEndpoints()

To check current status:
checkCurrentStatus()
`);

// Export functions for use in browser console
if (typeof window !== 'undefined') {
    window.fixAdminAccess = fixAdminAccess;
    window.testCorrectRoutes = testCorrectRoutes;
    window.showCorrectEndpoints = showCorrectEndpoints;
    window.refreshPage = refreshPage;
    window.checkCurrentStatus = checkCurrentStatus;
}
