import React, { useState, useEffect } from 'react';
import socketService from '../../services/socketService';
import apiService from '../../services/api';
import soundService from '../../services/soundService';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../common/SnackbarProvider';

const SocketTestPanel = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useSnackbar();
    const [isConnected, setIsConnected] = useState(false);
    const [testMessages, setTestMessages] = useState([]);
    const [socketStatus, setSocketStatus] = useState('Disconnected');

    useEffect(() => {
        const checkConnection = () => {
            const connected = socketService.isConnected();
            setIsConnected(connected);
            setSocketStatus(connected ? 'Connected' : 'Disconnected');
        };

        checkConnection();
        const interval = setInterval(checkConnection, 2000);

        return () => clearInterval(interval);
    }, []);

    const addTestMessage = (message, type = 'info') => {
        setTestMessages(prev => [...prev, {
            id: Date.now(),
            message,
            type,
            timestamp: new Date().toLocaleTimeString()
        }]);
    };

    const testSocketConnection = () => {
        try {
            if (!user) {
                addTestMessage('No user found', 'error');
                return;
            }

            if (!socketService.isConnected()) {
                addTestMessage('Socket not connected, attempting to connect...', 'warning');
                socketService.connect(user._id || user.id, user.userType || user.role);
            }

            addTestMessage('Socket connection test initiated', 'info');
        } catch (error) {
            addTestMessage(`Socket connection error: ${error.message}`, 'error');
        }
    };

    const testAdminNotification = () => {
        try {
            if (!socketService.isConnected()) {
                addTestMessage('Socket not connected', 'error');
                return;
            }

            // Emit a test notification
            socketService.emit('admin:test-notification', {
                message: 'Test notification from admin',
                timestamp: new Date().toISOString(),
                adminId: user._id || user.id
            });

            addTestMessage('Test admin notification sent', 'success');
            showSuccess('Test notification sent to drivers');
        } catch (error) {
            addTestMessage(`Notification error: ${error.message}`, 'error');
        }
    };

    const testEmergencyAlert = async () => {
        try {
            addTestMessage('Testing emergency alert via API...', 'info');

            // Test emergency alert via API
            const response = await apiService.testSocketEmergencyAlert(
                'test-driver-id',
                'Test emergency alert from admin panel',
                { lat: 35.1856, lng: 33.3823 }
            );

            if (response.success) {
                addTestMessage('Test emergency alert sent via API', 'success');
                showSuccess('Test emergency alert sent successfully!');
            } else {
                addTestMessage(`Emergency alert failed: ${response.message}`, 'error');
                showError('Emergency alert test failed');
            }
        } catch (error) {
            addTestMessage(`Emergency alert error: ${error.message}`, 'error');
            showError('Emergency alert test failed');
        }
    };

    const testDriverStatusRequest = () => {
        try {
            if (!socketService.isConnected()) {
                addTestMessage('Socket not connected', 'error');
                return;
            }

            socketService.emit('admin:request-driver-status');
            addTestMessage('Driver status request sent', 'info');
        } catch (error) {
            addTestMessage(`Status request error: ${error.message}`, 'error');
        }
    };

    const testSendMessageToDriver = async () => {
        try {
            addTestMessage('Sending test message to driver...', 'info');

            // Send message to a test driver
            const response = await apiService.sendMessageToDriver(
                'test-driver-id',
                'Hello from admin! This is a test message.'
            );

            if (response.success) {
                addTestMessage('Test message sent to driver', 'success');
                showSuccess('Message sent to driver successfully!');
            } else {
                addTestMessage(`Message failed: ${response.message}`, 'error');
                showError('Message sending failed');
            }
        } catch (error) {
            addTestMessage(`Message error: ${error.message}`, 'error');
            showError('Message sending failed');
        }
    };

    const testSystemNotification = async () => {
        try {
            addTestMessage('Sending system notification...', 'info');

            // Send system notification
            const response = await apiService.sendSystemNotification(
                'System maintenance scheduled for tomorrow at 2 AM',
                'high'
            );

            if (response.success) {
                addTestMessage('System notification sent', 'success');
                showSuccess('System notification sent successfully!');
            } else {
                addTestMessage(`System notification failed: ${response.message}`, 'error');
                showError('System notification failed');
            }
        } catch (error) {
            addTestMessage(`System notification error: ${error.message}`, 'error');
            showError('System notification failed');
        }
    };

    const testNotificationSound = () => {
        try {
            addTestMessage('Testing notification sounds...', 'info');

            // Test different sound types
            soundService.playSound('notification');
            setTimeout(() => soundService.playSound('alert'), 1000);
            setTimeout(() => soundService.playSound('delivery'), 2000);

            addTestMessage('Notification sounds played', 'success');
            showSuccess('Notification sounds tested!');
        } catch (error) {
            addTestMessage(`Sound test error: ${error.message}`, 'error');
            showError('Sound test failed');
        }
    };

    const clearMessages = () => {
        setTestMessages([]);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Socket Communication Test</h3>

            {/* Connection Status */}
            <div className="mb-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {socketStatus}
                </div>
            </div>

            {/* Test Buttons */}
            <div className="space-y-2 mb-4">
                <button
                    onClick={testSocketConnection}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Test Socket Connection
                </button>

                <button
                    onClick={testAdminNotification}
                    disabled={!isConnected}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                    Send Test Notification to Drivers
                </button>

                <button
                    onClick={testDriverStatusRequest}
                    disabled={!isConnected}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                    Request Driver Status
                </button>

                <button
                    onClick={testEmergencyAlert}
                    disabled={!isConnected}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                    Test Emergency Alert
                </button>

                <button
                    onClick={testSendMessageToDriver}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    Send Message to Driver
                </button>

                <button
                    onClick={testSystemNotification}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                    Send System Notification
                </button>

                <button
                    onClick={testNotificationSound}
                    className="w-full px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                    Test Notification Sounds
                </button>
            </div>

            {/* Test Messages */}
            <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Test Messages</h4>
                    <button
                        onClick={clearMessages}
                        className="text-xs text-gray-500 hover:text-gray-700"
                    >
                        Clear
                    </button>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1">
                    {testMessages.length === 0 ? (
                        <p className="text-sm text-gray-500">No test messages yet</p>
                    ) : (
                        testMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`text-xs p-2 rounded ${msg.type === 'error' ? 'bg-red-50 text-red-700' :
                                    msg.type === 'success' ? 'bg-green-50 text-green-700' :
                                        msg.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                                            'bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <span className="font-medium">{msg.timestamp}</span>: {msg.message}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* User Info */}
            <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current User</h4>
                <div className="text-xs text-gray-600">
                    <p>ID: {user?._id || user?.id || 'N/A'}</p>
                    <p>Type: {user?.userType || user?.role || 'N/A'}</p>
                    <p>Email: {user?.email || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

export default SocketTestPanel;
