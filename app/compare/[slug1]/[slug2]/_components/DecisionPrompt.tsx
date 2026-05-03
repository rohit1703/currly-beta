'use client';

import { useState, useEffect, useRef } from 'react';
import { usePostHog } from 'posthog-js/react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

type Tool = { id: string; name: string; image_url: string | null };

type Step = 'choice' | 'confidence' | 'done';

const CONFIDENCE_OPTIONS = [
  { value: 3, label: 'Definitely' },
  { value: 2, label: 'Probably' },
  { value: 1, label: 'Still evaluating' },
] as const;

export function DecisionPrompt({ tools }: { tools: [Tool, Tool] }) {
  const posthog = usePostHog();
  const pathname = usePathname();

  const [step, setStep] = useState<Step>('choice');
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<1 | 2 | 3 | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);
  const mountedAtRef = useRef(Date.now());

  // Fire decision_started once on mount
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    posthog?.capture('decision_started', {
      context: 'compare',
      tool_ids: tools.map(t => t.id),
      source_path: pathname,
    });
  }, []);

  // Fire decision_abandoned on page unload if never submitted
  useEffect(() => {
    const onUnload = () => {
      if (step === 'done') return;
      posthog?.capture('decision_abandoned', {
        context: 'compare',
        tool_ids: tools.map(t => t.id),
        time_on_page_ms: Date.now() - mountedAtRef.current,
      });
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [step]);

  async function submit(selectedId: string | null, conf: 1 | 2 | 3 | undefined) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_ids: tools.map(t => t.id),
          chosen_tool_id: selectedId,
          confidence: conf,
          context: 'compare',
          source_path: pathname,
        }),
      });
      const data = await res.json();
      posthog?.capture('decision_submitted', {
        session_id: data.session_id,
        status: selectedId ? 'decided' : 'undecided',
        chosen_tool_id: selectedId,
        confidence: conf ?? null,
      });
    } catch {
      // non-critical — still show confirmation
    } finally {
      setSubmitting(false);
      setStep('done');
    }
  }

  function handleToolChoice(toolId: string) {
    setChosenId(toolId);
    setStep('confidence');
  }

  async function handleStillDeciding() {
    await submit(null, undefined);
  }

  async function handleConfidenceSubmit() {
    if (!confidence) return;
    await submit(chosenId, confidence);
  }

  if (step === 'done') {
    return (
      <div className="mt-8 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl p-8 text-center">
        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-3" />
        <p className="font-semibold text-gray-900 dark:text-white">Decision recorded. Thanks for sharing.</p>
        <p className="text-sm text-gray-500 mt-1">You're helping make Currly smarter for everyone.</p>
      </div>
    );
  }

  if (step === 'confidence') {
    const chosen = tools.find(t => t.id === chosenId)!;
    return (
      <div className="mt-8 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl p-8">
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 text-center mb-1">Going with {chosen.name}</p>
        <h3 className="text-lg font-bold text-center mb-6">How confident are you?</h3>
        <div className="flex gap-3 justify-center flex-wrap mb-6">
          {CONFIDENCE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setConfidence(opt.value)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                confidence === opt.value
                  ? 'bg-[#0066FF] text-white border-[#0066FF]'
                  : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#0066FF]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setStep('choice'); setConfidence(null); setChosenId(null); }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleConfidenceSubmit}
            disabled={!confidence || submitting}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#0066FF] text-white hover:bg-[#0052CC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Saving…' : 'Submit'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl p-8">
      <h3 className="text-lg font-bold text-center mb-6">Which one are you going with?</h3>
      <div className="flex gap-4 justify-center flex-wrap mb-4">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => handleToolChoice(tool.id)}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-[#0066FF] hover:bg-blue-50 dark:hover:bg-[#0066FF]/10 transition-all group"
          >
            {tool.image_url ? (
              <Image
                src={tool.image_url}
                alt={tool.name}
                width={28}
                height={28}
                className="w-7 h-7 object-contain rounded-lg"
              />
            ) : (
              <span className="w-7 h-7 flex items-center justify-center text-sm font-bold bg-gray-200 dark:bg-white/10 rounded-lg">
                {tool.name[0]}
              </span>
            )}
            <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#0066FF] transition-colors">
              {tool.name}
            </span>
          </button>
        ))}
      </div>
      <div className="text-center">
        <button
          onClick={handleStillDeciding}
          disabled={submitting}
          className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-40"
        >
          Still deciding
        </button>
      </div>
    </div>
  );
}
