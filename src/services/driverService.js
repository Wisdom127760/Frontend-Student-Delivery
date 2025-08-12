import apiService from './api.js';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Driver Management Service
class DriverService {
    // Get all drivers with filters
    async getDrivers(filters = {}) {
        try {
            const response = await apiService.getDrivers(filters);

            // Ensure we always return a proper structure
            if (response && typeof response === 'object') {
                // If response has a drivers property, return it
                if (response.drivers && Array.isArray(response.drivers)) {
                    return response;
                }
                // If response is an array, wrap it in drivers property
                if (Array.isArray(response)) {
                    return { drivers: response };
                }
                // If response has other properties but no drivers, return empty array
                return { drivers: [] };
            }

            // Fallback for unexpected response types
            return { drivers: [] };
        } catch (error) {
            console.error('Error fetching drivers:', error);
            // Return empty array structure on error
            return { drivers: [] };
        }
    }

    // Get single driver by ID
    async getDriver(driverId) {
        try {
            const response = await apiService.getDriver(driverId);
            return response;
        } catch (error) {
            console.error('Error fetching driver:', error);
            throw error;
        }
    }

    // Create new driver
    async createDriver(driverData) {
        try {
            const response = await apiService.createDriver(driverData);
            return response;
        } catch (error) {
            console.error('Error creating driver:', error);
            throw error;
        }
    }

    // Invite new driver (OTP-based)
    async inviteDriver(driverData) {
        try {
            const response = await apiService.inviteDriver(driverData);
            return response;
        } catch (error) {
            console.error('Error inviting driver:', error);
            throw error;
        }
    }

    // Get pending invitations
    async getPendingInvitations(page = 1, limit = 20) {
        try {
            const response = await apiService.getPendingInvitations(page, limit);
            return response;
        } catch (error) {
            console.error('Error fetching pending invitations:', error);
            throw error;
        }
    }

    // Cancel invitation
    async cancelInvitation(invitationId) {
        try {
            const response = await apiService.cancelInvitation(invitationId);
            return response;
        } catch (error) {
            console.error('Error canceling invitation:', error);
            throw error;
        }
    }

    // Resend invitation
    async resendInvitation(invitationId) {
        try {
            const response = await apiService.resendInvitation(invitationId);
            return response;
        } catch (error) {
            console.error('Error resending invitation:', error);
            throw error;
        }
    }

    // Update driver
    async updateDriver(driverId, driverData) {
        try {
            const response = await apiService.updateDriver(driverId, driverData);
            return response;
        } catch (error) {
            console.error('Error updating driver:', error);
            throw error;
        }
    }

    // Delete driver
    async deleteDriver(driverId) {
        try {
            const response = await apiService.deleteDriver(driverId);
            return response;
        } catch (error) {
            console.error('Error deleting driver:', error);
            throw error;
        }
    }

    // Suspend driver
    async suspendDriver(driverId, reason = '') {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/drivers/${driverId}/suspend`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });

            if (!response.ok) {
                throw new Error('Failed to suspend driver');
            }

            return await response.json();
        } catch (error) {
            console.error('Error suspending driver:', error);
            throw error;
        }
    }

    // Unsuspend driver
    async unsuspendDriver(driverId) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/drivers/${driverId}/unsuspend`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to unsuspend driver');
            }

