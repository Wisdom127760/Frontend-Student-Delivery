import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* 404 Icon */}
                <div className="mb-8">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                        <ExclamationTriangleIcon className="w-12 h-12 text-white" />
                    </div>
                </div>

                {/* Error Message */}
                <div className="mb-8">
                    <h1 className="text-6xl font-bold text-green-600 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
                    </p>
                </div>

                {/* Current URL Info */}
                <div className="bg-white rounded-lg p-4 mb-8 shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Current URL:</p>
                    <p className="text-xs font-mono text-gray-700 break-all bg-gray-50 p-2 rounded">
                        {window.location.pathname}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <HomeIcon className="w-5 h-5 mr-2" />
                        Go to Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Go Back
                    </button>
                </div>

                {/* Additional Help */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Need help? Contact support at{' '}
                        <a
                            href="https://wa.me/905338329785"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700 font-medium"
                        >
                            +90 533 832 97 85
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
