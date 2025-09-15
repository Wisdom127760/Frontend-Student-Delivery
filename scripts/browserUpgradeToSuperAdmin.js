/**
 * Simple Browser Script to Upgrade to Super Admin (No Auto-Refresh)
 * 
 * Instructions:
 * 1. Open your admin panel (localhost:3000/admin)
 * 2. Open browser console (F12 -> Console)
 * 3. Copy and paste this script
 * 4. Press Enter to run
 * 5. If successful, manually refresh the page
 */

function upgradeToSuperAdmin() {
    console.log('🚀 Starting Super Admin Upgrade Script');

    try {
        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('👤 Current user:', currentUser);

        if (!currentUser.email) {
            console.error('❌ No user found in localStorage. Please log in first.');
            return false;
        }

        // Update user role in localStorage
        const updatedUser = {
            ...currentUser,
            userType: 'super_admin',
            role: 'super_admin'
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('✅ Successfully updated localStorage with super_admin role');
        console.log('📋 Updated user:', updatedUser);

        console.log('🔄 Please manually refresh the page to see the changes');
        console.log('🎯 You should now see Remittances and Settings in your navigation menu');

        return true;

    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

// Run the function
const success = upgradeToSuperAdmin();

if (success) {
    console.log('🎉 Script completed successfully!');
} else {
    console.log('💥 Script failed. Check the error messages above.');
}
