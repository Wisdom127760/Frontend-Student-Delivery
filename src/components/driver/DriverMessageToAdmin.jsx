import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import { useToast } from '../common/ToastProvider';
import Button from '../ui/Button';
import soundService from '../../services/soundService';
import socketService from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';

const DriverMessageToAdmin = () => {
    const { showSuccess, showError } = useToast();
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const sendMessage = async () => {
        if (!message.trim()) {
            showError('Please enter a message');
            return;
        }

        setIsSending(true);
        try {
            console.log('💬 DriverMessageToAdmin: ===== STARTING MESSAGE SEND =====');
            console.log('💬 DriverMessageToAdmin: Message to send:', message.trim());
            console.log('💬 DriverMessageToAdmin: User object:', user);
            console.log('💬 DriverMessageToAdmin: API Service:', apiService);

            // Use the new messaging API instead of the old notification endpoint
            const response = await apiService.sendMessage({
                message: message.trim(),
                type: 'general',
                timestamp: new Date().toISOString()
            });

            console.log('💬 DriverMessageToAdmin: API Response:', response);
            console.log('💬 DriverMessageToAdmin: Response success:', response.success);
            console.log('💬 DriverMessageToAdmin: Response data:', response.data);

            if (response.success) {
                // Play success sound when message is sent
                soundService.playSound('success');
                showSuccess('Message sent to admin successfully!');
                setMessage('');
                console.log('💬 DriverMessageToAdmin: Message sent via messaging API:', response);

                // Emit WebSocket event to notify admin in real-time
                console.log('💬 DriverMessageToAdmin: Checking WebSocket connection...');
                console.log('💬 DriverMessageToAdmin: Socket connected?', socketService.isConnected());

                if (socketService.isConnected()) {
                    console.log('💬 DriverMessageToAdmin: WebSocket is connected, preparing message data...');

                    // Get driver info from the API response or user object
                    const driverId = response.data?.message?.driverId?._id ||
                        response.data?.driverId?._id ||
                        user?._id ||
                        user?.id;

                    const driverName = response.data?.message?.driverId?.fullName ||
                        response.data?.driverId?.fullName ||
                        user?.fullName ||
                        user?.name ||
                        'Driver';

                    console.log('💬 DriverMessageToAdmin: Driver info extracted:', {
                        driverId: driverId,
                        driverName: driverName,
                        hasDriverId: !!driverId,
                        responseData: response.data
                    });

                    if (!driverId) {
                        console.error('💬 DriverMessageToAdmin: No driverId available:', {
                            responseDriverId: response.data?.message?.driverId,
                            userDriverId: user?._id || user?.id,
                            response: response
                        });
                        showError('Unable to send real-time notification: Driver ID not found');
                        return;
                    }

                    const messageData = {
                        message: message.trim(),
                        type: 'general',
                        driverId: driverId,
                        driverName: driverName,
                        conversationId: response.data?.conversation?._id || response.data?.message?.conversationId,
                        senderType: 'driver',
                        timestamp: new Date().toISOString(),
                        isFromSender: true // Flag to prevent echo
                    };

                    console.log('💬 DriverMessageToAdmin: ===== EMITTING WEBSOCKET EVENT =====');
                    console.log('💬 DriverMessageToAdmin: Message data to emit:', messageData);
                    console.log('💬 DriverMessageToAdmin: Socket service:', socketService);
                    console.log('💬 DriverMessageToAdmin: Socket object:', socketService.getSocket());

                    socketService.emit('driver-message', messageData);
                    console.log('💬 DriverMessageToAdmin: ===== WEBSOCKET EVENT EMITTED =====');
                    console.log('💬 DriverMessageToAdmin: WebSocket event emitted successfully!');
                } else {
                    console.warn('💬 DriverMessageToAdmin: WebSocket not connected, admin will not receive real-time notification');
                    console.log('💬 DriverMessageToAdmin: Attempting to connect WebSocket...');
                    socketService.connect(user?._id || user?.id, user?.userType || user?.role);
                }
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

                <Button
                    onClick={sendMessage}
                    loading={isSending}
                    loadingText="Sending..."
                    icon={PaperAirplaneIcon}
                    fullWidth={true}
                    disabled={!message.trim()}
                >
                    Send Message
                </Button>
            </div>
        </div>
    );
};

export default DriverMessageToAdmin;
