import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DriverLayout from '../../components/layouts/DriverLayout';
import Avatar from '../../components/common/Avatar';
import DocumentUpload from '../../components/common/DocumentUpload';
import apiService from '../../services/api';
import { ProfilePageSkeleton } from '../../components/common/SkeletonLoader';
import { compressImage } from '../../services/cloudinaryService';
import toast from 'react-hot-toast';
import {
  CameraIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  PencilIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const DriverProfilePage = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Debug current profile state on each render
  console.log('🔍 ProfilePage render - Current profile state:', profile);
  console.log('🔍 ProfilePage render - Is loading:', isLoading);
  console.log('🔍 ProfilePage render - User authenticated:', !!user);
  console.log('🔍 ProfilePage render - Is authenticated:', isAuthenticated);
  console.log('🔍 ProfilePage render - User data:', user);
  console.log('🔍 ProfilePage render - Token exists:', !!localStorage.getItem('token'));

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (profile && !isLoading) {
      localStorage.setItem('driverProfile', JSON.stringify(profile));
      console.log('💾 Profile saved to localStorage');
    }
  }, [profile, isLoading]);

  // Load profile from localStorage on initial load
  useEffect(() => {
    const savedProfile = localStorage.getItem('driverProfile');
    if (savedProfile && !profile && !isLoading) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        console.log('📂 Profile loaded from localStorage');
      } catch (error) {
        console.error('❌ Error parsing saved profile:', error);
        localStorage.removeItem('driverProfile');
      }
    }
  }, [profile, isLoading]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    studentId: '',
    university: '',
    transportationMethod: '',
    transportationArea: ''
  });

  // Profile options from backend API - using correct enum values
  const [serviceAreas, setServiceAreas] = useState([
    { value: '', label: 'Loading areas...' }
  ]);
  const [transportationMethods, setTransportationMethods] = useState([
    { value: '', label: 'Loading methods...' }
  ]);
  const [universities, setUniversities] = useState([
    { value: '', label: 'Loading universities...' }
  ]);

  // Fetch profile options from backend API
  const fetchProfileOptions = useCallback(async () => {
    try {
      console.log('📡 Fetching profile options from /api/public/profile-options...');
      const response = await fetch('/api/public/profile-options');
      const data = await response.json();

      if (data.success && data.data) {
        console.log('✅ Profile options loaded:', data.data);

        // Set service areas from addresses
        if (data.data.addresses) {
          const addressOptions = [
            { value: '', label: 'Select Service Area' },
            ...data.data.addresses.map(address => ({
              value: address,
              label: address
            }))
          ];
          setServiceAreas(addressOptions);
        }

        // Set transportation methods
        if (data.data.transportationMethods) {
          const methodOptions = [
            { value: '', label: 'Select Transportation Method' },
            ...data.data.transportationMethods.map(method => ({
              value: method.value,
              label: method.label,
              requiresLicense: method.requiresLicense
            }))
          ];
          setTransportationMethods(methodOptions);
        }

        // Set universities
        if (data.data.universities) {
          const universityOptions = [
            { value: '', label: 'Select University' },
            ...data.data.universities.map(university => ({
              value: university,
              label: university
            }))
          ];
          setUniversities(universityOptions);
        }
      } else {
        console.warn('⚠️ Profile options API returned unexpected format:', data);
        // Fallback to static lists with correct enum values from backend schema
        setServiceAreas([
          { value: '', label: 'Select Service Area' },
          { value: 'Gonyeli', label: 'Gonyeli' },
          { value: 'Kucuk', label: 'Kucuk' },
          { value: 'Lefkosa', label: 'Lefkosa' },
          { value: 'Famagusta', label: 'Famagusta' },
          { value: 'Kyrenia', label: 'Kyrenia' },
          { value: 'Other', label: 'Other' }
        ]);
        setTransportationMethods([
          { value: '', label: 'Select Transportation Method' },
          { value: 'bicycle', label: 'Bicycle', requiresLicense: false },
          { value: 'motorcycle', label: 'Motorcycle', requiresLicense: true },
          { value: 'scooter', label: 'Scooter', requiresLicense: true },
          { value: 'car', label: 'Car', requiresLicense: true },
          { value: 'walking', label: 'Walking', requiresLicense: false },
          { value: 'other', label: 'Other', requiresLicense: false }
        ]);
        setUniversities([
          { value: '', label: 'Select University' },
          { value: 'Eastern Mediterranean University (EMU)', label: 'Eastern Mediterranean University (EMU)' },
          { value: 'Near East University (NEU)', label: 'Near East University (NEU)' },
          { value: 'Cyprus International University (CIU)', label: 'Cyprus International University (CIU)' },
          { value: 'Girne American University (GAU)', label: 'Girne American University (GAU)' },
          { value: 'University of Kyrenia (UoK)', label: 'University of Kyrenia (UoK)' },
          { value: 'European University of Lefke (EUL)', label: 'European University of Lefke (EUL)' },
          { value: 'Middle East Technical University (METU) – Northern Cyprus Campus', label: 'Middle East Technical University (METU) – Northern Cyprus Campus' },
          { value: 'Final International University (FIU)', label: 'Final International University (FIU)' },
          { value: 'Bahçeşehir Cyprus University (BAU)', label: 'Bahçeşehir Cyprus University (BAU)' },
          { value: 'University of Mediterranean Karpasia (UMK)', label: 'University of Mediterranean Karpasia (UMK)' },
          { value: 'Cyprus Health and Social Science University', label: 'Cyprus Health and Social Science University' },
          { value: 'Arkin University of Creative Arts & Design', label: 'Arkin University of Creative Arts & Design' },
          { value: 'Cyprus West University', label: 'Cyprus West University' }
        ]);
      }
    } catch (error) {
      console.error('❌ Error fetching profile options:', error);
      // Fallback to static lists with correct enum values from backend schema
      setServiceAreas([
        { value: '', label: 'Select Service Area' },
        { value: 'Gonyeli', label: 'Gonyeli' },
        { value: 'Kucuk', label: 'Kucuk' },
        { value: 'Lefkosa', label: 'Lefkosa' },
        { value: 'Famagusta', label: 'Famagusta' },
        { value: 'Kyrenia', label: 'Kyrenia' },
        { value: 'Other', label: 'Other' }
      ]);
      setTransportationMethods([
        { value: '', label: 'Select Transportation Method' },
        { value: 'bicycle', label: 'Bicycle', requiresLicense: false },
        { value: 'motorcycle', label: 'Motorcycle', requiresLicense: true },
        { value: 'scooter', label: 'Scooter', requiresLicense: true },
        { value: 'car', label: 'Car', requiresLicense: true },
        { value: 'walking', label: 'Walking', requiresLicense: false },
        { value: 'other', label: 'Other', requiresLicense: false }
      ]);
      setUniversities([
        { value: '', label: 'Select University' },
        { value: 'Eastern Mediterranean University (EMU)', label: 'Eastern Mediterranean University (EMU)' },
        { value: 'Near East University (NEU)', label: 'Near East University (NEU)' },
        { value: 'Cyprus International University (CIU)', label: 'Cyprus International University (CIU)' },
        { value: 'Girne American University (GAU)', label: 'Girne American University (GAU)' },
        { value: 'University of Kyrenia (UoK)', label: 'University of Kyrenia (UoK)' },
        { value: 'European University of Lefke (EUL)', label: 'European University of Lefke (EUL)' },
        { value: 'Middle East Technical University (METU) – Northern Cyprus Campus', label: 'Middle East Technical University (METU) – Northern Cyprus Campus' },
        { value: 'Final International University (FIU)', label: 'Final International University (FIU)' },
        { value: 'Bahçeşehir Cyprus University (BAU)', label: 'Bahçeşehir Cyprus University (BAU)' },
        { value: 'University of Mediterranean Karpasia (UMK)', label: 'University of Mediterranean Karpasia (UMK)' },
        { value: 'Cyprus Health and Social Science University', label: 'Cyprus Health and Social Science University' },
        { value: 'Arkin University of Creative Arts & Design', label: 'Arkin University of Creative Arts & Design' },
        { value: 'Cyprus West University', label: 'Cyprus West University' }
      ]);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      // Prevent multiple simultaneous API calls
      if (isFetching) {
        console.log('⚠️ Profile fetch already in progress, skipping...');
        return;
      }

      console.log('🔍 ProfilePage: Starting profile fetch...');
      console.log('🔍 Current profile before fetch: Starting fresh fetch...');

      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        console.log('⚠️ User not authenticated, skipping profile fetch');
        setIsLoading(false);
        return;
      }

      // Check if we already have profile data and it's not stale
      if (profile && !isLoading) {
        console.log('✅ Profile data already loaded, skipping fetch');
        return;
      }

      // Check if authentication token exists
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No authentication token found, redirecting to login');
        localStorage.removeItem('user');
        localStorage.removeItem('driverProfile');
        window.location.href = '/';
        return;
      }

      console.log('✅ Authentication token found, proceeding with API call');

      console.log('✅ User authenticated, proceeding with profile fetch');
      setIsFetching(true);
      setIsLoading(true);

      // Try to get profile from API first
      try {
        console.log('📡 ProfilePage: Calling apiService.getDriverProfile()...');
        const response = await apiService.getDriverProfile();
        console.log('📊 ProfilePage: API response:', response);
        console.log('📊 ProfilePage: Full response structure:', JSON.stringify(response, null, 2));
        if (response.success && response.data) {
          const apiData = response.data;
          console.log('📊 Raw API data structure:', apiData);
          console.log('📊 API data keys:', Object.keys(apiData));
          console.log('📊 Personal details:', apiData.personalDetails);
          console.log('📊 Profile image data:', {
            profileImage: apiData.profileImage,
            profilePicture: apiData.profilePicture,
            image: apiData.image,
            avatar: apiData.avatar
          });
          console.log('📊 Complete API data structure:', {
            hasProfile: !!apiData.profile,
            hasCompletion: !!apiData.completion,
            hasVerification: !!apiData.verification,
            hasDocuments: !!apiData.documents,
            topLevelKeys: Object.keys(apiData)
          });

          if (apiData.profile) {
            console.log('📊 Profile structure:', {
              hasPersonalDetails: !!apiData.profile.personalDetails,
              hasStudentInfo: !!apiData.profile.studentInfo,
              hasTransportation: !!apiData.profile.transportation,
              profileKeys: Object.keys(apiData.profile)
            });
          }

          if (apiData.completion) {
            console.log('📊 Completion structure:', {
              overall: apiData.completion.overall,
              hasSections: !!apiData.completion.sections,
              isComplete: apiData.completion.isComplete,
              readyForDeliveries: apiData.completion.readyForDeliveries
            });
          }

          // Handle the complete backend payload structure
          console.log('📊 Checking payload structure - has profile object:', !!apiData.profile);
          console.log('📊 Checking payload structure - has completion object:', !!apiData.completion);
          console.log('📊 Checking payload structure - completion details:', apiData.completion);

          let profileData;

          // Check if backend returns the new complete structure
          if (apiData.profile && apiData.completion && apiData.verification) {
            console.log('✅ Using complete backend payload structure');

            // Preserve existing image if API doesn't return one
            const existingImage = profile?.profileImage;
            const apiImage = apiData.profileImage ||
              apiData.profile?.profileImage ||
              apiData.profilePicture ||
              apiData.image ||
              apiData.avatar;

            profileData = {
              // Handle profile image - preserve existing if API doesn't return one
              profileImage: apiImage || existingImage || null,
              profileImagePublicId: apiData.profileImagePublicId || apiData.publicId || profile?.profileImagePublicId || null,

              // Use the complete backend structure directly
              profile: apiData.profile,
              completion: apiData.completion,
              verification: apiData.verification,
              documents: apiData.documents || {}
            };
          } else {
            console.log('📊 Using legacy flat structure - transforming to nested format');
            // Transform flat API response to expected nested structure

            // Preserve existing image if API doesn't return one
            const existingImage = profile?.profileImage;
            const apiImage = apiData.profileImage ||
              apiData.profilePicture ||
              apiData.image ||
              apiData.avatar;

            profileData = {
              // Preserve profile image - use API image or keep existing
              profileImage: apiImage || existingImage || null,
              profileImagePublicId: apiData.profileImagePublicId || apiData.publicId || profile?.profileImagePublicId || null,

              profile: {
                personalDetails: {
                  fullName: apiData.personalDetails?.fullName || apiData.fullName || '',
                  email: apiData.personalDetails?.email || apiData.email || '',
                  phone: apiData.personalDetails?.phone || apiData.phone || '',
                  address: apiData.personalDetails?.address || apiData.address || ''
                },
                studentInfo: {
                  studentId: apiData.studentInfo?.studentId || apiData.studentId || '',
                  university: apiData.studentInfo?.university || apiData.university || ''
                },
                transportation: {
                  method: apiData.transportation?.method || apiData.transportationMethod || '',
                  area: apiData.transportation?.area || apiData.transportationArea || ''
                }
              },
              verification: apiData.verification || {
                studentVerified: false,
                profileComplete: false,
                activeDeliveryPartner: false
              },
              completion: apiData.completion || {
                overall: 0,
                sections: {
                  personalDetails: { completed: 0, total: 4, percentage: 0 },
                  studentInfo: { completed: 0, total: 2, percentage: 0 },
                  transportation: { completed: 0, total: 2, percentage: 0 },
                  verification: { completed: 0, total: 3, percentage: 0 },
                  documents: { completed: 0, total: 5, percentage: 0 }
                },
                isComplete: false,
                readyForDeliveries: false
              },
              documents: apiData.documents || {}
            };
          }

          console.log('🔄 Final transformed profile data:', profileData);
          console.log('🔄 Profile image preserved:', profileData.profileImage || 'No profile image found');
          console.log('🔄 Personal details preserved:', profileData.profile.personalDetails);

          // Debug the header values specifically
          console.log('🎯 HEADER DEBUG - What the header will show:');
          console.log('  Profile Complete %:', profileData?.completion?.overall || 0);
          console.log('  Service Area:', profileData?.profile?.transportation?.area || 'N/A');
          console.log('  Transport Method:', profileData?.profile?.transportation?.method || 'N/A');
          console.log('  Full completion object:', profileData?.completion);
          console.log('  Full transportation object:', profileData?.profile?.transportation);

          // Check if this is stored data (persistent) vs calculated data
          console.log('🔍 PERSISTENCE CHECK:');
          console.log('  Has storedProfileCompletion:', !!apiData.storedProfileCompletion);
          console.log('  Has storedVerification:', !!apiData.storedVerification);
          console.log('  Stored completion overall:', apiData.storedProfileCompletion?.overall);
          console.log('  Data source:', apiData.storedProfileCompletion ? 'DATABASE (PERSISTENT)' : 'CALCULATED (TEMPORARY)');

          // Add timestamp to track when data was last updated
          console.log('🕒 Data freshness:');
          console.log('  Current time:', new Date().toISOString());
          console.log('  Profile updated at:', apiData.updatedAt || 'Unknown');

          setProfile(profileData);

          // Update AuthContext with profile data
          updateProfile(profileData);

          // Also populate form data for editing using transformed data
          setFormData({
            fullName: profileData.profile.personalDetails.fullName,
            email: profileData.profile.personalDetails.email,
            phone: profileData.profile.personalDetails.phone,
            address: profileData.profile.personalDetails.address,
            studentId: profileData.profile.studentInfo.studentId,
            university: profileData.profile.studentInfo.university,
            transportationMethod: profileData.profile.transportation.method,
            transportationArea: profileData.profile.transportation.area
          });

          console.log('📝 Form data populated:', {
            fullName: profileData.profile.personalDetails.fullName,
            email: profileData.profile.personalDetails.email,
            hasData: !!(profileData.profile.personalDetails.fullName || profileData.profile.personalDetails.email)
          });

          console.log('✅ ProfilePage: Successfully loaded profile from API');
          return;
        }
      } catch (apiError) {
        console.error('❌ ProfilePage: API call failed:', apiError);
        console.error('Error details:', {
          message: apiError.message,
          status: apiError.response?.status,
          data: apiError.response?.data,
          url: '/api/driver/profile'
        });

        // Don't use fallback if it's an auth error - let user re-login
        if (apiError.response?.status === 401) {
          console.error('🔒 Authentication failed - redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('driverProfile'); // Clear saved profile data
          window.location.href = '/';
          return;
        }

        // Show specific error message for other API errors
        if (apiError.response?.status === 400) {
          console.error('❌ Bad Request - API validation failed');
          toast.error('Profile data format error. Please contact support.');
        } else if (apiError.response?.status === 500) {
          console.error('❌ Server Error - Backend issue');
          toast.error('Server error. Please try again later.');
        } else {
          console.error('❌ Network or other error');
          toast.error('Failed to load profile. Please check your connection.');
        }

        console.log('⚠️ Using fallback data due to API error');
      }

      // No fallback data - API should work properly
      console.log('❌ ProfilePage: API call failed - no profile data available');
      toast.error('Failed to load profile data');

      // Set empty profile state
      setProfile({
        profile: {
          personalDetails: { fullName: '', email: '', phone: '', address: '' },
          studentInfo: { studentId: '', university: '' },
          transportation: { method: '', area: '' }
        },
        verification: { studentVerified: false, profileComplete: false, activeDeliveryPartner: false },
        completion: { overall: 0, sections: {}, isComplete: false, readyForDeliveries: false },
        documents: {}
      });
    } catch (error) {
      console.error('💥 ProfilePage: Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      console.log('🏁 ProfilePage: Setting isLoading to false');
      setIsLoading(false);
      setIsFetching(false);
      // Note: profile state will be logged in the next render due to React's async nature
    }
  }, [user?.id, isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      console.error('❌ User not authenticated, cannot update profile');
      toast.error('Please log in to update your profile');
      return;
    }

    // Check if authentication token exists
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No authentication token found, redirecting to login');
      toast.error('Please log in again to update your profile');
      localStorage.removeItem('user');
      localStorage.removeItem('driverProfile');
      window.location.href = '/';
      return;
    }

    console.log('✅ Authentication token found, proceeding with profile update');

    setIsSaving(true);

    try {
      console.log('💾 ProfilePage: Saving profile data:', formData);

      // Prepare the data in the backend structure - using correct field names from schema
      const updateData = {
        // Correct field names matching backend validation schema
        fullName: formData.fullName || '',
        phone: formData.phone || '',
        area: formData.transportationArea || '', // Service area - maps to 'area' field
        transportationType: formData.transportationMethod || '', // Maps to 'transportationType' field
        university: formData.university || '',
        studentId: formData.studentId || '',
        address: formData.transportationArea || '' // Service area - maps to 'address' field
      };

      // Validate required fields before sending (matching backend schema)
      const requiredFields = ['fullName', 'phone', 'studentId', 'university'];
      const missingFields = requiredFields.filter(field => !updateData[field] || updateData[field].trim() === '');

      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setIsSaving(false);
        return;
      }

      console.log('✅ All required fields present, sending to API');

      console.log('📡 API Update Data:', {
        fullName: updateData.fullName,
        phone: updateData.phone,
        area: updateData.area,
        transportationType: updateData.transportationType,
        university: updateData.university,
        studentId: updateData.studentId,
        address: updateData.address,
        apiUrl: '/api/driver/profile'
      });

      // Try to call the API
      try {
        const response = await apiService.updateDriverProfile(updateData);
        if (response.success) {
          toast.success('Profile updated successfully!');
          setIsEditing(false);

          // Update profile state directly instead of refreshing to preserve image
          if (response.data) {
            console.log('✅ Profile updated successfully, updating state directly');
            setProfile(prev => ({
              ...prev,
              profile: {
                ...prev.profile,
                personalDetails: {
                  ...prev.profile?.personalDetails,
                  fullName: updateData.fullName,
                  phone: updateData.phone
                },
                studentInfo: {
                  ...prev.profile?.studentInfo,
                  studentId: updateData.studentId,
                  university: updateData.university
                },
                transportation: {
                  ...prev.profile?.transportation,
                  method: updateData.transportationType,
                  area: updateData.area
                }
              }
            }));
          } else {
            // Fallback: refresh profile data if no response data
            console.log('⚠️ No response data, refreshing profile');
            await fetchProfile();
          }
          return;
        }
      } catch (apiError) {
        console.error('❌ ProfilePage: API update failed:', apiError);
        console.error('❌ Error details:', {
          message: apiError.message,
          status: apiError.response?.status,
          data: apiError.response?.data,
          url: '/api/driver/profile'
        });

        // Log the exact data being sent to help debug
        console.error('📤 Data sent to API:', updateData);
        console.error('📤 Full request payload:', JSON.stringify(updateData, null, 2));

        // Show more specific error message
        if (apiError.response?.status === 400) {
          toast.error('Invalid profile data. Please check your information.');
        } else if (apiError.response?.status === 401) {
          toast.error('Please log in again to update your profile.');
        } else {
          toast.error(`Failed to update profile: ${apiError.response?.data?.message || apiError.message}`);
        }

        setIsEditing(false);
        return;
      }

    } catch (error) {
      console.error('💥 ProfilePage: Error saving profile:', error);
      toast.error('Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (profile) {
      setFormData({
        fullName: profile.profile?.personalDetails?.fullName || '',
        email: profile.profile?.personalDetails?.email || '',
        phone: profile.profile?.personalDetails?.phone || '',
        address: profile.profile?.personalDetails?.address || '',
        studentId: profile.profile?.studentInfo?.studentId || '',
        university: profile.profile?.studentInfo?.university || '',
        transportationMethod: profile.profile?.transportation?.method || '',
        transportationArea: profile.profile?.transportation?.area || ''
      });
    }
  };

  // Handle document upload completion
  const handleDocumentUploaded = async (documentType, documentData) => {
    console.log('📄 Document uploaded:', documentType, documentData);

    // Update profile state with new document data
    setProfile(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: {
          status: 'pending',
          uploadDate: new Date().toISOString(),
          ...documentData
        }
      }
    }));

    // Update profile data directly instead of refreshing
    console.log('✅ Document uploaded, profile data updated directly');
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setIsUploadingImage(true);

    try {
      toast('Compressing and uploading image...', { icon: '📤' });

      // Compress the image
      const compressedFile = await compressImage(file, 400, 400, 0.8);
      console.log(`📦 Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      console.log(`📦 Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

      // Upload directly to backend - no local storage
      const formData = new FormData();
      formData.append('profilePicture', compressedFile, 'profile.jpg');
      formData.append('publicId', `upload_${Date.now()}`);
      formData.append('originalSize', file.size.toString());
      formData.append('compressedSize', compressedFile.size.toString());

      console.log('📤 Uploading image directly to database...');

      const result = await apiService.uploadDriverProfileImage(formData);

      // Debug: Log the full backend response
      console.log('🔍 Full backend response:', result);
      console.log('🔍 Response structure:', {
        success: result.success,
        message: result.message,
        data: result.data,
        hasImageUrl: !!(result.data?.imageUrl),
        allKeys: Object.keys(result)
      });

      // Check for success with proper image URL extraction
      if (result.success === true) {
        console.log('✅ Profile image uploaded to database successfully');
        toast.success('Profile image uploaded successfully!');

        // Extract image URL from various possible response formats
        const imageUrl = result.data?.imageUrl ||
          result.data?.profilePicture ||
          result.data?.optimizedUrl ||
          result.data?.url;

        if (imageUrl) {
          console.log('🔗 Using image URL:', imageUrl);
          console.log('📝 Updating profile state with new image');

          setProfile(prev => {
            const updatedProfile = {
              ...prev,
              profileImage: imageUrl,
              profileImagePublicId: result.data?.publicId || `upload_${Date.now()}`
            };
            console.log('🎯 Profile state updated:', {
              hasProfile: !!updatedProfile,
              hasProfileData: !!updatedProfile.profile,
              imageUrl: updatedProfile.profileImage
            });
            return updatedProfile;
          });

          console.log('✅ Image upload complete - NOT refreshing to avoid data loss');
        } else {
          console.warn('⚠️ No image URL found in response, refreshing profile');
          await fetchProfile();
        }
      } else {
        console.error('❌ Upload failed - backend returned success: false');
        throw new Error('Upload failed: ' + (result.message || 'Server returned success: false'));
      }

    } catch (error) {
      console.error('❌ Image upload failed:', error);
      toast.error(`Upload failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsUploadingImage(false);
      // Clear the input so the same file can be selected again
      event.target.value = '';
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && user.id) {
      console.log('✅ User properly authenticated with ID:', user.id);
      fetchProfile();
    } else {
      console.log('⚠️ User not properly authenticated:', { isAuthenticated, user });
      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        console.log('🔒 Not authenticated, redirecting to login');
        window.location.href = '/';
      }
    }
  }, [user?.id, isAuthenticated]);

  // Fetch profile options (service areas) on component mount
  useEffect(() => {
    fetchProfileOptions();
  }, []);

  if (isLoading) {
    return (
      <DriverLayout>
        <ProfilePageSkeleton />
      </DriverLayout>
    );
  }

  return (
    <DriverLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-1">Complete driver information from backend</p>
            </div>
            <button
              onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${isEditing
                ? 'bg-gray-500 text-white hover:bg-gray-600'
                : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              <PencilIcon className="w-4 h-4" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* Profile Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <Avatar
                  user={user}
                  profile={profile}
                  size="xl"
                  className="border-4 border-green-200 shadow-lg"
                />
                <div className="absolute bottom-0 right-0">
                  <input
                    type="file"
                    id="profile-image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className={`flex items-center justify-center p-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors cursor-pointer ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {isUploadingImage ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <CameraIcon className="w-4 h-4" />
                    )}
                  </label>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-900">{profile?.profile?.personalDetails?.fullName || 'Student Delivery Partner'}</h2>
                <p className="text-gray-600 mt-1">{profile?.profile?.personalDetails?.email}</p>
                <p className="text-sm text-gray-500 mt-1">ID: {profile?.profile?.studentInfo?.studentId}</p>
                <div className="flex items-center justify-center sm:justify-start space-x-6 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{profile?.completion?.overall || 0}%</p>
                    <p className="text-sm text-gray-600">Profile Complete</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{profile?.profile?.transportation?.area || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Service Area</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{profile?.profile?.transportation?.method || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Transport</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                {profile?.verification?.studentVerified && (
                  <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700">Student Verified</span>
                  </div>
                )}
                {profile?.completion?.readyForDeliveries && (
                  <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">Ready for Deliveries</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Complete Backend Data Display */}
          <div className="space-y-8">
            {/* Personal Details Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Personal Details</h2>
                <p className="text-sm text-gray-600">Completion: {profile?.completion?.sections?.personalDetails?.completed || 0}/{profile?.completion?.sections?.personalDetails?.total || 0} ({profile?.completion?.sections?.personalDetails?.percentage || 0}%)</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    {isEditing ? (
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter your full name"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">{profile?.profile?.personalDetails?.fullName || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    {isEditing ? (
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter your email address"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">{profile?.profile?.personalDetails?.email || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    {isEditing ? (
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">{profile?.profile?.personalDetails?.phone || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    {isEditing ? (
                      <div className="relative">
                        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter your address"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">{profile?.profile?.personalDetails?.address || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Student Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Student Information</h2>
                <p className="text-sm text-gray-600">Completion: {profile?.completion?.sections?.studentInfo?.completed || 0}/{profile?.completion?.sections?.studentInfo?.total || 0} ({profile?.completion?.sections?.studentInfo?.percentage || 0}%)</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                    {isEditing ? (
                      <div className="relative">
                        <IdentificationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter your student ID"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">{profile?.profile?.studentInfo?.studentId || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                    {isEditing ? (
                      <select
                        name="university"
                        value={formData.university}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-400 transition-colors"
                      >
                        {universities.map((university) => (
                          <option key={university.value} value={university.value}>
                            {university.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">{profile?.profile?.studentInfo?.university || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Transportation Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Transportation</h2>
                <p className="text-sm text-gray-600">Completion: {profile?.completion?.sections?.transportation?.completed || 0}/{profile?.completion?.sections?.transportation?.total || 0} ({profile?.completion?.sections?.transportation?.percentage || 0}%)</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transportation Method</label>
                    {isEditing ? (
                      <select
                        name="transportationMethod"
                        value={formData.transportationMethod}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-400 transition-colors"
                      >
                        {transportationMethods.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                            {method.requiresLicense ? ' (License Required)' : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">{profile?.profile?.transportation?.method || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Area
                      <span className="text-xs text-gray-500 ml-1">(Select your primary delivery area)</span>
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <select
                          name="transportationArea"
                          value={formData.transportationArea}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white appearance-none hover:border-green-400 transition-colors"
                        >
                          {serviceAreas.map((area) => (
                            <option key={area.value} value={area.value}>
                              {area.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                        {serviceAreas.find(area => area.value === profile?.profile?.transportation?.area)?.label ||
                          profile?.profile?.transportation?.area || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Changes Button */}
            {isEditing && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Verification Status Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Verification Status</h2>
                <p className="text-sm text-gray-600">Completion: {profile?.completion?.sections?.verification?.completed || 0}/{profile?.completion?.sections?.verification?.total || 0} ({profile?.completion?.sections?.verification?.percentage || 0}%)</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-4 border border-gray-100 rounded-lg">
                    <div className={`p-2 rounded-lg ${profile?.verification?.studentVerified ? 'bg-green-50' : 'bg-red-50'}`}>
                      <ShieldCheckIcon className={`h-5 w-5 ${profile?.verification?.studentVerified ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Student Verified</p>
                      <p className="text-sm text-gray-600">{profile?.verification?.studentVerified ? 'Verified' : 'Not verified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-gray-100 rounded-lg">
                    <div className={`p-2 rounded-lg ${profile?.verification?.profileComplete ? 'bg-green-50' : 'bg-red-50'}`}>
                      <DocumentTextIcon className={`h-5 w-5 ${profile?.verification?.profileComplete ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Profile Complete</p>
                      <p className="text-sm text-gray-600">{profile?.verification?.profileComplete ? 'Complete' : 'Incomplete'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-gray-100 rounded-lg">
                    <div className={`p-2 rounded-lg ${profile?.verification?.activeDeliveryPartner ? 'bg-green-50' : 'bg-red-50'}`}>
                      <AcademicCapIcon className={`h-5 w-5 ${profile?.verification?.activeDeliveryPartner ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Active Partner</p>
                      <p className="text-sm text-gray-600">{profile?.verification?.activeDeliveryPartner ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Overview Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Profile Completion Overview</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Overall Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm font-medium text-gray-900">{profile?.completion?.overall || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${profile?.completion?.overall || 0}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-xs">
                    <span className={`px-2 py-1 rounded ${profile?.completion?.isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {profile?.completion?.isComplete ? 'Complete' : 'Incomplete'}
                    </span>
                    <span className={`px-2 py-1 rounded ${profile?.completion?.readyForDeliveries ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {profile?.completion?.readyForDeliveries ? 'Ready for Deliveries' : 'Not Ready'}
                    </span>
                  </div>
                </div>

                {/* Section Progress */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(profile?.completion?.sections || {}).map(([sectionName, sectionData]) => (
                    <div key={sectionName} className="p-4 border border-gray-100 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">{sectionName.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-sm font-medium text-gray-900">{sectionData.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${sectionData.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{sectionData.completed}/{sectionData.total} completed</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <DocumentUpload
              documents={profile?.documents || {}}
              onDocumentUploaded={handleDocumentUploaded}
              user={user}
            />

            {/* Support Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Support & Information</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Support Cards */}
                <div className="space-y-4">
                  <a
                    href="https://wa.me/905338329785"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
                  >
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 2.079.529 4.0 1.459 5.68L.029 24l6.592-1.729c1.618.826 3.436 1.296 5.396 1.296 6.621 0 11.988-5.367 11.988-11.987C23.988 5.367 18.621.001 12.017.001zM12.017 21.92c-1.737 0-3.396-.441-4.838-1.204l-.347-.206-3.595.942.959-3.507-.225-.359a9.861 9.861 0 01-1.474-5.298c0-5.464 4.445-9.909 9.909-9.909s9.909 4.445 9.909 9.909-4.445 9.909-9.909 9.909z" />
                        <path d="M17.185 14.716c-.301-.15-1.781-.879-2.057-.979-.276-.101-.477-.151-.678.15-.2.301-.776.979-.951 1.181-.175.2-.351.226-.652.075-.301-.15-1.271-.468-2.42-1.493-.894-.798-1.497-1.784-1.672-2.085-.176-.301-.019-.464.132-.613.135-.133.301-.351.452-.527.15-.175.2-.301.301-.502.101-.2.05-.376-.025-.527-.075-.15-.678-1.634-.931-2.235-.246-.584-.497-.505-.678-.515-.176-.009-.376-.009-.577-.009s-.527.075-.803.376c-.276.301-1.053 1.029-1.053 2.51s1.078 2.909 1.228 3.109c.15.2 2.12 3.237 5.136 4.541.717.31 1.277.494 1.714.632.72.229 1.375.196 1.893.119.577-.086 1.781-.728 2.032-1.431.252-.703.252-1.305.176-1.431-.075-.125-.276-.2-.577-.351z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-green-700">WhatsApp Support</h3>
                      <p className="text-sm text-gray-600">+90 533 832 97 85</p>
                    </div>
                  </a>

                  <a
                    href="https://instagram.com/greepit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-all group"
                  >
                    <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
                      <svg className="h-6 w-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-pink-700">Follow Us</h3>
                      <p className="text-sm text-gray-600">@greepit</p>
                    </div>
                  </a>
                </div>

                {/* Security Notice */}
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
        </div>
      </div>
    </DriverLayout>
  );
};

export default DriverProfilePage;