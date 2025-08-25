/**
 * Leaderboard Data Validator and Processor
 * Ensures leaderboard data is always in the correct format and displays properly
 */

export const validateLeaderboardData = (data) => {
    if (!data || !Array.isArray(data)) {
        console.warn('⚠️ LeaderboardValidator: Invalid data structure, expected array');
        return [];
    }

    return data
        .filter(driver => driver && typeof driver === 'object')
        .map(driver => {
            // Ensure all required fields exist with proper defaults
            const validated = {
                ...driver,
                // Basic info
                _id: driver._id || driver.id || `driver-${Math.random()}`,
                name: driver.name || driver.fullNameComputed || 'Unknown Driver',
                email: driver.email || '',

                // Numeric fields with proper parsing
                totalDeliveries: parseInt(driver.totalDeliveries) || parseInt(driver.deliveries) || 0,
                totalEarnings: parseFloat(driver.totalEarnings) || parseFloat(driver.earnings) || 0,
                rating: parseFloat(driver.rating) || 0,
                points: parseInt(driver.points) || 0,
                totalReferrals: parseInt(driver.totalReferrals) || 0,

                // Calculated fields
                avgEarningsPerDelivery: parseFloat(driver.avgEarningsPerDelivery) || 0,
                avgDeliveryTime: parseFloat(driver.avgDeliveryTime) || 0,
                completionRate: parseFloat(driver.completionRate) || 0,

                // Status fields
                isOnline: Boolean(driver.isOnline || driver.isActive),
                lastActive: driver.lastActive || null,

                // Profile fields
                profilePicture: driver.profilePicture || driver.profileImage || driver.avatar || null,

                // Additional fields
                achievements: Array.isArray(driver.achievements) ? driver.achievements : [],
                phone: driver.phone || ''
            };

            // Calculate points if not provided
            if (!validated.points && validated.totalDeliveries > 0) {
                validated.points = Math.round(
                    (validated.totalDeliveries * 10) +
                    (validated.totalEarnings * 0.1) +
                    (validated.rating * 10) +
                    (validated.totalReferrals * 20)
                );
            }

            // Calculate average earnings per delivery if not provided
            if (!validated.avgEarningsPerDelivery && validated.totalDeliveries > 0 && validated.totalEarnings > 0) {
                validated.avgEarningsPerDelivery = Math.round((validated.totalEarnings / validated.totalDeliveries) * 100) / 100;
            }

            return validated;
        })
        .sort((a, b) => (b.points || 0) - (a.points || 0)); // Sort by points descending
};

export const calculateLeaderboardStats = (drivers) => {
    if (!Array.isArray(drivers) || drivers.length === 0) {
        return {
            totalDrivers: 0,
            totalDeliveries: 0,
            totalEarnings: 0,
            averageRating: 0,
            totalPoints: 0,
            onlineDrivers: 0
        };
    }

    const stats = drivers.reduce((acc, driver) => {
        acc.totalDeliveries += driver.totalDeliveries || 0;
        acc.totalEarnings += driver.totalEarnings || 0;
        acc.totalPoints += driver.points || 0;
        acc.ratingSum += driver.rating || 0;
        if (driver.isOnline) acc.onlineDrivers++;
        return acc;
    }, {
        totalDrivers: drivers.length,
        totalDeliveries: 0,
        totalEarnings: 0,
        totalPoints: 0,
        ratingSum: 0,
        onlineDrivers: 0
    });

    return {
        ...stats,
        averageRating: stats.ratingSum / stats.totalDrivers
    };
};

export const formatLeaderboardData = (data, category = 'overall') => {
    const validatedData = validateLeaderboardData(data);

    // Apply category-specific sorting
    switch (category) {
        case 'delivery':
            return validatedData.sort((a, b) => (b.totalDeliveries || 0) - (a.totalDeliveries || 0));
        case 'earnings':
            return validatedData.sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0));
        case 'rating':
            return validatedData.filter(d => d.rating > 0).sort((a, b) => (b.rating || 0) - (a.rating || 0));
        case 'referrals':
            return validatedData.sort((a, b) => (b.totalReferrals || 0) - (a.totalReferrals || 0));
        case 'overall':
        default:
            return validatedData; // Already sorted by points
    }
};

export const getLeaderboardRank = (driver, drivers) => {
    if (!Array.isArray(drivers) || drivers.length === 0) return 0;

    const sortedDrivers = [...drivers].sort((a, b) => (b.points || 0) - (a.points || 0));
    const index = sortedDrivers.findIndex(d => d._id === driver._id);
    return index >= 0 ? index + 1 : 0;
};

export const getRankBadge = (rank) => {
    switch (rank) {
        case 1: return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🥇', label: '1st' };
        case 2: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: '🥈', label: '2nd' };
        case 3: return { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🥉', label: '3rd' };
        default: return { bg: 'bg-blue-100', text: 'text-blue-700', icon: `#${rank}`, label: `${rank}th` };
    }
};
