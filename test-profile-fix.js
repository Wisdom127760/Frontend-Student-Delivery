// Test Profile Route Fix
// This script tests if the profile route fix is working

const API_BASE_URL = 'http://localhost:3001/api';

// The correct admin token
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ODk3M2I2OWNkMmQ4MjM0ZjI2YmQzOSIsImVtYWlsIjoid2lzZG9tQGdyZWVwLmlvIiwidXNlclR5cGUiOiJhZG1pbiIsIm5hbWUiOiJTdXBlciBBZG1pbiIsInJvbGUiOiJzdXBlcl9hZG1pbiIsInBlcm1pc3Npb25zIjpbImFsbCIsImNyZWF0ZV9kZWxpdmVyeSIsImVkaXRfZGVsaXZlcnkiLCJkZWxldGVfZGVsaXZlcnkiLCJtYW5hZ2VfZHJpdmVycyIsInZpZXdfYW5hbHl0aWNzIiwiYWlfdmVyaWZpY2F0aW9uIl0sImlhdCI6MTc1NTk0NjAzOSwiZXhwIjoxNzU2NTUwODM5fQ.IUEI1LA50soL35odd1LcqsdoITK2um6jZYGEUpkHRDU';

async function testProfileFix() {
    try {
        console.log('🧪 Testing Profile Route Fix...');

        // Test 1: Test the correct profile route
        console.log('\n📋 Test 1: Testing correct profile route...');
        const profileResponse = await fetch(`${API_BASE_URL}/auth/profile/688973b69cd2d8234f26bd39`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Profile route status:', profileResponse.status);
        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('✅ Profile route working correctly');
            console.log('📋 Profile data:', profileData);
        } else {
            const errorData = await profileResponse.json();
            console.log('❌ Profile route still failing:', errorData);
        }

        // Test 2: Test the old wrong route (should still fail)
        console.log('\n📋 Test 2: Testing old wrong route...');
        const wrongRouteResponse = await fetch(`${API_BASE_URL}/profile/688973b69cd2d8234f26bd39`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Wrong route status:', wrongRouteResponse.status);
        if (wrongRouteResponse.status === 404) {
            console.log('✅ Wrong route correctly returns 404 (as expected)');
        } else {
            console.log('⚠️ Wrong route unexpectedly working');
        }

        // Test 3: Test admin notifications
        console.log('\n📋 Test 3: Testing admin notifications...');
        const notificationsResponse = await fetch(`${API_BASE_URL}/admin/notifications?limit=5`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Notifications status:', notificationsResponse.status);
        if (notificationsResponse.ok) {
            console.log('✅ Admin notifications working correctly');
        } else {
            console.log('❌ Admin notifications failing');
        }

        console.log('\n🎯 Profile Route Fix Test Complete!');
        console.log('\n💡 Next Steps:');
        console.log('1. Refresh your admin page');
        console.log('2. The profile should now load correctly');
        console.log('3. All admin features should work');

    } catch (error) {
        console.error('❌ Profile fix test failed:', error);
    }
}

// Instructions for use
console.log(`
🧪 PROFILE ROUTE FIX TEST

This script tests if the profile route fix is working.

To test the fix:

1. Run: testProfileFix()

Expected results:
- ✅ Profile route should return 200
- ✅ Wrong route should return 404
- ✅ Admin notifications should work

After the test passes:
1. Refresh your admin page
2. Profile should load correctly
3. All admin features should work
`);

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.testProfileFix = testProfileFix;
}
