// Backend Profile Route Fix Template
// This file contains the code to add the missing profile route to your backend

/*
🔧 BACKEND PROFILE ROUTE FIX

The issue is that your backend doesn't have the profile route registered.
Here's the complete fix:

1. **Add this route to your backend file: src/routes/auth.js or src/routes/user.js**

*/

// Profile route implementation
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User'); // Adjust path as needed

// GET /api/profile/:userId - Get user profile by ID
router.get('/profile/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Return user profile data
        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                role: user.role,
                phone: user.phone,
                address: user.address,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Profile route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Alternative: If you want to put it in a separate profile routes file
// Create: src/routes/profile.js

/*
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/profile/:userId
router.get('/:userId', auth, async (req, res) => {
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
                role: user.role,
                phone: user.phone,
                address: user.address
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
*/

/*
2. **Register the route in your main app file: src/app.js or index.js**

Add one of these lines to your main app file:

// Option 1: If you added the route to auth.js
app.use('/api/auth', authRoutes);

// Option 2: If you created a separate profile.js file
app.use('/api/profile', profileRoutes);

// Option 3: If you want to add it directly to the main app
app.get('/api/profile/:userId', auth, async (req, res) => {
    // ... same implementation as above
});

*/

/*
3. **Complete example of how your main app file should look:**

const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile'); // if you created separate file
const adminRoutes = require('./routes/admin');

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes); // Add this line
app.use('/api/admin', adminRoutes);

// Error handling
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

module.exports = app;
*/

/*
4. **Test the route after implementation:**

```bash
# Test without auth (should return 401)
curl http://localhost:3001/api/profile/688973b69cd2d8234f26bd39

# Test with auth (should return 200)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/profile/688973b69cd2d8234f26bd39
```

5. **Expected response:**

```json
{
    "success": true,
    "data": {
        "id": "688973b69cd2d8234f26bd39",
        "name": "Super Admin",
        "email": "wisdom@greep.io",
        "userType": "admin",
        "role": "super_admin",
        "phone": "+1234567890",
        "address": "123 Admin Street"
    }
}
*/
