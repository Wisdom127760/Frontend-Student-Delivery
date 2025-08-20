import React, { useState, useEffect } from 'react';
import {
    UserGroupIcon,
    GiftIcon,
    TrophyIcon,
    ChartBarIcon,
    ClipboardDocumentIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const ReferralPage = () => {
    const { user } = useAuth();
    const [referralData, setReferralData] = useState(null);
    const [pointsData, setPointsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redeemAmount, setRedeemAmount] = useState('');
    const [redeemDescription, setRedeemDescription] = useState('');
    const [showRedeemModal, setShowRedeemModal] = useState(false);

    useEffect(() => {
        if (user) {
            loadReferralData();
            loadPointsData();
        }
    }, [user]);

    const loadReferralData = async () => {
        try {
            console.log('🎯 Loading referral data for driver:', user._id || user.id);

            // Use the same API call as Dashboard to get the referral code
            const codeResponse = await apiService.getDriverReferralCode(user._id || user.id);
            const statsResponse = await apiService.getDriverReferralStats(user._id || user.id);

            console.log('📋 Code response:', codeResponse);
            console.log('📊 Stats response:', statsResponse);

            if (codeResponse.success && statsResponse.success) {
                // Merge the data from both endpoints
                const mergedData = {
                    ...statsResponse.data,
                    referralCode: codeResponse.data.referralCode || codeResponse.data.referralCode
                };
                console.log('🔗 Merged referral data:', mergedData);
                setReferralData(mergedData);
            } else if (codeResponse.success) {
                // If only code response is successful, use that
                console.log('✅ Using code response only:', codeResponse.data);
                setReferralData(codeResponse.data);
            } else if (statsResponse.success) {
                // If only stats response is successful, use that
                console.log('✅ Using stats response only:', statsResponse.data);
                setReferralData(statsResponse.data);
            } else {
                console.warn('⚠️ Both API calls failed');
            }
        } catch (error) {
            console.error('❌ Error loading referral data:', error);
            toast.error('Failed to load referral data');
        }
    };

    const loadPointsData = async () => {
        try {
            const response = await apiService.getDriverPointsSummary(user._id || user.id);
            if (response.success) {
                setPointsData(response.data);
            }
        } catch (error) {
            console.error('Error loading points data:', error);
            toast.error('Failed to load points data');
        } finally {
            setLoading(false);
        }
    };

    const copyReferralCode = async () => {
        if (referralData?.referralCode) {
            try {
                await navigator.clipboard.writeText(referralData.referralCode);
                toast.success('Referral code copied!');
            } catch (error) {
                console.error('Failed to copy:', error);
                toast.error('Failed to copy referral code');
            }
        }
    };

    const handleRedeemPoints = async () => {
        if (!redeemAmount || !redeemDescription) {
            toast.error('Please fill in all fields');
            return;
        }

        const amount = parseInt(redeemAmount);
        if (amount <= 0 || amount > pointsData.availablePoints) {
            toast.error('Invalid amount');
            return;
        }

        try {
            const response = await apiService.redeemDriverPoints(user._id || user.id, {
                amount,
                description: redeemDescription
            });

            if (response.success) {
                toast.success('Points redeemed successfully!');
                setShowRedeemModal(false);
                setRedeemAmount('');
                setRedeemDescription('');
                loadPointsData();
            }
        } catch (error) {
            console.error('Error redeeming points:', error);
            toast.error('Failed to redeem points');
        }
    };

    const formatReferralCode = (code) => {
        if (!code) return 'No code generated';
        // Handle different code formats
        if (code.includes('-')) {
            return code; // Already formatted
        }
        // Format codes like "GRPSDS001XE" to "GRP-SDS-001-XE"
        return code.replace(/(.{3})(.{3})(.{3})(.{2})/, '$1-$2-$3-$4');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
                    <p className="text-gray-600 mt-2">Earn points by referring new drivers to our platform</p>
                </div>

                {/* Points Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <GiftIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Available Points</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {pointsData?.availablePoints || 0} points
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <TrophyIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Points Earned</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {pointsData?.totalPoints || 0} points
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <ChartBarIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Completed Referrals</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {referralData?.completedReferrals || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Referral Code Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Your Referral Code</h2>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Share this code with new drivers:</p>
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white px-4 py-2 rounded-lg border border-green-300">
                                        <p className="font-mono text-lg font-bold text-green-600">
                                            {referralData?.referralCode || 'Loading...'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={copyReferralCode}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600 mb-1">Rewards</p>
                                <p className="text-sm font-medium text-gray-900">You: 1000 points</p>
                                <p className="text-sm font-medium text-gray-900">Friend: 500 points</p>
                            </div>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm text-gray-600">5 deliveries completed</span>
                        </div>
                        <div className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm text-gray-600">₺500 total earnings</span>
                        </div>
                        <div className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm text-gray-600">30 days active</span>
                        </div>
                    </div>
                </div>

                {/* Referral Statistics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Active Referrals */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Referrals</h3>
                        {referralData?.referralsAsReferrer?.filter(r => r.status === 'pending').length > 0 ? (
                            <div className="space-y-4">
                                {referralData.referralsAsReferrer
                                    .filter(r => r.status === 'pending')
                                    .map((referral, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {referral.referred?.name || 'Unknown Driver'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {referral.getCompletionPercentage()}% complete
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${referral.getCompletionPercentage()}%` }}
                                                ></div>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500">
                                                {referral.progress.deliveriesCompleted}/5 deliveries •
                                                ₺{referral.progress.totalEarnings}/₺500 earnings •
                                                {referral.progress.daysActive}/30 days
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No active referrals</p>
                                <p className="text-sm text-gray-400">Share your referral code to get started</p>
                            </div>
                        )}
                    </div>

                    {/* Points History */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Points History</h3>
                            <button
                                onClick={() => setShowRedeemModal(true)}
                                disabled={!pointsData?.availablePoints || pointsData.availablePoints <= 0}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Redeem Points
                            </button>
                        </div>

                        <div className="space-y-3">
                            {pointsData?.pointsHistory?.slice(0, 5).map((entry, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{entry.description}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(entry.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`text-sm font-bold ${entry.amount > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {entry.amount > 0 ? '+' : ''}{entry.amount} points
                                    </span>
                                </div>
                            ))}

                            {(!pointsData?.pointsHistory || pointsData.pointsHistory.length === 0) && (
                                <div className="text-center py-8">
                                    <GiftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No points history yet</p>
                                    <p className="text-sm text-gray-400">Complete referrals to earn points</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Redeem Points Modal */}
            {showRedeemModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Redeem Points</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount (Available: {pointsData?.availablePoints || 0} points)
                                    </label>
                                    <input
                                        type="number"
                                        value={redeemAmount}
                                        onChange={(e) => setRedeemAmount(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter amount"
                                        max={pointsData?.availablePoints || 0}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={redeemDescription}
                                        onChange={(e) => setRedeemDescription(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="What are you redeeming for?"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowRedeemModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRedeemPoints}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                >
                                    Redeem
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferralPage;
