import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Currly',
  description: 'How Currly collects, uses, and protects your personal data.',
};

const EFFECTIVE_DATE = 'May 2, 2026';
const CONTACT_EMAIL = 'founders@currly.ai';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#050505] text-[#1A1A1A] dark:text-white font-sans">
      <nav className="sticky top-0 z-20 border-b border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0066FF] mb-3">Legal</p>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-10 text-[15px] leading-relaxed">

          <section>
            <h2 className="text-lg font-bold mb-3">1. Who we are</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Currly (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates currly.ai — an AI-powered tool discovery platform.
              If you have questions about this policy, email us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0066FF] hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Data we collect</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Account data</p>
                <p>When you sign up, we store your email address and any profile information you provide (name, avatar) via Supabase Auth. This data is required to provide the service.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Saved tools</p>
                <p>Tools you save are stored in our database and associated with your account so we can show them to you across sessions.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Search events (anonymous)</p>
                <p>We log search queries and timestamps to improve search relevance and understand popular use-cases. These records are <strong>not linked to your user account</strong> — they are anonymous. Retained for 90 days, then automatically deleted.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Tool click events (anonymous)</p>
                <p>When you visit a tool&apos;s detail page, we record the click anonymously to surface popular tools. Retained for 90 days.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">API usage (authenticated)</p>
                <p>When you use AI-generated summaries, we log your user ID, the endpoint called, and a timestamp for rate-limiting and abuse prevention. Retained for 30 days.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Analytics (with consent)</p>
                <p>With your consent, we use PostHog to capture page views and in-app events. No personal data is sent to PostHog beyond anonymous session identifiers. You can withdraw consent at any time from your profile settings.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. How we use your data</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Authenticate you and maintain your account</li>
              <li>Show you tools you&apos;ve saved across devices</li>
              <li>Improve search ranking and surface popular tools</li>
              <li>Enforce rate limits on AI features to prevent abuse</li>
              <li>Understand aggregate usage patterns (analytics, with consent)</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 mt-4">We do not sell your data. We do not use your data for advertising. We do not build personal profiles for marketing.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Third-party processors</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">We share data with the following processors only to the extent necessary to provide the service:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Processor</th>
                    <th className="text-left px-4 py-3 font-semibold">Purpose</th>
                    <th className="text-left px-4 py-3 font-semibold">Data shared</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-600 dark:text-gray-400">
                  <tr>
                    <td className="px-4 py-3 font-medium">Supabase</td>
                    <td className="px-4 py-3">Database and authentication hosting</td>
                    <td className="px-4 py-3">All stored data (see §2)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">OpenAI</td>
                    <td className="px-4 py-3">Semantic search (query embeddings) and AI summaries</td>
                    <td className="px-4 py-3">Search queries; tool data for summaries</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Vercel</td>
                    <td className="px-4 py-3">Application hosting and edge delivery</td>
                    <td className="px-4 py-3">Request metadata (IP, headers) for routing</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">PostHog</td>
                    <td className="px-4 py-3">Product analytics (consent required)</td>
                    <td className="px-4 py-3">Page views, anonymous event data</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">
              OpenAI&apos;s API processes search queries to generate vector embeddings. Per{' '}
              <a href="https://openai.com/policies/api-data-usage-policies" target="_blank" rel="noopener noreferrer" className="text-[#0066FF] hover:underline">OpenAI&apos;s API usage policy</a>,
              data submitted via API is not used to train models (as of March 2023).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Data retention</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Data type</th>
                    <th className="text-left px-4 py-3 font-semibold">Retention period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-600 dark:text-gray-400">
                  <tr><td className="px-4 py-3">Account and profile data</td><td className="px-4 py-3">Until account deletion</td></tr>
                  <tr><td className="px-4 py-3">Saved tools</td><td className="px-4 py-3">Until removed by user or account deletion</td></tr>
                  <tr><td className="px-4 py-3">Anonymous search events</td><td className="px-4 py-3">90 days (auto-deleted)</td></tr>
                  <tr><td className="px-4 py-3">Anonymous click events</td><td className="px-4 py-3">90 days (auto-deleted)</td></tr>
                  <tr><td className="px-4 py-3">API usage logs</td><td className="px-4 py-3">30 days (auto-deleted)</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Your rights</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Depending on your jurisdiction (including EEA, UK, and California), you may have the right to access, correct, export, or delete your personal data. We support these rights directly:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li><strong className="text-gray-800 dark:text-gray-200">Export:</strong> Download a copy of your account data from your <Link href="/profile" className="text-[#0066FF] hover:underline">Profile page</Link>.</li>
              <li><strong className="text-gray-800 dark:text-gray-200">Delete:</strong> Delete your account (and all associated data) from your <Link href="/profile" className="text-[#0066FF] hover:underline">Profile page</Link>.</li>
              <li><strong className="text-gray-800 dark:text-gray-200">Analytics opt-out:</strong> Withdraw PostHog analytics consent at any time from Profile settings.</li>
              <li><strong className="text-gray-800 dark:text-gray-200">Correct:</strong> Update your profile information via your account settings.</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              For requests we cannot automate, email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0066FF] hover:underline">{CONTACT_EMAIL}</a>. We respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Cookies and tracking</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We use session cookies set by Supabase Auth to keep you logged in. These are strictly necessary and cannot be declined without preventing login.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-3">
              We use PostHog for product analytics only with your explicit consent. If you decline, no analytics cookies or tracking pixels are loaded.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Security</h2>
            <p className="text-gray-600 dark:text-gray-400">
              All data is encrypted in transit (TLS) and at rest. Access to the database is controlled via Supabase Row Level Security (RLS). Admin access requires authentication and is limited to specific authorized accounts. We follow responsible disclosure principles — if you discover a security issue, please email us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">9. Changes to this policy</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We will update this policy as our practices change. Material changes will be communicated by updating the effective date and, for significant changes, by email. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">10. Contact</h2>
            <p className="text-gray-600 dark:text-gray-400">
              For any privacy questions or data requests: <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0066FF] hover:underline">{CONTACT_EMAIL}</a>
            </p>
          </section>

        </div>

        <div className="mt-14 pt-8 border-t border-gray-100 dark:border-white/10 flex gap-4 text-sm text-gray-400">
          <Link href="/terms" className="hover:text-[#0066FF] transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-[#0066FF] transition-colors">← Home</Link>
        </div>
      </main>
    </div>
  );
}
