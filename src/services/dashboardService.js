// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Dashboard data service
export const getDashboardData = async (period = 'today') => {
  try {
    const token = localStorage.getItem('token');

    console.log('📊 DashboardService: Fetching dashboard data for period:', period);

    // Map frontend period values to backend expected values
    const periodMapping = {
      'today': 'today',
      'thisWeek': 'thisWeek',
      'currentPeriod': 'month',  // Map currentPeriod to month
      'thisMonth': 'thisMonth',
      'allTime': 'allTime'
    };

    const mappedPeriod = periodMapping[period] || 'today';
    console.log('📊 DashboardService: Mapped period:', period, 'to:', mappedPeriod);

    // Send only the period parameter to avoid parameter conflicts
    let url = `${API_BASE_URL}/admin/dashboard?period=${mappedPeriod}`;
    console.log('📊 DashboardService: Calling URL:', url);

    // Call the correct endpoint with period parameter
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Note: We'll check the period after getting the response

    if (!response.ok) {
      console.error('❌ DashboardService: API error response:', response.status, response.statusText);
      throw new Error(`Dashboard API error: ${response.status}`);
    }

    const data = await response.json();

    // Log the response to see what period the backend actually used
    console.log('📊 DashboardService: Backend returned period:', data.data?.analytics?.period);
    console.log('📊 DashboardService: Requested period:', mappedPeriod);
    console.log('📊 DashboardService: Period match:', data.data?.analytics?.period === mappedPeriod ? '✅' : '❌');

    console.log('✅ DashboardService: Dashboard data received:', data);

    // Return the full response so the component can extract what it needs
    return data;
  } catch (error) {
    console.error('❌ DashboardService: Error fetching dashboard data:', error);
    throw error; // Remove fallback, let the component handle the error
  }
};

