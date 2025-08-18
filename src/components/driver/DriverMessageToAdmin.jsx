import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
// import { useAuth } from '../../context/AuthContext'; // Unused import
import apiService from '../../services/api';
import { useToast } from '../common/ToastProvider';

const DriverMessageToAdmin = () => {
    // const { user } = useAuth(); // Unused variable
    const { showSuccess, showError } = useToast();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const sendMessage = async () => {
        if (!message.trim()) {
            showError('Please enter a message');
            return;
        }

        setIsSending(true);
        try {
            const response = await apiService.sendMessageToAdmin(message.trim());

            if (response.success) {
                showSuccess('Message sent to admin successfully!');
                setMessage('');
            } else {
                showError('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            showError('Failed to send message. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Send Message to Admin</h3>

            <div className="space-y-3">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message to admin..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={3}
                    disabled={isSending}
                />

                <button
                    onClick={sendMessage}
                    disabled={!message.trim() || isSending}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSending ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                        </>
                    ) : (
                        <>
                            <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                            Send Message
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default DriverMessageToAdmin;
