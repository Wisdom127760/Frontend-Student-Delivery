// Rate Limiting Utility
class RateLimiter {
    constructor() {
        this.requestTimestamps = new Map();
        this.minInterval = 5000; // Minimum 5 seconds between requests for the same endpoint (reduced for testing)
    }

    // Check if we can make a request to a specific endpoint
    canMakeRequest(endpoint) {
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
}

// Create a singleton instance
const rateLimiter = new RateLimiter();

export default rateLimiter;
