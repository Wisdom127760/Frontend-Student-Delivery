#!/usr/bin/env node

/**
 * Script to upgrade wisdom@greep.io to super_admin role
 * 
 * This script will:
 * 1. Find the user by email
 * 2. Update their userType from 'admin' to 'super_admin'
 * 3. Update their role field to 'super_admin' as well
 * 4. Add super admin permissions
 * 
 * Usage:
 * node scripts/upgradeToSuperAdmin.js
 * 
 * Or with custom API URL:
 * REACT_APP_API_URL=http://your-api-url node scripts/upgradeToSuperAdmin.js
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const TARGET_EMAIL = 'wisdom@greep.io';

console.log('🚀 Starting Super Admin Upgrade Script');
console.log('📧 Target Email:', TARGET_EMAIL);
console.log('🌐 API URL:', API_BASE_URL);
console.log('');

async function upgradeToSuperAdmin() {
    try {
        console.log('🔍 Step 1: Finding user by email...');

        // First, let's try to find the user
        const findUserResponse = await fetch(`${API_BASE_URL}/admin/management/admins`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Note: You might need to add authentication headers here
                // 'Authorization': 'Bearer YOUR_TOKEN'
            }
        });

        if (!findUserResponse.ok) {
            console.log('⚠️ Could not fetch admin users list. Trying direct update approach...');

            // If we can't list users, try to update directly using the user ID from the debug info
            const userId = '688973b69cd2d8234f26bd39'; // From the debug panel
            await updateUserDirectly(userId);
            return;
        }

        const usersData = await findUserResponse.json();
        console.log('📋 Found admin users:', usersData);

        // Find the target user
        const targetUser = usersData.data?.find(user => user.email === TARGET_EMAIL) ||
            usersData.find(user => user.email === TARGET_EMAIL);

        if (!targetUser) {
            console.error('❌ User not found with email:', TARGET_EMAIL);
            console.log('📋 Available users:');
            const users = usersData.data || usersData;
            users.forEach(user => console.log(`  - ${user.email} (${user.userType || user.role})`));
            return;
        }

        console.log('✅ Found user:', {
            id: targetUser._id || targetUser.id,
            email: targetUser.email,
            currentRole: targetUser.userType || targetUser.role
        });

        console.log('');
        console.log('🔄 Step 2: Updating user to super_admin...');

        // Update the user
        await updateUserDirectly(targetUser._id || targetUser.id);

    } catch (error) {
        console.error('❌ Error in upgrade process:', error.message);
        console.error('📋 Full error:', error);

        // Try direct update as fallback
        console.log('');
        console.log('🔄 Trying direct update approach...');
        const userId = '688973b69cd2d8234f26bd39';
        await updateUserDirectly(userId);
    }
}

async function updateUserDirectly(userId) {
    try {
        const updateData = {
            userType: 'super_admin',
            role: 'super_admin',
            permissions: [
                'create_delivery',
                'edit_delivery',
                'delete_delivery',
                'manage_drivers',
                'view_analytics',
                'manage_remittances',
                'manage_admins',
                'manage_system_settings',
                'manage_earnings_config'
            ]
        };

        console.log('📤 Sending update request:', updateData);

        const updateResponse = await fetch(`${API_BASE_URL}/admin/management/admins/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // Note: You might need to add authentication headers here
                // 'Authorization': 'Bearer YOUR_TOKEN'
            },
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('❌ Update failed:', updateResponse.status, errorText);

            // Try alternative endpoint
            console.log('🔄 Trying alternative endpoint...');
            await tryAlternativeUpdate(userId, updateData);
            return;
        }

        const result = await updateResponse.json();
        console.log('✅ Update successful!');
        console.log('📋 Result:', result);

    } catch (error) {
        console.error('❌ Direct update failed:', error.message);
        await tryAlternativeUpdate(userId, {
            userType: 'super_admin',
            role: 'super_admin'
        });
    }
}

async function tryAlternativeUpdate(userId, updateData) {
    try {
        console.log('🔄 Trying alternative API endpoints...');

        // Try different possible endpoints
        const endpoints = [
            `${API_BASE_URL}/admin/users/${userId}`,
            `${API_BASE_URL}/users/${userId}`,
            `${API_BASE_URL}/admin/update-user/${userId}`,
            `${API_BASE_URL}/auth/update-user/${userId}`
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`🔍 Trying endpoint: ${endpoint}`);

                const response = await fetch(endpoint, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Success with endpoint:', endpoint);
                    console.log('📋 Result:', result);
                    return;
                } else {
                    console.log(`❌ Failed with ${response.status}: ${endpoint}`);
                }
            } catch (error) {
                console.log(`❌ Error with endpoint ${endpoint}:`, error.message);
            }
        }

        console.log('');
        console.log('⚠️ All API endpoints failed. You may need to:');
        console.log('1. Check your API server is running');
        console.log('2. Update the API_BASE_URL in this script');
        console.log('3. Add proper authentication headers');
        console.log('4. Update the user directly in your database');

    } catch (error) {
        console.error('❌ Alternative update failed:', error.message);
    }
}

// Run the script
upgradeToSuperAdmin().then(() => {
    console.log('');
    console.log('🎉 Script completed!');
    console.log('📝 Next steps:');
    console.log('1. Refresh your admin panel');
    console.log('2. Log out and log back in');
    console.log('3. Check that Remittances and Settings are now visible');
}).catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
});
