import React from 'react';
import { capitalize, capitalizeWords } from '../../utils/capitalize';

const CapitalizedInput = ({
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    className = '',
    autoCapitalize = true,
    capitalizeMode = 'words', // 'words', 'first', 'none'
    ...props
}) => {
    const handleChange = (e) => {
        let newValue = e.target.value;

        // Apply capitalization based on mode
        if (autoCapitalize && newValue) {
            switch (capitalizeMode) {
                case 'words':
                    newValue = capitalizeWords(newValue);
                    break;
                case 'first':
                    newValue = capitalize(newValue);
                    break;
                case 'none':
                default:
                    // No capitalization
                    break;
            }
        }

        // Call the original onChange with the processed value
        onChange({
            ...e,
            target: {
                ...e.target,
                value: newValue
            }
        });
    };

    return (
        <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
            {...props}
        />
    );
};

export default CapitalizedInput;
