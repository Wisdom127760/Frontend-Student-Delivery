import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, RotateCcw, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

// Form validation schema
const otpSchema = z.object({
  otp: z.string().length(6, 'Please enter a 6-digit OTP'),
});

type OTPFormData = z.infer<typeof otpSchema>;

interface OTPVerificationProps {
  email: string;
  userType: 'admin' | 'driver';
  onBack: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ email, userType, onBack }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const { login, sendOTP } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  const watchedOTP = watch('otp') || '';

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
        const target = e.target as HTMLInputElement;
        if (target.value.length === 1 && index < 5) {
          const nextInput = otpInputs[index + 1] as HTMLInputElement;
          nextInput?.focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && index > 0) {
          const prevInput = otpInputs[index - 1] as HTMLInputElement;
          prevInput?.focus();
        }
      });
    });
  }, []);

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOTP = watchedOTP.split('');
    newOTP[index] = value;
    const otpString = newOTP.join('');
    setValue('otp', otpString);
  };

  const onSubmit = async (data: OTPFormData) => {
    try {
      await login(data.email, data.otp, userType);
      toast.success('Login successful!');
      // Navigation will be handled by the auth context
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    }
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Simple Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="w-6 h-6 text-gray-600" />
          </div>
          <h1 className="text-2xl font-light text-gray-900 mb-1">Verify Code</h1>
          <p className="text-gray-500 text-sm">
            We sent a code to <span className="font-medium">{email}</span>
          </p>
        </div>

        {/* Clean Form */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Enter the 6-digit code
                </label>
                <div className="flex justify-between space-x-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      data-otp-input
                      type="text"
                      maxLength={1}
                      value={watchedOTP[index] || ''}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      className="w-12 h-12 text-center text-lg font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                      placeholder="0"
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="text-sm text-red-600 mt-2">{errors.otp.message}</p>
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
                    className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    {isResending ? 'Sending...' : 'Resend code'}
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="clean"
                className="w-full"
                disabled={watchedOTP.length !== 6}
              >
                Verify & Continue
              </Button>

              {/* Back Button */}
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                icon={ArrowLeft}
                className="w-full text-gray-600"
              >
                Back
              </Button>
            </form>
          </div>
        </div>

        {/* Simple Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Secure OTP authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
