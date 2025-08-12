import React from 'react';

const PieChart = ({ data = [], nameKey = 'name', valueKey = 'value' }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No data available</p>
            </div>
        );
    }

    return (
        <div className="w-full h-64 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Chart data: {data.length} segments</p>
            </div>
        </div>
    );
};

export default PieChart;
