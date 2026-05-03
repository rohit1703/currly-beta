'use client';

import { useState, useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import Image from 'next/image';
import { X, CheckCircle2 } from 'lucide-react';

type PendingOutcome = {
  session_id: string;
  check_day: 7 | 30;
  tool: { id: string; name: string; slug: string; image_url: string | null };
};

const SATISFACTION_OPTIONS = [
  { value: 1, emoji: '😞', label: 'Not useful' },
  { value: 2, emoji: '😕', label: 'Disappointing' },
  { value: 3, emoji: '😐', label: "It's okay" },
  { value: 4, emoji: '😊', label: 'Pretty good' },
  { value: 5, emoji: '🤩', label: 'Love it' },
] as const;

const TIME_TO_VALUE_OPTIONS = [
  '< 1 week', '1–4 weeks', '1–3 months', 'Still setting up', 'Not yet',
] as const;

export function OutcomePrompt() {
  const posthog = usePostHog();
  const [pending, setPending] = useState<PendingOutcome | null | 'loading'>('loading');
  const [step, setStep] = useState<'rating' | 'details' | 'done'>('rating');
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [timeToValue, setTimeToValue] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/outcomes/pending')
      .then(r => r.json())
      .then(({ pending: p }) => {
        setPending(p ?? null);
        if (p) {
          posthog?.capture('outcome_prompt_shown', {
            session_id: p.session_id,
            check_day:  p.check_day,
            tool_slug:  p.tool.slug,
          });
        }
      })
      .catch(() => setPending(null));
  }, []);

  async function submitOutcome(sat: number | null, ttv?: string, skipped = false) {
    if (!pending || pending === 'loading') return;
    setSubmitting(true);
    try {
      await fetch('/api/outcomes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision_session_id: pending.session_id,
          check_day:           pending.check_day,
          satisfaction:        sat ?? undefined,
          time_to_value:       ttv || undefined,
        }),
      });
      posthog?.capture(skipped ? 'outcome_skipped' : 'outcome_submitted', {
        session_id:   pending.session_id,
        check_day:    pending.check_day,
        tool_slug:    pending.tool.slug,
        satisfaction: sat,
        time_to_value: ttv,
      });
    } catch {
      // non-critical
    } finally {
      setSubmitting(false);
      setStep('done');
    }
  }

  function handleSkip() {
    void submitOutcome(null, undefined, true);
  }

  function handleSatisfactionClick(val: number) {
    setSatisfaction(val);
    setStep('details');
  }

  async function handleDetailsSubmit() {
    await submitOutcome(satisfaction, timeToValue || undefined);
  }

  // Don't render anything while loading or when there's nothing pending
  if (pending === 'loading' || pending === null) return null;

  const label = pending.check_day === 7 ? 'one week' : 'one month';

  if (step === 'done') {
    return (
      <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-5 py-4 mb-6">
        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
        <p className="text-sm font-medium text-green-800 dark:text-green-300">
          Thanks — your feedback improves Currly's rankings for everyone.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl px-5 py-4 mb-6">
      <div className="flex items-start justify-between gap-3">
        {/* Left: tool info + question */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            {pending.tool.image_url ? (
              <Image
                src={pending.tool.image_url}
                alt={pending.tool.name}
                width={36}
                height={36}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <span className="text-sm font-bold text-gray-400">{pending.tool.name[0]}</span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            You picked <span className="text-gray-900 dark:text-white">{pending.tool.name}</span>{' '}
            {label} ago — how's it going?
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={handleSkip}
          disabled={submitting}
          className="text-gray-300 dark:text-gray-600 hover:text-gray-500 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {step === 'rating' && (
        <div className="flex items-center gap-1 mt-3">
          {SATISFACTION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleSatisfactionClick(opt.value)}
              title={opt.label}
              className="text-xl sm:text-2xl hover:scale-125 transition-transform active:scale-110"
              aria-label={opt.label}
            >
              {opt.emoji}
            </button>
          ))}
          <button
            onClick={handleSkip}
            disabled={submitting}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Skip
          </button>
        </div>
      )}

      {step === 'details' && (
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <span className="text-lg">{SATISFACTION_OPTIONS.find(o => o.value === satisfaction)?.emoji}</span>
          <select
            value={timeToValue}
            onChange={e => setTimeToValue(e.target.value)}
            className="text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#0066FF]"
          >
            <option value="">Time to value? (optional)</option>
            {TIME_TO_VALUE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button
            onClick={handleDetailsSubmit}
            disabled={submitting}
            className="text-sm font-bold bg-[#0066FF] text-white px-4 py-1.5 rounded-lg hover:bg-[#0052CC] disabled:opacity-40 transition-colors"
          >
            {submitting ? 'Saving…' : 'Submit'}
          </button>
          <button
            onClick={() => submitOutcome(satisfaction, undefined)}
            disabled={submitting}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip details
          </button>
        </div>
      )}
    </div>
  );
}
