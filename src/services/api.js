import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
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
    async sendOTP(email, userType) {
        const response = await api.post('/auth/send-otp', { email, userType });
        return response.data;
    }

    async verifyOTP(email, userType, otp) {
        const response = await api.post('/auth/verify-otp', { email, userType, otp });
        return response.data;
    }

    // Admin endpoints
    async getDashboardStats() {
        const response = await api.get('/admin/dashboard');
        return response.data;
    }

    async getDrivers(filters) {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
        }
        const response = await api.get(`/admin/drivers?${params.toString()}`);
        return response.data;
    }

    async getDriver(id) {
        const response = await api.get(`/admin/drivers/${id}`);
        return response.data;
    }

    async createDriver(driverData) {
        const response = await api.post('/admin/drivers', driverData);
        return response.data;
    }

    async updateDriver(id, driverData) {
        const response = await api.put(`/admin/drivers/${id}`, driverData);
        return response.data;
    }

    async deleteDriver(id) {
        const response = await api.delete(`/admin/drivers/${id}`);
        return response.data;
    }

    async getDeliveries(filters) {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
        }
        const response = await api.get(`/admin/deliveries?${params.toString()}`);
        return response.data;
    }

    async getDelivery(id) {
        const response = await api.get(`/admin/deliveries/${id}`);
        return response.data;
    }

    async createDelivery(deliveryData) {
        const response = await api.post('/admin/deliveries', deliveryData);
        return response.data;
    }

    async updateDelivery(id, deliveryData) {
        const response = await api.put(`/admin/deliveries/${id}`, deliveryData);
        return response.data;
    }

    async deleteDelivery(id) {
        const response = await api.delete(`/admin/deliveries/${id}`);
        return response.data;
    }

    async assignDelivery(deliveryId, driverId) {
        const response = await api.post(`/admin/deliveries/${deliveryId}/assign`, { driverId });
        return response.data;
    }

    // Driver endpoints
    async getDriverProfile() {
        const response = await api.get('/driver/profile');
        return response.data;
    }

    async updateDriverProfile(profileData) {
        const response = await api.put('/driver/profile', profileData);
        return response.data;
    }

    async updateDriverStatus(status) {
        const response = await api.put('/driver/status', { status });
        return response.data;
    }

    async updateDriverLocation(location) {
        const response = await api.put('/driver/location', location);
        return response.data;
    }

    async getDriverDeliveries(filters) {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
        }
        const response = await api.get(`/driver/deliveries?${params.toString()}`);
        return response.data;
    }

    async getDriverEarnings(period) {
        const params = period ? `?period=${period}` : '';
        const response = await api.get(`/driver/earnings${params}`);
        return response.data;
    }

    async acceptDelivery(deliveryId) {
        const response = await api.post(`/driver/deliveries/${deliveryId}/accept`);
        return response.data;
    }

    async updateDeliveryStatus(deliveryId, status) {
        const response = await api.put(`/driver/deliveries/${deliveryId}/status`, { status });
        return response.data;
    }

    // Public endpoints
    async trackDelivery(code) {
        const response = await api.get(`/delivery/track/${code}`);
        return response.data;
    }

    // File upload
    async uploadFile(file, type) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await api.post('/upload', formData, {
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
export { api };