import React, { useState, useEffect } from 'react';
import soundService from '../../services/soundService';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';

const SoundPermissionModal = ({ isOpen, onClose, onPermissionGranted }) => {
    const [permissionStatus, setPermissionStatus] = useState(null);
    const [isRequesting, setIsRequesting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            checkPermissionStatus();
        }
    }, [isOpen]);

    const checkPermissionStatus = () => {
        const status = soundService.getPermissionStatus();
        setPermissionStatus(status);
    };

    const requestPermission = async () => {
        setIsRequesting(true);
        try {
            const granted = await soundService.requestPermission();
            if (granted) {
                // Play a test sound to confirm it works
                await soundService.playSound('notification');
                onPermissionGranted && onPermissionGranted();
                onClose();
            } else {
                console.log('Permission denied by user');
            }
        } catch (error) {
            console.error('Failed to request permission:', error);
        } finally {
            setIsRequesting(false);
        }
    };

    const testSound = async () => {
        await soundService.playSound('notification');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center mb-4">
                    <SpeakerWaveIcon className="h-8 w-8 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        Enable Notification Sounds
                    </h3>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                        To hear notification sounds when deliveries are assigned, we need your permission to play audio.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-blue-900 mb-2">What you'll hear:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• 🚚 Distinctive chime when deliveries are assigned</li>
                            <li>• 🔔 Gentle ping for other notifications</li>
                            <li>• ✅ Success sound for completed deliveries</li>
                        </ul>
                    </div>

                    {permissionStatus && (
                        <div className="text-sm text-gray-500">
                            <p>Status: {permissionStatus.audioContextState}</p>
                            <p>Initialized: {permissionStatus.isInitialized ? 'Yes' : 'No'}</p>
                        </div>
                    )}
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={requestPermission}
                        disabled={isRequesting}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isRequesting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Enabling...
                            </>
                        ) : (
                            <>
                                <SpeakerWaveIcon className="h-4 w-4 mr-2" />
                                Enable Sounds
                            </>
                        )}
                    </button>

                    <button
                        onClick={testSound}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                        Test Sound
                    </button>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                        Skip
                    </button>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                    <p>You can change this later in your profile settings.</p>
                </div>
            </div>
        </div>
    );
};

export default SoundPermissionModal; 