import React, { useState } from 'react';
import { useNotificationPermission } from '../../hooks/useNotificationPermission';
import pwaService from '../../services/pwaService';
import soundService from '../../services/soundService';
import { BellIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/**
 * Test component for notification functionality
 * Only use in development mode
 */
const NotificationTest = () => {
    const [isTesting, setIsTesting] = useState(false);
    const {
        isGranted,
        isDenied,
        isDefault,
        isUnsupported,
        requestPermission,
        permissionInfo
    } = useNotificationPermission('general', 'soft');

    const testPushNotification = async () => {
        if (!isGranted) {
            toast.error('Please enable notifications first');
            return;
        }

        setIsTesting(true);
        try {
            pwaService.showPushNotification('Test Notification', {
                body: 'This is a test notification to verify the system is working correctly.',
                tag: 'test-notification',
                requireInteraction: true
            });
            toast.success('Test notification sent!');
        } catch (error) {
            console.error('Test notification failed:', error);
            toast.error('Test notification failed');
        } finally {
            setIsTesting(false);
        }
    };

    const testSound = async () => {
        try {
            await soundService.playSound('notification');
            toast.success('Test sound played!');
        } catch (error) {
            console.error('Test sound failed:', error);
            toast.error('Test sound failed');
        }
    };

    const testPermissionRequest = async () => {
        setIsTesting(true);
        try {
            const granted = await requestPermission();
            if (granted) {
                toast.success('Permission granted!');
            } else {
                toast.error('Permission denied');
            }
        } catch (error) {
            console.error('Permission request failed:', error);
            toast.error('Permission request failed');
        } finally {
            setIsTesting(false);
        }
    };

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">🔔 Notification Test</h3>

            <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${isGranted ? 'bg-green-100 text-green-800' :
                            isDenied ? 'bg-red-100 text-red-800' :
                                isDefault ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                        }`}>
                        {isGranted ? 'Granted' : isDenied ? 'Denied' : isDefault ? 'Default' : 'Unsupported'}
                    </span>
                </div>

                {permissionInfo && (
                    <div className="text-xs text-gray-600">
                        <div>Retry: {permissionInfo.retryCount}/{permissionInfo.maxRetries}</div>
                        <div>Supported: {permissionInfo.isSupported ? 'Yes' : 'No'}</div>
                    </div>
                )}
            </div>

            <div className="flex flex-col space-y-2 mt-3">
                {!isGranted && (
                    <button
                        onClick={testPermissionRequest}
                        disabled={isTesting || isUnsupported}
                        className="flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                    >
                        <BellIcon className="h-3 w-3 mr-1" />
                        Request Permission
                    </button>
                )}

                <button
                    onClick={testPushNotification}
                    disabled={!isGranted || isTesting}
                    className="flex items-center justify-center px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                >
                    <BellIcon className="h-3 w-3 mr-1" />
                    Test Notification
                </button>

                <button
                    onClick={testSound}
                    className="flex items-center justify-center px-3 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                >
                    <SpeakerWaveIcon className="h-3 w-3 mr-1" />
                    Test Sound
                </button>
            </div>
        </div>
    );
};

export default NotificationTest;
