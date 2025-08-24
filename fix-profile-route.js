// Fix Profile Route Script
// This script helps identify and fix the missing profile route issue

const API_BASE_URL = 'http://localhost:3001/api';

async function diagnoseProfileRoute() {
    try {
        console.log('🔍 Diagnosing Profile Route Issue...');

        // Test 1: Check if server is running
        console.log('\n📋 Test 1: Server health check...');
        try {
            const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
            console.log('📊 Health endpoint status:', healthResponse.status);
            if (healthResponse.ok) {
                console.log('✅ Server is running');
            } else {
                console.log('❌ Server health check failed');
            }
        } catch (error) {
            console.log('❌ Server not reachable:', error.message);
            return;
        }

        // Test 2: Check available routes
        console.log('\n📋 Test 2: Testing different profile route patterns...');

        const routeTests = [
            '/profile/688973b69cd2d8234f26bd39',
            '/auth/profile/688973b69cd2d8234f26bd39',
            '/user/profile/688973b69cd2d8234f26bd39',
            '/admin/profile/688973b69cd2d8234f26bd39',
            '/users/688973b69cd2d8234f26bd39',
            '/user/688973b69cd2d8234f26bd39'
        ];

        for (const route of routeTests) {
            try {
                const response = await fetch(`${API_BASE_URL}${route}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`📊 ${route}: ${response.status}`);
                if (response.status === 401) {
                    console.log(`✅ Route exists but requires authentication: ${route}`);
                } else if (response.status === 404) {
                    console.log(`❌ Route not found: ${route}`);
                } else {
                    console.log(`✅ Route exists: ${route}`);
                }
            } catch (error) {
                console.log(`❌ Error testing ${route}:`, error.message);
            }
        }

        // Test 3: Check admin routes
        console.log('\n📋 Test 3: Testing admin routes...');

        const adminRoutes = [
            '/admin/notifications',
            '/admin/dashboard',
            '/admin/users',
            '/system-settings/admin'
        ];

        for (const route of adminRoutes) {
            try {
                const response = await fetch(`${API_BASE_URL}${route}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`📊 ${route}: ${response.status}`);
                if (response.status === 401) {
                    console.log(`✅ Admin route exists but requires authentication: ${route}`);
                } else if (response.status === 404) {
                    console.log(`❌ Admin route not found: ${route}`);
                } else {
                    console.log(`✅ Admin route exists: ${route}`);
                }
            } catch (error) {
                console.log(`❌ Error testing ${route}:`, error.message);
            }
        }

        console.log('\n🎯 Diagnosis Complete!');
        console.log('\n💡 Solutions:');
        console.log('1. If routes return 401, they exist but need authentication');
        console.log('2. If routes return 404, they need to be added to your backend');
        console.log('3. Check your backend route registration');

    } catch (error) {
        console.error('❌ Diagnosis failed:', error);
    }
}

async function testWithAuth() {
    try {
        console.log('\n🧪 Testing with Authentication...');

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('❌ No token found - please apply admin token first');
            return;
        }

        console.log('🔑 Using token:', token.substring(0, 20) + '...');

        // Test profile route with auth
        const profileResponse = await fetch(`${API_BASE_URL}/profile/688973b69cd2d8234f26bd39`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Profile with auth status:', profileResponse.status);
        if (profileResponse.ok) {
            const data = await profileResponse.json();
            console.log('✅ Profile data:', data);
        } else {
            const error = await profileResponse.json();
            console.log('❌ Profile error:', error);
        }

    } catch (error) {
        console.error('❌ Auth test failed:', error);
    }
}

function showBackendFixInstructions() {
    console.log(`
🔧 BACKEND PROFILE ROUTE FIX

The issue is that your backend doesn't have the profile route registered.

Here's how to fix it:

1. **Check your backend route files:**
   - Look for routes in: src/routes/auth.js, src/routes/user.js, src/routes/admin.js
   - Find where profile routes should be defined

2. **Add the missing profile route:**
   
   In your backend, add this route to the appropriate file:

   // In src/routes/auth.js or src/routes/user.js
   router.get('/profile/:userId', authenticateToken, async (req, res) => {
       try {
           const { userId } = req.params;
           const user = await User.findById(userId);
           
           if (!user) {
               return res.status(404).json({ 
                   success: false, 
                   message: 'User not found' 
               });
           }
           
           res.json({
               success: true,
               data: {
                   id: user._id,
                   name: user.name,
                   email: user.email,
                   userType: user.userType,
                   role: user.role
               }
           });
       } catch (error) {
           res.status(500).json({ 
               success: false, 
               message: error.message 
           });
       }
   });

3. **Register the route in your main app:**
   
   In your main app file (src/app.js or index.js):
   
   app.use('/api/profile', profileRoutes);
   // or
   app.use('/api/auth', authRoutes); // if profile is in auth routes

4. **Restart your backend server:**
   npm start

5. **Test the route:**
   The route should now be accessible at /api/profile/:userId
`);
}

// Instructions for use
console.log(`
🔍 PROFILE ROUTE DIAGNOSIS SCRIPT

This script helps identify why the profile route is returning 404.

Available functions:

1. diagnoseProfileRoute() - Test different route patterns
2. testWithAuth() - Test with authentication token
3. showBackendFixInstructions() - Show backend fix instructions

To diagnose the issue:

1. Run: diagnoseProfileRoute()
2. Check which routes exist and which don't
3. Run: showBackendFixInstructions()
4. Follow the instructions to add the missing route

To test with authentication:
testWithAuth()
`);

// Export functions for use in browser console
if (typeof window !== 'undefined') {
    window.diagnoseProfileRoute = diagnoseProfileRoute;
    window.testWithAuth = testWithAuth;
    window.showBackendFixInstructions = showBackendFixInstructions;
}
