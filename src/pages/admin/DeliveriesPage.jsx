import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';
import { capitalizeName } from "../../utils/capitalize";
import SkeletonLoader from '../../components/common/SkeletonLoader';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Pagination from '../../components/common/Pagination';
import CapitalizedInput from '../../components/common/CapitalizedInput';
import { formMemory, whatsAppUtils } from '../../utils/formMemory';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    TruckIcon,
    XMarkIcon,
    UserIcon,
    ArrowPathIcon,
    FunnelIcon,
    ClockIcon,
    MapPinIcon,
    ChatBubbleLeftRightIcon,
    PhoneIcon,
    ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DeliveriesPage = () => {
    const location = useLocation();
    const [deliveries, setDeliveries] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [driverFilter, setDriverFilter] = useState('all');
    const [lastRefresh, setLastRefresh] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Side panel states
    const [showCreatePanel, setShowCreatePanel] = useState(false);
    const [showViewPanel, setShowViewPanel] = useState(false);
    const [showEditPanel, setShowEditPanel] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [isViewPanelOpen, setIsViewPanelOpen] = useState(false);

    // Confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deliveryToDelete, setDeliveryToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Customer message modal state
    const [showCustomerMessageModal, setShowCustomerMessageModal] = useState(false);
    const [customerMessageData, setCustomerMessageData] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        pickupLocation: '',
        pickupLocationLink: '',
        deliveryLocation: '',
        deliveryLocationLink: '',
        customerName: '',
        customerPhone: '',
        fee: 150,
        paymentMethod: 'cash',
        estimatedTime: '',
        notes: '',
        priority: 'normal',
        distance: '',
        assignedTo: '',
        mapLink: '' // New field for map link
    });

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    // Keyboard shortcut to close view panel
    const closeViewPanel = useCallback(() => {
        setIsViewPanelOpen(false);
        setTimeout(() => {
            setShowViewPanel(false);
        }, 300);
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && showViewPanel) {
                closeViewPanel();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [showViewPanel, closeViewPanel]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                // Fetch deliveries
                const deliveriesResponse = await fetch(`${API_BASE_URL}/admin/deliveries`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (deliveriesResponse.ok) {
                    const data = await deliveriesResponse.json();
                    setDeliveries(data.data || []);
                    setLastRefresh(new Date());
                } else {
                    console.error('Failed to fetch deliveries');
                    toast.error('Failed to fetch deliveries');
                }

                // Fetch drivers
                const driversResponse = await fetch(`${API_BASE_URL}/admin/drivers`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (driversResponse.ok) {
                    const data = await driversResponse.json();
                    setDrivers(data.data || []);
                } else {
                    console.error('Failed to fetch drivers');
                    toast.error('Failed to fetch drivers');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Error fetching data');
            } finally {
                setLoading(false);
            }
        };

        loadData();

        // Check if we should open the create panel
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('create') === 'true') {
            // Clear the query parameter from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // Open the create panel
            setShowCreatePanel(true);
        }

        // Load saved form data
        const savedFormData = formMemory.loadFormData('delivery');
        if (savedFormData) {
            setFormData(prev => ({ ...prev, ...savedFormData }));
        }
    }, [location.search, API_BASE_URL]);

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/deliveries`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDeliveries(data.data || []);
                setLastRefresh(new Date());
            } else {
                console.error('Failed to fetch deliveries');
                toast.error('Failed to fetch deliveries');
            }
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            toast.error('Error fetching deliveries');
        } finally {
            setLoading(false);
        }
    };



    const handleCreateDelivery = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.assignedTo) {
            toast.error('Please assign a driver to this delivery');
            return;
        }

        if (!formData.pickupLocation || !formData.deliveryLocation) {
            toast.error('Please fill in pickup and delivery locations');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            // Prepare the payload according to the backend schema
            const payload = {
                pickupLocation: formData.pickupLocation,
                pickupLocationLink: formData.pickupLocationLink,
                deliveryLocation: formData.deliveryLocation,
                deliveryLocationLink: formData.deliveryLocationLink,
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                fee: Number(formData.fee),
                paymentMethod: formData.paymentMethod,
                notes: formData.notes,
                priority: formData.priority,
                ...(formData.estimatedTime && { estimatedTime: new Date(formData.estimatedTime).toISOString() }),
                assignedTo: formData.assignedTo // Now required
            };

            const response = await fetch(`${API_BASE_URL}/admin/deliveries`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Delivery created successfully!');
                setShowCreatePanel(false);
                resetForm();
                fetchDeliveries();

                // Show customer message modal
                if (result.data && result.data.deliveryCode) {
                    showCustomerMessage(result.data);
                }
            } else {
                console.error('Failed to create delivery:', result);
                if (result.details) {
                    result.details.forEach(detail => {
                        toast.error(`${detail.field}: ${detail.message}`);
                    });
                } else {
                    toast.error(result.error || 'Failed to create delivery');
                }
            }
        } catch (error) {
            console.error('Error creating delivery:', error);
            toast.error('Error creating delivery');
        }
    };

    const handleUpdateDelivery = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.assignedTo) {
            toast.error('Please assign a driver to this delivery');
            return;
        }

        if (!formData.pickupLocation || !formData.deliveryLocation) {
            toast.error('Please fill in pickup and delivery locations');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            const payload = {
                pickupLocation: formData.pickupLocation,
                pickupLocationLink: formData.pickupLocationLink,
                deliveryLocation: formData.deliveryLocation,
                deliveryLocationLink: formData.deliveryLocationLink,
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                fee: Number(formData.fee),
                paymentMethod: formData.paymentMethod,
                notes: formData.notes,
                priority: formData.priority,
                ...(formData.estimatedTime && { estimatedTime: new Date(formData.estimatedTime).toISOString() }),
                assignedTo: formData.assignedTo // Now required
            };

            const response = await fetch(`${API_BASE_URL}/admin/deliveries/${selectedDelivery._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Delivery updated successfully!');
                setShowEditPanel(false);
                resetForm();
                fetchDeliveries();
            } else {
                console.error('Failed to update delivery:', result);
                if (result.details) {
                    result.details.forEach(detail => {
                        toast.error(`${detail.field}: ${detail.message}`);
                    });
                } else {
                    toast.error(result.error || 'Failed to update delivery');
                }
            }
        } catch (error) {
            console.error('Error updating delivery:', error);
            toast.error('Error updating delivery');
        }
    };

    const handleDeleteDelivery = async (deliveryId) => {
        const delivery = deliveries.find(d => d._id === deliveryId);
        setDeliveryToDelete(delivery);
        setShowDeleteModal(true);
    };

    const confirmDeleteDelivery = async () => {
        if (!deliveryToDelete) return;

        try {
            setDeleting(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/deliveries/${deliveryToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                toast.success('Delivery deleted successfully!');
                fetchDeliveries();
            } else {
                const result = await response.json();
                toast.error(result.error || 'Failed to delete delivery');
            }
        } catch (error) {
            console.error('Error deleting delivery:', error);
            toast.error('Error deleting delivery');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
            setDeliveryToDelete(null);
        }
    };



    const resetForm = () => {
        setFormData({
            pickupLocation: '',
            deliveryLocation: '',
            customerName: '',
            customerPhone: '',
            fee: 150,
            paymentMethod: 'cash',
            estimatedTime: '',
            notes: '',
            priority: 'normal',
            distance: '',
            assignedTo: '',
            mapLink: ''
        });
        // Clear saved form data
        formMemory.clearFormData('delivery');
    };

    const showCustomerMessage = (delivery) => {
        setCustomerMessageData(delivery);
        setShowCustomerMessageModal(true);
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Message copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy message');
        }
    };

    const generateWhatsAppMessage = (delivery) => {
        return `🚚 *Delivery Confirmation*

Hi ${delivery.customerName}! Your delivery has been created successfully.

📦 *Delivery Details:*
• Code: ${delivery.deliveryCode}
• From: ${delivery.pickupLocation}
• To: ${delivery.deliveryLocation}
• Fee: ₺${delivery.fee}
• Payment: ${delivery.paymentMethod}

🔗 *Track your delivery:*
${window.location.origin}/track/${delivery.deliveryCode}

Need help? Contact us: +90 533 832 9785

We'll keep you updated on the delivery status! 📱`;
    };

    const generateSMSMessage = (delivery) => {
        return `Delivery Confirmation

Hi ${delivery.customerName}! Your delivery (${delivery.deliveryCode}) has been created.

From: ${delivery.pickupLocation}
To: ${delivery.deliveryLocation}
Fee: ₺${delivery.fee}

Track: ${window.location.origin}/track/${delivery.deliveryCode}

Support: +90 533 832 9785

We'll update you on the status.`;
    };

    const generateEmailMessage = (delivery) => {
        return `Subject: Delivery Confirmation - ${delivery.deliveryCode}

Dear ${delivery.customerName},

Your delivery has been successfully created and is being processed.

Delivery Details:
• Tracking Code: ${delivery.deliveryCode}
• Pickup Location: ${delivery.pickupLocation}
• Delivery Location: ${delivery.deliveryLocation}
• Delivery Fee: ₺${delivery.fee}
• Payment Method: ${delivery.paymentMethod}

Track your delivery in real-time:
${window.location.origin}/track/${delivery.deliveryCode}

Need help? Contact our support team:
• WhatsApp: +90 533 832 9785
• Phone: +90 533 832 9785

We'll keep you informed of any updates to your delivery status.

Thank you for choosing our service!

Best regards,
Student Delivery Team`;
    };

    const openCreatePanel = () => {
        resetForm();
        setShowCreatePanel(true);
    };

    const fetchDeliveryDetails = async (deliveryId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/deliveries/${deliveryId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setSelectedDelivery(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching delivery details:', error);
        }
    };

    const openViewPanel = (delivery) => {
        setSelectedDelivery(delivery);
        setShowViewPanel(true);
        // Trigger animation after a brief delay
        setTimeout(() => {
            setIsViewPanelOpen(true);
        }, 10);

        // Refresh delivery data to ensure we have the latest information
        fetchDeliveryDetails(delivery._id);
    };

    const openEditPanel = (delivery) => {
        setSelectedDelivery(delivery);
        setFormData({
            pickupLocation: delivery.pickupLocation || '',
            pickupLocationLink: delivery.pickupLocationLink || '',
            deliveryLocation: delivery.deliveryLocation || '',
            deliveryLocationLink: delivery.deliveryLocationLink || '',
            customerName: delivery.customerName || '',
            customerPhone: delivery.customerPhone || '',
            fee: delivery.fee || 150,
            paymentMethod: delivery.paymentMethod || 'cash',
            estimatedTime: delivery.estimatedTime ? new Date(delivery.estimatedTime).toISOString().slice(0, 16) : '',
            notes: delivery.notes || '',
            priority: delivery.priority || 'normal',
            distance: delivery.distance || '',
            assignedTo: delivery.assignedTo || ''
        });
        setShowEditPanel(true);
    };

    const filteredDeliveries = deliveries.filter(delivery => {
        const matchesSearch = delivery.deliveryCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.deliveryLocation?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
        const matchesPayment = paymentFilter === 'all' || delivery.paymentMethod === paymentFilter;
        const matchesPriority = priorityFilter === 'all' || delivery.priority === priorityFilter;
        const matchesDriver = driverFilter === 'all' || delivery.assignedTo === driverFilter;

        return matchesSearch && matchesStatus && matchesPayment && matchesPriority && matchesDriver;
    });

    // Calculate totals for accounting
    const calculateTotals = () => {
        const totals = {
            totalDeliveries: filteredDeliveries.length,
            totalRevenue: 0,
            totalFees: 0,
            byPaymentMethod: {},
            byStatus: {},
            byPriority: {}
        };

        filteredDeliveries.forEach(delivery => {
            const fee = Number(delivery.fee) || 0;
            totals.totalFees += fee;
            totals.totalRevenue += fee;

            // Group by payment method
            const paymentMethod = delivery.paymentMethod || 'unknown';
            if (!totals.byPaymentMethod[paymentMethod]) {
                totals.byPaymentMethod[paymentMethod] = { count: 0, amount: 0 };
            }
            totals.byPaymentMethod[paymentMethod].count++;
            totals.byPaymentMethod[paymentMethod].amount += fee;

            // Group by status
            const status = delivery.status || 'unknown';
            if (!totals.byStatus[status]) {
                totals.byStatus[status] = { count: 0, amount: 0 };
            }
            totals.byStatus[status].count++;
            totals.byStatus[status].amount += fee;

            // Group by priority
            const priority = delivery.priority || 'unknown';
            if (!totals.byPriority[priority]) {
                totals.byPriority[priority] = { count: 0, amount: 0 };
            }
            totals.byPriority[priority].count++;
            totals.byPriority[priority].amount += fee;
        });

        return totals;
    };

    const totals = calculateTotals();

    // Pagination logic
    const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDeliveries = filteredDeliveries.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            assigned: 'bg-primary-100 text-primary-800',
            picked_up: 'bg-orange-100 text-orange-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800',
            normal: 'bg-primary-100 text-primary-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const getDeliveryProgress = (delivery) => {
        if (delivery.status === 'delivered') return 100;
        if (delivery.status === 'picked_up') return 75;
        if (delivery.status === 'assigned') return 50;
        if (delivery.status === 'pending') return 25;
        return 0;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <SkeletonLoader type="card" />

                {/* Filters Skeleton */}
                <SkeletonLoader type="card" />

                {/* Table Skeleton */}
                <SkeletonLoader type="table" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Deliveries</h1>
                        <p className="text-gray-600">Manage all delivery orders and track their status</p>

                        {/* Refresh indicator */}
                        {lastRefresh && (
                            <div className="mt-2 flex items-center text-xs text-gray-400">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-3">
                        <button
                            onClick={fetchDeliveries}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                        >
                            <ArrowPathIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={openCreatePanel}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            New Delivery
                        </button>
                    </div>
                </div>
            </div>

            {/* Accounting Summary */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Accounting Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-blue-600">Total Deliveries</div>
                        <div className="text-2xl font-bold text-blue-900">{totals.totalDeliveries}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-green-600">Total Revenue</div>
                        <div className="text-2xl font-bold text-green-900">₺{totals.totalRevenue.toLocaleString()}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-purple-600">Average Fee</div>
                        <div className="text-2xl font-bold text-purple-900">
                            ₺{totals.totalDeliveries > 0 ? (totals.totalRevenue / totals.totalDeliveries).toFixed(2) : '0'}
                        </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-orange-600">Delivered Revenue</div>
                        <div className="text-2xl font-bold text-orange-900">
                            ₺{(totals.byStatus.delivered?.amount || 0).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Payment Method Breakdown */}
                <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Payment Method Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {Object.entries(totals.byPaymentMethod).map(([method, data]) => (
                            <div key={method} className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm font-medium text-gray-700 capitalize">{method.replace('_', ' ')}</div>
                                <div className="text-lg font-bold text-gray-900">{data.count}</div>
                                <div className="text-sm text-gray-600">₺{data.amount.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search deliveries..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 min-w-[140px]"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="assigned">Assigned</option>
                            <option value="picked_up">Picked Up</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 min-w-[140px]"
                        >
                            <option value="all">All Payments</option>
                            <option value="cash">Cash</option>
                            <option value="pos">POS</option>
                            <option value="naira_transfer">Naira Transfer</option>
                            <option value="isbank_transfer">Isbank Transfer</option>
                            <option value="crypto_transfer">Crypto Transfer</option>
                        </select>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 min-w-[140px]"
                        >
                            <option value="all">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                        <select
                            value={driverFilter}
                            onChange={(e) => setDriverFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 min-w-[140px]"
                        >
                            <option value="all">All Drivers</option>
                            {drivers.map((driver) => (
                                <option key={driver._id} value={driver._id}>
                                    {capitalizeName(driver.name)}
                                </option>
                            ))}
                        </select>
                        <div className="text-sm text-gray-500">
                            {filteredDeliveries.length} of {deliveries.length} deliveries
                        </div>
                    </div>
                </div>
            </div>

            {/* Deliveries List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Delivery
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Route
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Driver
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Remittance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedDeliveries.map((delivery) => (
                                <tr key={delivery._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <TruckIcon className="h-8 w-8 text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(delivery.deliveryCode);
                                                        toast.success('Delivery code copied to clipboard!');
                                                    }}
                                                    className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline cursor-pointer flex items-center"
                                                    title="Click to copy delivery code"
                                                >
                                                    {delivery.deliveryCode}
                                                    <ClipboardDocumentIcon className="w-3 h-3 ml-1 opacity-50 hover:opacity-100" />
                                                </button>
                                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(delivery.priority)}`}>
                                                    {delivery.priority}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{delivery.customerName || 'N/A'}</div>
                                        <div className="text-sm text-gray-500">{delivery.customerPhone || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            <div className="font-medium flex items-center space-x-2">
                                                {delivery.pickupLocationLink ? (
                                                    <a
                                                        href={delivery.pickupLocationLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:text-blue-600 hover:underline cursor-pointer"
                                                        title="Open pickup location in maps"
                                                    >
                                                        From: {delivery.pickupLocation}
                                                    </a>
                                                ) : (
                                                    <span>From: {delivery.pickupLocation}</span>
                                                )}
                                                {delivery.pickupLocationLink && (
                                                    <a
                                                        href={delivery.pickupLocationLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                        title="Open pickup location in maps"
                                                    >
                                                        <MapPinIcon className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                            <div className="text-gray-500 flex items-center space-x-2">
                                                {delivery.deliveryLocationLink ? (
                                                    <a
                                                        href={delivery.deliveryLocationLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:text-blue-600 hover:underline cursor-pointer"
                                                        title="Open delivery location in maps"
                                                    >
                                                        To: {delivery.deliveryLocation}
                                                    </a>
                                                ) : (
                                                    <span>To: {delivery.deliveryLocation}</span>
                                                )}
                                                {delivery.deliveryLocationLink && (
                                                    <a
                                                        href={delivery.deliveryLocationLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                        title="Open delivery location in maps"
                                                    >
                                                        <MapPinIcon className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {delivery.assignedTo ? (
                                            <div className="flex items-center">
                                                <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {delivery.assignedTo.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {delivery.assignedTo.area}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                                            {delivery.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            ₺{delivery.fee}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {delivery.paymentMethod}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {delivery.status === 'delivered' ? (
                                            <div className="text-sm">
                                                {delivery.remittanceStatus === 'settled' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Settled
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {delivery.createdAt ? format(new Date(delivery.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => openViewPanel(delivery)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openEditPanel(delivery)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDelivery(delivery._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    totalItems={filteredDeliveries.length}
                    startIndex={startIndex}
                    endIndex={endIndex}
                />
            </div>

            {/* Create Delivery Side Panel */}
            {showCreatePanel && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
                    <div className="fixed right-0 top-0 h-screen w-full sm:w-[500px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900">Create New Delivery</h3>
                                <button
                                    onClick={() => setShowCreatePanel(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            {/* Form Content */}
                            <div className="flex-1 overflow-y-auto p-8">
                                <form id="create-delivery-form" onSubmit={handleCreateDelivery} className="space-y-6">
                                    {/* Route Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Route Information</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter pickup address"
                                                    value={formData.pickupLocation}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        setFormData({ ...formData, pickupLocation: newValue });
                                                        formMemory.autoSave('delivery', { ...formData, pickupLocation: newValue });
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                                <div className="mt-2">
                                                    <label className="block text-sm font-medium text-gray-600 mb-1">Pickup Location Link (Optional)</label>
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="url"
                                                            placeholder="Enter Google Maps link for pickup location"
                                                            value={formData.pickupLocationLink}
                                                            onChange={(e) => {
                                                                const newValue = e.target.value;
                                                                setFormData({ ...formData, pickupLocationLink: newValue });
                                                                formMemory.autoSave('delivery', { ...formData, pickupLocationLink: newValue });
                                                            }}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm"
                                                        />
                                                        {formData.pickupLocationLink && (
                                                            <a
                                                                href={formData.pickupLocationLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
                                                                title="Open pickup location in maps"
                                                            >
                                                                <MapPinIcon className="h-4 w-4 mr-1" />
                                                                Open
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Location</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter delivery address"
                                                    value={formData.deliveryLocation}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        setFormData({ ...formData, deliveryLocation: newValue });
                                                        formMemory.autoSave('delivery', { ...formData, deliveryLocation: newValue });
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                                <div className="mt-2">
                                                    <label className="block text-sm font-medium text-gray-600 mb-1">Delivery Location Link (Optional)</label>
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="url"
                                                            placeholder="Enter Google Maps link for delivery location"
                                                            value={formData.deliveryLocationLink}
                                                            onChange={(e) => {
                                                                const newValue = e.target.value;
                                                                setFormData({ ...formData, deliveryLocationLink: newValue });
                                                                formMemory.autoSave('delivery', { ...formData, deliveryLocationLink: newValue });
                                                            }}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm"
                                                        />
                                                        {formData.deliveryLocationLink && (
                                                            <a
                                                                href={formData.deliveryLocationLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
                                                                title="Open delivery location in maps"
                                                            >
                                                                <MapPinIcon className="h-4 w-4 mr-1" />
                                                                Open
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    {/* Customer Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                                                <CapitalizedInput
                                                    type="text"
                                                    placeholder="Enter customer name"
                                                    value={formData.customerName}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        setFormData({ ...formData, customerName: newValue });
                                                        formMemory.autoSave('delivery', { ...formData, customerName: newValue });
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                    capitalizeMode="words"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone</label>
                                                <div className="space-y-2">
                                                    <input
                                                        type="tel"
                                                        placeholder="Enter phone number (any format)"
                                                        value={formData.customerPhone}
                                                        onChange={(e) => {
                                                            const newValue = e.target.value;
                                                            setFormData({ ...formData, customerPhone: newValue });
                                                            formMemory.autoSave('delivery', { ...formData, customerPhone: newValue });
                                                        }}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                    />
                                                    {formData.customerPhone && (
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <span className="text-gray-600">Formatted:</span>
                                                            <span className="font-medium">{whatsAppUtils.formatPhoneNumber(formData.customerPhone)}</span>
                                                            {whatsAppUtils.isWhatsAppNumber(formData.customerPhone) && (
                                                                <a
                                                                    href={whatsAppUtils.generateWhatsAppLink(formData.customerPhone)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center text-green-600 hover:text-green-800"
                                                                    title="Open WhatsApp chat"
                                                                >
                                                                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                                                                    WhatsApp
                                                                </a>
                                                            )}
                                                            <a
                                                                href={`tel:${formData.customerPhone}`}
                                                                className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                                                title="Call customer"
                                                            >
                                                                <PhoneIcon className="h-4 w-4 mr-1" />
                                                                Call
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Details */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Fee (₺)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="0"
                                                    value={formData.fee}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        setFormData({ ...formData, fee: newValue });
                                                        formMemory.autoSave('delivery', { ...formData, fee: newValue });
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                                <select
                                                    value={formData.paymentMethod}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        setFormData({ ...formData, paymentMethod: newValue });
                                                        formMemory.autoSave('delivery', { ...formData, paymentMethod: newValue });
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                >
                                                    <option value="cash">Cash</option>
                                                    <option value="pos">POS</option>
                                                    <option value="naira_transfer">Naira Transfer</option>
                                                    <option value="isbank_transfer">Isbank Transfer</option>
                                                    <option value="crypto_transfer">Crypto Transfer</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assignment & Priority */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Assignment & Priority</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                                                <select
                                                    value={formData.priority}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        setFormData({ ...formData, priority: newValue });
                                                        formMemory.autoSave('delivery', { ...formData, priority: newValue });
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                >
                                                    <option value="low">Low Priority</option>
                                                    <option value="normal">Normal Priority</option>
                                                    <option value="high">High Priority</option>
                                                    <option value="urgent">Urgent</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Assign to Driver <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    required
                                                    value={formData.assignedTo}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        setFormData({ ...formData, assignedTo: newValue });
                                                        formMemory.autoSave('delivery', { ...formData, assignedTo: newValue });
                                                    }}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${!formData.assignedTo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                >
                                                    <option value="">Select Driver (Required)</option>
                                                    {drivers.map((driver) => (
                                                        <option key={driver._id} value={driver._id}>
                                                            {capitalizeName(driver.name)} - {driver.area}
                                                        </option>
                                                    ))}
                                                </select>
                                                {!formData.assignedTo && (
                                                    <p className="text-red-500 text-xs mt-1">Please select a driver for this delivery</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Details */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label>
                                                <input
                                                    type="datetime-local"
                                                    value={formData.estimatedTime}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        setFormData({ ...formData, estimatedTime: newValue });
                                                        formMemory.autoSave('delivery', { ...formData, estimatedTime: newValue });
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                                <textarea
                                                    rows="3"
                                                    placeholder="Add any additional notes or special instructions..."
                                                    value={formData.notes}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        setFormData({ ...formData, notes: newValue });
                                                        formMemory.autoSave('delivery', { ...formData, notes: newValue });
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setShowCreatePanel(false)}
                                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="create-delivery-form"
                                    className="px-8 py-3 text-sm font-medium text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 rounded-lg"
                                >
                                    Create Delivery
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Delivery Side Panel */}
            {showEditPanel && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
                    <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900">Edit Delivery</h3>
                                <button
                                    onClick={() => setShowEditPanel(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            {/* Form Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <form id="edit-delivery-form" onSubmit={handleUpdateDelivery} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.pickupLocation}
                                            onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <div className="mt-2">
                                            <label className="block text-sm font-medium text-gray-600">Pickup Location Link (Optional)</label>
                                            <div className="flex space-x-2">
                                                <input
                                                    type="url"
                                                    placeholder="Enter Google Maps link for pickup location"
                                                    value={formData.pickupLocationLink}
                                                    onChange={(e) => setFormData({ ...formData, pickupLocationLink: e.target.value })}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                />
                                                {formData.pickupLocationLink && (
                                                    <a
                                                        href={formData.pickupLocationLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
                                                        title="Open pickup location in maps"
                                                    >
                                                        <MapPinIcon className="h-4 w-4 mr-1" />
                                                        Open
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Delivery Location</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.deliveryLocation}
                                            onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <div className="mt-2">
                                            <label className="block text-sm font-medium text-gray-600">Delivery Location Link (Optional)</label>
                                            <div className="flex space-x-2">
                                                <input
                                                    type="url"
                                                    placeholder="Enter Google Maps link for delivery location"
                                                    value={formData.deliveryLocationLink}
                                                    onChange={(e) => setFormData({ ...formData, deliveryLocationLink: e.target.value })}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                />
                                                {formData.deliveryLocationLink && (
                                                    <a
                                                        href={formData.deliveryLocationLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-3 py-3 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
                                                        title="Open delivery location in maps"
                                                    >
                                                        <MapPinIcon className="h-4 w-4 mr-1" />
                                                        Open
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                                            <CapitalizedInput
                                                type="text"
                                                value={formData.customerName}
                                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                capitalizeMode="words"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Customer Phone</label>
                                            <input
                                                type="tel"
                                                value={formData.customerPhone}
                                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Fee (₺)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.fee}
                                                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                                            <select
                                                value={formData.paymentMethod}
                                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="cash">Cash</option>
                                                <option value="pos">POS</option>
                                                <option value="naira_transfer">Naira Transfer</option>
                                                <option value="isbank_transfer">Isbank Transfer</option>
                                                <option value="crypto_transfer">Crypto Transfer</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Priority</label>
                                            <select
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="low">Low</option>
                                                <option value="normal">Normal</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Assign to Driver</label>
                                            <select
                                                value={formData.assignedTo}
                                                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Select Driver</option>
                                                {drivers.map((driver) => (
                                                    <option key={driver._id} value={driver._id}>
                                                        {capitalizeName(driver.name)} - {driver.area}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Estimated Time</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.estimatedTime}
                                            onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                                        <textarea
                                            rows="3"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setShowEditPanel(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="edit-delivery-form"
                                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 rounded-lg"
                                >
                                    Update Delivery
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Delivery Side Panel */}
            {showViewPanel && selectedDelivery && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 transition-opacity duration-300 ease-in-out"
                    onClick={closeViewPanel}
                >
                    <div
                        className={`fixed right-0 top-0 h-screen w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isViewPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600">
                                <div className="flex items-center space-x-3">
                                    <TruckIcon className="h-6 w-6 text-white" />
                                    <h3 className="text-xl font-semibold text-white">Delivery Details</h3>
                                </div>
                                <button
                                    onClick={closeViewPanel}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-6">
                                    {/* Delivery Code & Status */}
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-xl font-bold text-gray-900">{selectedDelivery.deliveryCode}</h4>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDelivery.status)}`}>
                                                        {selectedDelivery.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedDelivery.priority)}`}>
                                                        {selectedDelivery.priority.toUpperCase()} PRIORITY
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <ClockIcon className="h-4 w-4" />
                                            <span>Created {selectedDelivery.createdAt ? format(new Date(selectedDelivery.createdAt), 'MMM dd, yyyy') : 'N/A'}</span>
                                        </div>
                                    </div>

                                    {/* Customer Information */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <UserIcon className="h-5 w-5 text-primary-600" />
                                            <h5 className="text-lg font-semibold text-gray-900">Customer Information</h5>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm font-medium text-gray-600">Name:</span>
                                                <span className="ml-2 text-sm text-gray-900">{selectedDelivery.customerName || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-600">Phone:</span>
                                                <span className="ml-2 text-sm text-gray-900">{selectedDelivery.customerPhone || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Route Information */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <TruckIcon className="h-5 w-5 text-primary-600" />
                                            <h5 className="text-lg font-semibold text-gray-900">Route Details</h5>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Pickup:</span>
                                                    <div className="text-sm text-gray-900">{selectedDelivery.pickupLocation}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-600">Delivery:</span>
                                                    <div className="text-sm text-gray-900">{selectedDelivery.deliveryLocation}</div>
                                                </div>
                                            </div>
                                            {selectedDelivery.distance && (
                                                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <span>Distance: {selectedDelivery.distance} km</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Driver Information */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <UserIcon className="h-5 w-5 text-primary-600" />
                                            <h5 className="text-lg font-semibold text-gray-900">Driver Assignment</h5>
                                        </div>
                                        <div>
                                            {selectedDelivery.assignedTo ? (
                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600">Driver:</span>
                                                        <span className="ml-2 text-sm text-gray-900">{selectedDelivery.assignedTo.name}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600">Area:</span>
                                                        <span className="ml-2 text-sm text-gray-900">{selectedDelivery.assignedTo.area}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600">Status:</span>
                                                        <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${selectedDelivery.assignedTo.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {selectedDelivery.assignedTo.isOnline ? 'Online' : 'Offline'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500 italic">No driver assigned</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Payment Information */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-bold text-green-600">₺</span>
                                            </div>
                                            <h5 className="text-lg font-semibold text-gray-900">Payment Details</h5>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm font-medium text-gray-600">Fee:</span>
                                                <span className="ml-2 text-lg font-bold text-green-600">₺{selectedDelivery.fee}</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-600">Method:</span>
                                                <span className="ml-2 text-sm text-gray-900 capitalize">{selectedDelivery.paymentMethod}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Estimated Time */}
                                    {selectedDelivery.estimatedTime && (
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <ClockIcon className="h-5 w-5 text-primary-600" />
                                                <h5 className="text-lg font-semibold text-gray-900">Estimated Time</h5>
                                            </div>
                                            <div className="text-sm text-gray-900">
                                                {format(new Date(selectedDelivery.estimatedTime), 'MMM dd, yyyy HH:mm')}
                                            </div>
                                        </div>
                                    )}

                                    {/* Notes */}
                                    {selectedDelivery.notes && (
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-bold text-blue-600">📝</span>
                                                </div>
                                                <h5 className="text-lg font-semibold text-gray-900">Notes</h5>
                                            </div>
                                            <div className="text-sm text-gray-900 bg-blue-50 p-3 rounded-lg">
                                                {selectedDelivery.notes}
                                            </div>
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <ClockIcon className="h-5 w-5 text-primary-600" />
                                            <h5 className="text-lg font-semibold text-gray-900">Timeline</h5>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                                <span>Progress</span>
                                                <span>{getDeliveryProgress(selectedDelivery)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${getDeliveryProgress(selectedDelivery)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900">Created</div>
                                                    <div className="text-xs text-gray-500">
                                                        {selectedDelivery.createdAt ? format(new Date(selectedDelivery.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedDelivery.assignedAt && (
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-gray-900">Assigned</div>
                                                        <div className="text-xs text-gray-500">
                                                            {format(new Date(selectedDelivery.assignedAt), 'MMM dd, yyyy HH:mm')}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedDelivery.pickedUpAt && (
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-gray-900">Picked Up</div>
                                                        <div className="text-xs text-gray-500">
                                                            {format(new Date(selectedDelivery.pickedUpAt), 'MMM dd, yyyy HH:mm')}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedDelivery.deliveredAt && (
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-gray-900">Delivered</div>
                                                        <div className="text-xs text-gray-500">
                                                            {format(new Date(selectedDelivery.deliveredAt), 'MMM dd, yyyy HH:mm')}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => fetchDeliveryDetails(selectedDelivery._id)}
                                    className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                >
                                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                                    Refresh
                                </button>
                                <button
                                    onClick={closeViewPanel}
                                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Message Modal */}
            {showCustomerMessageModal && customerMessageData && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                        <span className="text-green-600 font-bold text-lg">📱</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">Customer Message</h3>
                                </div>
                                <button
                                    onClick={() => setShowCustomerMessageModal(false)}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            <div className="text-center mb-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                    Delivery Created Successfully! 🎉
                                </h4>
                                <p className="text-gray-600">
                                    Copy the message below and send it to your customer
                                </p>
                                <button
                                    onClick={() => copyToClipboard(generateWhatsAppMessage(customerMessageData))}
                                    className="mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    📋 Copy WhatsApp Message (Recommended)
                                </button>
                            </div>

                            {/* Message Templates */}
                            <div className="space-y-4">
                                {/* WhatsApp Template */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-2xl">💬</span>
                                            <h5 className="font-semibold text-gray-900">WhatsApp Message</h5>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(generateWhatsAppMessage(customerMessageData))}
                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <div className="bg-white p-3 rounded border text-sm text-gray-700 whitespace-pre-wrap">
                                        {generateWhatsAppMessage(customerMessageData)}
                                    </div>
                                    <div className="mt-2">
                                        <a
                                            href={`https://wa.me/+905338329785?text=${encodeURIComponent(generateWhatsAppMessage(customerMessageData))}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                                        >
                                            <span>💬</span>
                                            <span>Send via WhatsApp</span>
                                        </a>
                                    </div>
                                </div>

                                {/* SMS Template */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-2xl">📱</span>
                                            <h5 className="font-semibold text-gray-900">SMS Message</h5>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(generateSMSMessage(customerMessageData))}
                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <div className="bg-white p-3 rounded border text-sm text-gray-700 whitespace-pre-wrap">
                                        {generateSMSMessage(customerMessageData)}
                                    </div>
                                </div>

                                {/* Email Template */}
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-2xl">📧</span>
                                            <h5 className="font-semibold text-gray-900">Email Message</h5>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(generateEmailMessage(customerMessageData))}
                                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <div className="bg-white p-3 rounded border text-sm text-gray-700 whitespace-pre-wrap">
                                        {generateEmailMessage(customerMessageData)}
                                    </div>
                                </div>
                            </div>

                            {/* Tracking Link */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-2xl">🔗</span>
                                        <h5 className="font-semibold text-gray-900">Direct Tracking Link</h5>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(`${window.location.origin}/track/${customerMessageData.deliveryCode}`)}
                                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        Copy Link
                                    </button>
                                </div>
                                <div className="bg-white p-3 rounded border text-sm text-gray-700 break-all">
                                    {window.location.origin}/track/{customerMessageData.deliveryCode}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowCustomerMessageModal(false)}
                                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Delivery Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeliveryToDelete(null);
                }}
                onConfirm={confirmDeleteDelivery}
                title="Delete Delivery"
                message={`Are you sure you want to delete delivery ${deliveryToDelete?.deliveryCode || 'this delivery'}? This action cannot be undone and will permanently remove the delivery from the system.`}
                confirmText="Delete Delivery"
                cancelText="Cancel"
                type="danger"
                isLoading={deleting}
            />
        </div>
    );
};

export default DeliveriesPage;
