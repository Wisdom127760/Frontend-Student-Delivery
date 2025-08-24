// Mock Driver Leaderboard Responses for All Periods
// Based on the actual implementation in driverController.js

const mockResponses = {
    today: {
        success: true,
        message: "Driver leaderboard retrieved successfully",
        data: {
            leaderboard: [
                {
                    _id: "6890dc5a98ce5bc39c4e92b7",
                    name: "wisdom agunta",
                    email: "aguntawisdom@gmail.com",
                    phone: "+905332154789",
                    totalDeliveries: 1,
                    totalEarnings: 100,
                    rating: 5.0,
                    completionRate: 100.0,
                    avgDeliveryTime: 25,
                    totalReferrals: 0,
                    referralPoints: 0,
                    isOnline: true,
                    lastActive: "2025-08-24T11:30:00.000Z",
                    points: 290,
                    profilePicture: "https://res.cloudinary.com/dj6olncss/image/upload/v1755874610/driver-profiles/file_asjaw8.jpg"
                },
                {
                    _id: "68a4fc0d79a93f2db0f362ad",
                    name: "Xerey",
                    email: "xereyo9997@fursee.com",
                    phone: "+905338481193",
                    totalDeliveries: 0,
                    totalEarnings: 0,
                    rating: 5.0,
                    completionRate: 0.0,
                    avgDeliveryTime: 0,
                    totalReferrals: 0,
                    referralPoints: 0,
                    isOnline: true,
                    lastActive: "2025-08-24T10:15:00.000Z",
                    points: 250,
                    profilePicture: "https://res.cloudinary.com/dj6olncss/image/upload/v1755643390/driver-profiles/file_wikx7t.jpg"
                }
            ],
            period: "today",
            generatedAt: "2025-08-24T11:31:20.945Z"
        },
        timestamp: "2025-08-24T11:31:20.945Z"
    },

    thisWeek: {
        success: true,
        message: "Driver leaderboard retrieved successfully",
        data: {
            leaderboard: [
                {
                    _id: "6890dc5a98ce5bc39c4e92b7",
                    name: "wisdom agunta",
                    email: "aguntawisdom@gmail.com",
                    phone: "+905332154789",
                    totalDeliveries: 5,
                    totalEarnings: 450,
                    rating: 5.0,
                    completionRate: 100.0,
                    avgDeliveryTime: 25,
                    totalReferrals: 0,
                    referralPoints: 0,
                    isOnline: true,
                    lastActive: "2025-08-24T11:30:00.000Z",
                    points: 545,
                    profilePicture: "https://res.cloudinary.com/dj6olncss/image/upload/v1755874610/driver-profiles/file_asjaw8.jpg"
                },
                {
                    _id: "68a4fc0d79a93f2db0f362ad",
                    name: "Xerey",
                    email: "xereyo9997@fursee.com",
                    phone: "+905338481193",
                    totalDeliveries: 2,
                    totalEarnings: 200,
                    rating: 5.0,
                    completionRate: 100.0,
                    avgDeliveryTime: 25,
                    totalReferrals: 0,
                    referralPoints: 0,
                    isOnline: true,
                    lastActive: "2025-08-24T10:15:00.000Z",
                    points: 270,
                    profilePicture: "https://res.cloudinary.com/dj6olncss/image/upload/v1755643390/driver-profiles/file_wikx7t.jpg"
                }
            ],
            period: "thisWeek",
            generatedAt: "2025-08-24T11:31:20.945Z"
        },
        timestamp: "2025-08-24T11:31:20.945Z"
    },

    month: {
        success: true,
        message: "Driver leaderboard retrieved successfully",
        data: {
            leaderboard: [
                {
                    _id: "6890dc5a98ce5bc39c4e92b7",
                    name: "wisdom agunta",
                    email: "aguntawisdom@gmail.com",
                    phone: "+905332154789",
                    totalDeliveries: 15,
                    totalEarnings: 1500,
                    rating: 5.0,
                    completionRate: 100.0,
                    avgDeliveryTime: 25,
                    totalReferrals: 0,
                    referralPoints: 0,
                    isOnline: true,
                    lastActive: "2025-08-24T11:30:00.000Z",
                    points: 665,
                    profilePicture: "https://res.cloudinary.com/dj6olncss/image/upload/v1755874610/driver-profiles/file_asjaw8.jpg"
                },
                {
                    _id: "68a4fc0d79a93f2db0f362ad",
                    name: "Xerey",
                    email: "xereyo9997@fursee.com",
                    phone: "+905338481193",
                    totalDeliveries: 8,
                    totalEarnings: 800,
                    rating: 5.0,
                    completionRate: 100.0,
                    avgDeliveryTime: 25,
                    totalReferrals: 0,
                    referralPoints: 0,
                    isOnline: true,
                    lastActive: "2025-08-24T10:15:00.000Z",
                    points: 430,
                    profilePicture: "https://res.cloudinary.com/dj6olncss/image/upload/v1755643390/driver-profiles/file_wikx7t.jpg"
                }
            ],
            period: "month",
            generatedAt: "2025-08-24T11:31:20.945Z"
        },
        timestamp: "2025-08-24T11:31:20.945Z"
    },

    allTime: {
        success: true,
        message: "Driver leaderboard retrieved successfully",
        data: {
            leaderboard: [
                {
                    _id: "6890dc5a98ce5bc39c4e92b7",
                    name: "wisdom agunta",
                    email: "aguntawisdom@gmail.com",
                    phone: "+905332154789",
                    totalDeliveries: 46,
                    totalEarnings: 5117,
                    rating: 5.0,
                    completionRate: 100.0,
                    avgDeliveryTime: 25,
                    totalReferrals: 0,
                    referralPoints: 0,
                    isOnline: true,
                    lastActive: "2025-08-24T11:30:00.000Z",
                    points: 1022,
                    profilePicture: "https://res.cloudinary.com/dj6olncss/image/upload/v1755874610/driver-profiles/file_asjaw8.jpg"
                },
                {
                    _id: "68a4fc0d79a93f2db0f362ad",
                    name: "Xerey",
                    email: "xereyo9997@fursee.com",
                    phone: "+905338481193",
                    totalDeliveries: 7,
                    totalEarnings: 778,
                    rating: 5.0,
                    completionRate: 100.0,
                    avgDeliveryTime: 25,
                    totalReferrals: 0,
                    referralPoints: 0,
                    isOnline: true,
                    lastActive: "2025-08-24T10:15:00.000Z",
                    points: 198,
                    profilePicture: "https://res.cloudinary.com/dj6olncss/image/upload/v1755643390/driver-profiles/file_wikx7t.jpg"
                }
            ],
            period: "allTime",
            generatedAt: "2025-08-24T11:31:20.945Z"
        },
        timestamp: "2025-08-24T11:31:20.945Z"
    }
};

// Display all responses
console.log('🏆 Driver Leaderboard Response Structure for All Periods\n');

Object.entries(mockResponses).forEach(([period, response]) => {
    console.log(`📊 Period: ${period.toUpperCase()}`);
    console.log('='.repeat(60));
    console.log(JSON.stringify(response, null, 2));
    console.log('\n' + '='.repeat(60) + '\n');
});

// Summary of data differences
console.log('📈 Data Summary by Period:');
console.log('='.repeat(60));
console.log('Driver: wisdom agunta');
console.log('Today:    1 delivery, ₺100 earnings, 290 points');
console.log('This Week: 5 deliveries, ₺450 earnings, 545 points');
console.log('This Month: 15 deliveries, ₺1500 earnings, 665 points');
console.log('All Time:  46 deliveries, ₺5117 earnings, 1022 points');
console.log('\nDriver: Xerey');
console.log('Today:    0 deliveries, ₺0 earnings, 250 points');
console.log('This Week: 2 deliveries, ₺200 earnings, 270 points');
console.log('This Month: 8 deliveries, ₺800 earnings, 430 points');
console.log('All Time:  7 deliveries, ₺778 earnings, 198 points');
