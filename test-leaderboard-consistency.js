const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test both leaderboard endpoints with different periods
async function testLeaderboardConsistency() {
    try {
        console.log('🏆 Testing Leaderboard Period-Specific Data...\n');

        const periods = ['today', 'thisWeek', 'month', 'allTime'];

        for (const period of periods) {
            console.log(`📊 Testing Period: ${period.toUpperCase()}`);
            console.log('='.repeat(50));

            // Test admin leaderboard
            console.log('👨‍💼 Admin Leaderboard:');
            const adminResponse = await axios.get(`${API_BASE_URL}/admin/leaderboard?category=overall&period=${period}&limit=5`);

            if (adminResponse.data.success) {
                console.log(`   Period: ${adminResponse.data.period}`);
                console.log(`   Drivers: ${adminResponse.data.data.length}`);

                // Show first 3 drivers
                adminResponse.data.data.slice(0, 3).forEach((driver, index) => {
                    console.log(`   ${index + 1}. ${driver.name}: ${driver.totalDeliveries} deliveries, ₺${driver.totalEarnings} earnings, ${driver.points} points`);
                });
            } else {
                console.log('   ❌ Admin Leaderboard failed:', adminResponse.data.message);
            }

            console.log('\n🚗 Driver Leaderboard:');
            const driverResponse = await axios.get(`${API_BASE_URL}/driver/leaderboard?category=overall&period=${period}&limit=5`);

            if (driverResponse.data.success) {
                console.log(`   Period: ${driverResponse.data.data.period}`);
                console.log(`   Drivers: ${driverResponse.data.data.leaderboard.length}`);

                // Show first 3 drivers
                driverResponse.data.data.leaderboard.slice(0, 3).forEach((driver, index) => {
                    console.log(`   ${index + 1}. ${driver.name}: ${driver.totalDeliveries} deliveries, ₺${driver.totalEarnings} earnings, ${driver.points} points`);
                });
            } else {
                console.log('   ❌ Driver Leaderboard failed:', driverResponse.data.message);
            }

            // Compare data consistency for this period
            console.log('\n🔍 Period Consistency Check:');

            if (adminResponse.data.success && driverResponse.data.success) {
                const adminData = adminResponse.data.data;
                const driverData = driverResponse.data.data.leaderboard;

                // Check if data is consistent for this period
                let isConsistent = true;

                for (let i = 0; i < Math.min(adminData.length, driverData.length); i++) {
                    const adminDriver = adminData[i];
                    const driverDriver = driverData[i];

                    if (adminDriver.totalDeliveries !== driverDriver.totalDeliveries ||
                        adminDriver.totalEarnings !== driverDriver.totalEarnings ||
                        adminDriver.points !== driverDriver.points) {
                        console.log(`   ❌ Inconsistency at position ${i + 1}:`);
                        console.log(`      Admin: ${adminDriver.name} - ${adminDriver.totalDeliveries} deliveries, ₺${adminDriver.totalEarnings} earnings, ${adminDriver.points} points`);
                        console.log(`      Driver: ${driverDriver.name} - ${driverDriver.totalDeliveries} deliveries, ₺${driverDriver.totalEarnings} earnings, ${driverDriver.points} points`);
                        isConsistent = false;
                    }
                }

                if (isConsistent) {
                    console.log(`   ✅ Data is consistent for ${period} period!`);
                } else {
                    console.log(`   ❌ Data is inconsistent for ${period} period.`);
                }
            }

            console.log('\n' + '='.repeat(50) + '\n');
        }

        console.log('🎯 Summary:');
        console.log('- All Time: Shows total accumulated points so far');
        console.log('- Today: Shows points earned today only');
        console.log('- This Week: Shows points earned this week only');
        console.log('- This Month: Shows points earned this month only');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testLeaderboardConsistency();
