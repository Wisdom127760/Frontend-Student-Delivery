const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test driver leaderboard response structure
async function testDriverLeaderboardResponse() {
    try {
        console.log('🏆 Testing Driver Leaderboard Response Structure...\n');

        const periods = ['today', 'thisWeek', 'month', 'allTime'];

        for (const period of periods) {
            console.log(`📊 Testing Period: ${period.toUpperCase()}`);
            console.log('='.repeat(50));

            try {
                const response = await axios.get(`${API_BASE_URL}/driver/leaderboard?category=overall&period=${period}&limit=5`);

                console.log('✅ Response Status:', response.status);
                console.log('📋 Response Structure:');
                console.log(JSON.stringify(response.data, null, 2));

            } catch (error) {
                console.log('❌ Error Response:');
                console.log('Status:', error.response?.status);
                console.log('Message:', error.response?.data?.message || error.message);
                console.log('Full Error:', JSON.stringify(error.response?.data, null, 2));
            }

            console.log('\n' + '='.repeat(50) + '\n');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testDriverLeaderboardResponse();
