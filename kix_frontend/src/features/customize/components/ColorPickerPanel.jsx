import { Palette, RotateCcw } from 'lucide-react';

const colorParts = [
  {
    key: 'laces',
    label: 'Laces',
    description: 'Shoe laces',
    icon: '🎀',
  },
  {
    key: 'logo',
    label: 'Logo',
    description: 'Brand logo',
    icon: '🏷️',
  },
  {
    key: 'heel',
    label: 'Heel',
    description: 'Heel section',
    icon: '👠',
  },
  {
    key: 'tongue',
    label: 'Tongue',
    description: 'Tongue section',
    icon: '👅',
  },
  {
    key: 'soleUpper',
    label: 'Upper Sole',
    description: 'Upper outsole',
    icon: '👟',
  },
  {
    key: 'soleLower',
    label: 'Lower Sole',
    description: 'Midsole',
    icon: '⬇️',
  },
  {
    key: 'upperBody',
    label: 'Upper Body',
    description: 'Main upper body',
    icon: '🧵',
  },
  {
    key: 'stitching',
    label: 'Stitching',
    description: 'Stitching & seams',
    icon: '🪡',
  },
  {
    key: 'innerPadding',
    label: 'Inner Padding',
    description: 'Inside lining',
    icon: '🛡️',
  },
];

export default function ColorPickerPanel({ colors, onColorChange, onReset }) {
  return (
    <div className="bg-white dark:bg-brand-gray rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-brand-accent/5 to-transparent dark:from-brand-accent/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-accent to-brand-accent/70 flex items-center justify-center shadow-lg">
            <Palette size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black">Color Customizer</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">9 customizable parts</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {colorParts.map((part) => (
          <div
            key={part.key}
            className="group p-4 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-brand-accent/50 dark:hover:border-brand-accent/50 hover:shadow-lg dark:hover:shadow-xl transition-all bg-gradient-to-br from-white to-gray-50/50 dark:from-brand-gray dark:to-brand-black/50"
          >
            <label className="block cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{part.icon}</div>
                  <div>
                    <p className="font-bold text-sm">{part.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{part.description}</p>
                  </div>
                </div>
                <div
                  className="w-12 h-12 rounded-xl border-2 border-gray-300 dark:border-white/30 shadow-lg flex-shrink-0 ring-2 ring-white dark:ring-brand-black group-hover:ring-brand-accent/50 transition-all"
                  style={{ backgroundColor: colors[part.key] }}
                />
              </div>
              <div className="relative">
                <input
                  type="color"
                  value={colors[part.key]}
                  onChange={(e) => onColorChange(part.key, e.target.value)}
                  className="w-full h-14 rounded-xl border-2 border-gray-200 dark:border-white/10 cursor-pointer hover:border-brand-accent/50 transition-all shadow-sm hover:shadow-md appearance-none overflow-hidden"
                  style={{
                    backgroundColor: colors[part.key],
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xs font-bold text-white drop-shadow-lg mix-blend-difference">
                    {colors[part.key].toUpperCase()}
                  </span>
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>

      {/* Quick Presets */}
      <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-gradient-to-t from-gray-50/50 to-transparent dark:from-brand-black/50">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Quick Presets
          </p>
          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-brand-black dark:hover:text-brand-accent transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            >
              <RotateCcw size={12} />
              Reset All
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { 
              name: 'Classic', 
              colors: { laces: '#ffffff', logo: '#000000', upperBody: '#ffffff', soleUpper: '#000000', soleLower: '#ffffff', heel: '#ffffff', tongue: '#ffffff', stitching: '#000000', innerPadding: '#ffffff' },
              gradient: 'from-white to-gray-100'
            },
            { 
              name: 'Black', 
              colors: { laces: '#ffffff', logo: '#ffffff', upperBody: '#000000', soleUpper: '#000000', soleLower: '#2a2a2a', heel: '#000000', tongue: '#000000', stitching: '#ffffff', innerPadding: '#1a1a1a' },
              gradient: 'from-gray-900 to-black'
            },
            { 
              name: 'Sport', 
              colors: { laces: '#3b82f6', logo: '#3b82f6', upperBody: '#ffffff', soleUpper: '#3b82f6', soleLower: '#ffffff', heel: '#ffffff', tongue: '#ffffff', stitching: '#3b82f6', innerPadding: '#f0f9ff' },
              gradient: 'from-blue-500 to-blue-600'
            },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                Object.entries(preset.colors).forEach(([key, value]) => {
                  onColorChange(key, value);
                });
              }}
              className={`relative px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-white/10 hover:border-brand-accent dark:hover:border-brand-accent hover:shadow-lg transition-all text-xs font-bold overflow-hidden group bg-gradient-to-br ${preset.gradient}`}
            >
              <span className="relative z-10 text-white drop-shadow-lg">{preset.name}</span>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

