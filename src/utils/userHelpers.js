/**
 * User Helper Utilities
 * 
 * Provides consistent user role/type checking across the application
 * to prevent authentication issues caused by field name differences.
 */

/**
 * Get user role from user object (handles both 'role' and 'userType' fields)
 * @param {Object} user - User object from authentication
 * @returns {string|null} - User role/type or null if not found
 */
export const getUserRole = (user) => {
    if (!user) return null;
    return user.role || user.userType || null;
};

/**
 * Check if user has any of the specified roles
 * @param {Object} user - User object from authentication
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {boolean} - True if user has any of the allowed roles
 */
export const hasRole = (user, allowedRoles) => {
    if (!user || !allowedRoles) return false;

    const userRole = getUserRole(user);
    if (!userRole) return false;

    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return rolesArray.includes(userRole);
};

/**
 * Check if user is an admin (handles different admin role variations)
 * @param {Object} user - User object from authentication
 * @returns {boolean} - True if user is any type of admin
 */
export const isAdmin = (user) => {
    const userRole = getUserRole(user);
    return userRole === 'admin' || userRole === 'super_admin';
};

/**
 * Check if user is a driver
 * @param {Object} user - User object from authentication
 * @returns {boolean} - True if user is a driver
 */
export const isDriver = (user) => {
    const userRole = getUserRole(user);
    return userRole === 'driver';
};

/**
 * Check if user is a super admin
 * @param {Object} user - User object from authentication
 * @returns {boolean} - True if user is a super admin
 */
export const isSuperAdmin = (user) => {
    const userRole = getUserRole(user);
    return userRole === 'super_admin';
};

/**
 * Get user display information
 * @param {Object} user - User object from authentication
 * @returns {Object} - Object with name, email, role for display
 */
export const getUserDisplayInfo = (user) => {
    if (!user) return { name: 'Unknown', email: 'Unknown', role: 'Unknown' };

    return {
        name: user.name || user.username || 'Unknown User',
        email: user.email || 'Unknown Email',
        role: getUserRole(user) || 'Unknown Role'
    };
};

// Export default object for easier importing
const userHelpers = {
    getUserRole,
    hasRole,
    isAdmin,
    isDriver,
    isSuperAdmin,
    getUserDisplayInfo
};

export default userHelpers;
