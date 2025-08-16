import React from 'react';

const AdminManagementTabs = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="bg-white border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`
                                    group relative min-w-0 flex-1 overflow-hidden py-4 px-1 text-center text-sm font-medium hover:text-gray-700 focus:z-10 focus:outline-none
                                    ${isActive
                                        ? 'text-green-600 border-b-2 border-green-600'
                                        : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <Icon className={`w-5 h-5 ${isActive ? tab.color : 'text-gray-400 group-hover:text-gray-500'}`} />
                                    <span>{tab.name}</span>
                                </div>

                                {/* Active indicator */}
                                {isActive && (
                                    <div className={`absolute inset-x-0 bottom-0 h-0.5 ${tab.bgColor}`} />
                                )}

                                {/* Hover indicator */}
                                {!isActive && (
                                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default AdminManagementTabs;
