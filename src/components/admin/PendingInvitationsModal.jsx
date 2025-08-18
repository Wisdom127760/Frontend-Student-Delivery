import React, { useState, useEffect } from 'react';
import { XMarkIcon, EnvelopeIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import driverService from '../../services/driverService';
import toast from 'react-hot-toast';

const PendingInvitationsModal = ({ isOpen, onClose, onInvitationUpdate }) => {
    const [invitations, setInvitations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchPendingInvitations();
        }
    }, [isOpen]);

    const fetchPendingInvitations = async () => {
        try {
            setIsLoading(true);
            const response = await driverService.getPendingInvitations();
            setInvitations(response.data?.invitations || []);
        } catch (error) {
            console.error('Error fetching pending invitations:', error);
            toast.error('Failed to fetch pending invitations');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelInvitation = async (invitationId, driverName) => {
        try {
            setIsActionLoading(true);
            await driverService.cancelInvitation(invitationId);
            toast.success('Invitation cancelled successfully');
            fetchPendingInvitations(); // Refresh the list
            onInvitationUpdate && onInvitationUpdate();
        } catch (error) {
            console.error('Error cancelling invitation:', error);
            toast.error('Failed to cancel invitation');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleResendInvitation = async (invitationId, driverName) => {
        try {
            setIsActionLoading(true);
            await driverService.resendInvitation(invitationId);
            toast.success(`Invitation resent to ${driverName}`);
            fetchPendingInvitations(); // Refresh the list
            onInvitationUpdate && onInvitationUpdate();
        } catch (error) {
            console.error('Error resending invitation:', error);
            toast.error('Failed to resend invitation');
        } finally {
            setIsActionLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeUntilExpiry = (expiresAt) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry - now;

        if (diff <= 0) {
            return 'Expired';
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} left`;
        } else {
            return `${hours} hour${hours > 1 ? 's' : ''} left`;
        }
    };

    const getExpiryStatus = (expiresAt) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry - now;

        if (diff <= 0) {
            return 'expired';
        } else if (diff < 24 * 60 * 60 * 1000) { // Less than 24 hours
            return 'expiring-soon';
        } else {
            return 'valid';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Pending Driver Invitations</h2>
                            <p className="text-sm text-gray-500">Manage driver invitations and resend if needed</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={isLoading || isActionLoading}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : invitations.length === 0 ? (
                        <div className="text-center py-12">
                            <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending invitations</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                All driver invitations have been processed or expired.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {invitations.map((invitation) => {
                                const expiryStatus = getExpiryStatus(invitation.expiresAt);
                                const timeLeft = getTimeUntilExpiry(invitation.expiresAt);

                                return (
                                    <div key={invitation._id} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-green-600">
                                                            {invitation.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-sm font-medium text-gray-900">{invitation.name}</h3>
                                                        <p className="text-sm text-gray-500">{invitation.email}</p>
                                                        <div className="flex items-center space-x-4 mt-1">
                                                            <span className="text-xs text-gray-500">
                                                                Invited: {formatDate(invitation.invitedAt)}
                                                            </span>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${expiryStatus === 'expired' ? 'bg-red-100 text-red-800' :
                                                                expiryStatus === 'expiring-soon' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'
                                                                }`}>
                                                                {timeLeft}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                {expiryStatus !== 'expired' && (
                                                    <button
                                                        onClick={() => handleResendInvitation(invitation._id, invitation.name)}
                                                        disabled={isActionLoading}
                                                        className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                        title="Resend invitation email"
                                                    >
                                                        <ArrowPathIcon className="w-4 h-4 mr-1" />
                                                        Resend
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleCancelInvitation(invitation._id, invitation.name)}
                                                    disabled={isActionLoading}
                                                    className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                                                    title="Cancel invitation"
                                                >
                                                    <XCircleIcon className="w-4 h-4 mr-1" />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingInvitationsModal;
