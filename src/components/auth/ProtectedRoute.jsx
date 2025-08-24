import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasRole } from '../../utils/userHelpers';
import LoadingScreen from '../common/LoadingScreen';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    // Use helper function for consistent role checking
    const hasAccess = allowedRoles.length === 0 || hasRole(user, allowedRoles);

    if (isLoading) {
        return <LoadingScreen message="Preparing your dashboard..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (!hasAccess) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
