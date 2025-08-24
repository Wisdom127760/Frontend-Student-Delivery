/**
 * Capitalizes the first letter of each word in a name
 * @param {string} name - The name to capitalize
 * @returns {string} - The capitalized name
 */
export const capitalizeName = (name) => {
    if (!name || typeof name !== 'string') {
        return 'Unknown User';
    }

    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Capitalizes a single word (first letter uppercase, rest lowercase)
 * @param {string} word - The word to capitalize
 * @returns {string} - The capitalized word
 */
export const capitalizeWord = (word) => {
    if (!word || typeof word !== 'string') {
        return '';
    }

    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

/**
 * Formats a full name with proper capitalization
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} - Properly formatted full name
 */
export const formatFullName = (firstName, lastName) => {
    const first = capitalizeWord(firstName || '');
    const last = capitalizeWord(lastName || '');

    if (first && last) {
        return `${first} ${last}`;
    } else if (first) {
        return first;
    } else if (last) {
        return last;
    }

    return 'Unknown User';
};
