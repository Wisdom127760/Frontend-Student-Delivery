import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SimpleNotifications from '../admin/SimpleNotifications';
import Avatar from '../common/Avatar';
import GlobalSearch from '../common/GlobalSearch';
import {
    ChartBarIcon,
    TruckIcon,
    UserGroupIcon,
    UserCircleIcon,
    HomeIcon,
    ChevronDownIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    CurrencyDollarIcon,
    ShieldCheckIcon,
    XMarkIcon,
    DocumentTextIcon,
    MagnifyingGlassIcon,
    CommandLineIcon
} from '@heroicons/react/24/outline';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();



    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Deliveries', href: '/admin/deliveries', icon: TruckIcon },
        { name: 'Drivers', href: '/admin/drivers', icon: UserGroupIcon },
        { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
        // Only show earnings management for super admins
        ...(user?.role === 'super_admin' ? [{ name: 'Earnings', href: '/admin/earnings', icon: CurrencyDollarIcon }] : []),
        // Only show remittances for super admins
        ...(user?.role === 'super_admin' ? [{ name: 'Remittances', href: '/admin/remittances', icon: DocumentTextIcon }] : []),
        // Only show admin management for super admins
        ...(user?.role === 'super_admin' ? [{ name: 'Admin Management', href: '/admin/admins', icon: ShieldCheckIcon }] : []),
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Updated isActive logic for better path matching
    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
                    <div className="flex items-center">
                        <img
                            src="/White.svg"
                            alt="Student Delivery Logo"
                            className="w-10 h-10 object-contain rounded-xl shadow-lg"
                        />
                        <h1 className="ml-3 text-xl font-bold text-gray-900">Admin Panel</h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 mt-8 px-4 overflow-y-auto">
                    <div className="space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${active
                                        ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-l-4 border-primary-600 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                                        }`}
                                >
                                    <Icon className={`mr-3 h-5 w-5 transition-colors ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                                        }`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 lg:ml-0">
                {/* Top Navigation */}
                <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Global Search Trigger */}
                        <button
                            onClick={() => {
                                // This will be handled by the GlobalSearch component's keyboard listener
                                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
                            }}
                            className="group flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 border border-gray-200/50 hover:border-gray-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <MagnifyingGlassIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            <span className="hidden sm:inline">Search</span>
                            <div className="hidden sm:flex items-center space-x-1 text-xs bg-gray-100 px-2 py-1 rounded-md">
                                <CommandLineIcon className="h-3 w-3" />
                                <span className="font-medium">K</span>
                            </div>
                        </button>

                        {/* Notifications */}
                        <SimpleNotifications />

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Avatar user={user} size="md" />
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-semibold text-gray-900 capitalize">{user?.name || 'Admin User'}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* User Dropdown Menu */}
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                navigate('/admin/profile');
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <UserCircleIcon className="mr-3 h-4 w-4" />
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                navigate('/admin/settings');
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Cog6ToothIcon className="mr-3 h-4 w-4" />
                                            Settings
                                        </button>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Click outside to close user menu */}
            {userMenuOpen && (
                <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
            )}

            {/* Global Search Modal */}
            <GlobalSearch />
        </div>
    );
};

export default AdminLayout; 