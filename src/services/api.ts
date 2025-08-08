import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, PaginatedResponse, User, Driver, Delivery, DashboardStats, Earnings, DeliveryTracking } from '../types';

// API Configuration
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API Service Class
class ApiService {
  // Auth endpoints
  async sendOTP(email: string, userType: 'admin' | 'driver'): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post('/auth/send-otp', { email, userType });
    return response.data;
  }

  async verifyOTP(email: string, userType: 'admin' | 'driver', otp: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiClient.post('/auth/verify-otp', { email, userType, otp });
    return response.data;
  }

  // Admin endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  }

  async getDrivers(filters?: any): Promise<ApiResponse<PaginatedResponse<Driver>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await apiClient.get(`/admin/drivers?${params.toString()}`);
    return response.data;
  }

  async getDriver(id: string): Promise<ApiResponse<Driver>> {
    const response = await apiClient.get(`/admin/drivers/${id}`);
    return response.data;
  }

  async createDriver(driverData: any): Promise<ApiResponse<Driver>> {
    const response = await apiClient.post('/admin/drivers', driverData);
    return response.data;
  }

  async updateDriver(id: string, driverData: any): Promise<ApiResponse<Driver>> {
    const response = await apiClient.put(`/admin/drivers/${id}`, driverData);
    return response.data;
  }

  async deleteDriver(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/admin/drivers/${id}`);
    return response.data;
  }

  async getDeliveries(filters?: any): Promise<ApiResponse<PaginatedResponse<Delivery>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await apiClient.get(`/admin/deliveries?${params.toString()}`);
    return response.data;
  }

  async getDelivery(id: string): Promise<ApiResponse<Delivery>> {
    const response = await apiClient.get(`/admin/deliveries/${id}`);
    return response.data;
  }

  async createDelivery(deliveryData: any): Promise<ApiResponse<Delivery>> {
    const response = await apiClient.post('/admin/deliveries', deliveryData);
    return response.data;
  }

  async updateDelivery(id: string, deliveryData: any): Promise<ApiResponse<Delivery>> {
    const response = await apiClient.put(`/admin/deliveries/${id}`, deliveryData);
    return response.data;
  }

  async deleteDelivery(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/admin/deliveries/${id}`);
    return response.data;
  }

  async assignDelivery(deliveryId: string, driverId: string): Promise<ApiResponse<Delivery>> {
    const response = await apiClient.post(`/admin/deliveries/${deliveryId}/assign`, { driverId });
    return response.data;
  }

  // Driver endpoints
  async getDriverProfile(): Promise<ApiResponse<Driver>> {
    const response = await apiClient.get('/driver/profile');
    return response.data;
  }

  async updateDriverProfile(profileData: any): Promise<ApiResponse<Driver>> {
    const response = await apiClient.put('/driver/profile', profileData);
    return response.data;
  }

  async updateDriverStatus(status: 'online' | 'offline' | 'busy'): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.put('/driver/status', { status });
    return response.data;
  }

  async updateDriverLocation(location: { lat: number; lng: number; address?: string }): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.put('/driver/location', location);
    return response.data;
  }

  async getDriverDeliveries(filters?: any): Promise<ApiResponse<PaginatedResponse<Delivery>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await apiClient.get(`/driver/deliveries?${params.toString()}`);
    return response.data;
  }

  async getDriverEarnings(period?: string): Promise<ApiResponse<Earnings>> {
    const params = period ? `?period=${period}` : '';
    const response = await apiClient.get(`/driver/earnings${params}`);
    return response.data;
  }

  async acceptDelivery(deliveryId: string): Promise<ApiResponse<Delivery>> {
    const response = await apiClient.post(`/driver/deliveries/${deliveryId}/accept`);
    return response.data;
  }

  async updateDeliveryStatus(deliveryId: string, status: string): Promise<ApiResponse<Delivery>> {
    const response = await apiClient.put(`/driver/deliveries/${deliveryId}/status`, { status });
    return response.data;
  }

  // Public endpoints
  async trackDelivery(code: string): Promise<ApiResponse<DeliveryTracking>> {
    const response = await apiClient.get(`/delivery/track/${code}`);
    return response.data;
  }

  // File upload
  async uploadFile(file: File, type: 'profile' | 'document'): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
export { apiClient };
