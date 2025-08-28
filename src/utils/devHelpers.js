// Development Helper Utilities
import rateLimiter from './rateLimiter';

class DevHelpers {
    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.rateLimitBypass = false;
    }

    // Bypass rate limiting for development
    enableRateLimitBypass() {
        if (this.isDevelopment) {
            this.rateLimitBypass = true;
            console.log('🔧 Development: Rate limit bypass enabled');
            return true;
        }
        return false;
    }

    // Disable rate limiting bypass
    disableRateLimitBypass() {
        if (this.isDevelopment) {
            this.rateLimitBypass = false;
            console.log('🔧 Development: Rate limit bypass disabled');
            return true;
        }
        return false;
    }

    // Check if rate limiting should be bypassed
    shouldBypassRateLimit() {
        return this.isDevelopment && this.rateLimitBypass;
    }

    // Clear all rate limiting timestamps
    clearRateLimits() {
        if (this.isDevelopment) {
            rateLimiter.clear();
            console.log('🔧 Development: All rate limits cleared');
            return true;
        }
        return false;
    }

    // Get development status
    getStatus() {
        return {
            isDevelopment: this.isDevelopment,
            rateLimitBypass: this.rateLimitBypass,
            rateLimiterStatus: rateLimiter.getStatus()
        };
    }

    // Development-only API retry with exponential backoff
    async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
        if (!this.isDevelopment) {
            return fn(); // In production, just call the function once
        }

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (error.response?.status === 429 && attempt < maxRetries) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    console.log(`🔧 Development: Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw error;
            }
        }
    }

    // Development-only: Force allow next request for specific endpoint
    forceAllowNextRequest(endpoint) {
        if (this.isDevelopment) {
            return rateLimiter.forceAllowNext(endpoint);
        }
        return false;
    }

    // Development-only: Log API call for debugging
    logApiCall(method, url, data = null) {
        if (this.isDevelopment) {
            console.log(`🔧 API Call: ${method} ${url}`, data ? { data } : '');
        }
    }

    // Development-only: Simulate network delay
    async simulateDelay(ms = 100) {
        if (this.isDevelopment) {
            await new Promise(resolve => setTimeout(resolve, ms));
        }
    }
}

// Create a singleton instance
const devHelpers = new DevHelpers();

// Expose to window for development debugging
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    window.devHelpers = devHelpers;
    console.log('🔧 Development helpers available at window.devHelpers');
    console.log('🔧 Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(devHelpers)));
}

export default devHelpers;
