'use client';

import { useState, useTransition } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { submitReview } from '@/actions/review';
import { useRouter } from 'next/navigation';

interface Review {
  id: string;
  rating: number;
  body: string | null;
  created_at: string;
  user_email?: string;
}

interface Props {
  toolId: string;
  toolSlug: string;
  reviews: Review[];
  userReview: Review | null;
  isLoggedIn: boolean;
  avgRating: number;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md';
}) {
  const [hover, setHover] = useState(0);
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
        >
          <Star
            className={`${sz} ${
              n <= (hover || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({
  toolId,
  toolSlug,
  reviews,
  userReview,
  isLoggedIn,
  avgRating,
}: Props) {
  const [rating, setRating] = useState(userReview?.rating || 0);
  const [body, setBody] = useState(userReview?.body || '');
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setMessage('Please select a star rating.'); return; }
    startTransition(async () => {
      const result = await submitReview(toolId, toolSlug, rating, body);
      setMessage(result.message);
      if (result.success) setShowForm(false);
    });
  };

  const totalReviews = reviews.length;

  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold">Reviews</h2>
          {totalReviews > 0 && (
            <div className="flex items-center gap-2">
              <StarRating value={Math.round(avgRating)} readonly size="sm" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-400">({totalReviews})</span>
            </div>
          )}
        </div>
        {isLoggedIn && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-bold text-[#0066FF] hover:underline"
          >
            {userReview ? 'Edit review' : 'Write a review'}
          </button>
        )}
        {!isLoggedIn && (
          <button
            onClick={() => router.push(`/login?redirectTo=/tool/${toolSlug}`)}
            className="text-sm font-bold text-[#0066FF] hover:underline"
          >
            Sign in to review
          </button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
          <p className="text-sm font-bold mb-3">Your rating</p>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Share your experience (optional)..."
            rows={3}
            className="w-full mt-4 px-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-[#0066FF] resize-none"
          />
          {message && <p className="text-xs text-gray-500 mt-2">{message}</p>}
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#0066FF] text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-[#0052CC] transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Submit
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setMessage(''); }}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-3 py-2 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {totalReviews === 0 && !showForm && (
        <p className="text-sm text-gray-400 text-center py-6">No reviews yet. Be the first!</p>
      )}

      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="border-b border-gray-100 dark:border-white/5 pb-4 last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-1">
              <StarRating value={review.rating} readonly size="sm" />
              <span className="text-xs text-gray-400">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            {review.body && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{review.body}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
