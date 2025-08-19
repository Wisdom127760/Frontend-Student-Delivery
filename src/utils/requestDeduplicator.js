// Request Deduplication Utility
class RequestDeduplicator {
    constructor() {
        this.pendingRequests = new Map();
    }

    // Execute a request, but if the same request is already pending, return the existing promise
    async execute(key, requestFn) {
        // If there's already a pending request with this key, return it
        if (this.pendingRequests.has(key)) {
            console.log(`🔄 Request deduplication: Reusing pending request for ${key}`);
            return this.pendingRequests.get(key);
        }

        // Create a new request promise
        const requestPromise = requestFn().finally(() => {
            // Remove from pending requests when done
            this.pendingRequests.delete(key);
        });

        // Store the promise
        this.pendingRequests.set(key, requestPromise);

        return requestPromise;
    }

    // Clear all pending requests
    clear() {
        this.pendingRequests.clear();
    }

    // Get the number of pending requests
    getPendingCount() {
        return this.pendingRequests.size;
    }

    // Check if a specific request is pending
    isPending(key) {
        return this.pendingRequests.has(key);
    }
}

// Create a singleton instance
const requestDeduplicator = new RequestDeduplicator();

export default requestDeduplicator;
