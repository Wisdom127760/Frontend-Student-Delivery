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

    async get(url) {
        const response = await api.get(url);
        return response.data;
    }

    async createDriver(driverData) {
        const response = await api.post('/admin/drivers', driverData);
        return response.data;
    }

    // Driver invitation endpoints
    async inviteDriver(driverData) {
        const response = await api.post('/admin/drivers/invite', driverData);
        return response.data;
    }

    async getPendingInvitations(page = 1, limit = 20) {
        const response = await api.get(`/admin/drivers/invitations?page=${page}&limit=${limit}`);
        return response.data;
    }

    async cancelInvitation(invitationId) {
        const response = await api.post(`/admin/drivers/invitations/${invitationId}/cancel`);
        return response.data;
    }

    async resendInvitation(invitationId) {
        const response = await api.post(`/admin/drivers/invitations/${invitationId}/resend`);
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

    async getDashboardData(period = null) {
        const params = period ? `?period=${period}` : '';
        const response = await api.get(`/driver/dashboard${params}`);
        return response.data;
    }

    async updateDriverProfile(profileData) {
        const response = await api.put('/driver/profile', profileData);
        return response.data;
    }

    async uploadDriverProfileImage(formData) {
        try {
            console.log('🚀 Uploading profile image to backend...', {
                hasProfilePicture: formData.has('profilePicture'),
                originalSize: formData.get('originalSize'),
                compressedSize: formData.get('compressedSize'),
                fileType: formData.get('fileType'),
                endpoint: '/driver/profile/image'
            });

            const response = await api.post('/driver/profile/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000, // 30 second timeout for image uploads
            });

            console.log('📥 Upload response received:', {
                status: response.status,
                statusText: response.statusText,
                data: response.data,
                headers: response.headers
            });
            return response.data;
        } catch (error) {
            console.error('API upload error:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    }



    async getDriverRemittances() {
        const response = await api.get('/driver/remittances');
        return response.data;
    }

    async requestRemittance(amount, method) {
        const response = await api.post('/driver/remittances/request', { amount, method });
        return response.data;
    }

    // Admin endpoints
    async getAdminDriverStatus() {
        const response = await api.get('/admin/drivers/status');
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

    // Document upload for driver verification
    async uploadDriverDocument(documentType, formData) {
        try {
            // Get the current token to ensure it's available
            const token = localStorage.getItem('token');
            console.log('🔑 Document upload - Token available:', !!token);
            console.log('📤 Uploading to correct endpoint:', `/driver/documents/${documentType}/upload`);

            // Use the correct document upload endpoint that exists in the backend
            const response = await api.post(`/driver/documents/${documentType}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000, // 30 second timeout for document uploads
            });

            console.log('✅ Document upload successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Document upload failed:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
                endpoint: `/driver/documents/${documentType}/upload`
            });
            throw error;
        }
    }

    // Notification endpoints
    async getDriverNotifications(filters = {}) {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
        }
        const response = await api.get(`/driver/notifications?${params.toString()}`);
        return response.data;
    }

    async getDriverUnreadNotificationsCount() {
        const response = await api.get('/driver/notifications/unread-count');
        return response.data;
    }

    async markNotificationAsRead(notificationId) {
        const response = await api.put(`/driver/notifications/${notificationId}/read`);
        return response.data;
    }

    async markAllNotificationsAsRead() {
        const response = await api.put('/driver/notifications/mark-all-read');
        return response.data;
    }

    // Admin Document Verification endpoints
    async getPendingDocuments(filter = 'all') {
        const params = filter !== 'all' ? `?status=${filter}` : '';
        const response = await api.get(`/admin/documents${params}`);
        return response.data;
    }

    async updateDocumentStatus(documentId, statusData) {
        const response = await api.put(`/admin/documents/${documentId}/status`, statusData);
        return response.data;
    }

    async startAIVerification(documentId) {
        const response = await api.post(`/admin/documents/${documentId}/verify-ai`);
        return response.data;
    }

    async getDocumentVerificationStatus(documentId) {
        const response = await api.get(`/admin/documents/${documentId}/verification-status`);
        return response.data;
    }

    async batchVerifyDocuments(documentIds, action) {
        const response = await api.post('/admin/documents/batch-verify', {
            documentIds,
            action
        });
        return response.data;
    }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
export { api };