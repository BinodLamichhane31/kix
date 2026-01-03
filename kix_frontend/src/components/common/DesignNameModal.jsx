import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function DesignNameModal({ isOpen, onClose, onSave, defaultName = '' }) {
  const [name, setName] = useState(defaultName);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      // Focus input after modal opens
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, defaultName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      setName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              Save Your Design
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <X size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Design Name
              </label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., My Custom Sneaker"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-brand-black dark:focus:border-brand-accent focus:outline-none transition-colors"
                maxLength={100}
                required
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {name.length}/100 characters
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black text-sm font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Design
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


