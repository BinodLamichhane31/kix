import { useState } from 'react';
import { Bell, Lock, Shield, Trash2, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../store/contexts/ThemeContext';

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    orderUpdates: true,
    promotions: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
  });

  const handleNotificationChange = (key, value) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      // In real app, handle account deletion
      console.log('Account deletion requested');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            {isDark ? <Moon size={20} className="text-brand-black dark:text-brand-accent" /> : <Sun size={20} className="text-brand-black dark:text-brand-accent" />}
            <h2 className="text-xl font-bold">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1">Theme</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Switch between light and dark mode
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
            >
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell size={20} className="text-brand-black dark:text-brand-accent" />
            <h2 className="text-xl font-bold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <div>
                <p className="font-semibold mb-1">Email Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive updates via email
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) => handleNotificationChange('email', e.target.checked)}
                className="w-5 h-5 rounded accent-brand-accent"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <div>
                <p className="font-semibold mb-1">SMS Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive updates via SMS
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                className="w-5 h-5 rounded accent-brand-accent"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <div>
                <p className="font-semibold mb-1">Order Updates</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified about order status changes
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.orderUpdates}
                onChange={(e) => handleNotificationChange('orderUpdates', e.target.checked)}
                className="w-5 h-5 rounded accent-brand-accent"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <div>
                <p className="font-semibold mb-1">Promotions & Offers</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive promotional emails and offers
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.promotions}
                onChange={(e) => handleNotificationChange('promotions', e.target.checked)}
                className="w-5 h-5 rounded accent-brand-accent"
              />
            </label>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={20} className="text-brand-black dark:text-brand-accent" />
            <h2 className="text-xl font-bold">Privacy</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Profile Visibility</label>
              <select
                value={privacy.profileVisibility}
                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <div>
                <p className="font-semibold mb-1">Show Email</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Allow others to see your email address
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacy.showEmail}
                onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                className="w-5 h-5 rounded accent-brand-accent"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <div>
                <p className="font-semibold mb-1">Show Phone</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Allow others to see your phone number
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacy.showPhone}
                onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                className="w-5 h-5 rounded accent-brand-accent"
              />
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock size={20} className="text-brand-black dark:text-brand-accent" />
            <h2 className="text-xl font-bold">Security</h2>
          </div>
          <div className="space-y-4">
            <button className="w-full sm:w-auto px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors">
              Change Password
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last changed: 3 months ago
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-red-200 dark:border-red-900/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 size={20} className="text-red-500" />
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">Delete Account</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