            return await response.json();
        } catch (error) {
            console.error('Error unsuspending driver:', error);
            throw error;
        }
    }

    // Update driver verification status
    async updateDriverVerification(driverId, verificationData) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/drivers/${driverId}/verification`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(verificationData)
            });

            if (!response.ok) {
                throw new Error('Failed to update driver verification');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating driver verification:', error);
            throw error;
        }
    }

    // Get driver status overview
    async getDriverStatus() {
        try {
            const response = await fetch('/api/admin/drivers/status', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch driver status');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching driver status:', error);
            throw error;
        }
    }

    // Update driver documents
    async updateDriverDocuments(driverId, documentType, documentData) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/drivers/${driverId}/documents/${documentType}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(documentData)
            });

            if (!response.ok) {
                throw new Error('Failed to update driver documents');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating driver documents:', error);
            throw error;
        }
    }

    // Get driver statistics with consistent calculation methods
    async getDriverStatistics(driverId, period = 'allTime', customDateRange = null) {
        try {
            let params = new URLSearchParams();

            // Add period parameter
            if (period && period !== 'allTime') {
                params.append('period', period);
            }

            // Add custom date range if provided
            if (customDateRange && customDateRange.startDate && customDateRange.endDate) {
                params.append('startDate', customDateRange.startDate);
                params.append('endDate', customDateRange.endDate);
            }

            // Add driver ID if provided
            if (driverId) {
                params.append('driverId', driverId);
            }

            const queryString = params.toString();
            const url = `/admin/drivers/statistics${queryString ? `?${queryString}` : ''}`;

            const response = await apiService.get(url);

            // Ensure consistent data structure
            const data = response.data || response;

            return {
                success: true,
                data: {
                    // Always include both all-time and filtered statistics
                    allTime: {
                        totalDeliveries: data.allTime?.totalDeliveries || 0,
                        completedDeliveries: data.allTime?.completedDeliveries || 0,
                        totalEarnings: data.allTime?.totalEarnings || 0,
                        averageRating: data.allTime?.averageRating || 0
                    },
                    filtered: {
                        totalDeliveries: data.filtered?.totalDeliveries || 0,
                        completedDeliveries: data.filtered?.completedDeliveries || 0,
                        totalEarnings: data.filtered?.totalEarnings || 0,
                        averageRating: data.filtered?.averageRating || 0
                    },
                    period: period,
                    dateRange: customDateRange,
                    calculationMethod: 'real-time-aggregation'
                }
            };
        } catch (error) {
            console.error('Error fetching driver statistics:', error);
            return {
                success: false,
                error: error.message,
                data: {
                    allTime: { totalDeliveries: 0, completedDeliveries: 0, totalEarnings: 0, averageRating: 0 },
                    filtered: { totalDeliveries: 0, completedDeliveries: 0, totalEarnings: 0, averageRating: 0 },
                    period: period,
                    dateRange: customDateRange,
                    calculationMethod: 'real-time-aggregation'
                }
            };
        }
    }

    // Get driver analytics with date range support
    async getDriverAnalytics(driverId, period = 'month') {
        try {
            const response = await apiService.get(`/admin/drivers/${driverId}/analytics?period=${period}`);

            // Ensure consistent data structure
            const data = response.data || response;

            return {
                success: true,
                data: {
                    period: period,
                    statistics: {
                        totalDeliveries: data.totalDeliveries || 0,
                        completedDeliveries: data.completedDeliveries || 0,
                        totalEarnings: data.totalEarnings || 0,
                        averageRating: data.averageRating || 0,
                        onTimeDeliveries: data.onTimeDeliveries || 0,
                        lateDeliveries: data.lateDeliveries || 0
                    },
                    breakdown: data.breakdown || [],
                    calculationMethod: 'real-time-aggregation'
                }
            };
        } catch (error) {
            console.error('Error fetching driver analytics:', error);
            return {
                success: false,
                error: error.message,
                data: {
                    period: period,
                    statistics: {
                        totalDeliveries: 0,
                        completedDeliveries: 0,
                        totalEarnings: 0,
                        averageRating: 0,
                        onTimeDeliveries: 0,
                        lateDeliveries: 0
                    },
                    breakdown: [],
                    calculationMethod: 'real-time-aggregation'
                }
            };
        }
    }

    // Get driver deliveries
    async getDriverDeliveries(driverId, filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, String(value));
                }
            });

            const response = await fetch(`${API_BASE_URL}/admin/drivers/${driverId}/deliveries?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch driver deliveries');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching driver deliveries:', error);
            throw error;
        }
    }

    // Get driver earnings
    async getDriverEarnings(driverId, period = 'month') {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/drivers/${driverId}/earnings?period=${period}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch driver earnings');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching driver earnings:', error);
            throw error;
        }
    }

    // Bulk operations
    async bulkSuspendDrivers(driverIds, reason = '') {
        try {
            const response = await fetch('/api/admin/drivers/bulk-suspend', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ driverIds, reason })
            });

            if (!response.ok) {
                throw new Error('Failed to bulk suspend drivers');
            }

            return await response.json();
        } catch (error) {
            console.error('Error bulk suspending drivers:', error);
            throw error;
        }
    }

    async bulkUnsuspendDrivers(driverIds) {
        try {
            const response = await fetch('/api/admin/drivers/bulk-unsuspend', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ driverIds })
            });

            if (!response.ok) {
                throw new Error('Failed to bulk unsuspend drivers');
            }

            return await response.json();
        } catch (error) {
            console.error('Error bulk unsuspending drivers:', error);
            throw error;
        }
    }

    // Export drivers data
    async exportDrivers(format = 'csv', filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('format', format);
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, String(value));
                }
            });

            const response = await fetch(`${API_BASE_URL}/admin/drivers/export?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to export drivers data');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `drivers-export-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return { success: true };
        } catch (error) {
            console.error('Error exporting drivers data:', error);
            throw error;
        }
    }
}

// Create singleton instance
const driverService = new DriverService();

export default driverService;
