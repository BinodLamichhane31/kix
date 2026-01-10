import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Save, Loader2 } from 'lucide-react';
import * as userService from '../../../services/api/user.service';
import { formatPrice } from '../../../utils/currency';
import { useToast } from '../../../store/contexts/ToastContext';
import { useAuth } from '../../../store/contexts/AuthContext';

export default function ProfilePage() {
  const { showToast } = useToast();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await userService.getProfile();
      setProfile(profileData);
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      showToast(error.message || 'Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updatedProfile = await userService.updateProfile(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      
      // Update auth context with new user data
      if (updateUser) {
        updateUser({
          name: updatedProfile.name,
          email: updatedProfile.email,
        });
      }
      
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const formatName = (name) => {
    if (!name) return { firstName: '', lastName: '' };
    const parts = name.trim().split(' ');
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return { firstName, lastName };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="mx-auto animate-spin text-brand-black dark:text-brand-accent" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-semibold mb-2">Failed to load profile</p>
      </div>
    );
  }

  const nameParts = formatName(profile.name);

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
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                <User size={48} className="text-gray-400 dark:text-gray-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">
                  {nameParts.firstName} {nameParts.lastName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Member since{' '}
                  {new Date(profile.createdAt || profile.dateJoined).toLocaleDateString('en-US', {
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
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-sm font-semibold py-2.5">{formData.name || 'N/A'}</p>
                )}
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
                  <p className="text-sm font-semibold py-2.5">{formData.email || 'N/A'}</p>
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
                      name: profile.name || '',
                      email: profile.email || '',
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
                <p className="text-2xl font-black">{profile.totalOrders || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Spent</p>
                <p className="text-2xl font-black">{formatPrice(profile.totalSpent || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

