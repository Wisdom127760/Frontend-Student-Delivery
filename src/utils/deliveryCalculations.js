/**
 * Delivery Calculations Utility
 * 
 * This utility provides consistent calculation methods for delivery statistics
 * across all endpoints to prevent discrepancies between different parts of the system.
 */

// Calculation methods
export const CALCULATION_METHODS = {
    REAL_TIME_AGGREGATION: 'real-time-aggregation',
    STORED_FIELD: 'stored-field',
    HYBRID: 'hybrid'
};

// Period definitions
export const PERIODS = {
    TODAY: 'today',
    THIS_WEEK: 'thisWeek',
    THIS_MONTH: 'thisMonth',
    ALL_TIME: 'allTime',
    CUSTOM: 'custom'
};

/**
 * Get date range for a given period
 * @param {string} period - The period type
 * @param {Object} customRange - Custom date range { startDate, endDate }
 * @returns {Object} Date range object
 */
export const getDateRange = (period, customRange = null) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (period) {
        case PERIODS.TODAY:
            return {
                startDate: startOfDay.toISOString(),
                endDate: now.toISOString()
            };
        case PERIODS.THIS_WEEK:
            return {
                startDate: startOfWeek.toISOString(),
                endDate: now.toISOString()
            };
        case PERIODS.THIS_MONTH:
            return {
                startDate: startOfMonth.toISOString(),
                endDate: now.toISOString()
            };
        case PERIODS.CUSTOM:
            return customRange || {
                startDate: startOfDay.toISOString(),
                endDate: now.toISOString()
            };
        case PERIODS.ALL_TIME:
        default:
            return {
                startDate: null,
                endDate: null
            };
    }
};

/**
 * Validate delivery data for consistent calculations
 * @param {Object} delivery - Delivery object
 * @returns {boolean} Whether the delivery is valid for calculations
 */
export const isValidDeliveryForCalculation = (delivery) => {
    return delivery &&
        delivery.status &&
        delivery.createdAt &&
        (delivery.status === 'delivered' ? delivery.completedAt : true);
};

/**
 * Calculate completed deliveries with consistent logic
 * @param {Array} deliveries - Array of delivery objects
 * @param {Object} dateRange - Date range filter
 * @param {string} calculationMethod - Calculation method to use
 * @returns {Object} Calculation results
 */
export const calculateCompletedDeliveries = (deliveries, dateRange = null, calculationMethod = CALCULATION_METHODS.REAL_TIME_AGGREGATION) => {
    if (!Array.isArray(deliveries)) {
        return {
            total: 0,
            completed: 0,
            pending: 0,
            inProgress: 0,
            cancelled: 0,
            calculationMethod,
            dateRange
        };
    }

    let filteredDeliveries = deliveries.filter(isValidDeliveryForCalculation);

    // Apply date range filter if provided
    if (dateRange && dateRange.startDate && dateRange.endDate) {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        filteredDeliveries = filteredDeliveries.filter(delivery => {
            const deliveryDate = new Date(delivery.createdAt);
            return deliveryDate >= startDate && deliveryDate <= endDate;
        });
    }

    // Calculate statistics
    const stats = {
        total: filteredDeliveries.length,
        completed: 0,
        pending: 0,
        inProgress: 0,
        cancelled: 0,
        calculationMethod,
        dateRange
    };

    filteredDeliveries.forEach(delivery => {
        switch (delivery.status) {
            case 'delivered':
                stats.completed++;
                break;
            case 'pending':
                stats.pending++;
                break;
            case 'assigned':
            case 'picked_up':
            case 'in_transit':
                stats.inProgress++;
                break;
            case 'cancelled':
                stats.cancelled++;
                break;
        }
    });

    return stats;
};

/**
 * Calculate earnings with consistent logic
 * @param {Array} deliveries - Array of delivery objects
 * @param {Object} dateRange - Date range filter
 * @returns {Object} Earnings calculation results
 */
