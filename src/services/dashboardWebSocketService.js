import socketService from './socketService';

class DashboardWebSocketService {
    constructor() {
        this.listeners = new Map();
        this.connected = false;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;

        // Listen for dashboard data updates
        this.setupDashboardListeners();
        this.initialized = true;
        console.log('📊 Dashboard WebSocket service initialized');
    }

    setupDashboardListeners() {
        const socket = socketService.getSocket();
        if (!socket) {
            console.warn('⚠️ Socket not available for dashboard listeners');
            return;
        }

        // Listen for real-time dashboard updates
        socket.on('dashboard-update', (data) => {
            console.log('📊 Received dashboard update:', data);
            this.notifyListeners('dashboard-update', data);
        });

        // Listen for driver-specific updates
        socket.on('driver-dashboard-update', (data) => {
            console.log('📊 Received driver dashboard update:', data);
            this.notifyListeners('driver-dashboard-update', data);
        });

        // Listen for admin dashboard updates
        socket.on('admin-dashboard-update', (data) => {
            console.log('📊 Received admin dashboard update:', data);
            this.notifyListeners('admin-dashboard-update', data);
        });

        // Listen for leaderboard updates
        socket.on('leaderboard-update', (data) => {
            console.log('🏆 Received leaderboard update:', data);
            this.notifyListeners('leaderboard-update', data);
        });

        // Listen for delivery updates
        socket.on('delivery-update', (data) => {
            console.log('📦 Received delivery update:', data);
            this.notifyListeners('delivery-update', data);
        });

        // Listen for earnings updates
        socket.on('earnings-update', (data) => {
            console.log('💰 Received earnings update:', data);
            this.notifyListeners('earnings-update', data);
        });

        // Listen for referral updates
        socket.on('referral-update', (data) => {
            console.log('👥 Received referral update:', data);
            this.notifyListeners('referral-update', data);
        });

        // Listen for dashboard data response
        socket.on('dashboard-data-response', (data) => {
            console.log('📊 Received dashboard data response:', data);
            this.notifyListeners('dashboard-data-response', data);
        });

        // Listen for leaderboard data response
        socket.on('leaderboard-data-response', (data) => {
            console.log('🏆 Received leaderboard data response:', data);
            this.notifyListeners('leaderboard-data-response', data);
        });
    }

    // Subscribe to dashboard updates
    subscribe(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType).add(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(eventType);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    // Notify all listeners for a specific event
    notifyListeners(eventType, data) {
        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in dashboard listener callback:', error);
                }
            });
        }
    }

    // Request dashboard data via WebSocket
    requestDashboardData(period = 'today', userType = 'driver') {
        const socket = socketService.getSocket();
        if (!socket) {
            console.warn('⚠️ Socket not available for dashboard request');
            return false;
        }

        console.log('📊 Requesting dashboard data via WebSocket:', { period, userType });
        socket.emit('request-dashboard-data', { period, userType });
        return true;
    }

    // Request leaderboard data via WebSocket
    requestLeaderboardData(period = 'month', category = 'overall') {
        const socket = socketService.getSocket();
        if (!socket) {
            console.warn('⚠️ Socket not available for leaderboard request');
            return false;
        }

        console.log('🏆 Requesting leaderboard data via WebSocket:', { period, category });
        socket.emit('request-leaderboard-data', { period, category });
        return true;
    }

    // Request specific driver data
    requestDriverData(driverId, dataType = 'dashboard') {
        const socket = socketService.getSocket();
        if (!socket) {
            console.warn('⚠️ Socket not available for driver data request');
            return false;
        }

        console.log('👤 Requesting driver data via WebSocket:', { driverId, dataType });
        socket.emit('request-driver-data', { driverId, dataType });
        return true;
    }

    // Cleanup
    cleanup() {
        this.listeners.clear();
        this.initialized = false;
        console.log('📊 Dashboard WebSocket service cleaned up');
    }
}

// Create singleton instance
const dashboardWebSocketService = new DashboardWebSocketService();
export default dashboardWebSocketService;
