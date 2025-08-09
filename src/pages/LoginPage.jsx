import React, { useState } from 'react';
import { Mail, User, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState('admin');
    const [loading, setLoading] = useState(false);
    const { sendOTP } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setLoading(true);

        try {
            console.log('🔄 Attempting to send OTP...');
            await sendOTP(email, userType);
            console.log('✅ OTP sent successfully');
            toast.success('OTP sent to your email!');

            // Navigate to OTP page - simple and reliable
            const url = `/verify-otp?email=${encodeURIComponent(email)}&userType=${userType}`;
            console.log('🔄 Navigating to:', url);
            console.log('🔄 Email:', email);
            console.log('🔄 UserType:', userType);
            console.log('🔄 Encoded email:', encodeURIComponent(email));

            // Navigate using React Router (no page reload)
            console.log('🚀 About to navigate using React Router to:', url);
            navigate(url);

        } catch (error) {
            console.error('❌ Failed to send OTP:', error);
            toast.error('Failed to send OTP. Please try again.');
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
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
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
                                        onChange={(e) => setUserType(e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className={`
                    p-3 rounded-md border-2 cursor-pointer transition-all
                    ${userType === 'admin'
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }
                  `}>
                                        <div className="flex flex-col items-center">
                                            <User className={`h-5 w-5 mb-1 ${userType === 'admin' ? 'text-green-600' : 'text-gray-500'}`} />
                                            <span className={`text-sm font-medium ${userType === 'admin' ? 'text-green-900' : 'text-gray-700'}`}>
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
                                        onChange={(e) => setUserType(e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className={`
                    p-3 rounded-md border-2 cursor-pointer transition-all
                    ${userType === 'driver'
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }
                  `}>
                                        <div className="flex flex-col items-center">
                                            <Truck className={`h-5 w-5 mb-1 ${userType === 'driver' ? 'text-green-600' : 'text-gray-500'}`} />
                                            <span className={`text-sm font-medium ${userType === 'driver' ? 'text-green-900' : 'text-gray-700'}`}>
                                                Driver
                                            </span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2.5 px-4 rounded-md font-medium transition-colors"
                        >
                            {loading ? 'Sending...' : 'Continue'}
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