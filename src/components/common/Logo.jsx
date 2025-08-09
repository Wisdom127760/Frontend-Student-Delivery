import React from 'react';

const Logo = ({ className = '', size = 'default' }) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    default: 'h-10 w-10',
    large: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>

      <span className="font-bold text-xl text-gray-900">Student Delivery</span>
    </div>
  );
};

export default Logo;
