import React, { useState, useEffect, useCallback } from 'react';
import { capitalizeName } from '../../utils/nameUtils';
import { ArrowPathIcon, MagnifyingGlassIcon, TrashIcon, EyeIcon, PlusIcon, DocumentArrowDownIcon, EnvelopeIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { TableRowSkeleton } from '../../components/common/SkeletonLoader';
import DriverDetailsModal from '../../components/admin/DriverDetailsModal';
import AddDriverModal from '../../components/admin/AddDriverModal';
import PendingInvitationsModal from '../../components/admin/PendingInvitationsModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Pagination from '../../components/common/Pagination';
import driverService from '../../services/driverService';
import { getStatusColor, getStatusText, formatDateTime } from '../../services/systemSettings';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import toast from 'react-hot-toast';

const DriversPage = () => {
  const { formatCurrency } = useSystemSettings();
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
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15); // Reduced for better fit

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

    const matchesSearch = capitalizeName(driver.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Subtle refresh indicator */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 z-50">
          <div className="h-0.5 bg-gradient-to-r from-green-400 to-green-600 animate-pulse"></div>
        </div>
      )}

      {/* Header Section - Compact */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Drivers</h1>
              <p className="text-xs text-gray-500">
                {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''} found
                {lastUpdate && (
                  <span className="ml-2">• Updated {lastUpdate.toLocaleTimeString()}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-1.5 text-xs rounded transition-colors ${showFilters
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <FunnelIcon className="w-3 h-3 mr-1" />
              Filters
            </button>

            <button
              onClick={handleRefresh}
              className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
            >
              <ArrowPathIcon className="w-3 h-3 mr-1" />
              Refresh
            </button>

            <button
              onClick={() => setShowAddDriverModal(true)}
              className="flex items-center px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="w-3 h-3 mr-1" />
              Add Driver
            </button>
          </div>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Name or email..."
                    className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
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

              <div className="flex items-end space-x-2">
                <button
                  onClick={() => setShowPendingInvitationsModal(true)}
                  className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  <EnvelopeIcon className="w-3 h-3 mr-1" />
                  Pending Invites
                </button>
                <button
                  onClick={() => handleExportDrivers('csv')}
                  className="flex items-center px-3 py-1.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                >
                  <DocumentArrowDownIcon className="w-3 h-3 mr-1" />
                  Export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedDrivers.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-medium text-blue-900">
                {selectedDrivers.length} driver{selectedDrivers.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleBulkSuspend}
                disabled={isBulkActionLoading}
                className="flex items-center px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
              >
                Suspend
              </button>
              <button
                onClick={handleBulkUnsuspend}
                disabled={isBulkActionLoading}
                className="flex items-center px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
              >
                Unsuspend
              </button>
            </div>
            <button
              onClick={() => setSelectedDrivers([])}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table Container - Takes remaining height */}
      <div className="flex-1 overflow-hidden">
        {/* Drivers Table - Desktop */}
        <div className="hidden lg:block h-full bg-white">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={selectedDrivers.length === filteredDrivers.length && filteredDrivers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deliveries
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    // Show skeleton rows while loading
                    Array.from({ length: 8 }).map((_, index) => (
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
                          <p className="text-xs text-gray-500">No drivers match your current filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedDrivers.includes(driver.id)}
                            onChange={() => handleSelectDriver(driver.id)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs font-medium text-gray-600">
                                {capitalizeName(driver.name)?.charAt(0)?.toUpperCase() || 'D'}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{capitalizeName(driver.name)}</div>
                              <div className="text-xs text-gray-500">ID: {driver.id?.slice(-8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm text-gray-900">{driver.email}</div>
                          <div className="text-xs text-gray-500">{driver.phone}</div>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                            {getStatusText(driver.status)}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm text-gray-900">{driver.totalDeliveries || 0}</div>
                          <div className="text-xs text-gray-500">deliveries</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(driver.totalEarnings || 0)}</div>
                          <div className="text-xs text-gray-500">total earnings</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm text-gray-900">{formatDateTime(driver.lastActive)}</div>
                          <div className="text-xs text-gray-500">last seen</div>
                        </td>
                        <td className="px-3 py-2 text-right">
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
        </div>

        {/* Drivers Cards - Mobile/Tablet */}
        <div className="lg:hidden h-full overflow-y-auto">
          <div className="space-y-2 p-2">
            {isLoading ? (
              // Show skeleton cards while loading
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))
            ) : filteredDrivers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-gray-400 text-xs">👥</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">No drivers found</p>
                  <p className="text-xs text-gray-500">No drivers match your current filters.</p>
                </div>
              </div>
            ) : (
              filteredDrivers.map((driver) => (
                <div key={driver.id} className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
                  {/* Header with checkbox and actions */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedDrivers.includes(driver.id)}
                        onChange={() => handleSelectDriver(driver.id)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {capitalizeName(driver.name)?.charAt(0)?.toUpperCase() || 'D'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{capitalizeName(driver.name)}</div>
                        <div className="text-xs text-gray-500">ID: {driver.id?.slice(-8)}</div>
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
                  <div className="mb-2">
                    <div className="text-sm text-gray-900">{driver.email}</div>
                    <div className="text-xs text-gray-500">{driver.phone}</div>
                  </div>

                  {/* Status and Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Status</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                        {getStatusText(driver.status)}
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
        </div>
      </div>

      {/* Pagination - Fixed at bottom */}
      {!isLoading && filteredDrivers.length > 0 && (
        <div className="bg-white border-t border-gray-200 px-4 py-2">
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

      {/* Modals */}
      <DriverDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          console.log('🔒 DriversPage: onClose called, setting isDetailsModalOpen to false');
          setIsDetailsModalOpen(false);
        }}
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
