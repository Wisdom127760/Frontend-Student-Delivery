// Success response handler
const successResponse = (res, data, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message: data.message || 'Operation completed successfully',
        data: data.data || data,
        timestamp: new Date().toISOString()
    });
};

// Error response handler
const errorResponse = (res, message, statusCode = 400) => {
    return res.status(statusCode).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString()
    });
};

// Validation error response handler
const validationErrorResponse = (res, errors) => {
    return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
        timestamp: new Date().toISOString()
    });
};

// Not found response handler
const notFoundResponse = (res, resource = 'Resource') => {
    return res.status(404).json({
        success: false,
        error: `${resource} not found`,
        timestamp: new Date().toISOString()
    });
};

// Unauthorized response handler
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
    return res.status(401).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString()
    });
};

// Forbidden response handler
const forbiddenResponse = (res, message = 'Access forbidden') => {
    return res.status(403).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString()
    });
};

// Server error response handler
const serverErrorResponse = (res, message = 'Internal server error') => {
    return res.status(500).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    successResponse,
    errorResponse,
    validationErrorResponse,
    notFoundResponse,
    unauthorizedResponse,
    forbiddenResponse,
    serverErrorResponse
};
