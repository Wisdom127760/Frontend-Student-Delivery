import React, { useState } from 'react';
import { Mail, User, Truck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState('admin');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { sendOTP } = useAuth();
    const navigate = useNavigate();

    // Email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Clear errors when user starts typing
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: null }));
        }
    };

    const handleUserTypeChange = (e) => {
        setUserType(e.target.value);
        if (errors.userType) {
            setErrors(prev => ({ ...prev, userType: null }));
        }
    };

    // Enhanced error handling function
    const handleError = (error) => {
        console.error('❌ Login error:', error);

        let errorMessage = 'An unexpected error occurred. Please try again.';
        let errorType = 'general';

        // Handle different types of errors
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    // Check for specific validation errors
                    if (data?.message?.toLowerCase().includes('email')) {
                        errorMessage = 'Please enter a valid email address.';
                        errorType = 'validation';
                    } else if (data?.message?.toLowerCase().includes('user type')) {
                        errorMessage = 'Please select a valid user type.';
                        errorType = 'validation';
                    } else {
                        errorMessage = data?.message || 'Invalid request. Please check your input.';
                        errorType = 'validation';
                    }
                    break;
                case 401:
                    errorMessage = data?.message || 'Authentication failed. Please check your credentials.';
                    errorType = 'auth';
                    break;
                case 403:
                    if (data?.message?.toLowerCase().includes('suspended')) {
                        errorMessage = 'Your account has been suspended. Please contact support.';
                        errorType = 'suspended';
                    } else if (data?.message?.toLowerCase().includes('blocked')) {
                        errorMessage = 'Your account has been blocked. Please contact support.';
                        errorType = 'blocked';
                    } else {
                        errorMessage = data?.message || 'Access denied. You are not authorized to perform this action.';
                        errorType = 'permission';
                    }
                    break;
                case 404:
                    if (data?.message?.toLowerCase().includes('user') || data?.message?.toLowerCase().includes('not found')) {
                        errorMessage = 'No account found with this email address. Please check your email or create a new account.';
                        errorType = 'userNotFound';
                    } else {
                        errorMessage = data?.message || 'User not found. Please check your email address.';
                        errorType = 'notFound';
                    }
                    break;
                case 409:
                    if (data?.message?.toLowerCase().includes('already exists')) {
                        errorMessage = 'An account with this email already exists. Please try logging in instead.';
                        errorType = 'userExists';
                    } else {
                        errorMessage = data?.message || 'Account conflict. Please try a different email.';
                        errorType = 'conflict';
                    }
                    break;
                case 429:
                    errorMessage = data?.message || 'Too many login attempts. Please wait a moment before trying again.';
                    errorType = 'rateLimit';
                    break;
                case 500:
                    errorMessage = data?.message || 'Server error. Please try again later.';
                    errorType = 'server';
                    break;
                default:
                    errorMessage = data?.message || `Server error (${status}). Please try again.`;
                    errorType = 'server';
            }
        } else if (error.request) {
            // Network error - no response received
            errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
            errorType = 'network';
        } else if (error.code === 'ERR_NETWORK') {
            // Axios network error
            errorMessage = 'Network error. Please check your connection and try again.';
            errorType = 'network';
        } else if (error.message) {
            // Other errors with message
            if (error.message.toLowerCase().includes('user not found')) {
                errorMessage = 'No account found with this email address. Please check your email or create a new account.';
                errorType = 'userNotFound';
            } else if (error.message.toLowerCase().includes('invalid email')) {
                errorMessage = 'Please enter a valid email address.';
                errorType = 'validation';
            } else if (error.message.toLowerCase().includes('suspended')) {
                errorMessage = 'Your account has been suspended. Please contact support.';
                errorType = 'suspended';
            } else {
                errorMessage = error.message;
                errorType = 'general';
            }
        }

        // Show appropriate toast based on error type
        switch (errorType) {
            case 'validation':
                toast.error(errorMessage, {
                    duration: 5000,
                });
                break;
            case 'auth':
                toast.error(errorMessage, {
                    duration: 4000,
                });
                break;
            case 'permission':
                toast.error(errorMessage, {
                    duration: 4000,
                });
                break;
            case 'userNotFound':
                toast.error(errorMessage, {
                    duration: 6000,
                });
                break;
            case 'userExists':
                toast.error(errorMessage, {
                    duration: 5000,
                });
                break;
            case 'suspended':
                toast.error(errorMessage, {
                    duration: 8000,
                });
                break;
            case 'blocked':
                toast.error(errorMessage, {
                    duration: 8000,
                });
                break;
            case 'conflict':
                toast.error(errorMessage, {
                    duration: 5000,
                });
                break;
            case 'rateLimit':
                toast.error(errorMessage, {
                    duration: 6000,
                });
                break;
            case 'network':
                toast.error(errorMessage, {
                    duration: 5000,
                });
                break;
            case 'server':
                toast.error(errorMessage, {
                    duration: 5000,
                });
                break;
            default:
                toast.error(errorMessage, {
                    duration: 4000,
                });
        }

        return { message: errorMessage, type: errorType };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Client-side validation
        const validationErrors = {};

        if (!email.trim()) {
            validationErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            validationErrors.email = 'Please enter a valid email address';
        }

        if (!userType) {
            validationErrors.userType = 'Please select a user type';
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error('Please fix the errors below');
            return;
        }

        setLoading(true);

        try {
            console.log('🔄 Attempting to send OTP...');
            await sendOTP(email.trim(), userType);
            console.log('✅ OTP sent successfully');

            toast.success('OTP sent to your email!', {
                duration: 3000,
            });

            // Navigate to OTP page
            const url = `/verify-otp?email=${encodeURIComponent(email.trim())}&userType=${userType}`;
            console.log('🔄 Navigating to:', url);
            navigate(url);

        } catch (error) {
            const errorInfo = handleError(error);

            // Set specific field errors if applicable
            if (errorInfo.type === 'validation' && error.response?.data?.field) {
                setErrors(prev => ({
                    ...prev,
                    [error.response.data.field]: errorInfo.message
                }));
            } else if (errorInfo.type === 'notFound') {
                setErrors(prev => ({
                    ...prev,
                    email: 'User not found with this email address'
                }));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <img
                        src="/White.png"
                        alt="Logo"
                        className="w-12 h-12 mx-auto mb-4 rounded-lg shadow-sm"
                    />
                    <h1 className="text-2xl font-bold text-gray-900">Student Delivery</h1>
                    <p className="text-gray-600 mt-1">Sign in to continue</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className={`absolute left-3 top-3 h-4 w-4 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    placeholder="your@email.com"
                                    className={`w-full pl-10 pr-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors.email
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {errors.email && (
                                <div className="flex items-center mt-1 text-sm text-red-600">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        {/* User Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                I am a
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Admin */}
                                <label className="relative">
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="admin"
                                        checked={userType === 'admin'}
                                        onChange={handleUserTypeChange}
                                        className="sr-only"
                                    />
                                    <div className={`
                                        p-3 rounded-md border-2 cursor-pointer transition-all
                                        ${userType === 'admin'
                                            ? 'border-green-500 bg-green-50'
                                            : errors.userType
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }
                                    `}>
                                        <div className="flex flex-col items-center">
                                            <User className={`h-5 w-5 mb-1 ${userType === 'admin'
                                                ? 'text-green-600'
                                                : errors.userType
                                                    ? 'text-red-500'
                                                    : 'text-gray-500'
                                                }`} />
                                            <span className={`text-sm font-medium ${userType === 'admin'
                                                ? 'text-green-900'
                                                : errors.userType
                                                    ? 'text-red-700'
                                                    : 'text-gray-700'
                                                }`}>
                                                Admin
                                            </span>
                                        </div>
                                    </div>
                                </label>

                                {/* Driver */}
                                <label className="relative">
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="driver"
                                        checked={userType === 'driver'}
                                        onChange={handleUserTypeChange}
                                        className="sr-only"
                                    />
                                    <div className={`
                                        p-3 rounded-md border-2 cursor-pointer transition-all
                                        ${userType === 'driver'
                                            ? 'border-green-500 bg-green-50'
                                            : errors.userType
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }
                                    `}>
                                        <div className="flex flex-col items-center">
                                            <Truck className={`h-5 w-5 mb-1 ${userType === 'driver'
                                                ? 'text-green-600'
                                                : errors.userType
                                                    ? 'text-red-500'
                                                    : 'text-gray-500'
                                                }`} />
                                            <span className={`text-sm font-medium ${userType === 'driver'
                                                ? 'text-green-900'
                                                : errors.userType
                                                    ? 'text-red-700'
                                                    : 'text-gray-700'
                                                }`}>
                                                Driver
                                            </span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                            {errors.userType && (
                                <div className="flex items-center mt-1 text-sm text-red-600">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    {errors.userType}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2.5 px-4 rounded-md font-medium transition-colors disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" color="white" showText={true} text="Sending..." />
                            ) : (
                                'Continue'
                            )}
                        </button>

                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    Secure OTP authentication
                </p>
            </div>
        </div>
    );
};

export default LoginPage;