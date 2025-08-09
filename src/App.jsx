import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import OTPVerification from './components/auth/OTPVerification';
import AdminDashboard from './pages/admin/AdminDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';
import DriversPage from './pages/admin/DriversPage';
import ProfilePage from './pages/admin/ProfilePage';
import DriverProfilePage from './pages/driver/ProfilePage';
import MyDeliveries from './pages/driver/MyDeliveries';
import EarningsPage from './pages/driver/EarningsPage';
import RemittancePage from './pages/driver/RemittancePage';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
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
        console.error('Mutation error:', error);
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="App">
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/verify-otp" element={<OTPVerification />} />
              <Route path="/test-otp" element={
                <div className="min-h-screen bg-green-100 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-green-800 mb-4">🎉 Navigation Works!</h1>
                    <p className="text-green-600">This proves React Router is working.</p>
                    <a href="/" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">Go Back</a>
                  </div>
                </div>
              } />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/drivers" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DriversPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/profile" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/driver" element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverDashboard />
                </ProtectedRoute>
              } />
              <Route path="/driver/deliveries" element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <MyDeliveries />
                </ProtectedRoute>
              } />
              <Route path="/driver/earnings" element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <EarningsPage />
                </ProtectedRoute>
              } />
              <Route path="/driver/remittances" element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <RemittancePage />
                </ProtectedRoute>
              } />
              <Route path="/driver/profile" element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverProfilePage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-red-100">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-red-600 mb-4">404 - Page Not Found</h1>
                  <p className="text-gray-600">Current URL: {window.location.pathname}</p>
                  <a href="/" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">Go Home</a>
                </div>
              </div>} />
            </Routes>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;