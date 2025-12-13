import { useState } from 'react';
import { User, Mail, Phone, Calendar, Save } from 'lucide-react';
import { mockUserProfile } from '../data/dummyData';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    firstName: mockUserProfile.firstName,
    lastName: mockUserProfile.lastName,
    email: mockUserProfile.email,
    phone: mockUserProfile.phone,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      // In real app, update the user profile via API
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your personal information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-white/10">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0">
                <img
                  src={mockUserProfile.avatar}
                  alt={`${mockUserProfile.firstName} ${mockUserProfile.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">
                  {mockUserProfile.firstName} {mockUserProfile.lastName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Member since{' '}
                  {new Date(mockUserProfile.dateJoined).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 font-semibold hover:border-brand-black dark:hover:border-brand-accent hover:bg-brand-accent/5 dark:hover:bg-brand-accent/10 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                    />
                  ) : (
                    <p className="text-sm font-semibold py-2.5">{formData.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                    />
                  ) : (
                    <p className="text-sm font-semibold py-2.5">{formData.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                  />
                ) : (
                  <p className="text-sm font-semibold py-2.5">{formData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                  />
                ) : (
                  <p className="text-sm font-semibold py-2.5">{formData.phone}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      firstName: mockUserProfile.firstName,
                      lastName: mockUserProfile.lastName,
                      email: mockUserProfile.email,
                      phone: mockUserProfile.phone,
                    });
                  }}
                  className="px-6 py-3 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <h2 className="text-xl font-bold mb-4">Account Statistics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Orders</p>
                <p className="text-2xl font-black">{mockUserProfile.totalOrders}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Spent</p>
                <p className="text-2xl font-black">{mockUserProfile.totalSpent.toLocaleString()} NPR</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

