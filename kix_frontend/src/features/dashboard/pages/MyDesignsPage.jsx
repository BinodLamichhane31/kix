import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Palette,
  Sparkles,
  Clock,
  Share2,
  Trash2,
  Edit3,
  Layers,
} from 'lucide-react';
import { mockDesigns } from '../data/dummyData';
import { appRoutes } from '../../../utils/navigation';

const statusFilters = [
  { id: 'all', label: 'All designs' },
  { id: 'production', label: 'Production ready' },
  { id: 'draft', label: 'Drafts' },
];

export default function MyDesignsPage() {
  const [filter, setFilter] = useState('all');
  const [designs, setDesigns] = useState(mockDesigns);
  const navigate = useNavigate();

  const filteredDesigns = useMemo(() => {
    if (filter === 'all') return designs;
    return designs.filter((design) => design.status === filter);
  }, [designs, filter]);

  const designStats = useMemo(() => {
    const total = designs.length;
    const production = designs.filter((d) => d.status === 'production').length;
    const drafts = designs.filter((d) => d.status === 'draft').length;
    const savedEdits = designs.reduce((sum, d) => sum + d.totalEdits, 0);
    return [
      {
        label: 'Saved designs',
        value: total,
        icon: Palette,
      },
      {
        label: 'Production ready',
        value: production,
        icon: Sparkles,
      },
      {
        label: 'Drafts',
        value: drafts,
        icon: Layers,
      },
      {
        label: 'Total edits',
        value: savedEdits,
        icon: Clock,
      },
    ];
  }, [designs]);

  const handleOpenDesigner = () => {
    navigate(appRoutes.customizeSneaker);
  };

  const handleDuplicate = (design) => {
    const timestamp = Date.now();
    const clone = {
      ...design,
      id: `${design.id}_copy_${timestamp}`,
      name: `${design.name} Copy`,
      status: 'draft',
      lastEdited: new Date().toISOString(),
    };
    setDesigns((prev) => [clone, ...prev]);
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove this design from your library?')) {
      setDesigns((prev) => prev.filter((design) => design.id !== id));
    }
  };

  const formatDate = (value) =>
    new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">My Designs</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            Keep your sneaker experiments organized and pick up exactly where you left off.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenDesigner}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
          >
            <Palette size={18} />
            Start new build
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {designStats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {label}
              </p>
              <p className="text-2xl font-black">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-brand-gray rounded-2xl border border-gray-200 dark:border-white/10 p-4 flex flex-wrap items-center gap-2">
        {statusFilters.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === item.id
                ? 'bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black'
                : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filteredDesigns.length === 0 ? (
        <div className="bg-white dark:bg-brand-gray rounded-2xl border border-dashed border-gray-300 dark:border-white/20 p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <Palette size={28} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold">No designs here yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Save your creations from the customization studio to build your personal library.
          </p>
          <button
            onClick={handleOpenDesigner}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
          >
            <Sparkles size={18} />
            Launch studio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDesigns.map((design) => (
            <article
              key={design.id}
              className="bg-white dark:bg-brand-gray rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col hover:border-gray-300 dark:hover:border-white/20 transition-colors"
            >
              <div className="relative aspect-video bg-gray-100 dark:bg-white/5">
                <img
                  src={design.thumbnail}
                  alt={design.name}
                  className="w-full h-full object-cover"
                />
                <span
                  className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
                    design.status === 'production'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                  }`}
                >
                  {design.status === 'production' ? 'Production ready' : 'Draft'}
                </span>
                <div
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full border-2 border-white dark:border-brand-gray"
                  style={{ backgroundColor: design.accent }}
                />
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black">{design.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {design.baseModel}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDuplicate(design)}
                    className="text-xs font-semibold text-brand-black dark:text-brand-accent hover:underline"
                  >
                    Duplicate
                  </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {design.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {design.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="bg-gray-50 dark:bg-brand-black/30 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Color recipe</span>
                    <span>Last edit: {formatDate(design.lastEdited)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {design.colors.map((entry) => (
                      <div
                        key={entry.label}
                        className="flex items-center gap-3"
                      >
                        <div
                          className="w-8 h-8 rounded-xl border border-gray-200 dark:border-white/10"
                          style={{ backgroundColor: entry.value }}
                        />
                        <div>
                          <p className="text-xs font-semibold">{entry.label}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {entry.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2 mt-auto border-t border-gray-100 dark:border-white/5 pt-4">
                  <button
                    onClick={handleOpenDesigner}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black font-semibold text-sm hover:bg-brand-accent dark:hover:bg-white transition-colors"
                  >
                    <Edit3 size={16} />
                    Customize
                  </button>
                  <button
                    onClick={() => alert('Share link copied!')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold hover:border-gray-300 dark:hover:border-white/20"
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                  <button
                    onClick={() => handleDelete(design.id)}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold hover:border-red-300 dark:hover:border-red-500 text-red-600 dark:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}





