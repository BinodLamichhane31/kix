import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' or 'warning'
}) {
  if (!isOpen) return null;

  const bgColor = type === 'danger'
    ? 'bg-red-50 dark:bg-red-900/20'
    : 'bg-yellow-50 dark:bg-yellow-900/20';
  
  const borderColor = type === 'danger'
    ? 'border-red-200 dark:border-red-800'
    : 'border-yellow-200 dark:border-yellow-800';
  
  const iconColor = type === 'danger'
    ? 'text-red-600 dark:text-red-400'
    : 'text-yellow-600 dark:text-yellow-400';
  
  const buttonBg = type === 'danger'
    ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
    : 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600';

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-brand-gray rounded-2xl border-2 ${borderColor} max-w-md w-full ${bgColor}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${type === 'danger' ? 'bg-red-100 dark:bg-red-900/40' : 'bg-yellow-100 dark:bg-yellow-900/40'} flex items-center justify-center`}>
              <AlertTriangle size={24} className={iconColor} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex-shrink-0"
            >
              <X size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-900 dark:text-white"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-6 py-3 ${buttonBg} text-white rounded-xl font-semibold transition-colors`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}












