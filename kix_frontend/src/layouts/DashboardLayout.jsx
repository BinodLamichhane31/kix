import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  User, 
  MapPin, 
  Heart, 
  Palette,
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { appRoutes } from '../utils/navigation';
import { useAuth } from '../store/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutDialog from '../components/common/LogoutDialog';
import { Toast } from '../components/common/Toast';

const navigationItems = [
  { 
    id: 'overview', 
    label: 'Overview', 
    icon: LayoutDashboard, 
    path: '/dashboard' 
  },
  { 
    id: 'orders', 
    label: 'Orders', 
    icon: Package, 
    path: '/dashboard/orders' 
  },
  { 
    id: 'profile', 
    label: 'Profile', 
    icon: User, 
    path: '/dashboard/profile' 
  },
  { 
    id: 'addresses', 
    label: 'Addresses', 
    icon: MapPin, 
    path: '/dashboard/addresses' 
  },
  { 
    id: 'wishlist', 
    label: 'Wishlist', 
    icon: Heart, 
    path: '/dashboard/wishlist' 
  },
  { 
    id: 'designs', 
    label: 'My Designs', 
    icon: Palette, 
    path: '/dashboard/designs' 
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    path: '/dashboard/settings' 
  },
];

export default function DashboardLayout() {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setIsLogoutDialogOpen(false);
    setShowToast(true);
    // Navigate after showing toast
    setTimeout(() => {
      navigate(appRoutes.root);
    }, 500);
  };

  const handleLogoutCancel = () => {
    setIsLogoutDialogOpen(false);
  };

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-black text-gray-900 dark:text-white">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-brand-gray border-b border-gray-200 dark:border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-black">Dashboard</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-brand-gray border-r border-gray-200 dark:border-white/10 z-40 transition-transform duration-300 overflow-y-auto`}
        >
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-black tracking-tight">
                KIX<span className="text-brand-accent">.</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                My Account
              </p>
            </div>

            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                      active
                        ? 'bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                    {active && (
                      <ChevronRight size={16} className="ml-auto" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-h-screen pt-24 lg:pt-0 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message="Logged out successfully"
          onClose={() => setShowToast(false)}
          type="success"
          duration={3000}
        />
      )}
    </div>
  );
}

