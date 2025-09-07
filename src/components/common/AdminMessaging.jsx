import React, { useState, useEffect, useRef } from 'react';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './ToastProvider';
import apiService from '../../services/api';
import socketService from '../../services/socketService';
import soundService from '../../services/soundService';

const AdminMessaging = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [lastMessageTime, setLastMessageTime] = useState(0);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        console.log('💬 AdminMessaging: Component mounted/updated, user:', user);
        // Load messages from API
        const loadMessages = async () => {
            try {
                const response = await apiService.getMessageHistory(1, 50);
                if (response.success && response.data.messages && response.data.messages.length > 0) {
                    // Ensure timestamps are properly converted to Date objects
                    const processedMessages = response.data.messages.map(msg => ({
                        ...msg,
                        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
                    }));
                    setMessages(processedMessages);
                    console.log('💬 AdminMessaging: Loaded', processedMessages.length, 'messages from API');
                } else {
                    // Start with empty messages array - no fallback messages
                    setMessages([]);
                    console.log('💬 AdminMessaging: No messages found, starting with empty array');
                }
            } catch (error) {
                console.log('💬 AdminMessaging: Could not load message history:', error);
                setMessages([]);
            }
        };

        // Load unread count
        const loadUnreadCount = async () => {
            try {
                const response = await apiService.getUnreadMessageCount();
                if (response.success && response.data.unreadCount !== undefined) {
                    setUnreadCount(response.data.unreadCount);
                } else {
                    setUnreadCount(0);
                }
            } catch (error) {
                console.log('💬 AdminMessaging: Could not load unread count:', error);
                setUnreadCount(0);
            }
        };

        loadMessages();
        loadUnreadCount();
    }, []);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Real-time message handling
    useEffect(() => {
        console.log('💬 AdminMessaging: Setting up real-time message handling, user:', user);
        const handleDriverMessage = (data) => {
            console.log('💬 AdminMessaging: Received driver message:', data);

            // Skip messages from the current user to prevent echo
            if (data.isFromSender || (data.driverId && data.driverId === (user._id || user.id))) {
                console.log('💬 AdminMessaging: Skipping message from sender to prevent echo');
                return;
            }

            const message = {
                id: data._id || data.id || Date.now() + Math.random(), // Use backend ID if available
                sender: 'driver',
                message: data.message,
                timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
                read: false,
                type: data.type || 'general',
                location: data.location,
                driverId: data.driverId,
                driverName: data.driverName || 'Driver'
            };

            // Check if message already exists to prevent duplicates
            setMessages(prev => {
                const exists = prev.some(msg =>
                    msg.id === message.id ||
                    (msg.message === message.message &&
                        msg.sender === message.sender &&
                        Math.abs(new Date(msg.timestamp) - new Date(message.timestamp)) < 5000) // Within 5 seconds
                );

                if (exists) {
                    console.log('💬 AdminMessaging: Duplicate message detected, skipping:', message);
                    return prev;
                }

                return [...prev, message];
            });

            setUnreadCount(prev => prev + 1);

            // Play sound notification for new messages
            if (data.type === 'emergency') {
                soundService.playSound('alert');
                showError(`🚨 Emergency from ${data.driverName}: ${data.message}`, 8000);
            } else {
                soundService.playSound('notification');
                showSuccess(`New message from ${data.driverName}`, 3000);
            }
        };

        const handleNewMessage = (data) => {
            console.log('💬 AdminMessaging: Received new message:', data);

            const message = {
                id: data._id || data.id || Date.now() + Math.random(),
                sender: 'driver',
                message: data.message,
                timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
                read: false,
                type: 'general',
                driverId: data.senderId,
                driverName: data.senderName || data.senderType || 'Driver'
            };

            // Check if message already exists to prevent duplicates
            setMessages(prev => {
                const exists = prev.some(msg =>
                    msg.id === message.id ||
                    (msg.message === message.message &&
                        msg.sender === message.sender &&
                        Math.abs(new Date(msg.timestamp) - new Date(message.timestamp)) < 5000) // Within 5 seconds
                );

                if (exists) {
                    console.log('💬 AdminMessaging: Duplicate new message detected, skipping:', message);
                    return prev;
                }

                return [...prev, message];
            });

            setUnreadCount(prev => prev + 1);

            // Play sound notification for new messages
            soundService.playSound('notification');
            showSuccess(`New message from ${message.driverName}`, 3000);
        };

        const handleAdminMessage = (message) => {
            setMessages(prev => [...prev, message]);
        };

        const handleTyping = (isTyping) => {
            setIsTyping(isTyping);
        };

        // Listen for real-time messages from drivers
        console.log('💬 AdminMessaging: Checking socket connection:', socketService.isConnected());
        if (socketService.isConnected()) {
            console.log('💬 AdminMessaging: Setting up message listeners');
            socketService.on('driver-message', handleDriverMessage);
            socketService.on('new-message', handleNewMessage);
            socketService.on('admin-message', handleAdminMessage);
            socketService.on('admin-typing', handleTyping);

            // Listen for new-notification events that might contain driver messages
            console.log('💬 AdminMessaging: Setting up new-notification listener');
            socketService.on('new-notification', (data) => {
                console.log('💬 AdminMessaging: Received new-notification event:', data);
                if (data._routeToMessaging ||
                    data.type === 'driver-message' ||
                    data.senderType === 'driver' ||
                    data.message?.includes('Message from') ||
                    data.message?.toLowerCase().includes('are you sur') ||
                    data.message?.toLowerCase().includes('hello') ||
                    data.message?.toLowerCase().includes('hey') ||
                    data.message?.toLowerCase().includes('test message') ||
                    data.message?.toLowerCase().includes('how low can you go')) {
                    // Skip messages from the current user to prevent echo
                    if (data.isFromSender || (data.driverId && data.driverId === (user._id || user.id))) {
                        console.log('💬 AdminMessaging: Skipping new-notification message from sender to prevent echo');
                        return;
                    }
                    console.log('💬 AdminMessaging: Processing driver message from new-notification event', data);

                    // Transform the notification data into message format
                    const messageData = {
                        _id: data._id || data.id || Date.now() + Math.random(),
                        message: data.message,
                        timestamp: data.timestamp || data.createdAt || new Date(),
                        senderId: data.senderId || data.driverId,
                        senderName: data.senderName || data.driverName || 'Driver',
                        senderType: 'driver',
                        type: data.type === 'emergency' ? 'emergency' : 'general'
                    };

                    handleDriverMessage(messageData);
                }
            });
        }

        return () => {
            if (socketService.isConnected()) {
                socketService.off('driver-message', handleDriverMessage);
                socketService.off('new-message', handleNewMessage);
                socketService.off('admin-message', handleAdminMessage);
                socketService.off('admin-typing', handleTyping);
                socketService.off('new-notification');
            }
        };
    }, [showSuccess, showError, user._id, user.id]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        // Debouncing: Prevent multiple rapid calls (minimum 1 second between messages)
        const now = Date.now();
        if (now - lastMessageTime < 1000) {
            console.log('⏱️ Message debounced - too soon after last message');
            return;
        }
        setLastMessageTime(now);

        const messageText = newMessage.trim();
        const isEmergency = messageText.toLowerCase().includes('emergency') ||
            messageText.toLowerCase().includes('urgent') ||
            messageText.toLowerCase().includes('help') ||
            messageText.toLowerCase().includes('accident');

        setIsLoading(true);
        try {
            // Get current location if available (especially for emergencies)
            let location = null;
            if (navigator.geolocation && isEmergency) {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            timeout: 5000,
                            enableHighAccuracy: true
                        });
                    });
                    location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('📍 Message location captured:', location);
                } catch (error) {
                    console.warn('⚠️ Could not get location:', error);
                }
            }

            // Create message object first
            const message = {
                id: Date.now(),
                sender: 'driver',
                message: messageText,
                timestamp: new Date(),
                read: true,
                type: isEmergency ? 'emergency' : 'general',
                location: location
            };

            // Add message to local state immediately for better UX
            setMessages(prev => [...prev, message]);

            // Send message via the proper messaging API
            try {
                const messagePayload = {
                    message: messageText,
                    type: isEmergency ? 'emergency' : 'general',
                    timestamp: new Date().toISOString()
                };

                // Only include location if it's a valid object
                if (location && typeof location === 'object') {
                    messagePayload.location = location;
                }

                const response = await apiService.sendMessage(messagePayload);
                console.log('📡 Message sent via messaging API:', response);

                // Update the message with API response data if available
                if (response.success && response.data?.message) {
                    const apiMessage = {
                        ...message,
                        id: response.data.message._id || message.id,
                        timestamp: new Date(response.data.message.createdAt || message.timestamp)
                    };

                    // Replace the local message with the API response
                    setMessages(prev => prev.map(msg =>
                        msg.id === message.id ? apiMessage : msg
                    ));
                }
            } catch (apiError) {
                console.log('📡 Messaging API not available, using local message only');
                // Message is already in local state, no need to add again
            }
            setNewMessage('');

            // Emit via socket for real-time delivery (if connected)
            if (socketService.isConnected()) {
                socketService.emit('driver-message', {
                    ...message,
                    driverId: user._id || user.id,
                    driverName: user.name || 'Driver',
                    isFromSender: true // Flag to prevent echo
                });
                console.log('🔌 Message sent via WebSocket');
            } else {
                console.log('⚠️ WebSocket not connected, message stored locally');
            }

            // Show success message
            if (isEmergency) {
                showSuccess('Emergency message sent! Admin will be notified immediately.');
            } else {
                showSuccess('Message sent successfully!');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            showError('Failed to send message. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Mark messages as read when messaging interface is opened
    const handleOpenMessaging = () => {
        setIsOpen(true);

        // Mark unread messages as read
        const unreadMessages = messages.filter(msg => !msg.read && msg.sender === 'driver');
        if (unreadMessages.length > 0) {
            const unreadIds = unreadMessages.map(msg => msg.id);

            // Update local state immediately
            setMessages(prev => prev.map(msg =>
                unreadIds.includes(msg.id) ? { ...msg, read: true } : msg
            ));
            setUnreadCount(0);

            // Mark as read in backend
            apiService.markMessagesAsRead(unreadIds).catch(error => {
                console.log('💬 AdminMessaging: Could not mark messages as read:', error);
            });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timestamp) => {
        try {
            // Handle different timestamp formats
            let date;
            if (timestamp instanceof Date) {
                date = timestamp;
            } else if (typeof timestamp === 'string') {
                date = new Date(timestamp);
            } else if (typeof timestamp === 'number') {
                date = new Date(timestamp);
            } else {
                // Fallback to current time if timestamp is invalid
                date = new Date();
            }

            // Check if the date is valid
            if (isNaN(date.getTime())) {
                date = new Date(); // Fallback to current time
            }

            return new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).format(date);
        } catch (error) {
            console.warn('Error formatting timestamp:', error, 'timestamp:', timestamp);
            // Return current time as fallback
            return new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).format(new Date());
        }
    };

    return (
        <div className="relative">
            {/* Message Icon Button */}
            <button
                onClick={handleOpenMessaging}
                className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="Message Admin"
            >
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Message Thread Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />

                    <div className="absolute right-4 top-16 w-96 h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Admin Support</h3>
                                <p className="text-sm text-gray-500">
                                    {isTyping ? 'Admin is typing...' : 'Get help with any issue - documents, deliveries, earnings, or emergencies'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                                        <div className="flex items-center space-x-1">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                            <span className="text-xs text-gray-500 ml-2">Admin is typing...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'admin'
                                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        <p className="text-sm">{message.message}</p>
                                        <p
                                            className={`text-xs mt-1 ${message.sender === 'admin'
                                                ? 'text-green-100'
                                                : 'text-gray-500'
                                                }`}
                                        >
                                            {formatTime(message.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message... (Use 'emergency' or 'urgent' for immediate help)"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() || isLoading}
                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                                >
                                    <PaperAirplaneIcon className="h-4 w-4" />
                                    <span className="hidden sm:inline">Send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminMessaging;
