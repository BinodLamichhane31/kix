import { useMemo, useState } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { getSeedReviews } from '../data/reviews';

export function ReviewsSection({ contextKey = 'global', title = 'Community reviews' }) {
  const [showDialog, setShowDialog] = useState(false);
  const [reviews, setReviews] = useState(() => getSeedReviews(contextKey));
  const [formState, setFormState] = useState({
    rating: 5,
    body: '',
  });
  const [showAll, setShowAll] = useState(false);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.body) return;

    setReviews((prev) => [
      {
        id: `${contextKey}-${Date.now()}`,
        name: 'Guest reviewer',
        rating: Number(formState.rating),
        title: 'New review',
        body: formState.body,
        date: 'moments ago',
      },
      ...prev,
    ]);
    setFormState({ rating: 5, body: '' });
    setShowDialog(false);
  };

  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <section className="mt-16 bg-white dark:bg-brand-gray rounded-3xl border border-gray-200 dark:border-white/10 p-8 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Reviews</p>
          <h2 className="text-3xl font-black mt-2">{title}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">/ 5</span>
          </div>
          <div className="flex items-center gap-1 text-brand-accent">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={18}
                fill={i < Math.round(avgRating) ? 'currentColor' : 'none'}
                className={i < Math.round(avgRating) ? 'text-brand-accent' : 'text-gray-300 dark:text-gray-600'}
              />
            ))}
          </div>
          <button
            onClick={() => setShowDialog(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-semibold hover:border-brand-black dark:hover:border-brand-accent transition-colors"
          >
            <MessageCircle size={16} />
            Rate & review
          </button>
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-semibold hover:border-brand-black dark:hover:border-brand-accent transition-colors"
          >
            {showAll ? 'Hide reviews' : 'View all'}
          </button>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {visibleReviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{review.name}</p>
              <div className="flex items-center gap-1 text-brand-accent">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < review.rating ? 'currentColor' : 'none'}
                    className={i < review.rating ? 'text-brand-accent' : 'text-gray-300 dark:text-gray-600'}
                  />
                ))}
              </div>
            </div>
            {review.title && <p className="text-sm font-bold">{review.title}</p>}
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">{review.body}</p>
            <p className="text-xs text-gray-400">{review.date || 'Recently'}</p>
          </div>
        ))}
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-brand-gray rounded-[32px] border border-gray-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl w-full max-w-lg space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Share your vibe</p>
              <h3 className="text-2xl font-black">Rate this sneaker</h3>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">How was your experience?</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormState((prev) => ({ ...prev, rating: star }))}
                      className="p-2 text-brand-accent hover:scale-110 transition-transform"
                      aria-label={`Rate ${star} star`}
                    >
                      <Star
                        size={28}
                        fill={star <= formState.rating ? 'currentColor' : 'none'}
                        className={star <= formState.rating ? 'text-brand-accent drop-shadow' : 'text-gray-300 dark:text-gray-600'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tell us more</p>
                <textarea
                  className="w-full rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-5 py-4 text-sm h-28 focus:border-brand-black dark:focus:border-brand-accent outline-none transition-colors resize-none"
                  value={formState.body}
                  onChange={(e) => setFormState((prev) => ({ ...prev, body: e.target.value }))}
                  placeholder="Comfort, fit, customization…"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-2xl py-3 font-bold hover:bg-brand-accent dark:hover:bg-white transition-colors"
                >
                  Submit review
                </button>
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="flex-1 border border-gray-200 dark:border-white/10 rounded-2xl py-3 font-bold hover:border-brand-black dark:hover:border-brand-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

