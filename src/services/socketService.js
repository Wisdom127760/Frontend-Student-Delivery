import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.initialized = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect(userId, userType) {
        try {
            // Connect to Socket.IO server
            this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
                auth: {
                    userId,
                    userType
                },
                transports: ['websocket', 'polling'],
                timeout: 20000,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000
            });

            this.setupEventListeners();
            this.connected = true;
            this.initialized = true;

            console.log('🔌 Socket connected:', { userId, userType });
        } catch (error) {
            console.error('Socket connection error:', error);
        }
    }

    setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('🔌 Socket connected successfully');
            this.connected = true;
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔌 Socket connection error:', error);
            this.reconnectAttempts++;
            this.connected = false;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('🔌 Max reconnection attempts reached. Backend server may not be running.');
                console.error('🔌 Please ensure the backend server is running on localhost:3001');
                // Stop trying to reconnect to avoid spam
                this.socket.disconnect();
            }
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('🔌 Socket reconnected after', attemptNumber, 'attempts');
            this.connected = true;
            this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('🔌 Socket reconnection error:', error);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('🔌 Socket reconnection failed');
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
            this.initialized = false;
            console.log('🔌 Socket disconnected');
        }
    }

    emit(event, data) {
        if (this.socket && this.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected, cannot emit:', event);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    // Driver-specific methods
    updateDriverStatus(status) {
        this.emit('driver:status', { status });
    }

    updateDriverLocation(location) {
        this.emit('driver:location', location);
    }

    // Admin-specific methods
    requestDriverStatus() {
        this.emit('admin:request-driver-status');
    }

    // Get socket instance for direct access
    getSocket() {
        return this.socket;
    }

    // Check if socket is initialized
    isInitialized() {
        return this.initialized;
    }

    // Force socket initialization if not already done
    ensureInitialized(userId, userType) {
        if (!this.initialized && userId && userType) {
            this.connect(userId, userType);
        }
        return this.initialized;
    }

    // Check connection status
    isConnected() {
        // If socket is not initialized, consider it as not connected yet
        if (!this.initialized || !this.socket) {
            return false;
        }
        return this.connected && this.socket.connected;
    }

    // Alternative method name for consistency
    isSocketConnected() {
        return this.connected && this.socket?.connected;
    }
}

// Create singleton instance
const socketService = new SocketService();

// Export socket instance for direct access
export const socket = socketService.getSocket();

export default socketService;
export { socketService }; 