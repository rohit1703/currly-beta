'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined' || posthog.__loaded) return;

    const consent = localStorage.getItem('currly_analytics_consent');

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false,
      // Start opted-out by default; opted in only when consent is 'accepted'
      opt_out_capturing_by_default: consent !== 'accepted',
    });
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}