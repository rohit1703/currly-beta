'use client';

import { useState, useTransition } from 'react';
import { ThumbsUp } from 'lucide-react';
import { toggleUpvote } from '@/actions/upvote';
import { useRouter } from 'next/navigation';

interface Props {
  toolId: string;
  initialUpvoted: boolean;
  initialCount: number;
  isLoggedIn: boolean;
  redirectTo?: string;
}

export default function UpvoteButton({
  toolId,
  initialUpvoted,
  initialCount,
  isLoggedIn,
  redirectTo,
}: Props) {
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push(`/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`);
      return;
    }

    const newUpvoted = !upvoted;
    setUpvoted(newUpvoted);
    setCount(c => (newUpvoted ? c + 1 : Math.max(0, c - 1)));

    startTransition(async () => {
      try {
        const result = await toggleUpvote(toolId);
        setUpvoted(result.upvoted);
        setCount(result.count);
      } catch {
        // Revert on failure
        setUpvoted(!newUpvoted);
        setCount(c => (newUpvoted ? Math.max(0, c - 1) : c + 1));
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all disabled:opacity-70 ${
        upvoted
          ? 'bg-[#0066FF] text-white border-[#0066FF] shadow-md shadow-blue-500/20'
          : 'bg-white dark:bg-[#111] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-[#0066FF] hover:text-[#0066FF]'
      }`}
    >
      <ThumbsUp className="w-4 h-4" />
      <span>{count > 0 ? `${count} ` : ''}Upvote{count !== 1 ? 's' : ''}</span>
    </button>
  );
}
