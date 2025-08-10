import React, { useState } from 'react';
import {
    DocumentArrowUpIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    PhotoIcon,
    AcademicCapIcon,
    IdentificationIcon,
    TruckIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import { compressImage } from '../../services/cloudinaryService';
import AIVerificationStatus from './AIVerificationStatus';

const DocumentUpload = ({ documents = {}, onDocumentUploaded, user }) => {
    const [uploading, setUploading] = useState({});
    const [selectedFiles, setSelectedFiles] = useState({});
    const [aiVerification, setAiVerification] = useState({});
    const [showAiVerification, setShowAiVerification] = useState(false);

    // Document type configuration
    const documentTypes = [
        {
            key: 'studentId',
            label: 'Student ID',
            description: 'Upload your current student identification card',
            required: true,
            icon: IdentificationIcon,
            acceptedTypes: 'image/*,.pdf'
        },
        {
            key: 'profilePhoto',
            label: 'Profile Photo',
            description: 'Upload a clear photo of yourself',
            required: true,
            icon: PhotoIcon,
            acceptedTypes: 'image/*'
        },
        {
            key: 'universityEnrollment',
            label: 'University Enrollment Certificate',
            description: 'Upload your university enrollment or registration certificate',
            required: true,
            icon: AcademicCapIcon,
            acceptedTypes: 'image/*,.pdf'
        },
        {
            key: 'identityCard',
            label: 'Identity Card',
            description: 'Upload your national identity card or passport',
            required: true,
            icon: IdentificationIcon,
            acceptedTypes: 'image/*,.pdf'
        },
        {
            key: 'transportationLicense',
            label: 'Transportation License',
            description: 'Upload your driver\'s license (required for car/motorcycle)',
            required: false,
            icon: TruckIcon,
            acceptedTypes: 'image/*,.pdf'
        }
    ];

    // Check if transportation license is required based on user's transportation method
    const isTransportationLicenseRequired = () => {
        const transportationMethod = user?.profile?.transportation?.method;
        return ['car', 'motorcycle'].includes(transportationMethod);
    };

    // Handle AI verification completion
    const handleAIVerificationComplete = (documentType, result) => {
        console.log(`🤖 AI verification completed for ${documentType}:`, result);

        setAiVerification(prev => ({
            ...prev,
            [documentType]: result
        }));

        // Show success message based on verification result
        if (result.verification?.isAuthentic) {
            toast.success(`✅ ${documentTypes.find(d => d.key === documentType)?.label} verified by AI!`);
        } else {
            toast.error(`❌ ${documentTypes.find(d => d.key === documentType)?.label} verification failed. Please check the issues.`);
        }
    };

    const handleFileSelect = (documentType, event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFiles(prev => ({
                ...prev,
                [documentType]: file
            }));
        }
    };

    const handleUpload = async (documentType) => {
        const file = selectedFiles[documentType];
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        // Validate file type
        const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
        if (!isValidType) {
            toast.error('Please select an image (JPEG, PNG, WebP) or PDF file');
            return;
        }

        setUploading(prev => ({ ...prev, [documentType]: true }));

        try {
            let fileToUpload = file;

            // Compress images before upload (except PDFs)
            if (file.type.startsWith('image/')) {
                console.log(`🔄 Compressing ${documentType} image...`);
                try {
                    fileToUpload = await compressImage(file, 1200, 1200, 0.8);
                    console.log(`✅ Image compressed: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) → ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
                } catch (compressionError) {
                    console.warn(`⚠️ Image compression failed, using original:`, compressionError);
                    fileToUpload = file;
                }
            }

            const formData = new FormData();
            formData.append('document', fileToUpload);

            console.log(`📤 Uploading ${documentType} document...`);

            const response = await apiService.uploadDriverDocument(documentType, formData);

            if (response.success) {
                toast.success(`${documentTypes.find(d => d.key === documentType)?.label} uploaded successfully!`);

                // Clear the selected file
                setSelectedFiles(prev => {
                    const newState = { ...prev };
                    delete newState[documentType];
                    return newState;
                });

                // Notify parent component to refresh profile data
                if (onDocumentUploaded) {
                    onDocumentUploaded(documentType, response.data);
                }
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (error) {
            console.error(`❌ Error uploading ${documentType}:`, error);
            toast.error(`Upload failed: ${error.response?.data?.error || error.message}`);
        } finally {
            setUploading(prev => ({ ...prev, [documentType]: false }));
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'verified':
                return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
            case 'rejected':
                return <XCircleIcon className="w-5 h-5 text-red-600" />;
            case 'pending':
                return <ClockIcon className="w-5 h-5 text-yellow-600" />;
            default:
                return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'verified':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'verified':
                return 'Verified';
            case 'rejected':
                return 'Rejected';
            case 'pending':
                return 'Pending Review';
            default:
                return 'Not Uploaded';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Document Verification</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Upload required documents to complete your verification
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center space-x-4">
                            {/* AI Verification Toggle */}
                            <div className="flex items-center space-x-2">
                                <SparklesIcon className="w-5 h-5 text-purple-600" />
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showAiVerification}
                                        onChange={(e) => setShowAiVerification(e.target.checked)}
                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">AI Verification</span>
                                </label>
                            </div>

                            {/* Document Count */}
                            <div>
                                <p className="text-sm text-gray-600">Documents Verified</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {Object.values(documents).filter(doc => doc?.status === 'verified').length}/
                                    {documentTypes.filter(doc => doc.required || (doc.key === 'transportationLicense' && isTransportationLicenseRequired())).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {documentTypes.map((docType) => {
                        // Skip transportation license if not required
                        if (docType.key === 'transportationLicense' && !isTransportationLicenseRequired()) {
                            return null;
                        }

                        const document = documents[docType.key];
                        const status = document?.status || 'not_uploaded';
                        const isUploading = uploading[docType.key];
                        const hasSelectedFile = selectedFiles[docType.key];
                        const IconComponent = docType.icon;

                        return (
                            <div key={docType.key} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3 flex-1">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <IconComponent className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h4 className="font-medium text-gray-900">{docType.label}</h4>
                                                {docType.required && (
                                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                                        Required
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{docType.description}</p>

                                            {/* Status Display */}
                                            <div className="flex items-center space-x-2 mb-3">
                                                {getStatusIcon(status)}
                                                <span className={`text-sm px-2 py-1 rounded-full border ${getStatusColor(status)}`}>
                                                    {getStatusText(status)}
                                                </span>
                                                {document?.uploadDate && (
                                                    <span className="text-xs text-gray-500">
                                                        Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Rejection Reason */}
                                            {status === 'rejected' && document?.rejectionReason && (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                                    <p className="text-sm text-red-700">
                                                        <strong>Rejection Reason:</strong> {document.rejectionReason}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Upload Section - Show if not verified */}
                                            {status !== 'verified' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="file"
                                                            accept={docType.acceptedTypes}
                                                            onChange={(e) => handleFileSelect(docType.key, e)}
                                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                                            disabled={isUploading}
                                                        />
                                                        {hasSelectedFile && (
                                                            <button
                                                                onClick={() => handleUpload(docType.key)}
                                                                disabled={isUploading}
                                                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                                            >
                                                                {isUploading ? (
                                                                    <>
                                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                        <span>Processing...</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <DocumentArrowUpIcon className="w-4 h-4" />
                                                                        <span>Upload</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                    {hasSelectedFile && (
                                                        <p className="text-xs text-gray-600">
                                                            Selected: {selectedFiles[docType.key]?.name}
                                                            ({(selectedFiles[docType.key]?.size / 1024 / 1024).toFixed(2)} MB)
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Success Message */}
                                            {status === 'verified' && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                    <p className="text-sm text-green-700 flex items-center space-x-2">
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                        <span>Document verified successfully!</span>
                                                    </p>
                                                </div>
                                            )}

                                            {/* AI Verification Status */}
                                            {showAiVerification && aiVerification[docType.key] && (
                                                <div className="mt-4">
                                                    <AIVerificationStatus
                                                        documentType={docType.key}
                                                        file={selectedFiles[docType.key]}
                                                        userId={user?.id}
                                                        onVerificationComplete={(result) => handleAIVerificationComplete(docType.key, result)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Help Text */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-blue-800 mb-1">Document Upload Guidelines</p>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• Accepted formats: JPEG, PNG, WebP, PDF</li>
                                <li>• Maximum file size: 5MB per document</li>
                                <li>• Images are automatically compressed for faster upload</li>
                                <li>• Enable AI Verification for instant document analysis</li>
                                <li>• AI can detect fraud, extract text, and verify authenticity</li>
                                <li>• Ensure documents are clear and readable</li>
                                <li>• Documents will be reviewed by admin team</li>
                                <li>• You'll be notified once verification is complete</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentUpload;
