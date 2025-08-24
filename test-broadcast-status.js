const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test delivery broadcast status
async function testBroadcastStatus() {
    try {
        console.log('🔍 Testing Delivery Broadcast Status...\n');

        // You can replace this with an actual delivery ID from your database
        const deliveryId = 'YOUR_DELIVERY_ID_HERE'; // Replace with actual delivery ID

        if (deliveryId === 'YOUR_DELIVERY_ID_HERE') {
            console.log('⚠️  Please replace the deliveryId with an actual delivery ID from your database');
            console.log('   You can find delivery IDs in your MongoDB database or from the admin panel');
            return;
        }

        console.log(`📋 Checking broadcast status for delivery: ${deliveryId}`);

        try {
            const response = await axios.get(`${API_BASE_URL}/delivery/${deliveryId}/broadcast-status`);

            if (response.data.success) {
                const status = response.data.data;
                console.log('✅ Broadcast Status:');
                console.log(`   Delivery ID: ${status.deliveryId}`);
                console.log(`   Broadcast Status: ${status.broadcastStatus}`);
                console.log(`   Start Time: ${status.broadcastStartTime}`);
                console.log(`   End Time: ${status.broadcastEndTime}`);
                console.log(`   Is Expired: ${status.isExpired}`);
                console.log(`   Assigned To: ${status.assignedTo || 'None'}`);
                console.log(`   Delivery Status: ${status.status}`);
                console.log(`   Can Be Accepted: ${status.canBeAccepted}`);

                // Provide recommendations based on status
                console.log('\n💡 Recommendations:');
                switch (status.broadcastStatus) {
                    case 'not_started':
                        console.log('   - Start the broadcast using the admin panel');
                        break;
                    case 'broadcasting':
                        if (status.isExpired) {
                            console.log('   - Broadcast has expired, consider restarting');
                        } else if (status.assignedTo) {
                            console.log('   - Delivery already assigned to a driver');
                        } else {
                            console.log('   - Delivery is ready to be accepted by drivers');
                        }
                        break;
                    case 'accepted':
                        console.log('   - Delivery has been accepted by a driver');
                        break;
                    case 'expired':
                        console.log('   - Broadcast expired, consider manual assignment or restart');
                        break;
                    case 'manual_assignment':
                        console.log('   - Delivery was manually assigned, cannot be accepted via broadcast');
                        break;
                    default:
                        console.log('   - Unknown broadcast status');
                }
            } else {
                console.log('❌ Failed to get broadcast status:', response.data.error);
            }
        } catch (error) {
            console.log('❌ Error:', error.response?.data?.error || error.message);
        }

        // Test accepting the delivery
        console.log('\n📋 Testing delivery acceptance...');
        try {
            const acceptResponse = await axios.post(`${API_BASE_URL}/delivery/${deliveryId}/accept`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_DRIVER_TOKEN_HERE' // Replace with actual driver token
                }
            });

            if (acceptResponse.data.success) {
                console.log('✅ Delivery accepted successfully!');
            } else {
                console.log('❌ Failed to accept delivery:', acceptResponse.data.error);
            }
        } catch (error) {
            console.log('❌ Error accepting delivery:', error.response?.data?.error || error.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testBroadcastStatus();
