import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Bell,
  User,
  Wrench,
  BarChart3,
  Users,
  Building2,
  QrCode,
  FileSpreadsheet,
  LogOut,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import NotificationDropdown from '../components/NotificationDropdown';
import QRScannerModal from '../components/QRScannerModal';

export const AppLayout = () => {
  const { user, logout, isStudent, isStaff, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
        { label: 'All Complaints', to: '/admin/reports', icon: ClipboardList },
        { label: 'Users', to: '/admin/users', icon: Users },
        { label: 'Departments', to: '/admin/departments', icon: Building2 },
        { label: 'QR Printouts', to: '/admin/qr-management', icon: QrCode },
      ];
    }
    if (isStaff) {
      return [
        { label: 'Assigned Work', to: '/staff/dashboard', icon: Wrench },
        { label: 'All Campus Issues', to: '/student/complaints', icon: ClipboardList },
        { label: 'Notifications', to: '/student/notifications', icon: Bell },
        { label: 'Profile', to: '/profile', icon: User },
      ];
    }
    // Default Student links
    return [
      { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
      { label: 'Report Issue', to: '/student/report', icon: PlusCircle, highlight: true },
      { label: 'My Complaints', to: '/student/complaints', icon: ClipboardList },
      { label: 'Notifications', to: '/student/notifications', icon: Bell },
      { label: 'Profile', to: '/profile', icon: User },
    ];
  };

  const navLinks = getNavLinks();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-blue-600 group-hover:bg-blue-700 transition-colors flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                    CampusFix
                  </span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
                    Smart Facility Ops
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Items */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 shadow-xs'
                          : item.highlight
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Controls & Profile */}
            <div className="flex items-center gap-3">
              {/* Scan Classroom QR Quick Button */}
              <button
                type="button"
                onClick={() => setIsQRModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-colors"
                title="Scan QR on classroom door"
              >
                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                <span>Scan Room QR</span>
              </button>

              {/* Notification Dropdown */}
              <NotificationDropdown />

              {/* User Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user?.first_name ? user.first_name[0] : (user?.username ? user.username[0].toUpperCase() : 'U')}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email}
                  </span>
                  <span className="text-[10px] font-medium uppercase text-blue-600 tracking-wider">
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Subnav */}
        <div className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Global QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />

      {/* Sleek Minimal Footer */}
      <footer className="border-t border-slate-200/80 bg-white/50 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 CampusFix – Smart College Issue Reporting & Tracking System.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Powered by Django 5 & React 19</span>
            <span>•</span>
            <span>Cloudinary Storage</span>
            <span>•</span>
            <span>SimpleJWT Auth</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default AppLayout;
