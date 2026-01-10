import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, Check, Loader2 } from 'lucide-react';
import * as addressService from '../../../services/api/address.service';
import { useToast } from '../../../store/contexts/ToastContext';

export default function AddressesPage() {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    landmark: '',
    city: '',
    postalCode: '',
    country: 'Nepal',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getAddresses();
      setAddresses(data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      showToast(error.message || 'Failed to load addresses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const updatedAddress = await addressService.setDefaultAddress(addressId);
      await loadAddresses(); // Reload to get updated data
      showToast('Default address updated successfully', 'success');
    } catch (error) {
      console.error('Error setting default address:', error);
      showToast(error.message || 'Failed to set default address', 'error');
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await addressService.deleteAddress(addressId);
      await loadAddresses(); // Reload to get updated data
      showToast('Address deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting address:', error);
      showToast(error.message || 'Failed to delete address', 'error');
    }
  };

  const handleEdit = (address) => {
    setEditingId(address._id);
    setFormData({
      label: address.label || '',
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      email: address.email || '',
      address: address.address || '',
      landmark: address.landmark || '',
      city: address.city || '',
      postalCode: address.postalCode || '',
      country: address.country || 'Nepal',
      phone: address.phone || '',
      isDefault: address.isDefault || false,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingId) {
        await addressService.updateAddress(editingId, formData);
        showToast('Address updated successfully', 'success');
        setEditingId(null);
      } else {
        await addressService.addAddress(formData);
        showToast('Address added successfully', 'success');
        setIsAdding(false);
      }
      
      // Reset form
      setFormData({
        label: '',
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        landmark: '',
        city: '',
        postalCode: '',
        country: 'Nepal',
        phone: '',
        isDefault: false,
      });
      
      // Reload addresses
      await loadAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      showToast(error.message || 'Failed to save address', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      label: '',
      firstName: '',
      lastName: '',
      email: '',
      address: '',
      landmark: '',
      city: '',
      postalCode: '',
      country: 'Nepal',
      phone: '',
      isDefault: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Addresses</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your shipping addresses
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
          >
            <Plus size={18} />
            Add Address
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-4"
        >
          <h2 className="text-xl font-bold">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Label
            </label>
            <input
              type="text"
              required
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="Home, Work, Office..."
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                First Name
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Last Name
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Address
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Nearest Landmark <span className="font-normal normal-case">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              placeholder="e.g., Near Central Hospital"
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                City
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                required
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Country
              </label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Phone
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Address'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-3 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:border-gray-300 dark:hover:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-brand-black dark:text-brand-accent" />
        </div>
      )}

      {/* Addresses Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`bg-white dark:bg-brand-gray rounded-2xl border p-6 ${
                address.isDefault
                  ? 'border-brand-black dark:border-brand-accent'
                  : 'border-gray-200 dark:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-brand-black dark:text-brand-accent" />
                  <div>
                    <h3 className="font-bold">{address.label}</h3>
                    {address.isDefault && (
                      <span className="text-xs font-semibold text-brand-black dark:text-brand-accent">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(address._id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="text-sm space-y-1 mb-4">
                <p className="font-semibold">
                  {address.firstName} {address.lastName}
                </p>
                {address.email && (
                  <p className="text-gray-600 dark:text-gray-400">{address.email}</p>
                )}
                <p className="text-gray-600 dark:text-gray-400">{address.address}</p>
                {address.landmark && (
                  <p className="text-gray-500 dark:text-gray-500 italic">
                    Near: {address.landmark}
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-400">
                  {address.city}, {address.postalCode}
                </p>
                <p className="text-gray-600 dark:text-gray-400">{address.country}</p>
                <p className="text-gray-600 dark:text-gray-400">{address.phone}</p>
              </div>

              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefault(address._id)}
                  className="w-full px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-white/10 rounded-lg hover:border-brand-black dark:hover:border-brand-accent hover:bg-brand-accent/5 dark:hover:bg-brand-accent/10 transition-colors"
                >
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && addresses.length === 0 && !isAdding && (
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-12 text-center">
          <MapPin size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-lg font-semibold mb-2">No addresses saved</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Add your first shipping address to get started
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
          >
            <Plus size={18} />
            Add Address
          </button>
        </div>
      )}
    </div>
  );
}

