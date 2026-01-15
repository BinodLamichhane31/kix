import { X, RotateCw, Maximize2 } from 'lucide-react';
import ShoeViewer from './ShoeViewer';
import { Suspense } from 'react';

export default function DesignPreviewModal({ isOpen, onClose, design, title }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-brand-gray rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-[70]">
          <div className="bg-white/90 dark:bg-brand-black/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
            <h2 className="text-sm font-black text-brand-black dark:text-white uppercase tracking-tight">
              {title || 'Design Preview'}
            </h2>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-10 h-10 bg-white/90 dark:bg-brand-black/80 backdrop-blur-md rounded-2xl flex items-center justify-center border border-gray-200 dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-500 transition-colors cursor-pointer"
            aria-label="Close preview"
          >
            <X size={20} />
          </button>
        </div>

        {/* 3D Viewer Area */}
        <div className="aspect-[4/3] sm:aspect-video w-full flex items-center justify-center bg-gray-50 dark:bg-brand-black/40">
          <Suspense fallback={
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin" />
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Initialising 3D Scene</p>
            </div>
          }>
            <ShoeViewer 
              colors={design.colors} 
              interactive={true} 
              autoRotate={true}
            />
          </Suspense>
        </div>

        {/* Footer/Instructions */}
        <div className="p-6 bg-gray-50 dark:bg-brand-black/20 border-t border-gray-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <RotateCw size={14} />
              <span>Drag to rotate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 size={14} />
              <span>Scroll to zoom</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {Object.entries(design.colors || {}).slice(0, 5).map(([part, color]) => (
              <div 
                key={part}
                className="w-4 h-4 rounded-full border border-gray-200 dark:border-white/20 shadow-inner"
                style={{ backgroundColor: color }}
                title={part}
              />
            ))}
            {Object.keys(design.colors || {}).length > 5 && (
              <span className="text-[10px] font-bold text-gray-400">+{Object.keys(design.colors).length - 5}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
