const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test driver status fix
async function testDriverStatusFix() {
    try {
        console.log('🔍 Testing Driver Status Fix...\n');

        // Test getting drivers with status
        console.log('📋 Testing GET /admin/drivers endpoint...');

        try {
            const response = await axios.get(`${API_BASE_URL}/admin/drivers?limit=5`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE' // Replace with actual admin token
                }
            });

            if (response.data.success) {
                console.log('✅ Drivers API Response:');
                console.log(`   Total drivers: ${response.data.totalItems || response.data.drivers?.length || 0}`);

                // Check if drivers have status field
                const drivers = response.data.drivers || response.data.data || [];
                console.log(`   Drivers returned: ${drivers.length}`);

                if (drivers.length > 0) {
                    console.log('\n📊 Driver Status Analysis:');
                    drivers.forEach((driver, index) => {
                        console.log(`   Driver ${index + 1}: ${driver.name || driver.fullName}`);
                        console.log(`     - Status: ${driver.status || 'MISSING'}`);
                        console.log(`     - isOnline: ${driver.isOnline}`);
                        console.log(`     - isActive: ${driver.isActive}`);
                        console.log(`     - isSuspended: ${driver.isSuspended}`);
                        console.log('');
                    });

                    // Check if all drivers have status
                    const driversWithStatus = drivers.filter(d => d.status);
                    const driversWithoutStatus = drivers.filter(d => !d.status);

                    console.log('📈 Status Coverage:');
                    console.log(`   ✅ Drivers with status: ${driversWithStatus.length}`);
                    console.log(`   ❌ Drivers without status: ${driversWithoutStatus.length}`);

                    if (driversWithoutStatus.length === 0) {
                        console.log('🎉 All drivers have status field!');
                    } else {
                        console.log('⚠️ Some drivers are missing status field');
                    }

                    // Check status values
                    const statusCounts = {};
                    drivers.forEach(d => {
                        if (d.status) {
                            statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
                        }
                    });

                    console.log('\n📊 Status Distribution:');
                    Object.entries(statusCounts).forEach(([status, count]) => {
                        console.log(`   ${status}: ${count} drivers`);
                    });

                } else {
                    console.log('⚠️ No drivers returned from API');
                }
            } else {
                console.log('❌ API returned error:', response.data.error);
            }
        } catch (error) {
            console.log('❌ Error calling drivers API:', error.response?.data?.error || error.message);
        }

        console.log('\n🎯 Expected Status Values:');
        console.log('   - online: Driver is online and active');
        console.log('   - offline: Driver is active but not online');
        console.log('   - suspended: Driver is suspended');
        console.log('   - inactive: Driver is not active');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testDriverStatusFix();
