import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Pagination from '../../components/common/Pagination';
import CapitalizedInput from '../../components/common/CapitalizedInput';
import { formMemory } from '../../utils/formMemory';
import {
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
    ClipboardDocumentIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../../components/common/ToastProvider';
import apiService from '../../services/api';
import socketService from '../../services/socketService';
import LocationInput from '../../components/common/LocationInput';

const DeliveriesPage = () => {
    const location = useLocation();
    const { showSuccess, showError, showInfo } = useToast();
    const [deliveries, setDeliveries] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    // const [priorityFilter, setPriorityFilter] = useState('all'); // Unused state
    // const [driverFilter, setDriverFilter] = useState('all'); // Unused state
    const [broadcastFilter, setBroadcastFilter] = useState('all');
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
        mapLink: '', // New field for map link
        // Broadcast settings
        useAutoBroadcast: true,
        broadcastRadius: 5,
        broadcastDuration: 60,
        pickupCoordinates: {
            lat: null,
            lng: null
        },
        deliveryCoordinates: {
            lat: null,
            lng: null
        }
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
                console.log('🔄 Loading deliveries data...');

                // Fetch deliveries using API service
                const deliveriesResult = await apiService.getDeliveries();
                console.log('📦 Deliveries result:', deliveriesResult);

                if (deliveriesResult.success) {
                    // Handle nested data structure from backend
                    const deliveriesData = deliveriesResult.data?.deliveries || deliveriesResult.data || [];
                    setDeliveries(deliveriesData);
                    setLastRefresh(new Date());
                    console.log('✅ Deliveries loaded:', deliveriesData.length || 0, 'items');
                } else {
                    console.error('❌ Failed to fetch deliveries:', deliveriesResult);
                    showError('Failed to fetch deliveries');
                }

                // Fetch drivers using API service
                const driversResult = await apiService.getDrivers();
                console.log('🚗 Drivers result:', driversResult);

                if (driversResult.success) {
                    setDrivers(driversResult.data || []);
                    console.log('✅ Drivers loaded:', driversResult.data?.length || 0, 'items');
                } else {
                    console.error('❌ Failed to fetch drivers:', driversResult);
                    showError('Failed to fetch drivers');
                }
            } catch (error) {
                console.error('💥 Error fetching data:', error);
                showError('Error fetching data');
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

    // Socket event listeners for real-time updates
    useEffect(() => {
        if (!socketService.isConnected()) {
            console.log('⚠️ DeliveriesPage: Socket not connected for real-time updates');
            return;
        }

        console.log('🔌 DeliveriesPage: Setting up socket event listeners');

        // Listen for new delivery broadcasts
        const handleNewBroadcast = (data) => {
            console.log('📡 DeliveriesPage: New broadcast received:', data);
            showSuccess(`New delivery broadcast: ${data.pickupLocation} → ${data.deliveryLocation}`);
            fetchDeliveries(); // Refresh the list
        };

        // Listen for delivery status changes
        const handleDeliveryStatusChange = (data) => {
            console.log('📡 DeliveriesPage: Delivery status changed:', data);
            showInfo(`Delivery ${data.deliveryCode} status: ${data.status}`);
            fetchDeliveries(); // Refresh the list
        };

        // Listen for delivery assignments
        const handleDeliveryAssigned = (data) => {
            console.log('📡 DeliveriesPage: Delivery assigned:', data);
            showSuccess(`Delivery ${data.deliveryCode} assigned to driver`);
            fetchDeliveries(); // Refresh the list
        };

        // Set up event listeners
        socketService.on('delivery-broadcast', handleNewBroadcast);
        socketService.on('delivery-status-changed', handleDeliveryStatusChange);
        socketService.on('delivery-assigned', handleDeliveryAssigned);

        console.log('✅ DeliveriesPage: Socket event listeners set up successfully');

        return () => {
            console.log('🧹 DeliveriesPage: Cleaning up socket event listeners');
            socketService.off('delivery-broadcast', handleNewBroadcast);
            socketService.off('delivery-status-changed', handleDeliveryStatusChange);
            socketService.off('delivery-assigned', handleDeliveryAssigned);
        };
    }, []);

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            const result = await apiService.getDeliveries();

            if (result.success) {
                // Handle nested data structure from backend
                const deliveriesData = result.data?.deliveries || result.data || [];
                setDeliveries(deliveriesData);
                setLastRefresh(new Date());
            } else {
                console.error('Failed to fetch deliveries:', result);
                showError('Failed to fetch deliveries');
            }
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            showError('Error fetching deliveries');
        } finally {
            setLoading(false);
        }
    };



    const handleCreateDelivery = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.pickupLocation || !formData.deliveryLocation) {
            showError('Please fill in pickup and delivery locations');
            return;
        }

        if (formData.pickupLocation.length < 5) {
            showError('Pickup location must be at least 5 characters long');
            return;
        }

        if (formData.deliveryLocation.length < 5) {
            showError('Delivery location must be at least 5 characters long');
            return;
        }

        if (!formData.customerName || !formData.customerName.trim()) {
            showError('Please enter customer name');
            return;
        }

        if (!formData.customerPhone || !formData.customerPhone.trim()) {
            showError('Please enter customer phone number');
            return;
        }

        // If not using auto-broadcast, require driver assignment
        if (!formData.useAutoBroadcast && !formData.assignedTo) {
            showError('Please assign a driver to this delivery');
            return;
        }

        try {
            // const token = localStorage.getItem('token'); // Unused variable

            // Debug: Log the form data
            console.log('🔍 Form Data Debug:', {
                pickupLocation: formData.pickupLocation,
                deliveryLocation: formData.deliveryLocation,
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                fee: formData.fee,
                paymentMethod: formData.paymentMethod,
                notes: formData.notes,
                priority: formData.priority,
                useAutoBroadcast: formData.useAutoBroadcast,
                broadcastRadius: formData.broadcastRadius,
                broadcastDuration: formData.broadcastDuration,
                estimatedTime: formData.estimatedTime
            });

            // Prepare the payload according to the backend schema
            const payload = {
                pickupLocation: formData.pickupLocation,
                deliveryLocation: formData.deliveryLocation,
                customerName: formData.customerName.trim(),
                customerPhone: formData.customerPhone.trim(),
                fee: Number(formData.fee),
                paymentMethod: formData.paymentMethod,
                notes: formData.notes || '',
                priority: formData.priority,
                // Broadcast settings
                useAutoBroadcast: formData.useAutoBroadcast,
                broadcastRadius: formData.useAutoBroadcast ? Number(formData.broadcastRadius) : null,
                broadcastDuration: formData.useAutoBroadcast ? Number(formData.broadcastDuration) : null,
                // Manual assignment (only if not using auto-broadcast)
                ...(formData.useAutoBroadcast ? {} : { assignedTo: formData.assignedTo })
            };

            // Add optional fields only if they have values
            if (formData.pickupLocationLink) {
                payload.pickupLocationLink = formData.pickupLocationLink;
            }
            if (formData.deliveryLocationLink) {
                payload.deliveryLocationLink = formData.deliveryLocationLink;
            }
            if (formData.estimatedTime) {
                payload.estimatedTime = new Date(formData.estimatedTime).toISOString();
            }
            if (formData.pickupCoordinates && formData.pickupCoordinates.lat && formData.pickupCoordinates.lng) {
                payload.pickupCoordinates = formData.pickupCoordinates;
            }
            if (formData.deliveryCoordinates && formData.deliveryCoordinates.lat && formData.deliveryCoordinates.lng) {
                payload.deliveryCoordinates = formData.deliveryCoordinates;
            }

            // Debug: Log the final payload
            console.log('📦 Final Payload Debug:', payload);

            // Final validation check
            if (!payload.pickupLocation || !payload.deliveryLocation || !payload.customerName || !payload.customerPhone) {
                console.error('❌ Missing required fields in payload:', {
                    pickupLocation: !!payload.pickupLocation,
                    deliveryLocation: !!payload.deliveryLocation,
                    customerName: !!payload.customerName,
                    customerPhone: !!payload.customerPhone
                });
                showError('Missing required fields. Please fill in all required information.');
                return;
            }

            console.log('🚚 DeliveriesPage: Creating delivery with payload:', payload);
            const result = await apiService.createDeliveryWithBroadcast(payload);
            console.log('🚚 DeliveriesPage: Delivery creation result:', result);

            if (result.success) {
                const successMessage = formData.useAutoBroadcast
                    ? `Delivery created successfully! 🚚\n\n📦 Delivery Code: ${result.data.deliveryCode}\n💰 Fee: ₺${result.data.fee}\n📡 Broadcast Status: ${result.data.broadcastStatus}\n👥 Eligible Drivers: ${result.data.eligibleDrivers || 0}`
                    : `Delivery created successfully! 🚚\n\n📦 Delivery Code: ${result.data.deliveryCode}\n💰 Fee: ₺${result.data.fee}\n👤 Assigned Driver: ${result.data.assignedTo || 'Not assigned'}`;

                showSuccess(successMessage);

                setShowCreatePanel(false);
                resetForm();
                fetchDeliveries();

                // Show customer message modal
                console.log('🚚 DeliveriesPage: Checking if should show customer message modal:', result.data);
                if (result.data && result.data.deliveryCode) {
                    console.log('🚚 DeliveriesPage: Showing customer message modal for delivery:', result.data.deliveryCode);
                    showCustomerMessage(result.data);

                    // Show a delightful success notification
                    setTimeout(() => {
                        showSuccess('🎉 Customer notification ready! Use the modal to send messages.');
                    }, 500);
                } else {
                    console.log('🚚 DeliveriesPage: No delivery code found, not showing modal');
                }

                // Show additional info for auto-broadcast
                if (formData.useAutoBroadcast && result.data.broadcastStatus === 'not_started') {
                    setTimeout(() => {
                        showInfo('📡 Broadcast will start automatically in a few seconds...');
                    }, 2000);
                }

                // Emit socket event for real-time delivery broadcast
                if (formData.useAutoBroadcast && result.data) {
                    // Emit the delivery-broadcast event that the backend expects
                    socketService.emit('delivery-broadcast', {
                        deliveryId: result.data._id,
                        deliveryCode: result.data.deliveryCode,
                        pickupLocation: result.data.pickupLocation,
                        deliveryLocation: result.data.deliveryLocation,
                        customerName: result.data.customerName,
                        customerPhone: result.data.customerPhone,
                        fee: result.data.fee,
                        driverEarning: result.data.driverEarning || result.data.fee * 0.8, // 80% of fee as default
                        companyEarning: result.data.companyEarning || result.data.fee * 0.2, // 20% of fee as default
                        paymentMethod: result.data.paymentMethod,
                        priority: result.data.priority,
                        notes: result.data.notes,
                        estimatedTime: result.data.estimatedTime,
                        pickupCoordinates: result.data.pickupCoordinates,
                        deliveryCoordinates: result.data.deliveryCoordinates,
                        broadcastRadius: formData.broadcastRadius,
                        broadcastDuration: formData.broadcastDuration,
                        createdAt: result.data.createdAt,
                        broadcastEndTime: new Date(Date.now() + (formData.broadcastDuration || 60) * 1000).toISOString()
                    });
                }
            } else {
                console.error('Failed to create delivery:', result);
                if (result.details) {
                    result.details.forEach(detail => {
                        showError(`${detail.field}: ${detail.message}`);
                    });
                } else {
                    showError(result.message || 'Failed to create delivery');
                }
            }
        } catch (error) {
            console.error('Error creating delivery:', error);
            showError('Error creating delivery');
        }
    };

    const handleUpdateDelivery = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.assignedTo) {
            showError('Please assign a driver to this delivery');
            return;
        }

        if (!formData.pickupLocation || !formData.deliveryLocation) {
            showError('Please fill in pickup and delivery locations');
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
                const result = await response.json();
                showSuccess('Delivery updated successfully!');
                setShowEditPanel(false);
                resetForm();
                fetchDeliveries();

                // Show customer message modal for manual assignments
                if (result && result.deliveryCode) {
                    console.log('🚚 DeliveriesPage: Showing customer message modal for updated delivery:', result.deliveryCode);
                    showCustomerMessage(result);
                }
            } else {
                console.error('Failed to update delivery:', result);
                if (result.details) {
                    result.details.forEach(detail => {
                        showError(`${detail.field}: ${detail.message}`);
                    });
                } else {
                    showError(result.error || 'Failed to update delivery');
                }
            }
        } catch (error) {
            console.error('Error updating delivery:', error);
            showError('Error updating delivery');
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
                showSuccess('Delivery deleted successfully!');
                fetchDeliveries();
            } else {
                const result = await response.json();
                showError(result.error || 'Failed to delete delivery');
            }
        } catch (error) {
            console.error('Error deleting delivery:', error);
            showError('Error deleting delivery');
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
            mapLink: '',
            // Broadcast settings
            useAutoBroadcast: true,
            broadcastRadius: 5,
            broadcastDuration: 60,
            pickupCoordinates: {
                lat: null,
                lng: null
            },
            deliveryCoordinates: {
                lat: null,
                lng: null
            }
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
            showSuccess('Message copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            showError('Failed to copy message');
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

    const filteredDeliveries = Array.isArray(deliveries) ? deliveries.filter(delivery => {
        const matchesSearch = true;

        const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
        const matchesPayment = paymentFilter === 'all' || delivery.paymentMethod === paymentFilter;
        const matchesPriority = 'all' === 'all' || delivery.priority === 'all'; // priorityFilter commented out
        const matchesDriver = 'all' === 'all' || delivery.assignedTo === 'all'; // driverFilter commented out
        const matchesBroadcast = broadcastFilter === 'all' || delivery.broadcastStatus === broadcastFilter;

        return matchesSearch && matchesStatus && matchesPayment && matchesPriority && matchesDriver && matchesBroadcast;
    }) : [];

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

    const getBroadcastColor = (broadcastStatus) => {
        const colors = {
            not_started: 'bg-gray-100 text-gray-800',
            broadcasting: 'bg-blue-100 text-blue-800',
            accepted: 'bg-green-100 text-green-800',
            expired: 'bg-red-100 text-red-800',
            manual_assignment: 'bg-purple-100 text-purple-800'
        };
        return colors[broadcastStatus] || 'bg-gray-100 text-gray-800';
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
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="bg-white shadow-sm rounded-lg p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                                <div>
                                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Deliveries</h1>
                                    <p className="text-xs sm:text-sm text-gray-600">Manage all delivery orders and track their status</p>
                                    {lastRefresh && (
                                        <div className="mt-1 flex items-center text-xs text-gray-400">
                                            <ClockIcon className="h-3 w-3 mr-1" />
                                            <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                    <button
                                        onClick={fetchDeliveries}
                                        disabled={loading}
                                        className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
                                    >
                                        <ArrowPathIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </button>
                                    <button
                                        onClick={openCreatePanel}
                                        className="inline-flex items-center justify-center px-3 py-2 border border-transparent rounded text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        New Delivery
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Accounting Summary */}
                        <div className="bg-white shadow-sm rounded-lg p-3 sm:p-4">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Accounting Summary</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                                <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                                    <div className="text-xs font-medium text-blue-600">Total Deliveries</div>
                                    <div className="text-lg sm:text-xl font-bold text-blue-900">{totals.totalDeliveries}</div>
                                </div>
                                <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                                    <div className="text-xs font-medium text-green-600">Total Revenue</div>
                                    <div className="text-lg sm:text-xl font-bold text-green-900">₺{totals.totalRevenue.toLocaleString()}</div>
                                </div>
                                <div className="bg-purple-50 p-2 sm:p-3 rounded-lg">
                                    <div className="text-xs font-medium text-purple-600">Average Fee</div>
                                    <div className="text-lg sm:text-xl font-bold text-purple-900">
                                        ₺{totals.totalDeliveries > 0 ? (totals.totalRevenue / totals.totalDeliveries).toFixed(2) : '0'}
                                    </div>
                                </div>
                                <div className="bg-orange-50 p-2 sm:p-3 rounded-lg">
                                    <div className="text-xs font-medium text-orange-600">Delivered Revenue</div>
                                    <div className="text-lg sm:text-xl font-bold text-orange-900">
                                        ₺{(totals.byStatus.delivered?.amount || 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Breakdown */}
                            <div className="mt-4">
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">Payment Method Breakdown</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                                    {Object.entries(totals.byPaymentMethod).map(([method, data]) => (
                                        <div key={method} className="bg-gray-50 p-2 rounded-lg">
                                            <div className="text-xs font-medium text-gray-700 capitalize">{method.replace('_', ' ')}</div>
                                            <div className="text-sm font-bold text-gray-900">{data.count}</div>
                                            <div className="text-xs text-gray-600">₺{data.amount.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white shadow-sm rounded-lg p-3 sm:p-4">
                            <div className="flex flex-col space-y-3">
                                <div className="flex items-center space-x-2">
                                    <FunnelIcon className="h-4 w-4 text-gray-500" />
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">Filters:</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
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
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
                                    >
                                        <option value="all">All Payments</option>
                                        <option value="cash">Cash</option>
                                        <option value="pos">POS</option>
                                        <option value="naira_transfer">Naira Transfer</option>
                                        <option value="isbank_transfer">Isbank Transfer</option>
                                        <option value="crypto_transfer">Crypto Transfer</option>
                                    </select>
                                    <select
                                        value={broadcastFilter}
                                        onChange={(e) => setBroadcastFilter(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
                                    >
                                        <option value="all">All Broadcasts</option>
                                        <option value="not_started">Not Started</option>
                                        <option value="broadcasting">Broadcasting</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="expired">Expired</option>
                                        <option value="manual_assignment">Manual Assignment</option>
                                    </select>
                                    <div className="flex items-center justify-center px-3 py-2 bg-gray-50 rounded-md">
                                        <span className="text-xs sm:text-sm text-gray-500">
                                            {filteredDeliveries.length} of {deliveries.length} deliveries
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Deliveries List - Mobile Card View */}
                        <div className="lg:hidden">
                            <div className="space-y-3">
                                {paginatedDeliveries.map((delivery) => (
                                    <div key={delivery._id} className="bg-white shadow-sm rounded-lg p-4 space-y-3">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <TruckIcon className="h-6 w-6 text-blue-600" />
                                                <div>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(delivery.deliveryCode);
                                                            showSuccess('Delivery code copied to clipboard!');
                                                        }}
                                                        className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline cursor-pointer flex items-center"
                                                        title="Click to copy delivery code"
                                                    >
                                                        {delivery.deliveryCode}
                                                        <ClipboardDocumentIcon className="w-3 h-3 ml-1 opacity-50 hover:opacity-100" />
                                                    </button>
                                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getPriorityColor(delivery.priority)}`}>
                                                        {delivery.priority}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-green-600">₺{delivery.fee}</div>
                                                <div className="text-xs text-gray-500">{delivery.paymentMethod}</div>
                                            </div>
                                        </div>

                                        {/* Customer Info */}
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{delivery.customerName || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">{delivery.customerPhone || 'N/A'}</div>
                                        </div>

                                        {/* Route */}
                                        <div className="space-y-1">
                                            <div className="text-sm text-gray-900">
                                                <span className="font-medium">From:</span> {delivery.pickupLocation}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                <span className="font-medium">To:</span> {delivery.deliveryLocation}
                                            </div>
                                        </div>

                                        {/* Status and Driver */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                                                    {delivery.status}
                                                </span>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBroadcastColor(delivery.broadcastStatus)}`}>
                                                    {delivery.broadcastStatus}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {delivery.assignedTo ? delivery.assignedTo.name : 'Unassigned'}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                                            <button
                                                onClick={() => openViewPanel(delivery)}
                                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                            >
                                                <EyeIcon className="h-3 w-3 mr-1" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => openEditPanel(delivery)}
                                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                                            >
                                                <PencilIcon className="h-3 w-3 mr-1" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDelivery(delivery._id)}
                                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <TrashIcon className="h-3 w-3 mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Deliveries List - Desktop Table View */}
                        <div className="hidden lg:block bg-white shadow-sm rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Broadcast</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedDeliveries.map((delivery) => (
                                            <tr key={delivery._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <TruckIcon className="h-8 w-8 text-blue-600" />
                                                        <div className="ml-4">
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(delivery.deliveryCode);
                                                                    showSuccess('Delivery code copied to clipboard!');
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
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{delivery.customerName || 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">{delivery.customerPhone || 'N/A'}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm text-gray-900">
                                                        <div className="font-medium">From: {delivery.pickupLocation}</div>
                                                        <div className="text-gray-500">To: {delivery.deliveryLocation}</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {delivery.assignedTo ? (
                                                        <div className="flex items-center">
                                                            <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{delivery.assignedTo.name}</div>
                                                                <div className="text-sm text-gray-500">{delivery.assignedTo.area}</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                                                        {delivery.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBroadcastColor(delivery.broadcastStatus)}`}>
                                                        {delivery.broadcastStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">₺{delivery.fee}</div>
                                                    <div className="text-sm text-gray-500">{delivery.paymentMethod}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {format(new Date(delivery.createdAt), 'MMM dd, yyyy')}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() => openViewPanel(delivery)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="View details"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditPanel(delivery)}
                                                            className="text-gray-600 hover:text-gray-900"
                                                            title="Edit delivery"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteDelivery(delivery._id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete delivery"
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
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-white shadow-sm rounded-lg p-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    itemsPerPage={itemsPerPage}
                                    onItemsPerPageChange={setItemsPerPage}
                                    totalItems={filteredDeliveries.length}
                                />
                            </div>
                        )}
                    </div>
                </div>
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
                            <div className="flex-1 overflow-y-auto p-6">
                                <form id="create-delivery-form" onSubmit={handleCreateDelivery} className="space-y-6">
                                    {/* Route Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Route Information</h4>
                                        <div className="space-y-4">
                                            <LocationInput
                                                value={formData.pickupLocation}
                                                onChange={(value) => setFormData({ ...formData, pickupLocation: value })}
                                                placeholder="Enter pickup address"
                                                label="Pickup Location"
                                                onLocationSelect={(location) => {
                                                    setFormData({
                                                        ...formData,
                                                        pickupLocation: location.address,
                                                        pickupCoordinates: { lat: location.lat, lng: location.lng }
                                                    });
                                                }}
                                            />

                                            <LocationInput
                                                value={formData.deliveryLocation}
                                                onChange={(value) => setFormData({ ...formData, deliveryLocation: value })}
                                                placeholder="Enter delivery address"
                                                label="Delivery Location"
                                                onLocationSelect={(location) => {
                                                    setFormData({
                                                        ...formData,
                                                        deliveryLocation: location.address,
                                                        deliveryCoordinates: { lat: location.lat, lng: location.lng }
                                                    });
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Customer Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                                                <CapitalizedInput
                                                    type="text"
                                                    placeholder="Enter customer name"
                                                    value={formData.customerName}
                                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                    capitalizeMode="words"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone</label>
                                                <input
                                                    type="tel"
                                                    placeholder="Enter phone number"
                                                    value={formData.customerPhone}
                                                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Details */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Fee (₺)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="0"
                                                    value={formData.fee}
                                                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                                <select
                                                    value={formData.paymentMethod}
                                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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

                                    {/* Priority */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Priority</h4>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                                            <select
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            >
                                                <option value="low">Low Priority</option>
                                                <option value="normal">Normal Priority</option>
                                                <option value="high">High Priority</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
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
                                                    onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                                <textarea
                                                    rows="3"
                                                    placeholder="Add any additional notes or special instructions..."
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Broadcast Settings */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Broadcast Settings</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="useAutoBroadcast"
                                                    checked={formData.useAutoBroadcast}
                                                    onChange={(e) => setFormData({ ...formData, useAutoBroadcast: e.target.checked })}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="useAutoBroadcast" className="ml-2 block text-sm text-gray-900">
                                                    Use Automatic Broadcast
                                                </label>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                When enabled, the system will automatically broadcast this delivery to nearby drivers.
                                                The first driver to accept will be assigned.
                                            </p>

                                            {formData.useAutoBroadcast && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Broadcast Radius (km)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="50"
                                                            value={formData.broadcastRadius}
                                                            onChange={(e) => setFormData({ ...formData, broadcastRadius: Number(e.target.value) })}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Broadcast Duration (seconds)</label>
                                                        <input
                                                            type="number"
                                                            min="10"
                                                            max="300"
                                                            value={formData.broadcastDuration}
                                                            onChange={(e) => setFormData({ ...formData, broadcastDuration: Number(e.target.value) })}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Manual Assignment (only show if not using auto-broadcast) */}
                                    {!formData.useAutoBroadcast && (
                                        <div>
                                            <h4 className="text-lg font-medium text-gray-900 mb-4">Manual Assignment</h4>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Driver</label>
                                                <select
                                                    required
                                                    value={formData.assignedTo}
                                                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                >
                                                    <option value="">Select a driver</option>
                                                    {drivers.map((driver) => (
                                                        <option key={driver._id} value={driver._id}>
                                                            {driver.name} - {driver.phone}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
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
                                    className="px-8 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 rounded-lg"
                                >
                                    Create Delivery
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Delivery Panel */}
            {showViewPanel && selectedDelivery && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
                        onClick={closeViewPanel}
                    />

                    {/* Panel */}
                    <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isViewPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <TruckIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Delivery Details</h3>
                                    <p className="text-sm text-gray-500">{selectedDelivery.deliveryCode}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeViewPanel}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Status and Priority */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedDelivery.status)}`}>
                                        {selectedDelivery.status}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedDelivery.priority)}`}>
                                        {selectedDelivery.priority}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-600">₺{selectedDelivery.fee}</div>
                                    <div className="text-sm text-gray-500">{selectedDelivery.paymentMethod}</div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <UserIcon className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-900">{selectedDelivery.customerName || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <PhoneIcon className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-900">{selectedDelivery.customerPhone || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Route Information */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-gray-900">Route Information</h4>

                                {/* Pickup */}
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-blue-700">Pickup</span>
                                        </div>
                                        {selectedDelivery.pickupLocationLink && (
                                            <a
                                                href={selectedDelivery.pickupLocationLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Open Map
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-900">{selectedDelivery.pickupLocation}</p>
                                </div>

                                {/* Delivery */}
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-green-700">Delivery</span>
                                        </div>
                                        {selectedDelivery.deliveryLocationLink && (
                                            <a
                                                href={selectedDelivery.deliveryLocationLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-green-600 hover:text-green-800 font-medium"
                                            >
                                                Open Map
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-900">{selectedDelivery.deliveryLocation}</p>
                                </div>
                            </div>

                            {/* Assignment */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Assignment</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Assigned To:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {selectedDelivery.assignedTo ? 'Assigned' : 'Unassigned'}
                                        </span>
                                    </div>
                                    {selectedDelivery.estimatedTime && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Estimated Time:</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {new Date(selectedDelivery.estimatedTime).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    {selectedDelivery.distance && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Distance:</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {selectedDelivery.distance}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedDelivery.notes && (
                                <div className="bg-yellow-50 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Special Instructions</h4>
                                    <p className="text-sm text-gray-700">{selectedDelivery.notes}</p>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Timestamps</h4>
                                <div className="space-y-2 text-xs text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Created:</span>
                                        <span>{new Date(selectedDelivery.createdAt).toLocaleString()}</span>
                                    </div>
                                    {selectedDelivery.updatedAt && (
                                        <div className="flex justify-between">
                                            <span>Updated:</span>
                                            <span>{new Date(selectedDelivery.updatedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        closeViewPanel();
                                        openEditPanel(selectedDelivery);
                                    }}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Edit Delivery
                                </button>
                                <button
                                    onClick={() => {
                                        closeViewPanel();
                                        handleDeleteDelivery(selectedDelivery._id);
                                    }}
                                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Message Modal */}
            {showCustomerMessageModal && customerMessageData && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <TruckIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Delivery Created Successfully!</h3>
                                        <p className="text-green-100 text-sm">Ready to notify your customer</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCustomerMessageModal(false)}
                                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-6">
                            {/* Delivery Summary Card */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
                                <div className="flex items-center mb-4">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <TruckIcon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 ml-3">Delivery Summary</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                        <span className="text-gray-600 font-medium">Delivery Code</span>
                                        <span className="font-bold text-gray-900 text-lg">{customerMessageData.deliveryCode}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                        <span className="text-gray-600 font-medium">Fee</span>
                                        <span className="font-bold text-green-600 text-lg">₺{customerMessageData.fee}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                        <span className="text-gray-600 font-medium">Customer</span>
                                        <span className="font-semibold text-gray-900">{customerMessageData.customerName}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                        <span className="text-gray-600 font-medium">Payment</span>
                                        <span className="font-semibold text-gray-900">{customerMessageData.paymentMethod}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Message Templates */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <PhoneIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900">Send Message to Customer</h4>
                                </div>

                                {/* WhatsApp Message */}
                                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <h5 className="text-sm font-semibold text-green-900">WhatsApp Message</h5>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(generateWhatsAppMessage(customerMessageData))}
                                            className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-all duration-200"
                                        >
                                            <ClipboardDocumentIcon className="w-3 h-3" />
                                            <span>Copy</span>
                                        </button>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap border border-green-200">
                                        {generateWhatsAppMessage(customerMessageData)}
                                    </div>
                                </div>

                                {/* SMS Message */}
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <h5 className="text-sm font-semibold text-blue-900">SMS Message</h5>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(generateSMSMessage(customerMessageData))}
                                            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-all duration-200"
                                        >
                                            <ClipboardDocumentIcon className="w-3 h-3" />
                                            <span>Copy</span>
                                        </button>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap border border-blue-200">
                                        {generateSMSMessage(customerMessageData)}
                                    </div>
                                </div>

                                {/* Email Message */}
                                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                            <h5 className="text-sm font-semibold text-purple-900">Email Message</h5>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(generateEmailMessage(customerMessageData))}
                                            className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-all duration-200"
                                        >
                                            <ClipboardDocumentIcon className="w-3 h-3" />
                                            <span>Copy</span>
                                        </button>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap border border-purple-200">
                                        {generateEmailMessage(customerMessageData)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-gray-50 px-8 py-6 rounded-b-2xl border-t border-gray-200">
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => {
                                        const whatsappUrl = `https://wa.me/${customerMessageData.customerPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(generateWhatsAppMessage(customerMessageData))}`;
                                        window.open(whatsappUrl, '_blank');
                                    }}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl text-sm font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <PhoneIcon className="w-4 h-4" />
                                    <span>Send WhatsApp</span>
                                </button>
                                <button
                                    onClick={() => setShowCustomerMessageModal(false)}
                                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-xl text-sm font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
        </>
    );
};

export default DeliveriesPage;
