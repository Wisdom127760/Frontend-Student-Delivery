// Rate Limiting Utility
class RateLimiter {
    constructor() {
        this.requestTimestamps = new Map();
        // Development mode: much shorter intervals for testing
        this.minInterval = process.env.NODE_ENV === 'development' ? 100 : 1000; // 100ms for dev, 1s for prod
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }

    // Check if we can make a request to a specific endpoint
    canMakeRequest(endpoint) {
        // In development, allow more frequent requests
        if (this.isDevelopment) {
            // For development, we can be more lenient
            const now = Date.now();
            const lastRequest = this.requestTimestamps.get(endpoint);

            if (!lastRequest) {
                this.requestTimestamps.set(endpoint, now);
                return true;
            }

            const timeSinceLastRequest = now - lastRequest;

            // In development, allow requests every 100ms instead of 1s
            if (timeSinceLastRequest >= this.minInterval) {
                this.requestTimestamps.set(endpoint, now);
                return true;
            }

            // For development, we can also add some randomness to avoid exact timing
            if (Math.random() < 0.1) { // 10% chance to allow even if too soon
                this.requestTimestamps.set(endpoint, now);
                return true;
            }

            return false;
        }

        // Production behavior
        const now = Date.now();
        const lastRequest = this.requestTimestamps.get(endpoint);

        if (!lastRequest) {
            this.requestTimestamps.set(endpoint, now);
            return true;
        }

        const timeSinceLastRequest = now - lastRequest;

        if (timeSinceLastRequest >= this.minInterval) {
            this.requestTimestamps.set(endpoint, now);
            return true;
        }

        return false;
    }

    // Get time until next request can be made
    getTimeUntilNextRequest(endpoint) {
        const now = Date.now();
        const lastRequest = this.requestTimestamps.get(endpoint);

        if (!lastRequest) {
            return 0;
        }

        const timeSinceLastRequest = now - lastRequest;
        return Math.max(0, this.minInterval - timeSinceLastRequest);
    }

    // Clear timestamps for a specific endpoint
    clearEndpoint(endpoint) {
        this.requestTimestamps.delete(endpoint);
    }

    // Clear all timestamps
    clear() {
        this.requestTimestamps.clear();
    }

    // Development helper: force allow next request
    forceAllowNext(endpoint) {
        if (this.isDevelopment) {
            this.requestTimestamps.delete(endpoint);
            return true;
        }
        return false;
    }

    // Get current rate limit status
    getStatus() {
        return {
            isDevelopment: this.isDevelopment,
            minInterval: this.minInterval,
            activeEndpoints: this.requestTimestamps.size
        };
    }
}

// Create a singleton instance
const rateLimiter = new RateLimiter();

export default rateLimiter;
