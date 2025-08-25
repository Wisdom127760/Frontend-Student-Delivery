import React, { useState, useEffect, useRef } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import socketService from '../../services/socketService';
import Button from '../ui/Button';

const EmergencyAlert = () => {
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const modalRef = useRef(null);

    // Handle click outside modal
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowModal(false);
            }
        };

        if (showModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showModal]);

    const handleEmergencyAlert = async () => {
        if (!message.trim()) {
            return;
        }

        setLoading(true);
        try {
            // Emit emergency alert through socket
            socketService.emit('emergency-alert', {
                driverId: user._id || user.id,
                message: message.trim(),
                location: 'Current location', // You can add GPS location here
                timestamp: new Date().toISOString()
            });

            // Show success feedback in the modal
            setMessage('');
            setShowModal(false);
        } catch (error) {
            console.error('Error sending emergency alert:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Emergency Button */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-6 right-6 bg-orange-400 hover:bg-orange-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 animate-pulse"
                style={{ minWidth: '60px', minHeight: '60px' }}
                title="Emergency Alert"
            >
                <ExclamationTriangleIcon className="h-6 w-6" />
            </button>

            {/* Emergency Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div ref={modalRef} className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-red-600 flex items-center">
                                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                Emergency Alert
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-3">
                                Send an emergency alert to all administrators. This should only be used in genuine emergency situations.
                            </p>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe the emergency situation..."
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${message.trim() === '' && message !== ''
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                    }`}
                                rows={4}
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {message.length}/500 characters
                            </p>
                            {message.trim() === '' && message !== '' && (
                                <p className="text-red-500 text-sm mt-1">
                                    Please enter an emergency message
                                </p>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            <Button
                                onClick={() => setShowModal(false)}
                                variant="secondary"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleEmergencyAlert}
                                loading={loading}
                                loadingText="Sending..."
                                variant="danger"
                                className="flex-1"
                                disabled={!message.trim()}
                            >
                                Send Alert
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EmergencyAlert; 