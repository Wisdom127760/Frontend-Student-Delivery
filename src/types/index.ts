// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'driver';
  profileImage?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver extends User {
  role: 'driver';
  vehicleInfo?: string;
  licenseNumber?: string;
  status: 'online' | 'offline' | 'busy';
  currentLocation?: string;
  lastActive: string;
  totalDeliveries: number;
  totalEarnings: number;
  rating: number;
  area?: string;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

// Delivery Types
export interface Delivery {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupLocation: string;
  deliveryLocation: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  amount: number;
  paymentMethod: 'cash' | 'card' | 'online';
  estimatedTime: number; // in minutes
  actualTime?: number;
  driverId?: string;
  driver?: Driver;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

// Analytics Types
export interface DashboardStats {
  totalDrivers: number;
  activeDrivers: number;
  totalDeliveries: number;
  completedDeliveries: number;
  completionRate: number;
  totalRevenue: number;
  averageRating: number;
  pendingDeliveries: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface LoginForm {
  email: string;
  userType: 'admin' | 'driver';
}

export interface OTPForm {
  email: string;
  userType: 'admin' | 'driver';
  otp: string;
}

export interface DriverForm {
  name: string;
  email: string;
  phone: string;
  address?: string;
  vehicleInfo?: string;
  licenseNumber?: string;
  area?: string;
}

export interface DeliveryForm {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupLocation: string;
  deliveryLocation: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  amount: number;
  paymentMethod: 'cash' | 'card' | 'online';
  estimatedTime: number;
  notes?: string;
}

// Filter Types
export interface DeliveryFilters {
  status?: string;
  priority?: string;
  driverId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DriverFilters {
  status?: string;
  area?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Real-time Types
export interface DriverStatus {
  id: string;
  status: 'online' | 'offline' | 'busy';
  currentLocation?: string;
  lastActive: string;
}

export interface RealTimeUpdate {
  type: 'driver_status' | 'delivery_status' | 'new_delivery';
  data: any;
  timestamp: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  userId: string;
}

// Earnings Types
export interface Earnings {
  total: number;
  thisWeek: number;
  thisMonth: number;
  breakdown: {
    date: string;
    amount: number;
    deliveries: number;
  }[];
}

// Area Types
export interface Area {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

// Public Tracking Types
export interface DeliveryTracking {
  code: string;
  status: string;
  estimatedDelivery: string;
  currentLocation?: string;
  driver?: {
    name: string;
    phone: string;
  };
  timeline: {
    status: string;
    timestamp: string;
    location?: string;
  }[];
}
