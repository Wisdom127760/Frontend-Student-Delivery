// Test Script: Verify Earnings Calculation with Correct Business Rules
// This script tests the earnings calculation using your actual business rules

const API_BASE_URL = 'http://localhost:5000/api'; // Adjust to your backend URL

async function testCorrectEarningsCalculation() {
    try {
        console.log('🧪 Testing earnings calculation with correct business rules...');

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
            console.log('✅ Earnings calculation successful with business rules!');
            console.log('💰 Results:', result.data);
            console.log(`📦 Deliveries processed: ${result.data.deliveriesProcessed}`);
            console.log(`💰 Total earnings calculated: ₺${result.data.totalEarningsCalculated}`);
            console.log('📊 Earnings config used:', result.data.earningsConfig);

            // Test different fee scenarios
            console.log('\n🧪 Testing different fee scenarios:');
            testFeeScenarios(result.data.earningsConfig);

        } else {
            console.error('❌ Earnings calculation failed:', result.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

function testFeeScenarios(earningsConfig) {
    console.log('\n📊 Fee Calculation Examples:');

    const testFees = [50, 100, 125, 150, 200, 500];

    testFees.forEach(fee => {
        let baseEarnings = 0;
        let rule = '';

        // Find applicable rule
        const applicableRule = earningsConfig.rules.find(rule => {
            if (rule.maxAmount === null) {
                return fee >= rule.minAmount;
            }
            return fee >= rule.minAmount && fee <= rule.maxAmount;
        });

        if (applicableRule) {
            if (applicableRule.driverFixed) {
                baseEarnings = applicableRule.driverFixed;
                rule = `Fixed: ₺${applicableRule.driverFixed}`;
            } else if (applicableRule.driverPercentage) {
                baseEarnings = fee * (applicableRule.driverPercentage / 100);
                rule = `${applicableRule.driverPercentage}%`;
            }
        }

        // Add potential bonuses
        const priorityBonus = earningsConfig.bonuses.priority || 0;
        const speedBonus = earningsConfig.bonuses.speed || 0;
        const ratingBonus = earningsConfig.bonuses.rating || 0;
        const totalBonuses = priorityBonus + speedBonus + ratingBonus;

        const totalEarnings = baseEarnings + totalBonuses;

        console.log(`₺${fee} delivery:`);
        console.log(`  Base: ₺${baseEarnings} (${rule})`);
        console.log(`  Bonuses: ₺${totalBonuses} (Priority: ₺${priorityBonus}, Speed: ₺${speedBonus}, Rating: ₺${ratingBonus})`);
        console.log(`  Total: ₺${totalEarnings}`);
        console.log('');
    });
}

// Instructions for manual testing:
console.log(`
🧪 CORRECT EARNINGS CALCULATION TEST

This test verifies that earnings are calculated using your actual business rules:

📊 Business Rules:
- ₺0-₺100: 60% to driver, 40% to company
- ₺101-₺150: ₺100 fixed to driver, ₺50 to company  
- ₺151+: 60% to driver, 40% to company

🎁 Bonuses:
- Priority: ₺10 for high priority deliveries
- Speed: ₺5 for completion < 2 hours
- Rating: ₺2 for rating >= 4.5

To test:

1. Open your browser's developer console (F12)
2. Make sure you're logged in as a driver
3. Copy and paste this code:

${testCorrectEarningsCalculation.toString()}

4. Then run: testCorrectEarningsCalculation()

This will trigger earnings calculation using your actual business rules.
`);

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.testCorrectEarningsCalculation = testCorrectEarningsCalculation;
}
