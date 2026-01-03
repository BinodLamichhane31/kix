import { useMemo, useState, useEffect } from 'react';
import { Star, MessageCircle, Loader2, Edit, Trash2, X } from 'lucide-react';
import * as reviewService from '../../../services/api/review.service';
import { useAuth } from '../../../store/contexts/AuthContext';
import { useToast } from '../../../store/contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

export function ReviewsSection({ productId, productRating = 0, productReviewCount = 0, title = 'Community reviews' }) {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [checkingReview, setCheckingReview] = useState(false);
  const [formState, setFormState] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    if (productId) {
      loadReviews();
      if (isAuthenticated) {
        checkUserReview();
      }
    }
  }, [productId, isAuthenticated, sortBy]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getProductReviews(productId, {
        limit: 50,
        sort: sortBy,
      });
      setReviews(response.data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      showToast('Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkUserReview = async () => {
    try {
      setCheckingReview(true);
      const response = await reviewService.checkUserReview(productId);
      setUserReview(response.hasReviewed ? response.review : null);
    } catch (error) {
      // Silently fail if not authenticated
      setUserReview(null);
    } finally {
      setCheckingReview(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/auth/sign-in');
      return;
    }

    if (!formState.comment.trim()) {
      showToast('Please enter a comment', 'error');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingReview) {
        // Update existing review
        await reviewService.updateReview(editingReview._id || editingReview.id, {
          rating: formState.rating,
          title: formState.title.trim() || undefined,
          comment: formState.comment.trim(),
        });
        showToast('Review updated successfully', 'success');
      } else {
        // Create new review
        await reviewService.createReview({
          productId,
          rating: formState.rating,
          title: formState.title.trim() || undefined,
          comment: formState.comment.trim(),
        });
        showToast('Review submitted successfully', 'success');
      }

      // Reload reviews and check user review
      await loadReviews();
      await checkUserReview();
      
      setFormState({ rating: 5, title: '', comment: '' });
      setShowDialog(false);
      setEditingReview(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast(error.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormState({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment,
    });
    setShowDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await reviewService.deleteReview(deleteConfirm._id || deleteConfirm.id);
      showToast('Review deleted successfully', 'success');
      await loadReviews();
      await checkUserReview();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast(error.message || 'Failed to delete review', 'error');
    }
  };

  const avgRating = useMemo(() => {
    return productRating || 0;
  }, [productRating]);

  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <section className="mt-16 bg-white dark:bg-brand-gray rounded-3xl border border-gray-200 dark:border-white/10 p-8 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Reviews</p>
          <h2 className="text-3xl font-black mt-2">{title}</h2>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
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
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({productReviewCount} {productReviewCount === 1 ? 'review' : 'reviews'})
          </span>
          {isAuthenticated && (
            <button
              onClick={() => {
                if (userReview) {
                  handleEdit(userReview);
                } else {
                  setEditingReview(null);
                  setFormState({ rating: 5, title: '', comment: '' });
                  setShowDialog(true);
                }
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-semibold hover:border-brand-black dark:hover:border-brand-accent transition-colors"
            >
              <MessageCircle size={16} />
              {userReview ? 'Edit Review' : 'Rate & review'}
            </button>
          )}
          {reviews.length > 3 && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-semibold hover:border-brand-black dark:hover:border-brand-accent transition-colors"
            >
              {showAll ? 'Show less' : `View all (${reviews.length})`}
            </button>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="mt-6 flex items-center gap-4">
          <label className="text-sm text-gray-500 dark:text-gray-400">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 text-sm focus:border-brand-black dark:focus:border-brand-accent focus:outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="mt-8 flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-brand-black dark:text-brand-accent" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {visibleReviews.map((review) => {
            const reviewUser = review.user || {};
            const isOwnReview = isAuthenticated && user && reviewUser._id === user.id;
            return (
              <div
                key={review._id || review.id}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 p-4 space-y-3 relative"
              >
                {isOwnReview && (
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-brand-black dark:hover:text-brand-accent transition-colors"
                      title="Edit review"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(review)}
                      className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete review"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{reviewUser.name || 'Anonymous'}</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">{review.comment}</p>
                <p className="text-xs text-gray-400">{formatDate(review.createdAt || review.date)}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review this product!</p>
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-brand-gray rounded-[32px] border border-gray-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl w-full max-w-lg space-y-6 relative">
            <button
              onClick={() => {
                setShowDialog(false);
                setEditingReview(null);
                setFormState({ rating: 5, title: '', comment: '' });
              }}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
            >
              <X size={20} />
            </button>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Share your vibe</p>
              <h3 className="text-2xl font-black">{editingReview ? 'Edit Review' : 'Rate this sneaker'}</h3>
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
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Title (Optional)</p>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-4 py-2.5 text-sm focus:border-brand-black dark:focus:border-brand-accent outline-none transition-colors"
                  value={formState.title}
                  onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Give your review a title..."
                  maxLength={100}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tell us more</p>
                <textarea
                  className="w-full rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-brand-black/40 px-5 py-4 text-sm h-28 focus:border-brand-black dark:focus:border-brand-accent outline-none transition-colors resize-none"
                  value={formState.comment}
                  onChange={(e) => setFormState((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Comfort, fit, customization…"
                  required
                  maxLength={1000}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{formState.comment.length}/1000</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-2xl py-3 font-bold hover:bg-brand-accent dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {editingReview ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    editingReview ? 'Update Review' : 'Submit Review'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDialog(false);
                    setEditingReview(null);
                    setFormState({ rating: 5, title: '', comment: '' });
                  }}
                  className="flex-1 border border-gray-200 dark:border-white/10 rounded-2xl py-3 font-bold hover:border-brand-black dark:hover:border-brand-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          title="Delete Review"
          message="Are you sure you want to delete your review? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
        />
      )}
    </section>
  );
}

