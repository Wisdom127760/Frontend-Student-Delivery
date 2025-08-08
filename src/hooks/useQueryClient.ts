import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      onError: (error: any) => {
        const message = error?.response?.data?.message || error?.message || 'An error occurred';
        toast.error(message);
      },
    },
    mutations: {
      onError: (error: any) => {
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
  drivers: (filters?: any) => ['admin', 'drivers', filters],
  driver: (id: string) => ['admin', 'driver', id],
  deliveries: (filters?: any) => ['admin', 'deliveries', filters],
  delivery: (id: string) => ['admin', 'delivery', id],
  
  // Driver
  driverProfile: ['driver', 'profile'],
  driverDeliveries: (filters?: any) => ['driver', 'deliveries', filters],
  driverEarnings: (period?: string) => ['driver', 'earnings', period],
  
  // Public
  deliveryTracking: (code: string) => ['delivery', 'tracking', code],
} as const;
