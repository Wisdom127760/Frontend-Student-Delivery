import React, { useState, useEffect, useRef } from 'react';
import {
    TruckIcon, MapPinIcon, ClockIcon, UserIcon, PhoneIcon,
    CheckCircleIcon, XMarkIcon, FireIcon, BoltIcon, StarIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../common/ToastProvider';
import apiService from '../../services/api';
import soundService from '../../services/soundService';
import { useSystemSettings } from '../../context/SystemSettingsContext';

const DeliveryBroadcastModal = ({ delivery, onAccept, onClose, onExpire }) => {
    const { showSuccess, showError } = useToast();
    const { formatCurrency, getCurrency } = useSystemSettings();
    const [timeRemaining, setTimeRemaining] = useState(delivery.broadcastDuration || 60);
    const [isAccepting, setIsAccepting] = useState(false);
    const [soundInterval, setSoundInterval] = useState(null);
    const intervalRef = useRef(null);

    // Calculate time remaining
    useEffect(() => {
        if (delivery?.broadcastEndTime) {
            const calculateTimeRemaining = () => {
                const now = new Date();
                const endTime = new Date(delivery.broadcastEndTime);
                const diff = Math.max(0, Math.floor((endTime - now) / 1000));

                if (diff <= 0) {
                    clearInterval(intervalRef.current);
                    onExpire && onExpire(delivery.deliveryId || delivery.id);
                    return;
                }
                setTimeRemaining(diff);
            };

            calculateTimeRemaining();
            intervalRef.current = setInterval(calculateTimeRemaining, 1000);

            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        }
    }, [delivery?.broadcastEndTime, onExpire, delivery?.deliveryId, delivery?.id]);

    // Play persistent notification sound
    useEffect(() => {
        const playPersistentSound = () => {
            try {
                soundService.playSound('delivery');
            } catch (error) {
                console.warn('Could not play delivery sound:', error);
            }
        };

        playPersistentSound();
        const interval = setInterval(playPersistentSound, 3000);
        setSoundInterval(interval);

        return () => {
            if (interval) clearInterval(interval);
        };
    }, []);

    const stopSound = () => {
        if (soundInterval) {
            clearInterval(soundInterval);
            setSoundInterval(null);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getPriorityInfo = (priority) => {
        switch (priority) {
            case 'urgent':
                return { color: 'bg-red-100 text-red-800 border-red-200', icon: <FireIcon className="h-4 w-4" /> };
            case 'high':
                return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: <BoltIcon className="h-4 w-4" /> };
            default:
                return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <StarIcon className="h-4 w-4" /> };
        }
    };

    const handleAccept = async () => {
        try {
            setIsAccepting(true);
            stopSound();
            const deliveryId = delivery.deliveryId || delivery.id;
            const response = await apiService.acceptBroadcastDelivery(deliveryId);

            if (response.success) {
                showSuccess('Delivery accepted successfully!');
                soundService.playSound('success');
                onAccept && onAccept(deliveryId);
            } else {
                showError(response.message || 'Failed to accept delivery');
            }
        } catch (error) {
            console.error('Error accepting delivery:', error);
            showError('Failed to accept delivery');
        } finally {
            setIsAccepting(false);
        }
    };

    const handleClose = () => {
        stopSound();
        const deliveryId = delivery.deliveryId || delivery.id;
        onClose && onClose(deliveryId);
    };

    if (!delivery) return null;

    const priorityInfo = getPriorityInfo(delivery.priority);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-700 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/20 p-3 rounded-xl">
                                <TruckIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">🚨 NEW DELIVERY ALERT!</h2>
                                <p className="text-green-100 text-sm">High-priority delivery available</p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-xl">
                            <div className="flex items-center space-x-2">
                                <ClockIcon className="h-5 w-5" />
                                <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Delivery Code and Priority */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className="font-mono text-lg bg-gray-100 px-4 py-2 rounded-lg">
                                #{delivery.deliveryCode}
                            </span>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-1 ${priorityInfo.color}`}>
                                {priorityInfo.icon}
                                <span>{delivery.priority?.toUpperCase()}</span>
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-green-600">
                                {formatCurrency(delivery.fee, getCurrency())}
                            </div>
                            {delivery.driverEarning && (
                                <div className="text-sm text-blue-600 font-semibold">
                                    Your Earning: {formatCurrency(delivery.driverEarning, getCurrency())}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center space-x-3 mb-3">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{delivery.customerName}</h3>
                                <div className="flex items-center space-x-2">
                                    <PhoneIcon className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">{delivery.customerPhone}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Locations */}
                    <div className="space-y-4">
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                            <div className="flex items-start space-x-3">
                                <MapPinIcon className="h-5 w-5 text-green-600 mt-1" />
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">📍 Pickup Location</h4>
                                    <p className="text-gray-700">{delivery.pickupLocation}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                            <div className="flex items-start space-x-3">
                                <MapPinIcon className="h-5 w-5 text-red-600 mt-1" />
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">🎯 Delivery Location</h4>
                                    <p className="text-gray-700">{delivery.deliveryLocation}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {delivery.notes && (
                        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                            <h4 className="font-semibold text-gray-900 mb-1">📝 Special Notes</h4>
                            <p className="text-gray-700">{delivery.notes}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4">
                        <button
                            onClick={handleAccept}
                            disabled={isAccepting || timeRemaining <= 0}
                            className="flex-1 flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold text-lg shadow-lg"
                        >
                            {isAccepting ? (
                                <>
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                    Accepting...
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="h-6 w-6 mr-3" />
                                    ACCEPT DELIVERY
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleClose}
                            className="px-6 py-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Timer Progress Bar */}
                <div className="h-2 bg-gray-200">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1000 ease-linear"
                        style={{
                            width: `${((delivery.broadcastDuration || 60) - timeRemaining) / (delivery.broadcastDuration || 60) * 100}%`
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default DeliveryBroadcastModal;
