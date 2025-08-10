// Import removed as it's not used in this file

// Check if backend is available
const isBackendAvailable = async () => {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    // Try multiple endpoints
    const endpoints = [
      '/api/admin/deliveries?limit=1',
      '/api/health',
      '/health',
      '/'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
        if (response.ok) return true;
      } catch (error) {
        console.log(`Endpoint ${endpoint} not available`);
      }
    }
    return false;
  } catch (error) {
    console.log('Backend not available:', error);
    return false;
  }
};

// Dashboard data service
export const getDashboardData = async (period = 'month') => {
  const backendAvailable = await isBackendAvailable();

  // No fallback - backend must be available
  if (!backendAvailable) {
    throw new Error('Backend is not available');
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/admin/dashboard?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch dashboard data');

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// Recent deliveries service
export const getRecentDeliveries = async (limit = 5) => {
  const backendAvailable = await isBackendAvailable();

  if (!backendAvailable) {
    return [
      {
        id: '1',
        customerName: 'John Doe',
        pickupLocation: 'Famagusta Center',
        deliveryLocation: 'Eastern Mediterranean University',
        status: 'completed',
        amount: 25.50,
        createdAt: new Date().toISOString(),
        driverName: 'Ahmed Hassan'
      },
      {
        id: '2',
        customerName: 'Jane Smith',
        pickupLocation: 'City Mall',
        deliveryLocation: 'Student Housing',
        status: 'in_progress',
        amount: 18.75,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        driverName: 'Mehmet Yilmaz'
      },
      {
        id: '3',
        customerName: 'Mike Johnson',
        pickupLocation: 'University Campus',
        deliveryLocation: 'Downtown Area',
        status: 'pending',
        amount: 32.00,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        driverName: 'Ali Kaya'
      }
    ];
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/admin/deliveries?limit=${limit}&sort=createdAt&order=desc`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch recent deliveries');

    const data = await response.json();
    return data.deliveries || data;
  } catch (error) {
    console.error('Error fetching recent deliveries:', error);
    throw error;
  }
};

// Top drivers service
export const getTopDrivers = async (limit = 5) => {
  const backendAvailable = await isBackendAvailable();

  if (!backendAvailable) {
    return [
      {
        id: '1',
        name: 'Ahmed Hassan',
        email: 'ahmed@example.com',
        phone: '+90 555 123 4567',
        deliveries: 45,
        earnings: 1250.00,
        rating: 4.8,
        status: 'online',
        lastActive: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Mehmet Yilmaz',
        email: 'mehmet@example.com',
        phone: '+90 555 234 5678',
        deliveries: 38,
        earnings: 1100.00,
        rating: 4.9,
        status: 'busy',
        lastActive: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: '3',
        name: 'Ali Kaya',
        email: 'ali@example.com',
        phone: '+90 555 345 6789',
        deliveries: 32,
        earnings: 950.00,
        rating: 4.7,
        status: 'offline',
        lastActive: new Date(Date.now() - 1800000).toISOString()
      }
    ];
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/admin/drivers?limit=${limit}&sort=earnings&order=desc`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch top drivers');

    const data = await response.json();
    return data.drivers || data;
  } catch (error) {
    console.error('Error fetching top drivers:', error);
    throw error;
  }
};

// Real-time driver status service
export const getRealTimeDriverStatus = async () => {
  const backendAvailable = await isBackendAvailable();

  // No fallback - backend must be available
  if (!backendAvailable) {
    throw new Error('Backend is not available');
  }

  try {
    const token = localStorage.getItem('token');
    // Use the working endpoint instead of /status
    const response = await fetch('/api/admin/drivers?limit=10&status=all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch driver status');

    const data = await response.json();
    const drivers = data.drivers || data;

    // Transform the data to match our expected format
    const statusCounts = {
      online: 0,
      busy: 0,
      offline: 0,
      total: drivers.length
    };

    const transformedDrivers = drivers.map(driver => {
      const status = driver.status || 'offline';
      statusCounts[status]++;

      return {
        id: driver.id,
        name: driver.name,
        status: status,
        lastActive: driver.lastActive || driver.updatedAt,
        currentLocation: driver.currentLocation || 'Unknown'
      };
    });

    return {
      ...statusCounts,
      drivers: transformedDrivers
    };
  } catch (error) {
    console.error('Error fetching driver status:', error);
    throw error;
  }
};

// Get all drivers
export const getDrivers = async (filters = {}) => {
  const backendAvailable = await isBackendAvailable();

  if (!backendAvailable) {
    return {
      drivers: [
        {
          id: '1',
          name: 'Ahmed Hassan',
          email: 'ahmed@example.com',
          phone: '+90 555 123 4567',
          status: 'online',
          deliveries: 45,
          earnings: 1250.00,
          rating: 4.8,
          joinedAt: '2024-01-15',
          lastActive: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Mehmet Yilmaz',
          email: 'mehmet@example.com',
          phone: '+90 555 234 5678',
          status: 'busy',
          deliveries: 38,
          earnings: 1100.00,
          rating: 4.9,
          joinedAt: '2024-02-01',
          lastActive: new Date(Date.now() - 300000).toISOString()
        }
      ],
      total: 2,
      page: 1,
      limit: 10
    };
  }

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

    const response = await fetch(`/api/admin/drivers?${queryParams}`, {
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
    const response = await fetch(`/api/admin/drivers/${driverId}`, {
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
  deleteDriver,
  isBackendAvailable
};

export default dashboardService;
