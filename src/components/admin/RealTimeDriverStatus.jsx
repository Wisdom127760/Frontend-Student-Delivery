import React, { useState, useEffect, useCallback } from 'react';
import { getRealTimeDriverStatus } from '../../services/dashboardService';
import { getStatusColor, getStatusText } from '../../services/systemSettings';
import socketService from '../../services/socketService';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const RealTimeDriverStatus = () => {
  const [driverStatus, setDriverStatus] = useState({
    online: 0,
    busy: 0,
    offline: 0,
    total: 0,
    drivers: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchDriverStatus = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);

    try {
      const data = await getRealTimeDriverStatus();
      setDriverStatus(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching driver status:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDriverStatus();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDriverStatus(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDriverStatus]);

  // Socket.IO event listeners for real-time updates
  useEffect(() => {
    // Check if socket is available
    const socket = socketService.getSocket();
    if (!socket || !socketService.isConnected()) {
      console.log('Socket not available for RealTimeDriverStatus');
      return;
    }

    const handleDriverOnline = (driver) => {
      setDriverStatus(prev => {
        const updatedDrivers = prev.drivers.map(d =>
          d.id === driver.id ? { ...d, status: 'online', lastActive: new Date().toISOString() } : d
        );

        const counts = updatedDrivers.reduce((acc, d) => {
          acc[d.status] = (acc[d.status] || 0) + 1;
          return acc;
        }, { online: 0, busy: 0, offline: 0 });

        return {
          ...prev,
          drivers: updatedDrivers,
          ...counts,
          total: updatedDrivers.length
        };
      });
    };

    const handleDriverOffline = (driver) => {
      setDriverStatus(prev => {
        const updatedDrivers = prev.drivers.map(d =>
          d.id === driver.id ? { ...d, status: 'offline', lastActive: new Date().toISOString() } : d
        );

        const counts = updatedDrivers.reduce((acc, d) => {
          acc[d.status] = (acc[d.status] || 0) + 1;
          return acc;
        }, { online: 0, busy: 0, offline: 0 });

        return {
          ...prev,
          drivers: updatedDrivers,
          ...counts,
          total: updatedDrivers.length
        };
      });
    };

    const handleDriverBusy = (driver) => {
      setDriverStatus(prev => {
        const updatedDrivers = prev.drivers.map(d =>
          d.id === driver.id ? { ...d, status: 'busy', lastActive: new Date().toISOString() } : d
        );

        const counts = updatedDrivers.reduce((acc, d) => {
          acc[d.status] = (acc[d.status] || 0) + 1;
          return acc;
        }, { online: 0, busy: 0, offline: 0 });

        return {
          ...prev,
          drivers: updatedDrivers,
          ...counts,
          total: updatedDrivers.length
        };
      });
    };

    // Listen for real-time events
    socket.on('driver:online', handleDriverOnline);
    socket.on('driver:offline', handleDriverOffline);
    socket.on('driver:busy', handleDriverBusy);

    return () => {
      if (socket) {
        socket.off('driver:online', handleDriverOnline);
        socket.off('driver:offline', handleDriverOffline);
        socket.off('driver:busy', handleDriverBusy);
      }
    };
  }, []);

  const statusCards = [
    {
      title: 'Online',
      count: driverStatus.online,
      color: 'bg-green-500',
      icon: '🟢'
    },
    {
      title: 'Busy',
      count: driverStatus.busy,
      color: 'bg-red-500',
      icon: '🔴'
    },
    {
      title: 'Offline',
      count: driverStatus.offline,
      color: 'bg-gray-500',
      icon: '⚫'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Driver Status</h2>
          <p className="text-sm text-gray-600">
            Real-time driver availability
            {lastUpdate && (
              <span className="ml-2 text-xs text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => fetchDriverStatus()}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors opacity-60 hover:opacity-100"
          title="Refresh"
        >
          <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {statusCards.map((card, index) => (
          <div key={`status-${card.title}-${index}`} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.count}</p>
              </div>
              <div className={`w-8 h-8 rounded-full ${card.color} flex items-center justify-center text-white text-sm`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Recent Activity</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {driverStatus.drivers.slice(0, 5).map((driver, index) => (
            <div key={driver._id || driver.id || `driver-status-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(driver.status).split(' ')[0]}`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                  <p className="text-xs text-gray-500">{driver.currentLocation}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs px-2 py-1 rounded-full ${getStatusColor(driver.status)}`}>
                  {getStatusText(driver.status)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(driver.lastActive).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealTimeDriverStatus;
