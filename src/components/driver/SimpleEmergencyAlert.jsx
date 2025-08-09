import React, { useState, useEffect, useRef } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import socketService from '../../services/socketService';

const SimpleEmergencyAlert = () => {
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState('');
    // const [adminReplies, setAdminReplies] = useState([]); // For future use
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

    const sendEmergencyAlert = async () => {
        if (!message.trim()) {
            // Show error in the modal instead of alert
            return;
        }

        const userId = user._id || user.id;

        // Ensure socket is connected before sending emergency alert
        if (!socketService.isInitialized() || !socketService.isConnected()) {
            socketService.connect(userId, user.userType);

            // Wait a moment for the socket to connect and authenticate
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('🔍 Sending emergency alert with driver ID:', userId);
        console.log('🔍 Emergency alert data:', {
            driverId: userId,
            message: message.trim(),
            timestamp: new Date().toISOString()
        });

        // Send emergency alert
        socketService.emit('emergency-alert', {
            driverId: userId,
            message: message.trim(),
            timestamp: new Date().toISOString()
        });

        setMessage('');
        setShowModal(false);
    };

    // Listen for admin replies
    useEffect(() => {
        if (!user) return;

        const userId = user._id || user.id;

        // Ensure socket is connected
        if (!socketService.isInitialized() || !socketService.isConnected()) {
            socketService.connect(userId, user.userType);
        }

        socketService.on('emergency-reply', (data) => {
            // Admin reply received - could be handled by notification system instead
        });

        socketService.on('emergency-sent', (data) => {
            console.log('✅ Emergency alert sent confirmation:', data);
        });

        return () => {
            socketService.off('emergency-reply');
            socketService.off('emergency-sent');
        };
    }, [user]);

    return (
        <>
            {/* Emergency Button */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg"
                title="Emergency Alert"
            >
                <ExclamationTriangleIcon className="h-6 w-6" />
            </button>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div ref={modalRef} className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-red-600 mb-4">
                            Emergency Alert
                        </h3>

                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe the emergency..."
                            className={`w-full p-3 border rounded-lg mb-4 ${message.trim() === '' && message !== ''
                                ? 'border-red-500'
                                : 'border-gray-300'
                                }`}
                            rows={4}
                        />
                        {message.trim() === '' && message !== '' && (
                            <p className="text-red-500 text-sm mb-4">
                                Please enter an emergency message
                            </p>
                        )}

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 text-gray-600 border rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendEmergencyAlert}
                                disabled={!message.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
                            >
                                Send Alert
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SimpleEmergencyAlert; 