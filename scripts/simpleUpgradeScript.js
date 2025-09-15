// Simple Super Admin Upgrade Script
// Copy and paste this entire script into your browser console

console.log('🚀 Starting Super Admin Upgrade');

try {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('👤 Current user:', currentUser);

    // Update user role
    const updatedUser = {
        ...currentUser,
        userType: 'super_admin',
        role: 'super_admin'
    };

    // Save updated user
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('✅ Updated user role to super_admin');
    console.log('📋 New user data:', updatedUser);

    console.log('🔄 Now refresh the page (F5) to see Remittances and Settings in your menu');

} catch (error) {
    console.error('❌ Error:', error);
}
