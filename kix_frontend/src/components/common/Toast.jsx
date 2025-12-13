import { useEffect } from 'react';
import { Check, X } from 'lucide-react';

export default function Toast({
  message,
  isVisible,
  onClose,
  type = 'success',
  autoDismissDuration = 3000,
}) {
  useEffect(() => {
    if (isVisible && typeof autoDismissDuration === 'number' && autoDismissDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoDismissDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, autoDismissDuration]);

  if (!isVisible) return null;

  const bgColor = type === 'success' 
    ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
    : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700';

  const textColor = type === 'success'
    ? 'text-green-700 dark:text-green-300'
    : 'text-red-700 dark:text-red-300';

  return (
    <div className="fixed z-50 transition-all duration-300 ease-in-out transform top-24 right-4">
      <div className={`${bgColor} border rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px] max-w-md`}>
        {type === 'success' ? (
          <div className="flex items-center justify-center flex-shrink-0 w-5 h-5 bg-green-500 rounded-full">
            <Check size={14} className="text-white" />
          </div>
        ) : (
          <div className="flex items-center justify-center flex-shrink-0 w-5 h-5 bg-red-500 rounded-full">
            <X size={14} className="text-white" />
          </div>
        )}
        <p className={`flex-1 text-sm font-medium ${textColor}`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 ${textColor}`}
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

