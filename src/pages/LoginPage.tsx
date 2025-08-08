import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, User, ArrowRight, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  userType: z.enum(['admin', 'driver'], {
    required_error: 'Please select a user type',
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { sendOTP } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userType: 'admin',
    },
  });

  const watchedUserType = watch('userType');

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await sendOTP(data.email, data.userType);
      toast.success('OTP sent to your email!');
      // Navigate to OTP verification page
      // This would be handled by your routing logic
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-light text-gray-900 mb-1">Student Delivery</h1>
          <p className="text-gray-500 text-sm">Sign in to continue</p>
        </div>

        {/* Clean Form */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Input */}
              <div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  icon={Mail}
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              {/* User Type Selection - Simplified */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I am a
                </label>
                <div className="space-y-2">
                  <label className="block">
                    <input
                      type="radio"
                      value="admin"
                      className="sr-only"
                      {...register('userType')}
                    />
                    <div className={`
                      cursor-pointer rounded-xl border p-4 transition-all duration-200
                      ${watchedUserType === 'admin' 
                        ? 'border-gray-300 bg-gray-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Administrator</div>
                          <div className="text-sm text-gray-500">Manage deliveries & drivers</div>
                        </div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="block">
                    <input
                      type="radio"
                      value="driver"
                      className="sr-only"
                      {...register('userType')}
                    />
                    <div className={`
                      cursor-pointer rounded-xl border p-4 transition-all duration-200
                      ${watchedUserType === 'driver' 
                        ? 'border-gray-300 bg-gray-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Truck className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Driver</div>
                          <div className="text-sm text-gray-500">Accept & complete deliveries</div>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.userType && (
                  <p className="text-sm text-red-600 mt-2">{errors.userType.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="clean"
                className="w-full"
                loading={isLoading}
                icon={ArrowRight}
                iconPosition="right"
              >
                Continue
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

export default LoginPage;