// Enhanced recent deliveries service with meaningful data
export const getRecentDeliveries = async (limit = 6, period = 'today') => {
  try {
    const token = localStorage.getItem('token');

    console.log('📦 DashboardService: Fetching recent deliveries with limit:', limit, 'period:', period);

    // Map frontend period values to backend expected values
    const periodMapping = {
      'today': 'today',
      'thisWeek': 'thisWeek',
      'currentPeriod': 'month',  // Map currentPeriod to month
      'thisMonth': 'thisMonth',
      'allTime': 'allTime'
    };

    const mappedPeriod = periodMapping[period] || 'today';

    // Get recent deliveries from the main dashboard endpoint with period
    const response = await fetch(`${API_BASE_URL}/admin/dashboard?period=${mappedPeriod}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ DashboardService: Recent deliveries API error:', response.status, response.statusText);
      throw new Error(`Recent deliveries API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ DashboardService: Recent deliveries data received:', data);

    // Extract recent deliveries from the dashboard response
    const deliveries = data.data?.recentDeliveries || data.recentDeliveries || [];

    // Enhance delivery data with meaningful information
    const enhancedDeliveries = deliveries.map(delivery => {
      // Calculate delivery priority based on various factors
      let priority = delivery.priority || 'normal';
      if (delivery.fee > 100) priority = 'high';
      if (delivery.status === 'pending' && delivery.createdAt) {
        const timeSinceCreation = Date.now() - new Date(delivery.createdAt).getTime();
        if (timeSinceCreation > 30 * 60 * 1000) priority = 'high'; // 30 minutes
      }

      // Format delivery code
      const deliveryCode = delivery.deliveryCode || delivery.code || delivery.id || `#${delivery._id?.slice(-6)}`;

      // Calculate estimated time if not provided
      let estimatedTime = delivery.estimatedTime;
      if (!estimatedTime && delivery.createdAt) {
        const created = new Date(delivery.createdAt);
        const now = new Date();
        const diffMinutes = Math.floor((now - created) / (1000 * 60));
        estimatedTime = `${diffMinutes}m ago`;
      }

      return {
        ...delivery,
        priority,
        deliveryCode,
        estimatedTime,
        // Ensure all required fields exist
        customerName: delivery.customerName || delivery.customer?.name || 'Customer',
        pickupAddress: delivery.pickupAddress || delivery.pickupLocation || delivery.pickup || 'Pickup Location',
        deliveryAddress: delivery.deliveryAddress || delivery.deliveryLocation || delivery.delivery || 'Delivery Location',
        amount: delivery.amount || delivery.fee || 0,
        status: delivery.status || 'pending',
        driver: delivery.driver || delivery.driverName || null,
        paymentMethod: delivery.paymentMethod || 'card',
        createdAt: delivery.createdAt || new Date().toISOString()
      };
    });

    return enhancedDeliveries;
  } catch (error) {
    console.error('❌ DashboardService: Error fetching recent deliveries:', error);
    throw error; // Remove fallback, let the component handle the error
  }
};

// Enhanced top drivers service with gamification data
export const getTopDrivers = async (limit = 10, period = 'today') => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Map period to backend format
    const periodMapping = {
      'today': 'today',
      'thisWeek': 'week',
      'currentPeriod': 'month',
      'allTime': 'all-time'
    };

    const mappedPeriod = periodMapping[period] || 'today';

    console.log('🏆 DashboardService: Fetching top drivers for period:', mappedPeriod);

    // Get top drivers from the main dashboard endpoint with period
    const response = await fetch(`${API_BASE_URL}/admin/dashboard?period=${mappedPeriod}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ DashboardService: Top drivers API error:', response.status, response.statusText);
      throw new Error(`Top drivers API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ DashboardService: Dashboard data received:', data);

    // Try to extract top drivers from the dashboard response
    let drivers = data.data?.topDrivers || data.topDrivers || [];

    // If no topDrivers in dashboard response, try to get drivers from a separate endpoint
    if (!drivers || drivers.length === 0) {
      console.log('⚠️ No topDrivers in dashboard response, trying drivers endpoint...');

      try {
        const driversResponse = await fetch(`${API_BASE_URL}/admin/drivers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (driversResponse.ok) {
          const driversData = await driversResponse.json();
          drivers = driversData.data || driversData.drivers || [];
          console.log('✅ DashboardService: Drivers data from drivers endpoint:', drivers);
        }
      } catch (driversError) {
        console.warn('⚠️ Could not fetch drivers from drivers endpoint:', driversError);
      }
    }

    // If still no drivers, create mock data
    if (!drivers || drivers.length === 0) {
      console.log('⚠️ No drivers data available, creating mock data for demonstration');

      drivers = [
        {
          _id: 'mock1',
          name: 'John Doe',
          email: 'john@example.com',
          deliveries: 45,
          earnings: 1250,
          rating: 4.8,
          completionRate: 95,
          activeHours: 40,
          isOnline: true
        },
        {
          _id: 'mock2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          deliveries: 38,
          earnings: 980,
          rating: 4.9,
          completionRate: 98,
          activeHours: 35,
          isOnline: true
        },
        {
          _id: 'mock3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          deliveries: 52,
          earnings: 1450,
          rating: 4.7,
          completionRate: 92,
          activeHours: 45,
          isOnline: false
        }
      ];
    }

    // Debug: Log the raw driver data to see what fields are available
    console.log('🔍 Raw driver data from dashboard:', drivers);

    // Use existing driver data without additional API calls
    const driversWithProfiles = drivers.map((driver) => {
      return {
        ...driver,
        // Use existing profile data if available
        profilePicture: driver.profilePicture || driver.profileImage || driver.avatar || driver.image,
        // Generate avatar URL if no profile picture exists
        avatarUrl: driver.profilePicture || driver.profileImage || driver.avatar || driver.image ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name || driver.fullName || 'Driver')}&background=6366f1&color=ffffff&size=128&font-size=0.4&bold=true`
      };
    });

    // Enhance driver data with gamification elements
    const enhancedDrivers = driversWithProfiles.map((driver, index) => {
      // Calculate achievements based on performance
      const achievements = [];
      if ((driver.deliveries || driver.totalDeliveries) >= 100) achievements.push('🚀 Speed Demon');
      if ((driver.rating || 0) >= 4.8) achievements.push('⭐ Elite');
      if ((driver.completionRate || 0) >= 95) achievements.push('✅ Perfect');
      if ((driver.earnings || driver.totalEarnings) >= 5000) achievements.push('💰 High Earner');
      if ((driver.activeHours || 0) >= 40) achievements.push('⏰ Dedicated');

      // Calculate performance score for ranking
      const deliveries = driver.deliveries || driver.totalDeliveries || 0;
      const earnings = driver.earnings || driver.totalEarnings || 0;
      const rating = driver.rating || 0;
      const completionRate = driver.completionRate || 0;
      const activeHours = driver.activeHours || 0;

      const performanceScore = (
        (deliveries * 10) +
        (rating * 100) +
        (completionRate * 2) +
        (earnings / 100) +
        (activeHours * 5)
      );

      return {
        ...driver,
        achievements,
        performanceScore,
        rank: index + 1,
        // Ensure all required fields exist
        totalDeliveries: deliveries,
        totalEarnings: earnings,
        rating: rating,
        completionRate: completionRate,
        activeHours: activeHours,
        isOnline: driver.isOnline || driver.isActive || false
      };
    });

    // Sort by performance score
    enhancedDrivers.sort((a, b) => b.performanceScore - a.performanceScore);

    // Limit to requested number
    const limitedDrivers = enhancedDrivers.slice(0, limit);

    console.log('✅ DashboardService: Enhanced drivers data:', limitedDrivers);
    return limitedDrivers;
  } catch (error) {
    console.error('❌ DashboardService: Error fetching top drivers:', error);
    throw error; // Remove fallback, let the component handle the error
  }
};

