// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Dashboard data service
export const getDashboardData = async (period = 'month') => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/dashboard?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Dashboard API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return null values instead of fallback data
    return {
      totalDeliveries: 0,
      activeDrivers: 0,
      totalRevenue: 0,
      pendingDeliveries: 0,
      deliveryGrowth: '+0%',
      driverGrowth: '+0%',
      revenueGrowth: '+0%',
      pendingGrowth: '+0%'
    };
  }
};

// Recent deliveries service
export const getRecentDeliveries = async (limit = 5) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/recent-deliveries?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Recent deliveries API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.recentDeliveries || data.recentDeliveries || data || [];
  } catch (error) {
    console.error('Error fetching recent deliveries:', error);
    return [];
  }
};

// Top drivers service
export const getTopDrivers = async (limit = 5) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/top-drivers?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Top drivers API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.topDrivers || data.topDrivers || data.drivers || data || [];
  } catch (error) {
    console.error('Error fetching top drivers:', error);
    return [];
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

    // Transform the data to match our expected format
    const statusCounts = {
      online: 0,
      busy: 0,
      offline: 0,
      total: drivers.length
    };

    const transformedDrivers = drivers.map(driver => {
      const status = driver.isOnline ? 'online' : 'offline';
      statusCounts[status]++;

      return {
        id: driver.id || driver._id,
        name: driver.name,
        status: status,
        lastActive: driver.lastLogin || driver.lastActive || new Date().toISOString(),
        currentLocation: driver.area || 'Unknown'
      };
    });

    return {
      ...statusCounts,
      drivers: transformedDrivers
    };
  } catch (error) {
    console.error('Error fetching driver status:', error);
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
