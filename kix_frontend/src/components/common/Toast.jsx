import { useEffect } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

export function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: Check,
    error: X,
    warning: AlertCircle,
    info: Info,
  };

  const styles = {
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  };

  const Icon = icons[type] || Info;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm min-w-[300px] max-w-md animate-in slide-in-from-top-5 ${styles[type]}`}
    >
      <Icon size={20} className="flex-shrink-0" />
      <p className="flex-1 text-sm font-semibold">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}
