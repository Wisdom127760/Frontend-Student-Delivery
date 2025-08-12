/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} - The capitalized string
 */
export const capitalize = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize each word in a string
 * @param {string} str - The string to capitalize
 * @returns {string} - The string with each word capitalized
 */
export const capitalizeWords = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.split(' ').map(word => capitalize(word)).join(' ');
};

/**
 * Capitalize name (alias for capitalizeWords)
 * @param {string} str - The name to capitalize
 * @returns {string} - The capitalized name
 */
export const capitalizeName = (str) => {
    return capitalizeWords(str);
};

export default capitalize;
