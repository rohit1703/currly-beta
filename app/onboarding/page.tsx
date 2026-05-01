import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Logo } from '@/components/Logo';
import OnboardingForm from '@/components/OnboardingForm';
import type { Metadata } from 'next';
import type { UserProfile } from '@/types';

export const metadata: Metadata = {
  title: 'Set Up Your Profile | Currly',
  robots: { index: false },
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const cookieStore = await cookies();
  const userSupabase = createClient(cookieStore);
  const { data: { user } } = await userSupabase.auth.getUser();

  if (!user) {
    const { next } = await searchParams;
    const dest = next ? `/login?redirectTo=/onboarding?next=${encodeURIComponent(next)}` : '/login?redirectTo=/onboarding';
    redirect(dest);
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const { next } = await searchParams;

  // If they already completed onboarding and navigated here without edit intent, send them along
  // We still render the form (pre-populated) so users can update their profile

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#050505] text-[#1A1A1A] dark:text-white font-sans flex flex-col">
      {/* Minimal nav */}
      <nav className="w-full px-6 py-5 flex justify-center">
        <Logo />
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold mb-2">
              {profile ? 'Update your profile' : 'Tell us about yourself'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile
                ? 'Update your details to get better tool recommendations.'
                : 'Help us surface the right tools for your stage and goals.'}
            </p>
          </div>

          <OnboardingForm initialProfile={profile as UserProfile | null} next={next} />
        </div>
      </main>
    </div>
  );
}
