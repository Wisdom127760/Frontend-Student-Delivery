import React from 'react';

const AdminUsersTableSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map((index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 rounded w-40 animate-pulse"></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsersTableSkeleton;
