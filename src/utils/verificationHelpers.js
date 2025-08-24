/**
 * Check if a driver is fully verified
 * @param {Object} driver - Driver object
 * @returns {boolean} - True if driver is verified
 */
export const isDriverVerified = (driver) => {
    if (!driver) return false;

    // Check if driver has verification status
    if (driver.verificationStatus?.status === 'verified') {
        return true;
    }

    // Check if driver has account status
    if (driver.accountStatus?.verification?.email &&
        driver.accountStatus?.verification?.documents) {
        return true;
    }

    // Check individual verification fields
    const emailVerified = driver.isEmailVerified || driver.verification?.email;
    const documentsVerified = driver.isDocumentVerified ||
        (driver.documents?.studentId?.status === 'verified' &&
            driver.documents?.profilePhoto?.status === 'verified' &&
            driver.documents?.universityEnrollment?.status === 'verified' &&
            driver.documents?.identityCard?.status === 'verified');

    return emailVerified && documentsVerified;
};

/**
 * Get verification status for display
 * @param {Object} driver - Driver object
 * @returns {Object} - Verification status object
 */
export const getVerificationStatus = (driver) => {
    const verified = isDriverVerified(driver);

    return {
        isVerified: verified,
        status: verified ? 'verified' : 'pending',
        message: verified ? 'Fully Verified' : 'Verification Pending'
    };
};
