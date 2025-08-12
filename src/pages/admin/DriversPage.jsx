import React, { useState, useEffect, useCallback } from 'react';
import { ArrowPathIcon, MagnifyingGlassIcon, TrashIcon, EyeIcon, PlusIcon, DocumentArrowDownIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { TableRowSkeleton } from '../../components/common/SkeletonLoader';
import DriverDetailsModal from '../../components/admin/DriverDetailsModal';
import AddDriverModal from '../../components/admin/AddDriverModal';
import PendingInvitationsModal from '../../components/admin/PendingInvitationsModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Pagination from '../../components/common/Pagination';
import driverService from '../../services/driverService';
import { getStatusColor, getStatusText, formatCurrency, formatDateTime } from '../../services/systemSettings';
import toast from 'react-hot-toast';

const DriversPage = () => {
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

    const reason = prompt('Enter suspension reason (optional):');
    if (reason === null) return; // User cancelled

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
          <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 animate-pulse"></div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Drivers Management</h1>
              <p className="mt-2 text-gray-600">
                Manage and monitor all registered drivers
                {lastUpdate && (
                  <span className="ml-2 text-sm text-gray-500">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddDriverModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Invite Driver
              </button>

              <button
                onClick={() => setShowPendingInvitationsModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                Pending Invitations
              </button>

              <button
                onClick={() => handleExportDrivers('csv')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export CSV
              </button>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh"
              >
                <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Drivers
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Drivers</option>
                <option value="online">Online</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedDrivers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedDrivers.length} driver{selectedDrivers.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleBulkSuspend}
                  disabled={isBulkActionLoading}
                  className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Suspend Selected
                </button>
                <button
                  onClick={handleBulkUnsuspend}
                  disabled={isBulkActionLoading}
                  className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Unsuspend Selected
                </button>
              </div>
              <button
                onClick={() => setSelectedDrivers([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Drivers Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDrivers.length === filteredDrivers.length && filteredDrivers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deliveries
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                ) : (
                  filteredDrivers.map((driver, index) => (
                    <tr key={driver._id || driver.id || `driver-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedDrivers.includes(driver.id)}
                          onChange={() => handleSelectDriver(driver.id)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {driver.profileImage ? (
                              <img
                                src={driver.profileImage}
                                alt={driver.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-600">
                                {driver.name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                            <div className="text-sm text-gray-500">ID: {driver.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{driver.email}</div>
                        <div className="text-sm text-gray-500">{driver.phone}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(driver.status)}`}>
                          {getStatusText(driver.status)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.deliveries || 0}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(driver.earnings || 0)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {driver.lastActive ? formatDateTime(driver.lastActive) : 'Never'}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredDrivers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No drivers found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No drivers are currently registered.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Driver Details Modal */}
      <DriverDetailsModal
        driver={selectedDriver}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedDriver(null);
        }}
        onDriverUpdate={handleDriverUpdate}
      />

      {/* Add Driver Modal */}
      <AddDriverModal
        isOpen={showAddDriverModal}
        onClose={() => setShowAddDriverModal(false)}
        onDriverAdded={handleDriverAdded}
      />

      {/* Pending Invitations Modal */}
      <PendingInvitationsModal
        isOpen={showPendingInvitationsModal}
        onClose={() => setShowPendingInvitationsModal(false)}
        onInvitationUpdate={() => {
          // Refresh drivers list when invitations are updated
          fetchDrivers();
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDriverToDelete(null);
        }}
        onConfirm={confirmDeleteDriver}
        title="Delete Driver"
        message={`Are you sure you want to delete ${driverToDelete?.name}? This action cannot be undone.`}
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default DriversPage;
