'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import {
  ROLES,
  COMPANY_STAGES,
  TEAM_SIZES,
  REGIONS,
  BUDGET_RANGES,
  USE_CASES,
  ONBOARDING_STEPS,
} from '@/lib/onboarding-constants';
import type { UserProfile } from '@/types';

const ANON_KEY = 'currly_anon_profile';

type FormState = {
  role: string;
  company_stage: string;
  team_size: string;
  region: string;
  monthly_budget_range: string;
  primary_use_case: string;
};

const EMPTY_FORM: FormState = {
  role: '',
  company_stage: '',
  team_size: '',
  region: '',
  monthly_budget_range: '',
  primary_use_case: '',
};

const FIELD_LABELS: Record<keyof FormState, string> = {
  role: 'Your role',
  company_stage: 'Company stage',
  team_size: 'Team size',
  region: 'Region',
  monthly_budget_range: 'Monthly AI budget',
  primary_use_case: 'Primary use case',
};

const FIELD_OPTIONS: Record<keyof FormState, readonly string[]> = {
  role: ROLES,
  company_stage: COMPANY_STAGES,
  team_size: TEAM_SIZES,
  region: REGIONS,
  monthly_budget_range: BUDGET_RANGES,
  primary_use_case: USE_CASES,
};

interface Props {
  initialProfile?: UserProfile | null;
  next?: string;
}

export default function OnboardingForm({ initialProfile, next: nextProp }: Props) {
  const router = useRouter();
  const nextParam = nextProp || '/dashboard';
  const posthog = usePostHog();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(
    initialProfile
      ? {
          role: initialProfile.role,
          company_stage: initialProfile.company_stage,
          team_size: initialProfile.team_size,
          region: initialProfile.region,
          monthly_budget_range: initialProfile.monthly_budget_range,
          primary_use_case: initialProfile.primary_use_case,
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadedFromAnon, setLoadedFromAnon] = useState(false);

  useEffect(() => {
    if (!initialProfile) {
      try {
        const raw = localStorage.getItem(ANON_KEY);
        if (raw) {
          const { _savedAt, ...fields } = JSON.parse(raw);
          setForm(prev => ({ ...prev, ...fields }));
          setLoadedFromAnon(true);
        }
      } catch {
        // ignore corrupt localStorage
      }
    }
    posthog?.capture('icp_form_viewed', {
      is_returning: !!initialProfile,
      prefilled_from_anon: !initialProfile && !!localStorage.getItem(ANON_KEY),
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentStepDef = ONBOARDING_STEPS[step];

  const validateStep = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    for (const field of currentStepDef.fields) {
      if (!form[field]) newErrors[field] = 'Please select an option.';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      posthog?.capture('icp_form_validation_error', {
        step: step + 1,
        step_label: currentStepDef.label,
        missing_fields: Object.keys(newErrors),
      });
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validateStep()) return;
    // Save progress to localStorage
    try {
      localStorage.setItem(ANON_KEY, JSON.stringify({ ...form, _savedAt: new Date().toISOString() }));
    } catch {}
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        try { localStorage.removeItem(ANON_KEY); } catch {}
        posthog?.capture('icp_form_submitted', { ...form, was_prefilled: loadedFromAnon });
        router.push(nextParam);
      } else {
        setSubmitError(json.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLastStep = step === ONBOARDING_STEPS.length - 1;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-medium">
            Step {step + 1} of {ONBOARDING_STEPS.length}
          </span>
          <span className="text-xs font-semibold text-[#0066FF]">{currentStepDef.label}</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0066FF] rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / ONBOARDING_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-5">
        {currentStepDef.fields.map((field) => (
          <div key={field}>
            <label
              htmlFor={field}
              className="block text-sm font-medium mb-1.5"
            >
              {FIELD_LABELS[field]}
            </label>
            <select
              id={field}
              value={form[field]}
              onChange={e => {
                setForm(prev => ({ ...prev, [field]: e.target.value }));
                if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
              }}
              className={`w-full rounded-xl border px-4 py-3 text-sm bg-white dark:bg-[#111] appearance-none focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 transition-colors ${
                errors[field]
                  ? 'border-red-400 dark:border-red-500'
                  : 'border-gray-200 dark:border-white/10'
              }`}
            >
              <option value="">Select…</option>
              {FIELD_OPTIONS[field].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {errors[field] && (
              <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Submit error */}
      {submitError && (
        <p className="mt-4 text-sm text-red-500 text-center">{submitError}</p>
      )}

      {/* Actions */}
      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={isLastStep ? handleSubmit : handleContinue}
          disabled={submitting}
          className="flex-1 py-3 rounded-xl bg-[#0066FF] text-white text-sm font-bold hover:bg-blue-600 disabled:opacity-60 transition-colors shadow-lg shadow-blue-500/20"
        >
          {isLastStep
            ? submitting ? 'Saving…' : 'Save & Continue'
            : 'Continue'}
        </button>
      </div>

      {/* Skip */}
      {!initialProfile && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push(nextParam)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
}
