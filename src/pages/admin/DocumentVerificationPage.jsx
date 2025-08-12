import React, { useState, useEffect, useCallback } from 'react';
import {
    DocumentMagnifyingGlassIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    SparklesIcon,
    FunnelIcon,
    ArrowPathIcon,
    UserIcon,
    AcademicCapIcon,
    IdentificationIcon,
    PhotoIcon,
    TruckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import Pagination from '../../components/common/Pagination';

const DocumentVerificationPage = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, verified, rejected
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [processingAction, setProcessingAction] = useState(null);
    const [usingMockData, setUsingMockData] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Document type icons
    const documentIcons = {
        studentId: IdentificationIcon,
        profilePhoto: PhotoIcon,
        universityEnrollment: AcademicCapIcon,
        identityCard: IdentificationIcon,
        transportationLicense: TruckIcon
    };

    // Document type labels
    const documentLabels = {
        studentId: 'Student ID',
        profilePhoto: 'Profile Photo',
        universityEnrollment: 'University Enrollment',
        identityCard: 'Identity Card',
        transportationLicense: 'Transportation License'
    };

    // Load pending documents
    const loadDocuments = useCallback(async () => {
        try {
            setLoading(true);

            // Try to load from API first
            try {
                console.log('🔍 Attempting to load documents from backend...');
                const response = await apiService.getPendingDocuments({
                    ...filter,
                    page: currentPage,
                    limit: itemsPerPage
                });

                // Handle different response structures
                let documentsData = [];
                if (response && response.data) {
                    documentsData = Array.isArray(response.data) ? response.data : [];
                } else if (Array.isArray(response)) {
                    documentsData = response;
                } else {
                    console.warn('Unexpected response structure:', response);
                    documentsData = [];
                }

                console.log('📋 Loaded documents from API:', documentsData);
                setDocuments(documentsData);
                setTotalPages(response.totalPages || 1);
                setTotalItems(response.totalItems || documentsData.length);
                setUsingMockData(false);
            } catch (apiError) {
                console.error('❌ API Error:', apiError);
                console.log('API not available, using mock data for testing');

                // No mock data - return empty array when API is not available
                const mockDocuments = [];

                // Filter mock data based on current filter
                const filteredMockData = filter === 'all'
                    ? mockDocuments
                    : mockDocuments.filter(doc => doc.status === filter);

                setDocuments(filteredMockData);
                setTotalPages(1);
                setTotalItems(filteredMockData.length);
                setUsingMockData(true);
                toast.info('No documents available - Backend API not ready');
            }
        } catch (error) {
            console.error('Error loading documents:', error);
            toast.error('Failed to load documents');
            setDocuments([]); // Set empty array on error
            setTotalPages(1);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    }, [filter, currentPage, itemsPerPage]);

    // Handle document action (approve/reject)
    const handleDocumentAction = async (documentId, action, reason = '') => {
        try {
            setProcessingAction(documentId);

            // Try API first, fallback to mock
            try {
                const response = await apiService.updateDocumentStatus(documentId, {
                    status: action,
                    reason: reason,
                    verifiedBy: 'admin', // This should be the actual admin ID
                    verifiedAt: new Date().toISOString()
                });

                if (response.success) {
                    toast.success(`Document ${action === 'approved' ? 'approved' : 'rejected'} successfully`);
                    loadDocuments(); // Refresh the list
                } else {
                    throw new Error(response.message || 'Action failed');
                }
            } catch (apiError) {
                console.error('API not available for document action');
                toast.error('Document action not available - Backend API not ready');
            }
        } catch (error) {
            console.error('Error updating document status:', error);
            toast.error(`Failed to ${action} document`);
        } finally {
            setProcessingAction(null);
        }
    };

    // Start AI verification for a document
    const startAIVerification = async (documentId) => {
        try {
            setProcessingAction(documentId);

            // Try API first, fallback to mock
            try {
                const response = await apiService.startAIVerification(documentId);

                if (response.success) {
                    toast.success('AI verification started');
                    loadDocuments(); // Refresh to show updated status
                } else {
                    throw new Error(response.message || 'AI verification failed');
                }
            } catch (apiError) {
                console.error('API not available for AI verification');
                toast.error('AI verification not available - Backend API not ready');
                setProcessingAction(null);
            }
        } catch (error) {
            console.error('Error starting AI verification:', error);
            toast.error('Failed to start AI verification');
        } finally {
            setProcessingAction(null);
        }
    };

    // Get status color and icon
    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return { color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: ClockIcon, text: 'Pending Review' };
            case 'verified':
                return { color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircleIcon, text: 'Verified' };
            case 'rejected':
                return { color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircleIcon, text: 'Rejected' };
            case 'ai_processing':
                return { color: 'text-blue-600', bgColor: 'bg-blue-50', icon: SparklesIcon, text: 'AI Processing' };
            default:
                return { color: 'text-gray-600', bgColor: 'bg-gray-50', icon: ExclamationTriangleIcon, text: 'Unknown' };
        }
    };

    // Load documents on mount and filter change
    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
                        <p className="text-gray-600 mt-1">Review and verify driver documents with AI assistance</p>
                        {usingMockData && (
                            <div className="mt-2 flex items-center space-x-2">
                                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded-md">
                                    No documents available - Backend API not ready
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={loadDocuments}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-4">
                    <FunnelIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Filter by status:</span>
                    <div className="flex space-x-2">
                        {[
                            { key: 'all', label: 'All Documents' },
                            { key: 'pending', label: 'Pending Review' },
                            { key: 'ai_processing', label: 'AI Processing' },
                            { key: 'verified', label: 'Verified' },
                            { key: 'rejected', label: 'Rejected' }
                        ].map((filterOption) => (
                            <button
                                key={filterOption.key}
                                onClick={() => setFilter(filterOption.key)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === filterOption.key
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {filterOption.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Loading documents...</p>
                    </div>
                ) : !Array.isArray(documents) ? (
                    <div className="p-8 text-center">
                        <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto" />
                        <h3 className="text-lg font-medium text-gray-900 mt-2">Invalid Data</h3>
                        <p className="text-gray-600 mt-1">Documents data is not in the expected format.</p>
                        <button
                            onClick={loadDocuments}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Retry Loading
                        </button>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="p-8 text-center">
                        <DocumentMagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto" />
                        <h3 className="text-lg font-medium text-gray-900 mt-2">No documents found</h3>
                        <p className="text-gray-600 mt-1">No documents match the current filter criteria.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {documents.map((document) => {
                            const Icon = documentIcons[document.documentType] || DocumentMagnifyingGlassIcon;
                            const statusInfo = getStatusInfo(document.status);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <div key={document._id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            {/* Document Icon */}
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                                    <Icon className="h-6 w-6 text-white" />
                                                </div>
                                            </div>

                                            {/* Document Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {documentLabels[document.documentType]}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                                        <StatusIcon className="h-3 w-3 inline mr-1" />
                                                        {statusInfo.text}
                                                    </span>
                                                </div>
                                                <div className="mt-1 text-sm text-gray-600">
                                                    <span className="flex items-center">
                                                        <UserIcon className="h-4 w-4 mr-1" />
                                                        {document.driver?.name || 'Unknown Driver'}
                                                    </span>
                                                    <span className="ml-4">
                                                        Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center space-x-2">
                                            {/* View Document */}
                                            <button
                                                onClick={() => {
                                                    setSelectedDocument(document);
                                                    setShowDocumentModal(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="View Document"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </button>

                                            {/* AI Verification */}
                                            {document.status === 'pending' && (
                                                <button
                                                    onClick={() => startAIVerification(document._id)}
                                                    disabled={processingAction === document._id}
                                                    className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Start AI Verification"
                                                >
                                                    <SparklesIcon className="h-5 w-5" />
                                                </button>
                                            )}

                                            {/* Approve/Reject */}
                                            {document.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleDocumentAction(document._id, 'approved')}
                                                        disabled={processingAction === document._id}
                                                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleDocumentAction(document._id, 'rejected')}
                                                        disabled={processingAction === document._id}
                                                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* AI Verification Status */}
                                    {document.aiVerificationResult && (
                                        <div className="mt-4 pl-16">
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <SparklesIcon className="h-5 w-5 text-blue-600" />
                                                    <h4 className="font-medium text-blue-900">AI Verification Results</h4>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-blue-700">Status:</span>
                                                        <span className={`text-sm font-medium ${document.aiVerificationResult.verification?.isAuthentic
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                            }`}>
                                                            {document.aiVerificationResult.verification?.isAuthentic ? 'Verified' : 'Rejected'}
                                                        </span>
                                                    </div>
                                                    {document.aiVerificationResult.confidence && (
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-blue-700">Confidence:</span>
                                                            <span className="text-sm font-medium text-blue-900">
                                                                {Math.round(document.aiVerificationResult.confidence.overall * 100)}%
                                                            </span>
                                                        </div>
                                                    )}
                                                    {document.aiVerificationResult.verification?.issues?.length > 0 && (
                                                        <div>
                                                            <span className="text-sm text-blue-700">Issues:</span>
                                                            <ul className="text-sm text-red-600 mt-1">
                                                                {document.aiVerificationResult.verification.issues.map((issue, index) => (
                                                                    <li key={index}>• {issue}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {/* Document Modal */}
            {showDocumentModal && selectedDocument && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDocumentModal(false)}></div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {documentLabels[selectedDocument.documentType]} - {selectedDocument.driver?.name}
                                    </h3>
                                    <button
                                        onClick={() => setShowDocumentModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XCircleIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Document Image */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Document Image</h4>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <img
                                                src={selectedDocument.documentUrl}
                                                alt={documentLabels[selectedDocument.documentType]}
                                                className="w-full h-auto"
                                            />
                                        </div>
                                    </div>

                                    {/* Document Details */}
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Document Details</h4>
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Type:</span>
                                                    <span className="text-sm font-medium">{documentLabels[selectedDocument.documentType]}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Status:</span>
                                                    <span className={`text-sm font-medium ${getStatusInfo(selectedDocument.status).color}`}>
                                                        {getStatusInfo(selectedDocument.status).text}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Uploaded:</span>
                                                    <span className="text-sm font-medium">
                                                        {new Date(selectedDocument.uploadedAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                {selectedDocument.verifiedAt && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Verified:</span>
                                                        <span className="text-sm font-medium">
                                                            {new Date(selectedDocument.verifiedAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* AI Verification Results */}
                                        {selectedDocument.aiVerificationResult && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">AI Verification Results</h4>
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <div className="flex items-center space-x-2 mb-3">
                                                        <SparklesIcon className="h-5 w-5 text-blue-600" />
                                                        <h5 className="font-medium text-blue-900">AI Analysis Complete</h5>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-blue-700">Verification Status:</span>
                                                            <span className={`text-sm font-medium ${selectedDocument.aiVerificationResult.verification?.isAuthentic
                                                                ? 'text-green-600'
                                                                : 'text-red-600'
                                                                }`}>
                                                                {selectedDocument.aiVerificationResult.verification?.isAuthentic ? '✅ Verified' : '❌ Rejected'}
                                                            </span>
                                                        </div>
                                                        {selectedDocument.aiVerificationResult.confidence && (
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-blue-700">Confidence Score:</span>
                                                                <span className="text-sm font-medium text-blue-900">
                                                                    {Math.round(selectedDocument.aiVerificationResult.confidence.overall * 100)}%
                                                                </span>
                                                            </div>
                                                        )}
                                                        {selectedDocument.aiVerificationResult.extractedData && (
                                                            <div>
                                                                <span className="text-sm text-blue-700">Extracted Data:</span>
                                                                <div className="mt-1 text-sm text-gray-600">
                                                                    {Object.entries(selectedDocument.aiVerificationResult.extractedData.fields || {}).map(([key, value]) => (
                                                                        <div key={key} className="flex justify-between">
                                                                            <span className="capitalize">{key}:</span>
                                                                            <span className="font-medium">{value}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {selectedDocument.aiVerificationResult.verification?.issues?.length > 0 && (
                                                            <div>
                                                                <span className="text-sm text-blue-700">Issues Found:</span>
                                                                <ul className="text-sm text-red-600 mt-1 space-y-1">
                                                                    {selectedDocument.aiVerificationResult.verification.issues.map((issue, index) => (
                                                                        <li key={index}>• {issue}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {selectedDocument.aiVerificationResult.verification?.recommendations?.length > 0 && (
                                                            <div>
                                                                <span className="text-sm text-blue-700">Recommendations:</span>
                                                                <ul className="text-sm text-green-600 mt-1 space-y-1">
                                                                    {selectedDocument.aiVerificationResult.verification.recommendations.map((rec, index) => (
                                                                        <li key={index}>• {rec}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {selectedDocument.status === 'pending' && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        handleDocumentAction(selectedDocument._id, 'approved');
                                                        setShowDocumentModal(false);
                                                    }}
                                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    Approve Document
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleDocumentAction(selectedDocument._id, 'rejected');
                                                        setShowDocumentModal(false);
                                                    }}
                                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    Reject Document
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentVerificationPage;
