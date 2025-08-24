// Debug Script: Admin Authentication Issues
// This script helps identify why admin endpoints are returning 403 Forbidden

const API_BASE_URL = 'http://localhost:3001/api';

async function debugAdminAuthentication() {
    try {
        console.log('🔍 Debugging admin authentication issues...');

        // Check 1: Authentication token
        console.log('\n📋 Check 1: Authentication token...');
        const token = localStorage.getItem('token');
        if (token) {
            console.log('✅ Token found in localStorage');
            console.log('🔑 Token preview:', token.substring(0, 20) + '...');
        } else {
            console.error('❌ No token found - please log in first');
            return;
        }

        // Check 2: User data
        console.log('\n📋 Check 2: User data...');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('👤 User data:', user);
        console.log('🎭 User role/type:', user.role || user.userType || 'undefined');
        console.log('🆔 User ID:', user._id || user.id || 'undefined');

        // Check 3: Test basic profile endpoint
        console.log('\n📋 Check 3: Testing profile endpoint...');
        try {
            const profileResponse = await fetch(`${API_BASE_URL}/profile/${user._id || user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📊 Profile endpoint status:', profileResponse.status);
            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                console.log('✅ Profile data:', profileData);
            } else {
                const errorData = await profileResponse.json();
                console.log('❌ Profile error:', errorData);
            }
        } catch (error) {
            console.error('❌ Profile request failed:', error);
        }

        // Check 4: Test admin notifications endpoint
        console.log('\n📋 Check 4: Testing admin notifications...');
        try {
            const notificationsResponse = await fetch(`${API_BASE_URL}/admin/notifications?limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📊 Notifications endpoint status:', notificationsResponse.status);
            if (notificationsResponse.ok) {
                const notificationsData = await notificationsResponse.json();
                console.log('✅ Notifications data:', notificationsData);
            } else {
                const errorData = await notificationsResponse.json();
                console.log('❌ Notifications error:', errorData);
            }
        } catch (error) {
            console.error('❌ Notifications request failed:', error);
        }

        // Check 5: Test system settings endpoint
        console.log('\n📋 Check 5: Testing system settings...');
        try {
            const settingsResponse = await fetch(`${API_BASE_URL}/system-settings/admin`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📊 Settings endpoint status:', settingsResponse.status);
            if (settingsResponse.ok) {
                const settingsData = await settingsResponse.json();
                console.log('✅ Settings data:', settingsData);
            } else {
                const errorData = await settingsResponse.json();
                console.log('❌ Settings error:', errorData);
            }
        } catch (error) {
            console.error('❌ Settings request failed:', error);
        }

        // Check 6: Decode JWT token (if possible)
        console.log('\n📋 Check 6: JWT Token analysis...');
        try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                console.log('🔍 JWT Payload:', payload);
                console.log('👤 JWT User ID:', payload.id || payload.userId || payload.sub);
                console.log('🎭 JWT Role:', payload.role || payload.userType || payload.userRole);
                console.log('⏰ JWT Expires:', new Date(payload.exp * 1000));
                console.log('⏰ JWT Issued:', new Date(payload.iat * 1000));
            } else {
                console.log('⚠️ Token doesn\'t appear to be a valid JWT');
            }
        } catch (error) {
            console.log('⚠️ Could not decode JWT token:', error.message);
        }

        console.log('\n🎯 Summary:');
        console.log('If you\'re getting 403 errors, the issue is likely:');
        console.log('1. Backend middleware not recognizing your role');
        console.log('2. Token expired or invalid');
        console.log('3. Backend route protection too strict');
        console.log('4. Role mismatch between frontend and backend');

    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

async function testBackendAuthMiddleware() {
    try {
        console.log('🧪 Testing backend authentication middleware...');

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ No token found');
            return;
        }

        // Test a simple endpoint that should work
        console.log('\n📋 Testing simple endpoint...');
        const simpleResponse = await fetch(`${API_BASE_URL}/health`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Health endpoint status:', simpleResponse.status);

        // Test with different headers
        console.log('\n📋 Testing with different headers...');
        const headersResponse = await fetch(`${API_BASE_URL}/admin/notifications?limit=1`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Admin-Panel/1.0'
            }
        });

        console.log('📊 Headers test status:', headersResponse.status);
        if (!headersResponse.ok) {
            const errorText = await headersResponse.text();
            console.log('❌ Error response:', errorText);
        }

    } catch (error) {
        console.error('❌ Middleware test failed:', error);
    }
}

// Instructions for debugging:
console.log(`
🔍 ADMIN AUTHENTICATION DEBUG

This script helps identify why admin endpoints are returning 403 Forbidden.

To debug:

1. Make sure you're logged in as a super admin
2. Open your browser's developer console (F12)
3. Copy and paste this code:

${debugAdminAuthentication.toString()}

4. Then run: debugAdminAuthentication()

For additional middleware testing:
${testBackendAuthMiddleware.toString()}

Then run: testBackendAuthMiddleware()
`);

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.debugAdminAuthentication = debugAdminAuthentication;
    window.testBackendAuthMiddleware = testBackendAuthMiddleware;
}
