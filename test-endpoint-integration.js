// Test Script: Verify Earnings Calculation Endpoint Integration
// This script tests if the backend endpoint is properly integrated

const API_BASE_URL = 'http://localhost:3001/api'; // Adjust to your backend URL

async function testEndpointIntegration() {
    try {
        console.log('🧪 Testing earnings calculation endpoint integration...');

        // Test 1: Check if endpoint exists (should return 401 if not authenticated, not 404)
        console.log('\n📋 Test 1: Checking if endpoint exists...');

        const response = await fetch(`${API_BASE_URL}/driver/earnings/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 404) {
            console.error('❌ Endpoint not found (404) - Backend integration needed!');
            console.log('💡 Follow the steps in BACKEND_INTEGRATION_STEPS.md');
            return;
        } else if (response.status === 401) {
            console.log('✅ Endpoint exists! (401 Unauthorized - expected without token)');
        } else {
            console.log(`✅ Endpoint exists! (Status: ${response.status})`);
        }

        // Test 2: Check if you can get a token from localStorage
        console.log('\n📋 Test 2: Checking authentication...');

        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                console.log('✅ Token found in localStorage');
                console.log('💡 You can now test with authentication by running:');
                console.log('   testAuthenticatedEarningsCalculation()');
            } else {
                console.log('⚠️ No token found - please log in first');
            }
        } else {
            console.log('⚠️ Running in Node.js environment - cannot access localStorage');
        }

        console.log('\n🎯 Next Steps:');
        console.log('1. Add the endpoint to your backend (see BACKEND_INTEGRATION_STEPS.md)');
        console.log('2. Restart your backend server');
        console.log('3. Test with authentication using the frontend');

    } catch (error) {
        console.error('❌ Test failed:', error.message);

        if (error.message.includes('fetch')) {
            console.log('💡 Make sure your backend server is running on the correct port');
        }
    }
}

async function testAuthenticatedEarningsCalculation() {
    try {
        console.log('🧪 Testing authenticated earnings calculation...');

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ No token found - please log in first');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/driver/earnings/calculate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Earnings calculation successful!');
            console.log('💰 Results:', result.data);
            console.log(`📦 Deliveries processed: ${result.data.deliveriesProcessed}`);
            console.log(`💰 Total earnings calculated: ₺${result.data.totalEarningsCalculated}`);
        } else {
            console.error('❌ Earnings calculation failed:', result.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Instructions for testing:
console.log(`
🧪 EARNINGS ENDPOINT INTEGRATION TEST

This script verifies that the earnings calculation endpoint is properly integrated.

To test:

1. Make sure your backend server is running
2. Open your browser's developer console (F12)
3. Copy and paste this code:

${testEndpointIntegration.toString()}

4. Then run: testEndpointIntegration()

If you're logged in, you can also test with authentication:
${testAuthenticatedEarningsCalculation.toString()}

Then run: testAuthenticatedEarningsCalculation()
`);

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.testEndpointIntegration = testEndpointIntegration;
    window.testAuthenticatedEarningsCalculation = testAuthenticatedEarningsCalculation;
}

