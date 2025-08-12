import React from 'react';

const LineChart = ({ data = [], xKey = 'x', yKey = 'y', color = 'blue' }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No data available</p>
            </div>
        );
    }

    // Color mapping for future use
    // const colors = {
    //     blue: 'stroke-blue-500',
    //     green: 'stroke-green-500',
    //     red: 'stroke-red-500',
    //     yellow: 'stroke-yellow-500',
    //     purple: 'stroke-purple-500'
    // };

    return (
        <div className="w-full h-64 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Chart data: {data.length} points</p>
            </div>
        </div>
    );
};

export default LineChart;
