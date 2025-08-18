import React, { useState, useRef, useCallback } from 'react';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import './LocationInput.css';

const LocationInput = ({
    value,
    onChange,
    placeholder,
    label,
    onLocationSelect,
    className = ""
}) => {
    const [showMap, setShowMap] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchTimeoutRef = useRef(null);

    const handleInputChange = (e) => {
        onChange(e.target.value);
    };

    const handleMapButtonClick = () => {
        setShowMap(!showMap);
        if (!showMap) {
            setSearchQuery(value);
        }
    };

    // Free geocoding using OpenStreetMap Nominatim
    const searchLocations = useCallback(async (query) => {
        if (!query || query.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            // Using OpenStreetMap Nominatim API (free, no API key required)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=cy&limit=5&addressdetails=1`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'StudentDeliveryApp/1.0' // Required by Nominatim
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            } else {
                console.error('Geocoding request failed:', response.status);
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching locations:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Debounce the search
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            searchLocations(query);
        }, 500);
    };

    const handleLocationSelect = (location) => {
        const address = location.display_name || location.name;
        const coords = {
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lon)
        };

        onChange(address);
        onLocationSelect && onLocationSelect({ address, ...coords });
        setShowMap(false);
        setSearchResults([]);
        setSearchQuery('');
    };

    const formatAddress = (location) => {
        const parts = [];
        if (location.name && location.name !== location.display_name) {
            parts.push(location.name);
        }
        if (location.address) {
            if (location.address.road) parts.push(location.address.road);
            if (location.address.city) parts.push(location.address.city);
            if (location.address.state) parts.push(location.address.state);
        }
        return parts.length > 0 ? parts.join(', ') : location.display_name;
    };

    return (
        <div className={`location-input-container ${className}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    onFocus={() => setShowMap(true)}
                />
                <button
                    type="button"
                    onClick={handleMapButtonClick}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors map-button"
                    title="Open location selector"
                >
                    <MapPinIcon className="h-5 w-5" />
                </button>
            </div>

            {showMap && (
                <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">
                            Search for a location in Cyprus:
                        </p>
                        <div className="relative">
                            <div className="flex items-center space-x-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        placeholder="Search for a location..."
                                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowMap(false)}
                                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Search Results */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {isSearching && (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="text-sm text-gray-500 mt-2">Searching...</p>
                            </div>
                        )}

                        {!isSearching && searchResults.length > 0 && (
                            <div className="space-y-1">
                                {searchResults.map((location, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleLocationSelect(location)}
                                        className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                    >
                                        <div className="flex items-start space-x-2">
                                            <MapPinIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">
                                                    {formatAddress(location)}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {location.display_name}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {!isSearching && searchQuery.length >= 3 && searchResults.length === 0 && (
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-500">No locations found</p>
                                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                            </div>
                        )}

                        {!isSearching && searchQuery.length < 3 && (
                            <div className="text-center py-4">
                                <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">
                                    Start typing to search for locations
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Minimum 3 characters required
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationInput;
