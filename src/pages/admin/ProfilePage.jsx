import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile } from '../../services/profileService';
import ProfileImageUpload from '../../components/common/ProfileImageUpload';
import CapitalizedInput from '../../components/common/CapitalizedInput';
import { ProfilePageSkeleton } from '../../components/common/SkeletonLoader';
import { capitalizeName } from '../../utils/capitalize';
import toast from 'react-hot-toast';
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        role: 'admin'
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile(user?.id);
                setProfile(data);
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    role: data.role || 'admin'
                });
            } catch (error) {
                toast.error('Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.id) {
            fetchProfile();
        }
    }, [user?.id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const updatedProfile = await updateProfile(user?.id, formData);
            setProfile(updatedProfile);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpdate = (imageUrl) => {
        setProfile(prev => ({
            ...prev,
            profileImage: imageUrl
        }));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ProfilePageSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="px-6 py-8 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
                        <p className="mt-2 text-gray-600">Manage your administrator account information</p>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Profile Image */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Image</h3>
                                <ProfileImageUpload
                                    userId={user?.id}
                                    currentImage={profile?.profileImage}
                                    onImageUpdate={handleImageUpdate}
                                />
                            </div>

                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <CapitalizedInput
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="Enter your full name"
                                                capitalizeMode="words"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="Enter your phone number"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                            Address
                                        </label>
                                        <div className="relative">
                                            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                id="address"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="Enter your address"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Role Information */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Role Information</h3>
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Administrator</p>
                                        <p className="text-sm text-gray-600">You have full system access and management privileges</p>
                                    </div>
                                </div>
                            </div>

                            {/* Authentication Info */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication</h3>
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">OTP Authentication Active</p>
                                        <p className="text-sm text-gray-600">Your account is secured with OTP-based authentication</p>
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-8 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
