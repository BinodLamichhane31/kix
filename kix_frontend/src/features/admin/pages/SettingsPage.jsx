import { Settings, Bell, Shield, Database, Mail } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage admin panel settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings size={20} className="text-brand-black dark:text-brand-accent" />
            <h2 className="text-xl font-bold">General Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Store Name</label>
              <input
                type="text"
                defaultValue="KIX"
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Store Email</label>
              <input
                type="email"
                defaultValue="admin@kix.com"
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Currency</label>
              <select className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors">
                <option value="NPR">Nepali Rupee (NPR)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
            </div>
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
                  Receive email alerts for new orders
                </p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-brand-accent" />
            </label>

            <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <div>
                <p className="font-semibold mb-1">Low Stock Alerts</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified when products are running low
                </p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-brand-accent" />
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={20} className="text-brand-black dark:text-brand-accent" />
            <h2 className="text-xl font-bold">Security</h2>
          </div>
          <div className="space-y-4">
            <button className="w-full sm:w-auto px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors">
              Change Password
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last changed: 2 months ago
            </p>
          </div>
        </div>

        {/* System */}
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database size={20} className="text-brand-black dark:text-brand-accent" />
            <h2 className="text-xl font-bold">System</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">Database Backup</p>
              <button className="px-6 py-3 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:border-gray-300 dark:hover:border-white/20 transition-colors">
                Create Backup
              </button>
            </div>
            <div>
              <p className="font-semibold mb-2">Last Backup</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                3 days ago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

