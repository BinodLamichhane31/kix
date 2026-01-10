import { useState, useMemo, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import * as userService from '../../../services/api/user.service';
import { formatPrice } from '../../../utils/currency';
import { useToast } from '../../../store/contexts/ToastContext';

// User status mapping
const userStatusMap = {
  active: {
    label: 'Active',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-300',
  },
  inactive: {
    label: 'Inactive',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-300',
  },
};

export default function UsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    loadUsers();
  }, [statusFilter]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
        limit: 50,
      };
      const response = await userService.getAllUsers(filters);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      showToast(error.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }
    const query = searchQuery.toLowerCase();
    return users.filter((user) => {
      const name = user.name || '';
      return (
        name.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    });
  }, [users, searchQuery]);

  const handleStatusToggle = async (userId) => {
    try {
      setUpdatingStatus((prev) => ({ ...prev, [userId]: true }));
      
      const user = users.find((u) => (u._id || u.id) === userId);
      const newStatus = !user.isActive;
      
      await userService.updateUserStatus(userId, newStatus);
      
      // Reload users
      await loadUsers();
      showToast(`User ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error) {
      console.error('Error updating user status:', error);
      showToast(error.message || 'Failed to update user status', 'error');
    } finally {
      setUpdatingStatus((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  const formatName = (name) => {
    if (!name) return 'N/A';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return { firstName, lastName };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Users</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage user accounts and permissions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 text-sm font-medium focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 size={48} className="mx-auto animate-spin text-brand-black dark:text-brand-accent" />
            <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const userId = user._id || user.id;
            const status = userStatusMap[user.isActive ? 'active' : 'inactive'];
            const nameParts = formatName(user.name);
            const isUpdating = updatingStatus[userId];
            
            return (
              <div
                key={userId}
                className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1">
                      {nameParts.firstName} {nameParts.lastName}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${status.bgColor} ${status.textColor}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail size={16} />
                    <span className="truncate">{user.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar size={16} />
                    <span>
                      Joined {new Date(user.createdAt || user.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-white/10 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Orders</span>
                    <span className="font-semibold">{user.totalOrders || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Spent</span>
                    <span className="font-semibold">{formatPrice(user.totalSpent || 0)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleStatusToggle(userId)}
                  disabled={isUpdating}
                  className={`mt-4 w-full px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    user.isActive
                      ? 'border border-gray-200 dark:border-white/10 hover:border-red-300 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
                      : 'bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black hover:bg-brand-accent dark:hover:bg-white'
                  }`}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    user.isActive ? 'Deactivate User' : 'Activate User'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-12 text-center">
          <Users size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-lg font-semibold mb-2">No users found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No users registered yet'}
          </p>
        </div>
      )}
    </div>
  );
}

