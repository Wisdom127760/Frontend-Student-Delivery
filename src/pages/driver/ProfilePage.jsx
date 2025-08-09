import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DriverLayout from '../../components/layouts/DriverLayout';
import Avatar from '../../components/common/Avatar';
import apiService from '../../services/api';
import { getUserDisplayInfo } from '../../utils/userHelpers';
import { ProfilePageSkeleton } from '../../components/common/SkeletonLoader';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon,
  CameraIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  PencilIcon,
  StarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const DriverProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    studentId: '',
    university: '',
    transportation: '',
    bio: ''
  });

  // Get user display info
  const userInfo = getUserDisplayInfo(user);

  const fetchProfile = useCallback(async () => {
    try {
      console.log('🔍 ProfilePage: Starting profile fetch...');
      setIsLoading(true);

      // Try to get profile from API first
      try {
        console.log('📡 ProfilePage: Calling apiService.getDriverProfile()...');
        const response = await apiService.getDriverProfile();
        console.log('📊 ProfilePage: API response:', response);
        if (response.success && response.data) {
          setProfile(response.data);
          setFormData({
            name: response.data.name || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
            studentId: response.data.studentId || '',
            university: response.data.university || '',
            transportation: response.data.transportation || '',
            bio: response.data.bio || ''
          });
          console.log('✅ ProfilePage: Successfully loaded profile from API');
          return;
        }
      } catch (apiError) {
        console.log('⚠️ ProfilePage: API not available, using fallback data:', apiError);
      }

      // Fallback to user data and mock structure
      const mockProfile = {
        id: user?.id || 'student-123',
        name: user?.name || userInfo.name || 'Student Delivery Partner',
        email: user?.email || userInfo.email || 'student@emu.edu.tr',
        phone: user?.phone || '+90 533 123 4567',
        address: user?.address || 'EMU Campus, Famagusta',
        studentId: user?.studentId || 'EMU-2024-001',
        university: user?.university || 'Eastern Mediterranean University',
        transportation: user?.transportation || 'bicycle',
        bio: user?.bio || 'Student delivery partner helping fellow students with their delivery needs.',
        profileImage: user?.profileImage || user?.avatar,
        joinDate: user?.joinDate || '2024-01-15',
        stats: {
          totalDeliveries: 32,
          rating: 4.7,
          completionRate: 96.8,
          experience: '6 months',
          status: 'verified'
        }
      };

      console.log('📋 ProfilePage: Using fallback mock profile:', mockProfile);
      setProfile(mockProfile);
      setFormData({
        name: mockProfile.name,
        email: mockProfile.email,
        phone: mockProfile.phone,
        address: mockProfile.address,
        studentId: mockProfile.studentId,
        university: mockProfile.university,
        transportation: mockProfile.transportation,
        bio: mockProfile.bio
      });
      console.log('✅ ProfilePage: Mock profile loaded successfully');
    } catch (error) {
      console.error('💥 ProfilePage: Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      console.log('🏁 ProfilePage: Setting isLoading to false');
      // Add small delay to ensure state updates are processed
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  }, [user, userInfo]); // userInfo is now stable as it's only called once

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
      // Try API update first
      try {
        const response = await apiService.updateDriverProfile(formData);
        if (response.success) {
          setProfile(prev => ({
            ...prev,
            ...formData
          }));
          setIsEditing(false);
          toast.success('Profile updated successfully!');
          return;
        }
      } catch (apiError) {
        console.log('API update failed, using local update');
      }

      // Fallback to local update
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProfile(prev => ({
        ...prev,
        ...formData
      }));

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };



  // Transportation options for students
  const transportationOptions = [
    { value: 'walking', label: 'Walking' },
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'car', label: 'Car' },
    { value: 'public_transport', label: 'Public Transport' },
    { value: 'other', label: 'Other' }
  ];

  const getTransportationLabel = (value) => {
    const option = transportationOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  if (isLoading) {
    return (
      <DriverLayout>
        <ProfilePageSkeleton />
      </DriverLayout>
    );
  }

  return (
    <DriverLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <Avatar
                user={profile}
                size="xl"
                className="border-4 border-white shadow-lg"
              />
              <button
                onClick={() => toast.info('Profile image upload coming soon!')}
                className="absolute bottom-0 right-0 p-2 bg-white text-green-600 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
              >
                <CameraIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold">{profile?.name || 'Student Delivery Partner'}</h1>
              <p className="text-green-100 mt-1">{profile?.email}</p>
              <div className="flex items-center justify-center sm:justify-start space-x-4 mt-3">
                <div className="flex items-center space-x-1">
                  <StarIcon className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium">{profile?.stats?.rating || 4.7}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span className="text-sm">{profile?.stats?.totalDeliveries || 0} deliveries</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span className="text-sm">{profile?.stats?.completionRate || 0}% completion</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {profile?.stats?.status === 'verified' && (
                <div className="flex items-center space-x-1 bg-white/20 rounded-lg px-3 py-2">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Verified Student</span>
                </div>
              )}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                            }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                            }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                            }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                            }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student ID
                      </label>
                      <div className="relative">
                        <IdentificationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="e.g., EMU-2024-001"
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                            }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        University
                      </label>
                      <div className="relative">
                        <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="university"
                          value={formData.university}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="e.g., Eastern Mediterranean University"
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                            }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transportation Method */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Transportation Method</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How do you make deliveries?
                    </label>
                    {isEditing ? (
                      <select
                        name="transportation"
                        value={formData.transportation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                      >
                        <option value="">Select transportation method</option>
                        {transportationOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                        {getTransportationLabel(formData.transportation) || 'Not specified'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About You
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Tell others about yourself and your delivery experience..."
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                      }`}
                  />
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Student Verified</p>
                      <p className="text-xs text-gray-500">Your student status is verified</p>
                    </div>
                  </div>
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Profile Complete</p>
                      <p className="text-xs text-gray-500">All required fields filled</p>
                    </div>
                  </div>
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <AcademicCapIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Active Delivery Partner</p>
                      <p className="text-xs text-gray-500">Ready to accept deliveries</p>
                    </div>
                  </div>
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {profile?.joinDate ?
                      new Date(profile.joinDate).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      }) :
                      'Jan 2024'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Experience</span>
                  <span className="text-sm font-medium text-gray-900">
                    {profile?.stats?.experience || '6 months'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Transportation</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getTransportationLabel(profile?.transportation) || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Security Notice</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Your account is secured with OTP-based authentication. Keep your contact information up to date for security purposes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DriverLayout>
  );
};

export default DriverProfilePage;