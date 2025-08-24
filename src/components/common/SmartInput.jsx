import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';
import formMemory from '../../utils/formMemory';

const SmartInput = ({
    formType,
    fieldName,
    value,
    onChange,
    placeholder,
    label,
    type = 'text',
    required = false,
    className = '',
    suggestions = [],
    showSuggestions = true,
    autoFocus = false,
    disabled = false,
    ...props
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Get suggestions from form memory
    useEffect(() => {
        if (formType && fieldName && showSuggestions) {
            const memorySuggestions = formMemory.getSuggestions(formType, fieldName, value);
            const allSuggestions = [...new Set([...memorySuggestions, ...suggestions])];
            setFilteredSuggestions(allSuggestions);
        } else {
            setFilteredSuggestions(suggestions);
        }
    }, [formType, fieldName, value, suggestions, showSuggestions]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!showDropdown) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setHighlightedIndex(prev =>
                        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
                        handleSuggestionSelect(filteredSuggestions[highlightedIndex]);
                    }
                    break;
                case 'Escape':
                    setShowDropdown(false);
                    setHighlightedIndex(-1);
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showDropdown, highlightedIndex, filteredSuggestions]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowDropdown(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        onChange(newValue);

        // Show dropdown when user starts typing
        if (newValue && filteredSuggestions.length > 0) {
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }

        setHighlightedIndex(-1);
    };

    const handleInputFocus = () => {
        setIsFocused(true);
        if (value && filteredSuggestions.length > 0) {
            setShowDropdown(true);
        }
    };

    const handleInputBlur = () => {
        setIsFocused(false);
        // Delay hiding dropdown to allow for clicks
        setTimeout(() => {
            setShowDropdown(false);
            setHighlightedIndex(-1);
        }, 150);
    };

    const handleSuggestionSelect = (suggestion) => {
        onChange(suggestion);
        setShowDropdown(false);
        setHighlightedIndex(-1);

        // Save to form memory
        if (formType && fieldName) {
            formMemory.saveFormData(formType, { [fieldName]: suggestion }, fieldName);
        }
    };

    const getSuggestionIcon = (suggestion, index) => {
        // Check if it's from memory (frequently used)
        const memorySuggestions = formType && fieldName ?
            formMemory.getSuggestions(formType, fieldName, '') : [];

        if (memorySuggestions.includes(suggestion)) {
            return <FireIcon className="h-4 w-4 text-orange-500" />;
        }

        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    };

    const getLastUsedValue = () => {
        if (formType && fieldName) {
            return formMemory.getLastUsedValue(formType, fieldName);
        }
        return null;
    };

    const lastUsedValue = getLastUsedValue();

    return (
        <div className="relative">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <input
                    ref={inputRef}
                    type={type}
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
                        ${isFocused ? 'border-blue-500' : 'border-gray-300'}
                        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                        ${className}
                    `}
                    {...props}
                />

                {/* Show last used value indicator */}
                {lastUsedValue && !value && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <button
                            type="button"
                            onClick={() => handleSuggestionSelect(lastUsedValue)}
                            className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                            title={`Last used: ${lastUsedValue}`}
                        >
                            Last used
                        </button>
                    </div>
                )}

                {/* Dropdown arrow */}
                {filteredSuggestions.length > 0 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <ChevronDownIcon
                            className={`h-4 w-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                        />
                    </div>
                )}
            </div>

            {/* Suggestions dropdown */}
            {showDropdown && filteredSuggestions.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                    {filteredSuggestions.map((suggestion, index) => (
                        <button
                            key={`${suggestion}-${index}`}
                            type="button"
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className={`
                                w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3
                                ${highlightedIndex === index ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                                ${index === 0 ? 'rounded-t-lg' : ''}
                                ${index === filteredSuggestions.length - 1 ? 'rounded-b-lg' : ''}
                            `}
                        >
                            {getSuggestionIcon(suggestion, index)}
                            <span className="flex-1">{suggestion}</span>
                            {index === 0 && filteredSuggestions.length > 1 && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    Press Enter
                                </span>
                            )}
                        </button>
                    ))}

                    {/* Quick actions */}
                    <div className="border-t border-gray-200 p-2 bg-gray-50">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Use ↑↓ to navigate, Enter to select</span>
                            <span>{filteredSuggestions.length} suggestions</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartInput;
