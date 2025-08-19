import React, { useState, useEffect, useCallback } from 'react';
import { ArrowPathIcon, MagnifyingGlassIcon, TrashIcon, EyeIcon, PlusIcon, DocumentArrowDownIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { TableRowSkeleton } from '../../components/common/SkeletonLoader';
import DriverDetailsModal from '../../components/admin/DriverDetailsModal';
import AddDriverModal from '../../components/admin/AddDriverModal';
import PendingInvitationsModal from '../../components/admin/PendingInvitationsModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Pagination from '../../components/common/Pagination';
import driverService from '../../services/driverService';
import { formatDateTime } from '../../services/systemSettings';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import toast from 'react-hot-toast';

const DriversPage = () => {
  const { formatCurrency } = useSystemSettings();

  // Driver status helper functions
  const getDriverStatusText = (driver) => {
    if (!driver) return 'Unknown';

    // Debug logging
    console.log('🔍 Driver status check for:', driver.name, {
      isSuspended: driver.isSuspended,
      isOnline: driver.isOnline,
      isActive: driver.isActive,
      verificationStatus: driver.verificationStatus?.status,
      accountStatus: driver.accountStatus?.verification?.activeDeliveryPartner
    });

    // Check suspension first
    if (driver.isSuspended) return 'Suspended';

    // Check online status
    if (driver.isOnline) return 'Online';

    // Check active status
    if (driver.isActive) return 'Active';

    // Check verification status
    if (driver.verificationStatus?.status) {
      return driver.verificationStatus.status === 'verified' ? 'Verified' : 'Partially Verified';
    }

    // Check account status
    if (driver.accountStatus?.verification?.activeDeliveryPartner) return 'Active Partner';

    // Default fallback
    return 'Inactive';
  };

  const getDriverStatusColor = (driver) => {
    if (!driver) return 'bg-gray-100 text-gray-800';

    // Check suspension first
    if (driver.isSuspended) return 'bg-red-100 text-red-800';

    // Check online status
    if (driver.isOnline) return 'bg-green-100 text-green-800';

    // Check active status
    if (driver.isActive) return 'bg-blue-100 text-blue-800';

    // Check verification status
    if (driver.verificationStatus?.status) {
      return driver.verificationStatus.status === 'verified'
        ? 'bg-green-100 text-green-800'
        : 'bg-yellow-100 text-yellow-800';
    }

    // Check account status
    if (driver.accountStatus?.verification?.activeDeliveryPartner) return 'bg-green-100 text-green-800';

    // Default fallback
    return 'bg-gray-100 text-gray-800';
  };
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showPendingInvitationsModal, setShowPendingInvitationsModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const fetchDrivers = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const filters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
        page: currentPage,
        limit: itemsPerPage
      };

      const data = await driverService.getDrivers(filters);

      // Ensure drivers is always an array
      const driversArray = Array.isArray(data.drivers) ? data.drivers :
        Array.isArray(data) ? data : [];

      setDrivers(driversArray);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || driversArray.length);
      setLastUpdate(new Date());
    } catch (error) {
      if (!silent) {
        toast.error('Failed to fetch drivers');
      }
      console.error('Error fetching drivers:', error);
      // Set empty array on error to prevent filter issues
      setDrivers([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      if (!silent) {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, [searchTerm, statusFilter, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchDrivers();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDrivers(true); // Silent refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDrivers]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDriver = (driver) => {
    setSelectedDriver(driver);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteDriver = (driver) => {
    setDriverToDelete(driver);
    setShowDeleteModal(true);
  };

  const confirmDeleteDriver = async () => {
    if (!driverToDelete) return;

    try {
      await driverService.deleteDriver(driverToDelete.id);
      toast.success('Driver deleted successfully');
      fetchDrivers(); // Refresh the list
      setShowDeleteModal(false);
      setDriverToDelete(null);
    } catch (error) {
      toast.error('Failed to delete driver');
      console.error('Error deleting driver:', error);
    }
  };

  const handleRefresh = () => {
    fetchDrivers(false); // Force refresh with loading state
  };

  const handleDriverUpdate = (updatedDriver) => {
    if (updatedDriver && typeof updatedDriver === 'object' && updatedDriver.id) {
      setDrivers(prev =>
        prev.map(driver =>
          driver.id === updatedDriver.id ? updatedDriver : driver
        )
      );
    }
  };

  const handleDriverAdded = (newDriver) => {
    if (newDriver && typeof newDriver === 'object') {
      setDrivers(prev => [newDriver, ...prev]);
    }
  };

  const handleSelectDriver = (driverId) => {
    setSelectedDrivers(prev =>
      prev.includes(driverId)
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDrivers.length === filteredDrivers.length) {
      setSelectedDrivers([]);
    } else {
      setSelectedDrivers(filteredDrivers.map(driver => driver.id));
    }
  };

  const handleBulkSuspend = async () => {
    if (selectedDrivers.length === 0) {
      toast.error('Please select drivers to suspend');
      return;
    }

    const reason = ''; // No reason required for bulk suspension

    try {
      setIsBulkActionLoading(true);
      await driverService.bulkSuspendDrivers(selectedDrivers, reason);
      toast.success(`${selectedDrivers.length} drivers suspended successfully`);
      setSelectedDrivers([]);
      fetchDrivers();
    } catch (error) {
      toast.error('Failed to suspend drivers');
      console.error('Error bulk suspending drivers:', error);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkUnsuspend = async () => {
    if (selectedDrivers.length === 0) {
      toast.error('Please select drivers to unsuspend');
      return;
    }

    try {
      setIsBulkActionLoading(true);
      await driverService.bulkUnsuspendDrivers(selectedDrivers);
      toast.success(`${selectedDrivers.length} drivers unsuspended successfully`);
      setSelectedDrivers([]);
      fetchDrivers();
    } catch (error) {
      toast.error('Failed to unsuspend drivers');
      console.error('Error bulk unsuspending drivers:', error);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleExportDrivers = async (format = 'csv') => {
    try {
      const filters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      };

      await driverService.exportDrivers(format, filters);
      toast.success(`Drivers exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export drivers');
      console.error('Error exporting drivers:', error);
    }
  };

  const filteredDrivers = Array.isArray(drivers) ? drivers.filter(driver => {
    if (!driver || typeof driver !== 'object') return false;

    const matchesSearch = driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subtle refresh indicator */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-0.5 bg-gradient-to-r from-green-400 to-green-600 animate-pulse"></div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Drivers Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage and monitor all registered drivers
                {lastUpdate && (
                  <span className="ml-2 text-xs text-gray-500">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddDriverModal(true)}
                className="flex items-center px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
              >
                <PlusIcon className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Invite Driver</span>
                <span className="sm:hidden">Add</span>
              </button>

              <button
                onClick={() => setShowPendingInvitationsModal(true)}
                className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                <EnvelopeIcon className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Pending Invitations</span>
                <span className="sm:hidden">Invites</span>
              </button>

              <button
                onClick={() => handleExportDrivers('csv')}
                className="flex items-center px-3 py-1.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
              >
                <DocumentArrowDownIcon className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Search Drivers
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Drivers</option>
                <option value="online">Online</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-xs text-gray-600">
                {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedDrivers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <span className="text-xs font-medium text-blue-900">
                  {selectedDrivers.length} driver{selectedDrivers.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={handleBulkSuspend}
                    disabled={isBulkActionLoading}
                    className="flex items-center px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    <span className="hidden sm:inline">Suspend Selected</span>
                    <span className="sm:hidden">Suspend</span>
                  </button>
                  <button
                    onClick={handleBulkUnsuspend}
                    disabled={isBulkActionLoading}
                    className="flex items-center px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    <span className="hidden sm:inline">Unsuspend Selected</span>
                    <span className="sm:hidden">Unsuspend</span>
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedDrivers([])}
                className="text-xs text-blue-600 hover:text-blue-800 self-start sm:self-auto"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Drivers Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDrivers.length === filteredDrivers.length && filteredDrivers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deliveries
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  // Show skeleton rows while loading
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRowSkeleton key={index} columns={8} />
                  ))
                ) : filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                          <span className="text-gray-400 text-xs">👥</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">No drivers found</p>
                        <p className="text-xs text-gray-500">No drivers are currently registered.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedDrivers.includes(driver.id)}
                          onChange={() => handleSelectDriver(driver.id)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-gray-600">
                              {driver.name?.charAt(0)?.toUpperCase() || 'D'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                            <div className="text-xs text-gray-500">ID: {driver.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm text-gray-900">{driver.email}</div>
                        <div className="text-xs text-gray-500">{driver.phone}</div>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDriverStatusColor(driver)}`}>
                          {getDriverStatusText(driver)}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm text-gray-900">{driver.totalDeliveries || 0}</div>
                        <div className="text-xs text-gray-500">deliveries</div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(driver.totalEarnings || 0)}</div>
                        <div className="text-xs text-gray-500">total earnings</div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm text-gray-900">{formatDateTime(driver.lastActive)}</div>
                        <div className="text-xs text-gray-500">last seen</div>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleViewDriver(driver)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Details"
                          >
                            <EyeIcon className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteDriver(driver)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Driver"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drivers Cards - Mobile/Tablet */}
        <div className="lg:hidden space-y-3">
          {isLoading ? (
            // Show skeleton cards while loading
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))
          ) : filteredDrivers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-gray-400 text-xs">👥</span>
                </div>
                <p className="text-sm font-medium text-gray-900">No drivers found</p>
                <p className="text-xs text-gray-500">No drivers are currently registered.</p>
              </div>
            </div>
          ) : (
            filteredDrivers.map((driver) => (
              <div key={driver.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                {/* Header with checkbox and actions */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedDrivers.includes(driver.id)}
                      onChange={() => handleSelectDriver(driver.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {driver.name?.charAt(0)?.toUpperCase() || 'D'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                      <div className="text-xs text-gray-500">ID: {driver.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleViewDriver(driver)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="View Details"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDriver(driver)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete Driver"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-3">
                  <div className="text-sm text-gray-900">{driver.email}</div>
                  <div className="text-xs text-gray-500">{driver.phone}</div>
                </div>

                {/* Status and Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Status</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDriverStatusColor(driver)}`}>
                      {getDriverStatusText(driver)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Deliveries</span>
                    <span className="text-sm font-medium text-gray-900">{driver.totalDeliveries || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Earnings</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(driver.totalEarnings || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Last Active</span>
                    <span className="text-xs text-gray-900">{formatDateTime(driver.lastActive)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!isLoading && filteredDrivers.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={totalItems}
              startIndex={(currentPage - 1) * itemsPerPage + 1}
              endIndex={Math.min(currentPage * itemsPerPage, totalItems)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <DriverDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        driver={selectedDriver}
        onDriverUpdate={handleDriverUpdate}
      />

      <AddDriverModal
        isOpen={showAddDriverModal}
        onClose={() => setShowAddDriverModal(false)}
        onDriverAdded={handleDriverAdded}
      />

      <PendingInvitationsModal
        isOpen={showPendingInvitationsModal}
        onClose={() => setShowPendingInvitationsModal(false)}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDriverToDelete(null);
        }}
        onConfirm={confirmDeleteDriver}
        title="Delete Driver"
        message={`Are you sure you want to delete driver "${driverToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Driver"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default DriversPage;
