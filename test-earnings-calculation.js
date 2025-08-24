// Test Script: Manual Earnings Calculation
// Run this script to manually calculate earnings for completed deliveries

const API_BASE_URL = 'http://localhost:5000/api'; // Adjust to your backend URL

async function testEarningsCalculation() {
    try {
        console.log('🧪 Testing earnings calculation...');

        // You'll need to get a valid token from your login
        const token = localStorage.getItem('token'); // Get from browser console

        if (!token) {
            console.error('❌ No token found. Please log in first and get the token from localStorage');
            return;
        }

        // Test the earnings calculation endpoint
        const response = await fetch(`${API_BASE_URL}/driver/earnings/calculate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Earnings calculation successful:', result.data);
            console.log(`💰 Total earnings calculated: ${result.data.totalEarningsCalculated}`);
            console.log(`📦 Deliveries processed: ${result.data.deliveriesProcessed}`);
        } else {
            console.error('❌ Earnings calculation failed:', result.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Instructions for manual testing:
console.log(`
🧪 MANUAL EARNINGS CALCULATION TEST

To test earnings calculation:

1. Open your browser's developer console (F12)
2. Make sure you're logged in as a driver
3. Copy and paste this code:

${testEarningsCalculation.toString()}

4. Then run: testEarningsCalculation()

This will trigger earnings calculation for your completed deliveries.
`);

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.testEarningsCalculation = testEarningsCalculation;
}
