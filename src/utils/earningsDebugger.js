// Earnings Debugger Utility
// This utility helps debug earnings issues and test the validation service

import EarningsValidationService from '../services/earningsValidationService';

export const debugEarnings = async () => {
    console.log('🔍 Starting earnings debug session...');

    const results = {
        timestamp: new Date().toISOString(),
        tests: [],
        summary: {}
    };

    // Test 1: Check if service is available
    try {
        console.log('🧪 Test 1: Checking EarningsValidationService availability...');
        if (typeof EarningsValidationService === 'object') {
            results.tests.push({ name: 'Service Available', status: 'PASS', message: 'EarningsValidationService is available' });
            console.log('✅ EarningsValidationService is available');
        } else {
            results.tests.push({ name: 'Service Available', status: 'FAIL', message: 'EarningsValidationService not found' });
            console.log('❌ EarningsValidationService not found');
        }
    } catch (error) {
        results.tests.push({ name: 'Service Available', status: 'ERROR', message: error.message });
        console.log('❌ Error checking service availability:', error);
    }

    // Test 2: Check authentication token
    try {
        console.log('🧪 Test 2: Checking authentication token...');
        const token = localStorage.getItem('token');
        if (token) {
            results.tests.push({ name: 'Authentication', status: 'PASS', message: 'Token available' });
            console.log('✅ Authentication token available');
        } else {
            results.tests.push({ name: 'Authentication', status: 'FAIL', message: 'No authentication token' });
            console.log('❌ No authentication token found');
        }
    } catch (error) {
        results.tests.push({ name: 'Authentication', status: 'ERROR', message: error.message });
        console.log('❌ Error checking authentication:', error);
    }

    // Test 3: Test validation status endpoint
    try {
        console.log('🧪 Test 3: Testing validation status endpoint...');
        const status = await EarningsValidationService.getEarningsValidationStatus();
        results.tests.push({
            name: 'Validation Status',
            status: 'PASS',
            message: `Status retrieved: ${status.totalDrivers} drivers, ${status.validDrivers} valid, ${status.invalidDrivers} invalid`
        });
        console.log('✅ Validation status retrieved:', status);
    } catch (error) {
        results.tests.push({ name: 'Validation Status', status: 'FAIL', message: error.message });
        console.log('❌ Validation status test failed:', error);
    }

    // Test 4: Test bulk validation endpoint
    try {
        console.log('🧪 Test 4: Testing bulk validation endpoint...');
        const validation = await EarningsValidationService.validateAllDriversEarnings();
        results.tests.push({
            name: 'Bulk Validation',
            status: 'PASS',
            message: `Bulk validation completed: ${validation.validDrivers} valid, ${validation.invalidDrivers} invalid`
        });
        console.log('✅ Bulk validation completed:', validation);
    } catch (error) {
        results.tests.push({ name: 'Bulk Validation', status: 'FAIL', message: error.message });
        console.log('❌ Bulk validation test failed:', error);
    }

    // Generate summary
    const passed = results.tests.filter(t => t.status === 'PASS').length;
    const failed = results.tests.filter(t => t.status === 'FAIL').length;
    const errors = results.tests.filter(t => t.status === 'ERROR').length;

    results.summary = {
        total: results.tests.length,
        passed,
        failed,
        errors,
        successRate: (passed / results.tests.length * 100).toFixed(1)
    };

    console.log('📊 Debug session completed:', results.summary);
    console.log('📋 Detailed results:', results);

    return results;
};

export const debugDriverEarnings = async (driverId) => {
    console.log('🔍 Starting driver earnings debug for:', driverId);

    const results = {
        driverId,
        timestamp: new Date().toISOString(),
        tests: []
    };

    // Test 1: Validate driver earnings
    try {
        console.log('🧪 Test 1: Validating driver earnings...');
        const validation = await EarningsValidationService.validateDriverEarnings(driverId);
        results.tests.push({
            name: 'Driver Validation',
            status: validation.isValid ? 'PASS' : 'FAIL',
            message: `Driver earnings ${validation.isValid ? 'valid' : 'invalid'}: ${validation.message}`,
            data: validation
        });
        console.log('✅ Driver validation completed:', validation);
    } catch (error) {
        results.tests.push({ name: 'Driver Validation', status: 'ERROR', message: error.message });
        console.log('❌ Driver validation failed:', error);
    }

    // Test 2: Fix driver earnings if invalid
    try {
        console.log('🧪 Test 2: Attempting to fix driver earnings...');
        const fixResult = await EarningsValidationService.fixDriverEarnings(driverId);
        results.tests.push({
            name: 'Driver Fix',
            status: fixResult.success ? 'PASS' : 'FAIL',
            message: `Fix ${fixResult.success ? 'successful' : 'failed'}: ${fixResult.message}`,
            data: fixResult
        });
        console.log('✅ Driver fix completed:', fixResult);
    } catch (error) {
        results.tests.push({ name: 'Driver Fix', status: 'ERROR', message: error.message });
        console.log('❌ Driver fix failed:', error);
    }

    console.log('📊 Driver debug completed for:', driverId);
    console.log('📋 Driver results:', results);

    return results;
};

// Export debug functions to window for console access
if (typeof window !== 'undefined') {
    window.debugEarnings = debugEarnings;
    window.debugDriverEarnings = debugDriverEarnings;
    console.log('🔧 Earnings debugger loaded. Use debugEarnings() or debugDriverEarnings(driverId) in console.');
}
