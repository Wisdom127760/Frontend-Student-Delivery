import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
console.log('🔧 API Configuration - REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('🔧 API Configuration - Final API_BASE_URL:', API_BASE_URL);

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
        console.log('🌐 Axios Request - URL:', config.url);
        console.log('🌐 Axios Request - Base URL:', config.baseURL);
        console.log('🌐 Axios Request - Full URL:', `${config.baseURL}${config.url}`);
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
        console.log('❌ API Error Response:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });

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

    async getAnalytics(period = 'thisMonth') {
        console.log('📊 API Service: Fetching analytics for period:', period);

        // Use the correct parameter name that works with the backend
        const response = await api.get(`/admin/analytics?timeframe=${period}`);
        console.log('📊 API Service: Analytics response:', response.data);
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
        const queryString = params.toString();
        const url = `/admin/drivers${queryString ? `?${queryString}` : ''}`;

        console.log('🚗 Fetching drivers with URL:', url);
        console.log('🔍 Filters:', filters);

        const response = await api.get(url);
        console.log('✅ Drivers API response:', response.data);
        console.log('🔍 Response structure:', {
            type: typeof response.data,
            isArray: Array.isArray(response.data),
            keys: response.data ? Object.keys(response.data) : 'null/undefined',
            hasData: response.data && response.data.data ? 'yes' : 'no',
            hasDrivers: response.data && response.data.drivers ? 'yes' : 'no',
            dataLength: response.data && Array.isArray(response.data) ? response.data.length : 'N/A'
        });
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
        // Try the broadcast endpoint first, fallback to admin endpoint
        try {
            const response = await api.get(`/delivery?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.log('Broadcast endpoint failed, trying admin endpoint:', error);
            const response = await api.get(`/admin/deliveries?${params.toString()}`);
            return response.data;
        }
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

    // Communication endpoints
    async sendEmergencyAlert(message, location = null) {
        console.log('🚨 API Service: Sending emergency alert:', { message, location });
        const payload = { message };
        if (location) {
            payload.location = location;
        }
        const response = await api.post('/notifications/emergency-alert', payload);
        console.log('🚨 API Service: Emergency alert response:', response.data);
        return response.data;
    }

    async sendMessageToAdmin(message) {
        console.log('💬 API Service: Sending message to admin:', message);
        const response = await api.post('/notifications/driver/send-message', { message });
        console.log('💬 API Service: Send message response:', response.data);
        return response.data;
    }

    async sendMessageToDriver(driverId, message) {
        console.log('💬 API Service: Sending message to driver:', { driverId, message });
        const response = await api.post('/notifications/admin/send-message', { driverId, message });
        console.log('💬 API Service: Send message response:', response.data);
        return response.data;
    }

    async sendSystemNotification(message, priority = 'medium') {
        console.log('📢 API Service: Sending system notification:', { message, priority });
        const response = await api.post('/notifications/system', { message, priority });
        console.log('📢 API Service: System notification response:', response.data);
        return response.data;
    }

    // Socket testing endpoints
    async testSocketEmergencyAlert(driverId, message, location = null) {
        console.log('🧪 API Service: Testing socket emergency alert:', { driverId, message, location });
        const payload = { driverId, message };
        if (location) {
            payload.location = location;
        }
        const response = await api.post('/socket/test-emergency-alert', payload);
        console.log('🧪 API Service: Socket test response:', response.data);
        return response.data;
    }

    async testSocketNotification(message) {
        console.log('🧪 API Service: Testing socket notification:', message);
        const response = await api.post('/socket/test-notification', { message });
        console.log('🧪 API Service: Socket test response:', response.data);
        return response.data;
    }

    async getSocketStatus() {
        console.log('🔌 API Service: Getting socket status');
        const response = await api.get('/socket/status');
        console.log('🔌 API Service: Socket status response:', response.data);
        return response.data;
    }

    // Admin Document Verification endpoints
    async getPendingDocuments(params = {}) {
        console.log('📄 API Service: Fetching pending documents with params:', params);

        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, String(value));
            }
        });

        const queryString = queryParams.toString();
        const url = `/admin/documents${queryString ? `?${queryString}` : ''}`;

        console.log('📄 API Service: Pending documents URL:', url);
        const response = await api.get(url);
        console.log('📄 API Service: Pending documents response:', response.data);
        return response.data;
    }

    async verifyDocument(documentId, rejectionReason = null) {
        console.log('📄 API Service: Updating document status:', documentId, 'with reason:', rejectionReason);

        const requestBody = {
            status: rejectionReason ? 'rejected' : 'verified'
        };

        if (rejectionReason) {
            requestBody.rejectionReason = rejectionReason;
        }

        const response = await api.put(`/admin/documents/${documentId}/status`, requestBody);
        console.log('📄 API Service: Update document status response:', response.data);
        return response.data;
    }

    async rejectDocument(documentId, reason) {
        console.log('📄 API Service: Rejecting document:', documentId, 'with reason:', reason);
        // Use the same endpoint as verifyDocument but with rejection data
        return this.verifyDocument(documentId, reason);
    }

    async updateDocumentStatus(documentId, statusData) {
        const response = await api.put(`/admin/documents/${documentId}/status`, statusData);
        return response.data;
    }

    async startAIVerification(documentId) {
        console.log('🤖 API Service: Starting AI verification for document:', documentId);
        const response = await api.post(`/admin/documents/${documentId}/verify-ai`);
        console.log('🤖 API Service: AI verification response:', response.data);
        return response.data;
    }

    async getDocumentVerificationStatus(documentId) {
        console.log('📊 API Service: Getting verification status for document:', documentId);
        const response = await api.get(`/admin/documents/${documentId}/verification-status`);
        console.log('📊 API Service: Verification status response:', response.data);
        return response.data;
    }

    async batchVerifyDocuments(documentIds, action) {
        const response = await api.post('/admin/documents/batch-verify', {
            documentIds,
            action
        });
        return response.data;
    }



    // Admin Notifications endpoints
    async getAdminNotifications(filters = {}) {
        console.log('🔔 API Service: Fetching admin notifications with filters:', filters);

        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });

        const queryString = params.toString();
        const url = `/admin/notifications${queryString ? `?${queryString}` : ''}`;

        console.log('🔔 API Service: Admin notifications URL:', url);
        const response = await api.get(url);
        console.log('🔔 API Service: Admin notifications response:', response.data);
        return response.data;
    }

    async markAdminNotificationAsRead(notificationId) {
        console.log('🔔 API Service: Marking admin notification as read:', notificationId);
        const response = await api.put(`/admin/notifications/${notificationId}/read`);
        console.log('🔔 API Service: Mark as read response:', response.data);
        return response.data;
    }

    async markAllAdminNotificationsAsRead() {
        console.log('🔔 API Service: Marking all admin notifications as read');
        const response = await api.put('/admin/notifications/mark-all-read');
        console.log('🔔 API Service: Mark all as read response:', response.data);
        return response.data;
    }

    async deleteAdminNotification(notificationId) {
        console.log('🔔 API Service: Deleting admin notification:', notificationId);
        const response = await api.delete(`/admin/notifications/${notificationId}`);
        console.log('🔔 API Service: Delete notification response:', response.data);
        return response.data;
    }

    // Admin Remittance endpoints
    async getRemittances(params = {}) {
        console.log('💰 API Service: Fetching remittances with params:', params);

        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, String(value));
            }
        });

        const queryString = queryParams.toString();
        const url = `/admin/remittances${queryString ? `?${queryString}` : ''}`;

        console.log('💰 API Service: Remittances URL:', url);
        const response = await api.get(url);
        console.log('💰 API Service: Remittances response:', response.data);
        return response.data;
    }

    async createRemittance(remittanceData) {
        console.log('💰 API Service: Creating remittance:', remittanceData);
        const response = await api.post('/admin/remittances', remittanceData);
        console.log('💰 API Service: Create remittance response:', response.data);
        return response.data;
    }

    async completeRemittance(remittanceId) {
        console.log('💰 API Service: Completing remittance:', remittanceId);
        const response = await api.put(`/admin/remittances/${remittanceId}/complete`);
        console.log('💰 API Service: Complete remittance response:', response.data);
        return response.data;
    }

    async cancelRemittance(remittanceId, reason) {
        console.log('💰 API Service: Cancelling remittance:', remittanceId, 'with reason:', reason);
        const response = await api.put(`/admin/remittances/${remittanceId}/cancel`, { reason });
        console.log('💰 API Service: Cancel remittance response:', response.data);
        return response.data;
    }

    async getRemittanceById(remittanceId) {
        console.log('💰 API Service: Fetching remittance by ID:', remittanceId);
        const response = await api.get(`/admin/remittances/${remittanceId}`);
        console.log('💰 API Service: Get remittance by ID response:', response.data);
        return response.data;
    }

    async getRemittanceStats() {
        console.log('💰 API Service: Fetching remittance statistics');
        const response = await api.get('/admin/remittances/statistics');
        console.log('💰 API Service: Remittance statistics response:', response.data);
        return response.data;
    }

    async bulkGenerateRemittances(data) {
        console.log('💰 API Service: Bulk generating remittances:', data);
        const response = await api.post('/admin/remittances/bulk-generate', data);
        console.log('💰 API Service: Bulk generate remittances response:', response.data);
        return response.data;
    }

    async getDriverRemittanceSummary(driverId) {
        console.log('💰 API Service: Getting driver remittance summary for:', driverId);
        const response = await api.get(`/admin/remittances/summary/${driverId}`);
        console.log('💰 API Service: Driver remittance summary response:', response.data);
        return response.data;
    }

    async getDriverRemittancesForDetails(driverId) {
        console.log('💰 API Service: Getting driver remittances for details:', driverId);
        const response = await api.get(`/admin/remittances?driverId=${driverId}`);
        console.log('💰 API Service: Driver remittances response:', response.data);
        return response.data;
    }

    async getPaymentStructure() {
        console.log('💰 API Service: Getting payment structure');
        const response = await api.get('/admin/remittances/payment-structure');
        console.log('💰 API Service: Payment structure response:', response.data);
        return response.data;
    }

    // Admin Management endpoints
    async getAdminUsers(params = {}) {
        console.log('👥 API Service: Getting admin users with params:', params);
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
            }
        });
        const url = `/admin/management/admins${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await api.get(url);
        console.log('👥 API Service: Admin users response:', response.data);
        return response.data;
    }

    async createAdminUser(adminData) {
        console.log('👥 API Service: Creating admin user:', adminData);
        const response = await api.post('/admin/management/admins', adminData);
        console.log('👥 API Service: Create admin response:', response.data);
        return response.data;
    }

    async updateAdminUser(adminId, adminData) {
        console.log('👥 API Service: Updating admin user:', adminId, adminData);
        const response = await api.put(`/admin/management/admins/${adminId}`, adminData);
        console.log('👥 API Service: Update admin response:', response.data);
        return response.data;
    }

    async deleteAdminUser(adminId) {
        console.log('👥 API Service: Deleting admin user:', adminId);
        const response = await api.delete(`/admin/management/admins/${adminId}`);
        console.log('👥 API Service: Delete admin response:', response.data);
        return response.data;
    }

    async resetAdminPassword(adminId, data) {
        console.log('👥 API Service: Resetting admin password:', adminId);
        const response = await api.post(`/admin/management/admins/${adminId}/reset-password`, data);
        console.log('👥 API Service: Reset password response:', response.data);
        return response.data;
    }

    async getSystemSettings() {
        console.log('⚙️ API Service: Getting system settings');
        const response = await api.get('/admin/management/system-settings');
        console.log('⚙️ API Service: System settings response:', response.data);
        return response.data;
    }

    async updateSystemSettings(settings) {
        console.log('⚙️ API Service: Updating system settings:', settings);
        const response = await api.put('/admin/management/system-settings', { settings });
        console.log('⚙️ API Service: Update system settings response:', response.data);
        return response.data;
    }

    async updateCurrency(currency) {
        console.log('⚙️ API Service: Updating currency:', currency);
        const response = await api.put('/admin/management/system-settings/currency', { currency });
        console.log('⚙️ API Service: Update currency response:', response.data);
        return response.data;
    }

    async getEarningsConfigurations() {
        console.log('💰 API Service: Getting earnings configurations');
        const response = await api.get('/admin/management/earnings-configurations');
        console.log('💰 API Service: Earnings configurations response:', response.data);
        return response.data;
    }

    async createEarningsConfiguration(configData) {
        console.log('💰 API Service: Creating earnings configuration:', configData);
        const response = await api.post('/admin/management/earnings-configurations', configData);
        console.log('💰 API Service: Create earnings config response:', response.data);
        return response.data;
    }

    async updateEarningsConfiguration(configId, configData) {
        console.log('💰 API Service: Updating earnings configuration:', configId, configData);
        const response = await api.put(`/admin/management/earnings-configurations/${configId}`, configData);
        console.log('💰 API Service: Update earnings config response:', response.data);
        return response.data;
    }

    async deleteEarningsConfiguration(configId) {
        console.log('💰 API Service: Deleting earnings configuration:', configId);
        const response = await api.delete(`/admin/management/earnings-configurations/${configId}`);
        console.log('💰 API Service: Delete earnings config response:', response.data);
        return response.data;
    }

    async getAdminStatistics() {
        console.log('📊 API Service: Getting admin statistics');
        const response = await api.get('/admin/management/statistics');
        console.log('📊 API Service: Admin statistics response:', response.data);
        return response.data;
    }

    // Delivery Broadcast endpoints
    async createDeliveryWithBroadcast(deliveryData) {
        console.log('📡 API Service: Creating delivery with broadcast:', deliveryData);
        console.log('🔗 API Base URL:', API_BASE_URL);
        console.log('🔗 Full URL will be:', `${API_BASE_URL}/delivery`);
        console.log('📦 Payload being sent:', JSON.stringify(deliveryData, null, 2));
        const response = await api.post('/delivery', deliveryData);
        console.log('📡 API Service: Create delivery with broadcast response:', response.data);
        return response.data;
    }

    async startBroadcast(deliveryId) {
        console.log('📡 API Service: Starting broadcast for delivery:', deliveryId);
        const response = await api.post(`/delivery/${deliveryId}/broadcast`);
        console.log('📡 API Service: Start broadcast response:', response.data);
        return response.data;
    }

    async assignDeliveryManually(deliveryId, driverId) {
        console.log('📡 API Service: Manually assigning delivery:', deliveryId, 'to driver:', driverId);
        const response = await api.post(`/delivery/${deliveryId}/assign`, { driverId });
        console.log('📡 API Service: Manual assignment response:', response.data);
        return response.data;
    }

    async getBroadcastStats() {
        console.log('📡 API Service: Getting broadcast statistics');
        const response = await api.get('/delivery/broadcast/stats');
        console.log('📡 API Service: Broadcast stats response:', response.data);
        return response.data;
    }

    async handleExpiredBroadcasts() {
        console.log('📡 API Service: Handling expired broadcasts');
        const response = await api.post('/delivery/broadcast/handle-expired');
        console.log('📡 API Service: Handle expired broadcasts response:', response.data);
        return response.data;
    }

    async getActiveBroadcasts(lat, lng) {
        console.log('📡 API Service: Getting active broadcasts for location:', lat, lng);
        const params = lat && lng ? `?lat=${lat}&lng=${lng}` : '';
        const response = await api.get(`/delivery/broadcast/active${params}`);
        console.log('📡 API Service: Active broadcasts response:', response.data);
        return response.data;
    }

    async acceptBroadcastDelivery(deliveryId) {
        console.log('📡 API Service: Accepting broadcast delivery:', deliveryId);
        const response = await api.post(`/delivery/${deliveryId}/accept`);
        console.log('📡 API Service: Accept broadcast delivery response:', response.data);
        return response.data;
    }

    async getBackgroundJobStatus() {
        console.log('⚙️ API Service: Getting background job status');
        const response = await api.get('/api/background-jobs/status');
        console.log('⚙️ API Service: Background job status response:', response.data);
        return response.data;
    }

    async triggerExpiredBroadcasts() {
        console.log('⚙️ API Service: Triggering expired broadcasts processing');
        const response = await api.post('/api/background-jobs/trigger-expired-broadcasts');
        console.log('⚙️ API Service: Trigger expired broadcasts response:', response.data);
        return response.data;
    }

    async triggerBroadcastProcessing() {
        console.log('⚙️ API Service: Triggering broadcast processing');
        const response = await api.post('/api/background-jobs/trigger-broadcast-processing');
        console.log('⚙️ API Service: Trigger broadcast processing response:', response.data);
        return response.data;
    }

    // Global Search endpoints
    async performGlobalSearch(query, entity = 'all', page = 1, limit = 10) {
        console.log('🔍 API Service: Performing global search:', { query, entity, page, limit });
        const params = new URLSearchParams({
            query: query,
            type: entity,
            page: page.toString(),
            limit: limit.toString()
        });
        const response = await api.get(`/api/search/global?${params.toString()}`);
        console.log('🔍 API Service: Global search response:', response.data);
        return response.data;
    }

    async performAdvancedSearch(searchParams) {
        console.log('🔍 API Service: Performing advanced search:', searchParams);
        const response = await api.post('/api/search/advanced', searchParams);
        console.log('🔍 API Service: Advanced search response:', response.data);
        return response.data;
    }

    async getSearchSuggestions(query, entity = 'all') {
        console.log('🔍 API Service: Getting search suggestions:', { query, entity });
        const params = new URLSearchParams({
            query: query,
            entity: entity
        });
        const response = await api.get(`/api/search/suggestions?${params.toString()}`);
        console.log('🔍 API Service: Search suggestions response:', response.data);
        return response.data;
    }

    async searchDeliveries(query, filters = {}) {
        console.log('🔍 API Service: Searching deliveries:', { query, filters });
        const params = new URLSearchParams({ query: query, ...filters });
        const response = await api.get(`/api/search/deliveries?${params.toString()}`);
        console.log('🔍 API Service: Delivery search response:', response.data);
        return response.data;
    }

    async searchDrivers(query, filters = {}) {
        console.log('🔍 API Service: Searching drivers:', { query, filters });
        const params = new URLSearchParams({ query: query, ...filters });
        const response = await api.get(`/api/search/drivers?${params.toString()}`);
        console.log('🔍 API Service: Driver search response:', response.data);
        return response.data;
    }

    async searchRemittances(query, filters = {}) {
        console.log('🔍 API Service: Searching remittances:', { query, filters });
        const params = new URLSearchParams({ query: query, ...filters });
        const response = await api.get(`/api/search/remittances?${params.toString()}`);
        console.log('🔍 API Service: Remittance search response:', response.data);
        return response.data;
    }



    // Enhanced Analytics functions
    async getEnhancedAnalytics(period = 'month') {
        console.log('📊 API Service: Fetching enhanced analytics for period:', period);
        const response = await api.get(`/admin/analytics/enhanced?period=${period}`);
        console.log('📊 API Service: Enhanced analytics response:', response.data);
        return response.data;
    }

    async getCoreAnalytics(period = 'month') {
        console.log('📊 API Service: Fetching core analytics for period:', period);
        const response = await api.get(`/admin/analytics/core?period=${period}`);
        console.log('📊 API Service: Core analytics response:', response.data);
        return response.data;
    }

    async getFinancialAnalytics(period = 'month') {
        console.log('📊 API Service: Fetching financial analytics for period:', period);
        const response = await api.get(`/admin/analytics/financial?period=${period}`);
        console.log('📊 API Service: Financial analytics response:', response.data);
        return response.data;
    }

    async getDriverAnalytics(period = 'month') {
        console.log('📊 API Service: Fetching driver analytics for period:', period);
        const response = await api.get(`/admin/analytics/drivers?period=${period}`);
        console.log('📊 API Service: Driver analytics response:', response.data);
        return response.data;
    }

    async getDeliveryAnalytics(period = 'month') {
        console.log('📊 API Service: Fetching delivery analytics for period:', period);
        const response = await api.get(`/admin/analytics/deliveries?period=${period}`);
        console.log('📊 API Service: Delivery analytics response:', response.data);
        return response.data;
    }

    async getPerformanceAnalytics(period = 'month') {
        console.log('📊 API Service: Fetching performance analytics for period:', period);
        const response = await api.get(`/admin/analytics/performance?period=${period}`);
        console.log('📊 API Service: Performance analytics response:', response.data);
        return response.data;
    }

    async getDocumentAnalytics(period = 'month') {
        console.log('📊 API Service: Fetching document analytics for period:', period);
        const response = await api.get(`/admin/analytics/documents?period=${period}`);
        console.log('📊 API Service: Document analytics response:', response.data);
        return response.data;
    }

    async getRemittanceAnalytics(period = 'month') {
        console.log('📊 API Service: Fetching remittance analytics for period:', period);
        const response = await api.get(`/admin/analytics/remittances?period=${period}`);
        console.log('📊 API Service: Remittance analytics response:', response.data);
        return response.data;
    }

    async getGrowthAnalytics(period = 'month') {
        console.log('📊 API Service: Fetching growth analytics for period:', period);
        const response = await api.get(`/admin/analytics/growth?period=${period}`);
        console.log('📊 API Service: Growth analytics response:', response.data);
        return response.data;
    }

    async exportAnalytics(period = 'month') {
        console.log('📊 API Service: Exporting analytics for period:', period);
        const response = await api.get(`/admin/analytics/export?period=${period}`, {
            responseType: 'blob'
        });
        console.log('📊 API Service: Export analytics response received');
        return response.data;
    }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
export { api };