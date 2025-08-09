import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserRole, hasRole } from '../../utils/userHelpers';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    // Use helper function for consistent role checking
    const userRole = getUserRole(user);
    const hasAccess = allowedRoles.length === 0 || hasRole(user, allowedRoles);

    console.log('🛡️ ProtectedRoute check:', {
        isLoading,
        isAuthenticated,
        user,
        userRole,
        allowedRoles,
        hasAccess,
        currentPath: location.pathname
    });

    if (isLoading) {
        console.log('🛡️ Loading state - showing spinner');
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log('🛡️ Not authenticated - redirecting to login');
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (!hasAccess) {
        console.log('🛡️ Access denied - redirecting to login. User role:', userRole, 'Allowed:', allowedRoles);
        return <Navigate to="/" replace />;
    }

    console.log('🛡️ Access granted - rendering protected content');
    return <>{children}</>;
};

export default ProtectedRoute;
