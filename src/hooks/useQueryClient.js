import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                // Don't retry on 4xx errors
                if (error?.response?.status >= 400 && error?.response?.status < 500) {
                    return false;
                }
                return failureCount < 3;
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
        },
        mutations: {
            onError: (error) => {
                const message = error?.response?.data?.message || error?.message || 'An error occurred';
                toast.error(message);
            },
        },
    },
});

// Query keys for consistent caching
export const queryKeys = {
    // Auth
    auth: ['auth'],

    // Admin
    dashboard: ['admin', 'dashboard'],
    drivers: (filters) => ['admin', 'drivers', filters],
    driver: (id) => ['admin', 'driver', id],
    deliveries: (filters) => ['admin', 'deliveries', filters],
    delivery: (id) => ['admin', 'delivery', id],

    // Driver
    driverProfile: ['driver', 'profile'],
    driverDeliveries: (filters) => ['driver', 'deliveries', filters],
    driverEarnings: (period) => ['driver', 'earnings', period],

    // Public
    deliveryTracking: (code) => ['delivery', 'tracking', code],
};
