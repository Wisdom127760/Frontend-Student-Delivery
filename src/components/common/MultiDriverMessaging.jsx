import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    ChatBubbleLeftRightIcon,
    PaperAirplaneIcon,
    XMarkIcon,
    UserIcon,
    ClockIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    UserPlusIcon,
    CheckCircleIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './ToastProvider';
import apiService from '../../services/api';
import socketService from '../../services/socketService';
import soundService from '../../services/soundService';

const MultiDriverMessaging = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [lastMessageTime, setLastMessageTime] = useState(0);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();

    // Load conversations list
    const loadConversations = useCallback(async () => {
        try {
            console.log('💬 MultiDriverMessaging: Loading conversations...');
            const response = await apiService.getConversations();
            console.log('💬 MultiDriverMessaging: Raw API response:', response);

            if (response.success && response.data.conversations) {
                // Transform backend conversation data to match frontend expectations
                const transformedConversations = response.data.conversations.map(conv => ({
                    id: conv._id,
                    driverId: conv.driverId,
                    driverName: conv.driverName || conv.driver?.name || 'Unknown Driver',
                    lastMessage: conv.lastMessage,
                    lastMessageTime: conv.lastMessageTime || conv.updatedAt,
                    unreadCount: conv.adminUnreadCount || 0,
                    status: conv.status || 'active',
                    priority: conv.priority || 'normal',
                    assignedAdmin: conv.assignedAdmin,
                    createdAt: conv.createdAt
                }));
                setConversations(transformedConversations);
                console.log('💬 MultiDriverMessaging: Loaded conversations:', transformedConversations);
            } else {
                console.log('💬 MultiDriverMessaging: No conversations found or API error. Response:', response);
                setConversations([]);
            }
        } catch (error) {
            console.error('💬 MultiDriverMessaging: Error loading conversations:', error);
            console.error('💬 MultiDriverMessaging: Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            // Set empty conversations array on error to prevent UI issues
            setConversations([]);

            // Show user-friendly error message
            if (error.response?.status === 500) {
                showError('Unable to load conversations. Please try again later.');
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                showError('Authentication required. Please log in again.');
            }
        }
    }, [showError]);

    // Load messages for a specific conversation
    const loadMessages = useCallback(async (conversationId) => {
        if (!conversationId) return;

        // Skip loading messages for temporary conversation IDs created on frontend
        if (conversationId.startsWith('temp-')) {
            console.log('💬 MultiDriverMessaging: Skipping message load for temporary conversation:', conversationId);
            setMessages([]);
            return;
        }

        setIsLoading(true);
        try {
            console.log('💬 MultiDriverMessaging: Loading messages for conversation:', conversationId);
            const response = await apiService.getConversationMessages(conversationId, 1, 50);
            console.log('💬 MultiDriverMessaging: Messages API response:', response);

            if (response.success && response.data.messages) {
                // Transform backend message data to match frontend expectations
                const processedMessages = response.data.messages.map(msg => ({
                    id: msg._id,
                    sender: msg.senderType === 'driver' ? 'driver' : 'admin',
                    message: msg.message,
                    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                    read: msg.read || false,
                    type: msg.type || 'general',
                    location: msg.location,
                    driverId: msg.senderType === 'driver' ? msg.senderId : null,
                    driverName: msg.senderType === 'driver' ? msg.senderName : 'Admin',
                    conversationId: msg.conversationId
                }));
                setMessages(processedMessages);
                console.log('💬 MultiDriverMessaging: Loaded messages for conversation:', conversationId, 'Count:', processedMessages.length);
            } else {
                console.log('💬 MultiDriverMessaging: No messages found or API error for conversation:', conversationId);
                setMessages([]);
            }
        } catch (error) {
            console.error('💬 MultiDriverMessaging: Error loading messages:', error);
            console.error('💬 MultiDriverMessaging: Error details:', {
                conversationId,
                error: error.message,
                response: error.response?.data
            });
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Send message to specific driver
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeConversation) return;

        // Debouncing: Prevent multiple rapid calls
        const now = Date.now();
        if (now - lastMessageTime < 1000) {
            console.log('💬 MultiDriverMessaging: Message sent too quickly, skipping');
            return;
        }
        setLastMessageTime(now);

        const messageText = newMessage.trim();
        setNewMessage('');

        // Add message to local state immediately
        const tempMessage = {
            id: `temp-${Date.now()}`,
            sender: 'admin',
            message: messageText,
            timestamp: new Date(),
            read: true,
            type: 'general',
            conversationId: activeConversation.id,
            driverId: activeConversation.driverId,
            driverName: activeConversation.driverName,
            isTemporary: true
        };

        setMessages(prev => [...prev, tempMessage]);

        try {
            const response = await apiService.sendMessageToDriver(activeConversation.driverId, {
                message: messageText,
                type: 'general',
                timestamp: new Date().toISOString()
            });

            if (response.success) {
                // Replace temporary message with real one
                setMessages(prev => prev.map(msg =>
                    msg.id === tempMessage.id
                        ? { ...msg, id: response.data.messageId, isTemporary: false }
                        : msg
                ));

                // Emit typing indicator
                socketService.emit('admin-typing', {
                    driverId: activeConversation.driverId,
                    isTyping: false
                });

                soundService.playSound('success');
                console.log('💬 MultiDriverMessaging: Message sent successfully');
            } else {
                // Remove temporary message on failure
                setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
                showError('Failed to send message');
            }
        } catch (error) {
            console.error('💬 MultiDriverMessaging: Error sending message:', error);
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
            showError('Failed to send message. Please try again.');
        }
    };

    // Handle incoming messages
    const handleDriverMessage = useCallback((data) => {
        console.log('💬 MultiDriverMessaging: Received driver message:', data);
        console.log('💬 MultiDriverMessaging: Current user:', user);
        console.log('💬 MultiDriverMessaging: Active conversation:', activeConversation);

        // Skip messages from the current user to prevent echo
        if (data.isFromSender || (data.driverId && data.driverId === (user._id || user.id))) {
            console.log('💬 MultiDriverMessaging: Skipping message from sender to prevent echo');
            return;
        }

        // Only process messages that are actually from drivers (not from admin)
        if (data.senderType === 'admin' || data.sender === 'admin') {
            console.log('💬 MultiDriverMessaging: Skipping admin message to prevent echo');
            return;
        }

        const message = {
            id: data._id || data.id || Date.now() + Math.random(),
            sender: 'driver',
            message: data.message,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            read: false,
            type: data.type || 'general',
            location: data.location,
            driverId: data.driverId,
            driverName: data.driverName || 'Driver',
            conversationId: data.conversationId
        };

        // Check if message already exists to prevent duplicates
        setMessages(prev => {
            const exists = prev.some(msg =>
                msg.id === message.id ||
                (msg.message === message.message &&
                    msg.sender === message.sender &&
                    msg.driverId === message.driverId &&
                    Math.abs(new Date(msg.timestamp) - new Date(message.timestamp)) < 5000)
            );

            if (exists) {
                console.log('💬 MultiDriverMessaging: Duplicate message detected, skipping:', message);
                return prev;
            }

            return [...prev, message];
        });

        // Update conversation list with new message or create new conversation
        setConversations(prev => {
            const existingConversation = prev.find(conv => conv.driverId === data.driverId);

            if (existingConversation) {
                // Update existing conversation
                // Only increment unread count if this is not the active conversation
                const shouldIncrementUnread = activeConversation?.driverId !== data.driverId;

                return prev.map(conv =>
                    conv.driverId === data.driverId
                        ? {
                            ...conv,
                            lastMessage: data.message,
                            lastMessageTime: data.timestamp || new Date(),
                            unreadCount: shouldIncrementUnread ? (conv.unreadCount || 0) + 1 : (conv.unreadCount || 0),
                            isActive: conv.driverId === activeConversation?.driverId
                        }
                        : conv
                );
            } else {
                // Create new conversation
                // Only set unread count to 1 if this is not the active conversation
                const shouldSetUnread = activeConversation?.driverId !== data.driverId;

                const newConversation = {
                    id: data.conversationId || `temp-${data.driverId}-${Date.now()}`,
                    driverId: data.driverId,
                    driverName: data.driverName || 'Unknown Driver',
                    lastMessage: data.message,
                    lastMessageTime: data.timestamp || new Date(),
                    unreadCount: shouldSetUnread ? 1 : 0,
                    status: 'active',
                    priority: data.type === 'emergency' ? 'urgent' : 'normal',
                    assignedAdmin: null,
                    createdAt: new Date()
                };

                console.log('💬 MultiDriverMessaging: Creating new conversation:', newConversation);
                return [newConversation, ...prev];
            }
        });

        // Play sound notification
        if (data.type === 'emergency') {
            soundService.playSound('alert');
            showError(`🚨 Emergency from ${data.driverName}: ${data.message}`, 8000);
        } else {
            soundService.playSound('notification');
            showSuccess(`New message from ${data.driverName}`, 3000);
        }
    }, [user, activeConversation, showSuccess, showError]);

    // Handle typing indicators
    const handleTyping = useCallback((data) => {
        if (data.driverId === activeConversation?.driverId) {
            setIsTyping(data.isTyping);
        }
    }, [activeConversation?.driverId]);

    // Select conversation
    const selectConversation = (conversation) => {
        setActiveConversation(conversation);
        loadMessages(conversation.id);

        // Mark messages as read
        if (conversation.unreadCount > 0) {
            apiService.markConversationAsRead(conversation.id);
            setConversations(prev => prev.map(conv =>
                conv.id === conversation.id
                    ? { ...conv, unreadCount: 0 }
                    : conv
            ));
        }
    };

    // Assign conversation to current admin
    const assignConversation = async (conversationId) => {
        try {
            const response = await apiService.assignConversation(conversationId, user._id || user.id);
            if (response.success) {
                showSuccess('Conversation assigned to you');
                loadConversations(); // Refresh conversations list
            } else {
                showError('Failed to assign conversation');
            }
        } catch (error) {
            console.error('Error assigning conversation:', error);
            showError('Failed to assign conversation');
        }
    };

    // Update conversation status
    const updateConversationStatus = async (conversationId, status) => {
        try {
            const response = await apiService.updateConversationStatus(conversationId, status);
            if (response.success) {
                showSuccess(`Conversation marked as ${status}`);
                loadConversations(); // Refresh conversations list
            } else {
                showError('Failed to update conversation status');
            }
        } catch (error) {
            console.error('Error updating conversation status:', error);
            showError('Failed to update conversation status');
        }
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'waiting': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-blue-100 text-blue-800';
            case 'archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'normal': return 'bg-blue-100 text-blue-800';
            case 'low': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Format time for display
    const formatTime = (timestamp) => {
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return 'Invalid time';

            const now = new Date();
            const diff = now - date;
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (minutes < 1) return 'Just now';
            if (minutes < 60) return `${minutes}m ago`;
            if (hours < 24) return `${hours}h ago`;
            if (days < 7) return `${days}d ago`;

            return date.toLocaleDateString();
        } catch (error) {
            return 'Invalid time';
        }
    };

    // Initialize
    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user, loadConversations]);

    // Reload conversations when modal opens
    useEffect(() => {
        if (isOpen && user) {
            console.log('💬 MultiDriverMessaging: Modal opened, reloading conversations...');
            loadConversations();
        }
    }, [isOpen, user, loadConversations]);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen]);

    // WebSocket setup
    useEffect(() => {
        if (!user) return;

        console.log('💬 MultiDriverMessaging: Setting up WebSocket listeners');
        console.log('💬 MultiDriverMessaging: Socket connected?', socketService.isConnected());
        console.log('💬 MultiDriverMessaging: User:', user);

        if (socketService.isConnected()) {
            console.log('💬 MultiDriverMessaging: Registering driver-message listener');
            socketService.on('driver-message', handleDriverMessage);
            socketService.on('driver-typing', handleTyping);

            // Add general event listener for debugging
            socketService.on('*', (eventName, data) => {
                console.log('💬 MultiDriverMessaging: Received WebSocket event:', eventName, data);
            });
        } else {
            console.log('💬 MultiDriverMessaging: Socket not connected, attempting to connect...');
            socketService.connect(user._id || user.id, user.userType || user.role);
        }

        return () => {
            if (socketService.isConnected()) {
                console.log('💬 MultiDriverMessaging: Cleaning up WebSocket listeners');
                socketService.off('driver-message', handleDriverMessage);
                socketService.off('driver-typing', handleTyping);
                socketService.off('*');
            }
        };
    }, [user, activeConversation, handleDriverMessage, handleTyping]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle typing indicator
    const handleTypingChange = (e) => {
        setNewMessage(e.target.value);

        if (activeConversation) {
            socketService.emit('admin-typing', {
                driverId: activeConversation.driverId,
                isTyping: e.target.value.length > 0
            });
        }
    };

    const totalUnreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

    return (
        <div className="relative">
            {/* Chat Icon with Unread Badge */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
                {totalUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </span>
                )}
            </button>

            {/* Messaging Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Conversations Sidebar */}
                        <div className="w-1/3 border-r border-gray-200 flex flex-col">
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Driver Conversations</h3>
                                <p className="text-sm text-gray-500">Manage messages with drivers</p>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {conversations.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        <UserIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p>No conversations yet</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Driver messages will appear here
                                        </p>
                                    </div>
                                ) : (
                                    conversations.map((conversation) => (
                                        <div
                                            key={conversation.id}
                                            onClick={() => selectConversation(conversation)}
                                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${activeConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3 flex-1">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {conversation.driverName?.charAt(0) || 'D'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-medium text-gray-900 truncate">
                                                                {conversation.driverName || 'Unknown Driver'}
                                                            </h4>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(conversation.status)}`}>
                                                                {conversation.status}
                                                            </span>
                                                            {conversation.priority === 'urgent' && (
                                                                <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {conversation.lastMessage || 'No messages yet'}
                                                        </p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(conversation.priority)}`}>
                                                                {conversation.priority}
                                                            </span>
                                                            {!conversation.assignedAdmin && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        assignConversation(conversation.id);
                                                                    }}
                                                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                                                >
                                                                    <UserPlusIcon className="h-3 w-3" />
                                                                    <span>Assign</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400">
                                                        {conversation.lastMessageTime ? formatTime(conversation.lastMessageTime) : ''}
                                                    </p>
                                                    {conversation.unreadCount > 0 && (
                                                        <span className="inline-flex bg-red-500 text-white text-xs rounded-full h-5 w-5 items-center justify-center mt-1">
                                                            {conversation.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 flex flex-col">
                            {activeConversation ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {activeConversation.driverName?.charAt(0) || 'D'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="font-semibold text-gray-900">
                                                            {activeConversation.driverName || 'Unknown Driver'}
                                                        </h3>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activeConversation.status)}`}>
                                                            {activeConversation.status}
                                                        </span>
                                                        {activeConversation.priority === 'urgent' && (
                                                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        Driver ID: {activeConversation.driverId}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {/* Status Management Buttons */}
                                                <div className="flex items-center space-x-1">
                                                    <button
                                                        onClick={() => updateConversationStatus(activeConversation.id, 'resolved')}
                                                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                                                        title="Mark as resolved"
                                                    >
                                                        <CheckCircleIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateConversationStatus(activeConversation.id, 'waiting')}
                                                        className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded transition-colors"
                                                        title="Mark as waiting"
                                                    >
                                                        <ClockIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateConversationStatus(activeConversation.id, 'archived')}
                                                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                                                        title="Archive conversation"
                                                    >
                                                        <ArchiveBoxIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => setIsOpen(false)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages Area */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {isLoading ? (
                                            <div className="text-center text-gray-500">Loading messages...</div>
                                        ) : messages.length === 0 ? (
                                            <div className="text-center text-gray-500">
                                                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                                <p>No messages yet. Start a conversation!</p>
                                            </div>
                                        ) : (
                                            messages.map((message) => (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'admin'
                                                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                                            : 'bg-gray-100 text-gray-900'
                                                            } ${message.isTemporary ? 'opacity-70' : ''}`}
                                                    >
                                                        <p className="text-sm">{message.message}</p>
                                                        <div className={`flex items-center justify-between mt-1 text-xs ${message.sender === 'admin' ? 'text-green-100' : 'text-gray-500'
                                                            }`}>
                                                            <span>{formatTime(message.timestamp)}</span>
                                                            {message.sender === 'admin' && (
                                                                <div className="flex items-center space-x-1">
                                                                    {message.isTemporary ? (
                                                                        <ClockIcon className="h-3 w-3" />
                                                                    ) : (
                                                                        <CheckIcon className="h-3 w-3" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}

                                        {/* Typing Indicator */}
                                        {isTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                                                    <div className="flex space-x-1">
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-gray-200">
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={handleTypingChange}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                                placeholder="Type your message..."
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim()}
                                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                                            >
                                                <PaperAirplaneIcon className="h-4 w-4" />
                                                <span>Send</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                        <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                                        <p>Choose a driver from the sidebar to start messaging</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiDriverMessaging;
