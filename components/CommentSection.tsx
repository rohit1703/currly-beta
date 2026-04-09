'use client';

import { useState, useTransition } from 'react';
import { MessageSquare, Loader2, Trash2 } from 'lucide-react';
import { postComment, deleteComment } from '@/actions/comment';
import { useRouter } from 'next/navigation';

interface Comment {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  user_email?: string;
}

interface Props {
  toolId: string;
  toolSlug: string;
  comments: Comment[];
  currentUserId: string | null;
  isLoggedIn: boolean;
}

export default function CommentSection({
  toolId,
  toolSlug,
  comments: initialComments,
  currentUserId,
  isLoggedIn,
}: Props) {
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [comments, setComments] = useState(initialComments);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    startTransition(async () => {
      const result = await postComment(toolId, toolSlug, text);
      setMessage(result.message);
      if (result.success) {
        setText('');
        // Optimistic: add placeholder; revalidation will replace it
        router.refresh();
      }
    });
  };

  const handleDelete = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    startTransition(async () => {
      await deleteComment(commentId, toolSlug);
    });
  };

  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-bold">Discussion</h2>
        {comments.length > 0 && (
          <span className="text-xs text-gray-400 font-medium bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
            {comments.length}
          </span>
        )}
      </div>

      {/* Comment form */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Share your thoughts or ask a question..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm outline-none focus:border-[#0066FF] resize-none"
          />
          {message && <p className="text-xs text-gray-500 mt-1">{message}</p>}
          <button
            type="submit"
            disabled={isPending || !text.trim()}
            className="mt-3 bg-[#0066FF] text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-[#0052CC] transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Post comment
          </button>
        </form>
      ) : (
        <button
          onClick={() => router.push(`/login?redirectTo=/tool/${toolSlug}`)}
          className="mb-6 w-full py-3 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-sm text-gray-400 hover:border-[#0066FF] hover:text-[#0066FF] transition-colors"
        >
          Sign in to join the discussion
        </button>
      )}

      {/* Comments list */}
      {comments.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No comments yet. Start the conversation!</p>
      )}

      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0066FF] to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {comment.user_email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {comment.user_email?.split('@')[0] ?? 'Anonymous'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                  {currentUserId === comment.user_id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">{comment.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
