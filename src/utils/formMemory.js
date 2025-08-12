// Form memory utility for remembering user inputs
export const formMemory = {
    // Save form data to localStorage
    saveFormData: (formName, data) => {
        try {
            localStorage.setItem(`form_${formName}`, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving form data:', error);
        }
    },

    // Load form data from localStorage
    loadFormData: (formName) => {
        try {
            const saved = localStorage.getItem(`form_${formName}`);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Error loading form data:', error);
            return null;
        }
    },

    // Clear form data from localStorage
    clearFormData: (formName) => {
        try {
            localStorage.removeItem(`form_${formName}`);
        } catch (error) {
            console.error('Error clearing form data:', error);
        }
    },

    // Auto-save form data on change
    autoSave: (formName, data) => {
        formMemory.saveFormData(formName, data);
    }
};

// WhatsApp detection utility for international numbers
export const whatsAppUtils = {
    // Check if phone number is connected to WhatsApp
    isWhatsAppNumber: (phoneNumber) => {
        if (!phoneNumber) return false;

        // Remove all non-digit characters
        const cleanNumber = phoneNumber.replace(/\D/g, '');

        // Basic validation for common WhatsApp number formats worldwide
        // WhatsApp supports numbers with 7-15 digits including country code
        return cleanNumber.length >= 7 && cleanNumber.length <= 15;
    },

    // Generate WhatsApp link for international numbers
    generateWhatsAppLink: (phoneNumber, message = '') => {
        if (!phoneNumber) return null;

        // Remove all non-digit characters except +
        let cleanNumber = phoneNumber.replace(/[^\d+]/g, '');

        // If number starts with +, keep it, otherwise assume it needs country code
        if (!cleanNumber.startsWith('+')) {
            // For international compatibility, we'll keep the number as is
            // Users should enter the full international format
            // cleanNumber remains unchanged
        }

        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    },

    // Format phone number for display (international)
    formatPhoneNumber: (phoneNumber) => {
        if (!phoneNumber) return '';

        // Remove all non-digit characters except +
        let cleanNumber = phoneNumber.replace(/[^\d+]/g, '');

        // If it already has a +, return as is
        if (cleanNumber.startsWith('+')) {
            return cleanNumber;
        }

        // If it's a 10-digit number (common for many countries), add +
        if (cleanNumber.length === 10) {
            return `+${cleanNumber}`;
        }

        // If it's 11 digits and starts with 1 (US/Canada), add +
        if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
            return `+${cleanNumber}`;
        }

        // For other formats, just add + if not present
        if (!cleanNumber.startsWith('+')) {
            return `+${cleanNumber}`;
        }

        return cleanNumber;
    },

    // Get country code from phone number
    getCountryCode: (phoneNumber) => {
        if (!phoneNumber) return null;

        const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');

        if (cleanNumber.startsWith('+')) {
            // Extract country code (first 1-4 digits after +)
            const match = cleanNumber.match(/^\+(\d{1,4})/);
            return match ? match[1] : null;
        }

        return null;
    },

    // Validate international phone number
    isValidInternationalNumber: (phoneNumber) => {
        if (!phoneNumber) return false;

        const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');

        // Must start with + and have 7-15 digits total
        if (!cleanNumber.startsWith('+')) return false;

        const digitsOnly = cleanNumber.replace('+', '');
        return digitsOnly.length >= 7 && digitsOnly.length <= 15;
    }
};

// Google Maps utility
export const mapsUtils = {
    // Generate Google Maps directions link
    generateDirectionsLink: (pickupLocation, deliveryLocation) => {
        if (!pickupLocation || !deliveryLocation) return null;

        const encodedPickup = encodeURIComponent(pickupLocation);
        const encodedDelivery = encodeURIComponent(deliveryLocation);

        return `https://www.google.com/maps/dir/${encodedPickup}/${encodedDelivery}`;
    },

    // Generate Google Maps search link for a location
    generateSearchLink: (location) => {
        if (!location) return null;

        const encodedLocation = encodeURIComponent(location);
        return `https://www.google.com/maps/search/${encodedLocation}`;
    }
}; 