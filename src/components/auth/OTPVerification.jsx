import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const OTPVerification = () => {
    const [otp, setOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [isResending, setIsResending] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, sendOTP } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Get email and userType from URL parameters
    const email = searchParams.get('email') || '';
    const userType = searchParams.get('userType') || 'admin';

    // Redirect to login if no email is provided
    useEffect(() => {
        if (!email) {
            console.log('❌ No email found, redirecting to login...');
            navigate('/');
        }
    }, [email, navigate]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    // Auto-focus and auto-advance OTP input
    useEffect(() => {
        const otpInputs = document.querySelectorAll('input[data-otp-input]');
        otpInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const target = e.target;
                if (target.value.length === 1 && index < 5) {
                    const nextInput = otpInputs[index + 1];
                    nextInput?.focus();
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    const prevInput = otpInputs[index - 1];
                    prevInput?.focus();
                }
            });
        });
    }, []);

    const handleOTPChange = (index, value) => {
        if (value.length > 1) return;

        const newOTP = otp.split('');
        newOTP[index] = value;
        const otpString = newOTP.join('');
        setOtp(otpString);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            toast.error('Please enter a 6-digit OTP');
            return;
        }

        setIsSubmitting(true);
        try {
            console.log('🔄 Attempting login...');
            const userData = await login(email, otp, userType);
            console.log('✅ Login successful, user data:', userData);

            // Small delay to ensure auth state is fully updated
            setTimeout(() => {
                const dashboardUrl = userType === 'admin' ? '/admin' : '/driver';
                console.log('🎯 Navigating to dashboard using React Router:', dashboardUrl);
                navigate(dashboardUrl);
            }, 100); // Very small delay just to ensure state is set
        } catch (error) {
            console.error('❌ Login failed:', error);
            toast.error('Invalid OTP. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    const handleResendOTP = async () => {
        setIsResending(true);
        try {
            await sendOTP(email, userType);
            setTimeLeft(60);
            toast.success('OTP resent successfully!');
        } catch (error) {
            toast.error('Failed to resend OTP. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">

                {/* Header */}
                <div className="text-center mb-8">
                    <img
                        src="/White.png"
                        alt="Logo"
                        className="w-12 h-12 mx-auto mb-4 rounded-lg shadow-sm"
                    />
                    <h1 className="text-2xl font-bold text-gray-900">Verify Code</h1>
                    <p className="text-gray-600 text-sm mt-1">
                        We sent a code to <span className="font-medium">{email}</span>
                    </p>

                    {/* Development Helper */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-800">
                                <strong>Development Mode:</strong> Check your email or try common test codes
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                                If this is a real backend, check server logs for the actual OTP
                            </p>
                        </div>
                    )}
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* OTP Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Enter the 6-digit code
                            </label>
                            <div className="flex justify-between space-x-2">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <input
                                        key={index}
                                        data-otp-input
                                        type="text"
                                        maxLength={1}
                                        value={otp[index] || ''}
                                        onChange={(e) => handleOTPChange(index, e.target.value)}
                                        className="w-10 h-12 text-center text-lg font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                ))}
                            </div>
                            {otp.length > 0 && otp.length < 6 && (
                                <p className="text-sm text-red-600 mt-2">Please enter all 6 digits</p>
                            )}
                        </div>

                        {/* Resend Section */}
                        <div className="text-center">
                            {timeLeft > 0 ? (
                                <p className="text-sm text-gray-500">
                                    Resend code in {timeLeft}s
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={isResending}
                                    className="text-sm text-green-600 hover:text-green-700 disabled:opacity-50"
                                >
                                    {isResending ? 'Sending...' : 'Resend code'}
                                </button>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={otp.length !== 6 || isSubmitting}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2.5 px-4 rounded-md font-medium transition-colors"
                        >
                            {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
                        </button>

                        {/* Back Button */}
                        <button
                            type="button"
                            onClick={handleBack}
                            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
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

export default OTPVerification;