export const calculateEarnings = (deliveries, dateRange = null) => {
    if (!Array.isArray(deliveries)) {
        return {
            total: 0,
            completed: 0,
            pending: 0,
            average: 0,
            calculationMethod: CALCULATION_METHODS.REAL_TIME_AGGREGATION,
            dateRange
        };
    }

    let filteredDeliveries = deliveries.filter(isValidDeliveryForCalculation);

    // Apply date range filter if provided
    if (dateRange && dateRange.startDate && dateRange.endDate) {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        filteredDeliveries = filteredDeliveries.filter(delivery => {
            const deliveryDate = new Date(delivery.createdAt);
            return deliveryDate >= startDate && deliveryDate <= endDate;
        });
    }

    const earnings = {
        total: 0,
        completed: 0,
        pending: 0,
        average: 0,
        calculationMethod: CALCULATION_METHODS.REAL_TIME_AGGREGATION,
        dateRange
    };

    let completedCount = 0;

    filteredDeliveries.forEach(delivery => {
        const amount = Number(delivery.fee || delivery.amount || 0);
        earnings.total += amount;

        if (delivery.status === 'delivered') {
            earnings.completed += amount;
            completedCount++;
        } else if (delivery.status === 'pending') {
            earnings.pending += amount;
        }
    });

    earnings.average = completedCount > 0 ? earnings.completed / completedCount : 0;

    return earnings;
};

/**
 * Compare calculation results and identify discrepancies
 * @param {Object} storedData - Data from stored fields
 * @param {Object} calculatedData - Data from real-time calculation
 * @returns {Object} Comparison results
 */
export const compareCalculations = (storedData, calculatedData) => {
    const discrepancies = {
        hasDiscrepancy: false,
        fields: {},
        recommendations: []
    };

    // Compare completed deliveries
    if (storedData.completedDeliveries !== calculatedData.completed) {
        discrepancies.hasDiscrepancy = true;
        discrepancies.fields.completedDeliveries = {
            stored: storedData.completedDeliveries || 0,
            calculated: calculatedData.completed || 0,
            difference: Math.abs((storedData.completedDeliveries || 0) - (calculatedData.completed || 0))
        };
    }

    // Compare total deliveries
    if (storedData.totalDeliveries !== calculatedData.total) {
        discrepancies.hasDiscrepancy = true;
        discrepancies.fields.totalDeliveries = {
            stored: storedData.totalDeliveries || 0,
            calculated: calculatedData.total || 0,
            difference: Math.abs((storedData.totalDeliveries || 0) - (calculatedData.total || 0))
        };
    }

    // Generate recommendations
    if (discrepancies.hasDiscrepancy) {
        discrepancies.recommendations.push(
            'Use real-time aggregation for consistent results across all endpoints',
            'Consider updating stored fields to match calculated values',
            'Implement data validation to prevent future discrepancies'
        );
    }

    return discrepancies;
};

/**
 * Format calculation results for display
 * @param {Object} results - Calculation results
 * @param {string} displayType - Type of display ('summary', 'detailed', 'comparison')
 * @returns {Object} Formatted results
 */
export const formatCalculationResults = (results, displayType = 'summary') => {
    const formatted = {
        ...results,
        displayType,
        timestamp: new Date().toISOString()
    };

    switch (displayType) {
        case 'summary':
            return {
                total: results.total || 0,
                completed: results.completed || 0,
                calculationMethod: results.calculationMethod,
                dateRange: results.dateRange
            };
        case 'detailed':
            return formatted;
        case 'comparison':
            return {
                ...formatted,
                hasDiscrepancy: results.hasDiscrepancy || false,
                recommendations: results.recommendations || []
            };
        default:
            return formatted;
    }
};

export default {
    CALCULATION_METHODS,
    PERIODS,
    getDateRange,
    isValidDeliveryForCalculation,
    calculateCompletedDeliveries,
    calculateEarnings,
    compareCalculations,
    formatCalculationResults
};
