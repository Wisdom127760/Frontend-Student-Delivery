import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SessionWarning = ({ isVisible, timeLeft, onExtend, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    if (isVisible && timeLeft <= 300) { // 5 minutes warning
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isVisible, timeLeft]);

  const handleExtend = () => {
    onExtend();
    setIsOpen(false);
    toast.success('Session extended!');
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    onLogout();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Session Timeout Warning
          </h3>
          
          <p className="text-gray-600 mb-6">
            Your session will expire in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} minutes.
            Would you like to extend your session?
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={handleExtend}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            >
              Extend Session
            </button>
            
            <button
              onClick={handleLogout}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionWarning;
