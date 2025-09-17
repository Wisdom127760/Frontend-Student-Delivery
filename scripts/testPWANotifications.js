#!/usr/bin/env node

/**
 * Test script for PWA delivery notifications
 * 
 * This script will:
 * 1. Check if the PWA is properly configured
 * 2. Test notification permissions
 * 3. Send test delivery notifications
 * 4. Verify service worker is working
 * 
 * Usage:
 * node scripts/testPWANotifications.js
 * 
 * Or with custom API URL:
 * REACT_APP_API_URL=http://your-api-url node scripts/testPWANotifications.js
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

console.log('🧪 Starting PWA Notification Test Script');
console.log('🌐 API URL:', API_BASE_URL);
console.log('');

async function testPWANotifications() {
    try {
        console.log('🔍 Step 1: Checking PWA configuration...');
        await checkPWAConfiguration();

        console.log('');
        console.log('🔍 Step 2: Testing notification permissions...');
        await testNotificationPermissions();

        console.log('');
        console.log('🔍 Step 3: Testing delivery notification endpoints...');
        await testDeliveryNotificationEndpoints();

        console.log('');
        console.log('🔍 Step 4: Sending test notifications...');
        await sendTestNotifications();

        console.log('');
        console.log('✅ PWA Notification Test Completed!');
        console.log('');
        console.log('📝 Next steps:');
        console.log('1. Open your PWA in a browser');
        console.log('2. Check that notifications are enabled');
        console.log('3. Create a test delivery to verify notifications work');
        console.log('4. Check browser console for any errors');

    } catch (error) {
        console.error('❌ Error in PWA notification test:', error.message);
        console.error('📋 Full error:', error);
        process.exit(1);
    }
}

async function checkPWAConfiguration() {
    try {
        // Check if manifest.json exists and is accessible
        const manifestResponse = await fetch('/manifest.json');
        if (manifestResponse.ok) {
            const manifest = await manifestResponse.json();
            console.log('✅ Manifest.json found:', manifest.name);
            console.log('   - Short name:', manifest.short_name);
            console.log('   - Display mode:', manifest.display);
            console.log('   - Notifications permission:', manifest.permissions?.includes('notifications') ? 'Yes' : 'No');
        } else {
            console.log('❌ Manifest.json not accessible');
        }

        // Check if service worker exists
        const swResponse = await fetch('/service-worker.js');
        if (swResponse.ok) {
            console.log('✅ Service worker found');
        } else {
            console.log('❌ Service worker not accessible');
        }

    } catch (error) {
        console.log('⚠️ Could not check PWA configuration (this is normal when running outside browser)');
    }
}

async function testNotificationPermissions() {
    try {
        // Test the notification permission endpoint
        const response = await fetch(`${API_BASE_URL}/driver/notification-permission`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Note: You might need to add authentication headers here
                // 'Authorization': 'Bearer YOUR_TOKEN'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Notification permission endpoint accessible');
            console.log('   - Response:', data);
        } else {
            console.log('⚠️ Notification permission endpoint not accessible:', response.status);
        }

    } catch (error) {
        console.log('⚠️ Could not test notification permissions:', error.message);
    }
}

async function testDeliveryNotificationEndpoints() {
    try {
        // Test push subscription endpoint
        const subscriptionResponse = await fetch(`${API_BASE_URL}/driver/push-subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Note: You might need to add authentication headers here
                // 'Authorization': 'Bearer YOUR_TOKEN'
            },
            body: JSON.stringify({
                test: true,
                message: 'Testing push subscription endpoint'
            })
        });

        if (subscriptionResponse.ok) {
            console.log('✅ Push subscription endpoint accessible');
        } else {
            console.log('⚠️ Push subscription endpoint not accessible:', subscriptionResponse.status);
        }

        // Test delivery broadcast endpoint
        const broadcastResponse = await fetch(`${API_BASE_URL}/admin/deliveries/broadcast`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Note: You might need to add authentication headers here
                // 'Authorization': 'Bearer YOUR_TOKEN'
            },
            body: JSON.stringify({
                test: true,
                message: 'Testing delivery broadcast endpoint'
            })
        });

        if (broadcastResponse.ok) {
            console.log('✅ Delivery broadcast endpoint accessible');
        } else {
            console.log('⚠️ Delivery broadcast endpoint not accessible:', broadcastResponse.status);
        }

    } catch (error) {
        console.log('⚠️ Could not test delivery notification endpoints:', error.message);
    }
}

async function sendTestNotifications() {
    try {
        // Send test delivery broadcast
        const testDelivery = {
            deliveryId: 'test-' + Date.now(),
            deliveryCode: 'TEST-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            pickupLocation: 'Test Pickup Location',
            deliveryLocation: 'Test Delivery Location',
            customerName: 'Test Customer',
            customerPhone: '+90 555 123 4567',
            fee: 25,
            driverEarning: 20,
            companyEarning: 5,
            paymentMethod: 'cash',
            priority: 'normal',
            notes: 'This is a test delivery notification',
            estimatedTime: new Date(Date.now() + 3600000).toISOString(),
            broadcastDuration: 60,
            createdAt: new Date().toISOString()
        };

        console.log('📤 Sending test delivery broadcast...');
        console.log('   - Delivery Code:', testDelivery.deliveryCode);
        console.log('   - Pickup:', testDelivery.pickupLocation);
        console.log('   - Delivery:', testDelivery.deliveryLocation);
        console.log('   - Fee:', testDelivery.fee);

        const response = await fetch(`${API_BASE_URL}/admin/deliveries/broadcast`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Note: You might need to add authentication headers here
                // 'Authorization': 'Bearer YOUR_TOKEN'
            },
            body: JSON.stringify({
                ...testDelivery,
                isTest: true
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Test delivery broadcast sent successfully');
            console.log('   - Response:', result);
        } else {
            const errorText = await response.text();
            console.log('⚠️ Test delivery broadcast failed:', response.status, errorText);
        }

    } catch (error) {
        console.log('⚠️ Could not send test notifications:', error.message);
    }
}

// Browser-specific tests (these will only work when run in a browser)
function runBrowserTests() {
    console.log('');
    console.log('🌐 Browser-specific tests:');
    console.log('');

    // Check if running in browser
    if (typeof window !== 'undefined') {
        console.log('✅ Running in browser environment');

        // Check service worker support
        if ('serviceWorker' in navigator) {
            console.log('✅ Service Worker supported');

            // Check if service worker is registered
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration) {
                    console.log('✅ Service Worker registered');
                    console.log('   - Scope:', registration.scope);
                    console.log('   - Active:', !!registration.active);
                    console.log('   - Waiting:', !!registration.waiting);
                } else {
                    console.log('❌ Service Worker not registered');
                }
            });
        } else {
            console.log('❌ Service Worker not supported');
        }

        // Check push notification support
        if ('PushManager' in window) {
            console.log('✅ Push Manager supported');
        } else {
            console.log('❌ Push Manager not supported');
        }

        // Check notification support
        if ('Notification' in window) {
            console.log('✅ Notifications supported');
            console.log('   - Permission:', Notification.permission);
        } else {
            console.log('❌ Notifications not supported');
        }

        // Check PWA installation
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('✅ PWA is installed (standalone mode)');
        } else {
            console.log('ℹ️ PWA is not installed (running in browser)');
        }

    } else {
        console.log('ℹ️ Not running in browser - browser tests skipped');
    }
}

// Run the script
testPWANotifications().then(() => {
    runBrowserTests();
    console.log('');
    console.log('🏁 Test script execution completed');
}).catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
});
