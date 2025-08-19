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
      'thisMonth': 'thisMonth',
      'allTime': 'allTime'
    };

    const mappedPeriod = periodMapping[period] || 'today';
    console.log('📊 DashboardService: Mapped period:', period, 'to:', mappedPeriod);

    // Try different parameter names that the backend might expect
    let url = `${API_BASE_URL}/admin/dashboard?period=${mappedPeriod}&timeframe=${mappedPeriod}&filter=${mappedPeriod}`;
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
      'thisMonth': 'thisMonth',
      'allTime': 'allTime'
    };

    const mappedPeriod = periodMapping[period] || 'today';

    // Get recent deliveries from the main dashboard endpoint with period
    const response = await fetch(`${API_BASE_URL}/admin/dashboard?period=${mappedPeriod}&timeframe=${mappedPeriod}&filter=${mappedPeriod}`, {
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
export const getTopDrivers = async (limit = 5, period = 'today') => {
  try {
    const token = localStorage.getItem('token');

    console.log('👥 DashboardService: Fetching top drivers with limit:', limit, 'period:', period);

    // Map frontend period values to backend expected values
    const periodMapping = {
      'today': 'today',
      'thisWeek': 'thisWeek',
      'thisMonth': 'thisMonth',
      'allTime': 'allTime'
    };

    const mappedPeriod = periodMapping[period] || 'today';

    // Get top drivers from the main dashboard endpoint with period
    const response = await fetch(`${API_BASE_URL}/admin/dashboard?period=${mappedPeriod}&timeframe=${mappedPeriod}&filter=${mappedPeriod}`, {
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
    console.log('✅ DashboardService: Top drivers data received:', data);

    // Extract top drivers from the dashboard response
    const drivers = data.data?.topDrivers || data.topDrivers || [];



    // Enhance driver data with gamification elements
    const enhancedDrivers = drivers.map((driver, index) => {
      // Calculate achievements based on performance
      const achievements = [];
      if (driver.deliveries >= 100) achievements.push('🚀 Speed Demon');
      if (driver.rating >= 4.8) achievements.push('⭐ Elite');
      if (driver.completionRate >= 95) achievements.push('✅ Perfect');
      if (driver.earnings >= 5000) achievements.push('💰 High Earner');
      if (driver.activeHours >= 40) achievements.push('⏰ Dedicated');

      // Calculate performance score for ranking
      const performanceScore = (
        (driver.deliveries * 10) +
        (driver.rating * 100) +
        (driver.completionRate * 2) +
        (driver.earnings / 100) +
        (driver.activeHours * 5)
      );

      return {
        ...driver,
        achievements,
        performanceScore,
        rank: index + 1,
        // Ensure all required fields exist
        deliveries: driver.deliveries || 0,
        earnings: driver.earnings || 0,
        rating: driver.rating || 0,
        completionRate: driver.completionRate || 0,
        activeHours: driver.activeHours || 0,
        isOnline: driver.isOnline || driver.isActive || false
      };
    });

    // Sort by performance score
    enhancedDrivers.sort((a, b) => b.performanceScore - a.performanceScore);

    return enhancedDrivers;
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
