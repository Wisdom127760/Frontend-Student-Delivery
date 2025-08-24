import React from 'react';
import toast from 'react-hot-toast';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to console
        console.error('🚨 Unhandled Error Caught by ErrorBoundary:', error);
        console.error('🚨 Error Info:', errorInfo);

        // Store error details
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Show user-friendly toast notification
        let errorMessage = 'An unexpected error occurred. Please refresh the page.';

        // Try to provide more specific error messages based on error type
        if (error.name === 'TypeError') {
            if (error.message.includes('Cannot read property') || error.message.includes('undefined')) {
                errorMessage = 'A data processing error occurred. Please refresh the page.';
            } else if (error.message.includes('is not a function')) {
                errorMessage = 'A system function error occurred. Please refresh the page.';
            } else {
                errorMessage = 'A data processing error occurred. Please try again.';
            }
        } else if (error.name === 'ReferenceError') {
            if (error.message.includes('is not defined')) {
                errorMessage = 'A system configuration error occurred. Please refresh the page.';
            } else {
                errorMessage = 'A system error occurred. Please refresh the page.';
            }
        } else if (error.name === 'NetworkError') {
            errorMessage = 'Network connection error. Please check your internet connection.';
        } else if (error.name === 'SyntaxError') {
            errorMessage = 'A system configuration error occurred. Please refresh the page.';
        } else if (error.name === 'RangeError') {
            errorMessage = 'A data processing error occurred. Please try again.';
        } else if (error.message) {
            // Use the error message if it's user-friendly
            if (error.message.includes('fetch') || error.message.includes('network')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message.includes('JSON') || error.message.includes('parse')) {
                errorMessage = 'Data processing error. Please refresh the page.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Request timeout. Please try again.';
            } else if (error.message.includes('cors')) {
                errorMessage = 'Cross-origin error. Please refresh the page.';
            } else if (error.message.includes('permission')) {
                errorMessage = 'Permission denied. Please check your browser settings.';
            } else if (error.message.includes('quota')) {
                errorMessage = 'Storage quota exceeded. Please clear browser data and try again.';
            } else if (error.message.length < 100) {
                // Only use short error messages to avoid overwhelming users
                errorMessage = error.message;
            }
        }

        // Show toast with error details
        toast.error(errorMessage, {
            duration: 6000,
        });

        // Log to external error reporting service if available
        if (process.env.NODE_ENV === 'production') {
            // You can integrate with services like Sentry, LogRocket, etc. here
            console.error('🚨 Production Error Report:', {
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🚨</span>
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900 mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-gray-600 mb-6">
                            An unexpected error occurred. We've been notified and are working to fix it.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={this.handleRetry}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
                            >
                                Go to Home
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Error Details (Development)
                                </summary>
                                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                                    <div className="mb-2">
                                        <strong>Error:</strong> {this.state.error.toString()}
                                    </div>
                                    <div>
                                        <strong>Stack:</strong>
                                        <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                                    </div>
                                    {this.state.errorInfo && (
                                        <div className="mt-2">
                                            <strong>Component Stack:</strong>
                                            <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
