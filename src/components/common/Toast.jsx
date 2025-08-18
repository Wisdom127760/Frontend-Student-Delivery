import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Toast = ({ message, type = 'info', duration = 4000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
            case 'error':
                return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
            case 'warning':
                return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
            default:
                return <InformationCircleIcon className="h-5 w-5 text-blue-600" />;
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed bottom-8 right-8 z-50 w-80 max-w-sm transition-all duration-300 ease-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <div className={`rounded-lg border p-4 shadow-lg w-full ${getStyles()}`}>
                <div className="flex items-start space-x-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                        <p className="text-sm font-medium break-words leading-relaxed">{message}</p>
                    </div>
                    <div className="flex-shrink-0">
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(() => onClose(), 300);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toast;