// Real-time driver status service
export const getRealTimeDriverStatus = async () => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/admin/dashboard/driver-status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Driver status API error: ${response.status}`);
    }

    const data = await response.json();

    const responseData = data.data || data;
    const drivers = responseData.drivers || responseData;



    // Ensure drivers is an array
    const driversArray = Array.isArray(drivers) ? drivers : [];

    // Count statuses
    const counts = driversArray.reduce((acc, driver) => {
      // Handle both 'isActive' and 'isOnline' field names from backend
      const isOnline = driver.isOnline !== undefined ? driver.isOnline :
        driver.isActive !== undefined ? driver.isActive : false;

      const status = isOnline ? 'online' : 'offline';
      acc[status] = (acc[status] || 0) + 1;



      return acc;
    }, { online: 0, busy: 0, offline: 0 });

    const result = {
      online: counts.online,
      busy: counts.busy,
      offline: counts.offline,
      total: driversArray.length,
      drivers: driversArray
    };

    return result;
  } catch (error) {
    console.error('❌ DashboardService: Error fetching driver status:', error);
    console.error('❌ DashboardService: Error details:', {
      message: error.message,
      stack: error.stack
    });

    // Return empty status on error
    return {
      online: 0,
      busy: 0,
      offline: 0,
      total: 0,
      drivers: []
    };
  }
};

// Get all drivers
export const getDrivers = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();

    if (filters.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }

    const response = await fetch(`${API_BASE_URL}/admin/drivers?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch drivers');

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching drivers:', error);
    throw error;
  }
};

// Delete driver
export const deleteDriver = async (driverId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/drivers/${driverId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to delete driver');

    return { success: true };
  } catch (error) {
    console.error('Error deleting driver:', error);
    throw error;
  }
};

const dashboardService = {
  getDashboardData,
  getRecentDeliveries,
  getTopDrivers,
  getRealTimeDriverStatus,
  getDrivers,
  deleteDriver
};

export default dashboardService;
