import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Currly',
  description: 'Terms governing your use of the Currly platform.',
};

const EFFECTIVE_DATE = 'May 2, 2026';
const CONTACT_EMAIL = 'founders@currly.ai';

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="space-y-10 text-[15px] leading-relaxed">

          <section>
            <h2 className="text-lg font-bold mb-3">1. Acceptance</h2>
            <p className="text-gray-600 dark:text-gray-400">
              By accessing or using Currly (&ldquo;Service&rdquo;), you agree to these Terms. If you do not agree, do not use the Service. These Terms form a binding agreement between you and Currly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. What Currly provides</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Currly is an AI-powered discovery platform that helps users find, compare, and save SaaS and AI tools. We curate tool listings, provide semantic search, and surface AI-generated summaries. We are not affiliated with, endorsed by, or responsible for any third-party tool listed on our platform.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-3">
              The Service is provided in beta. Features may change, be removed, or become unavailable without notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Account registration</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Some features (saving tools, AI summaries) require an account. You must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mt-3">
              <li>Provide accurate information when registering</li>
              <li>Keep your login credentials confidential</li>
              <li>Be at least 16 years old (or the minimum digital age in your jurisdiction)</li>
              <li>Notify us immediately of unauthorized account access</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 mt-3">You are responsible for all activity under your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Acceptable use</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Scrape, crawl, or automate requests to the platform without written permission</li>
              <li>Attempt to reverse-engineer our ranking or recommendation systems</li>
              <li>Use the AI summary feature to generate misleading or harmful content</li>
              <li>Upload or submit malicious code, spam, or content that violates applicable law</li>
              <li>Use the Service to violate the rights of third parties</li>
              <li>Circumvent rate limits or access controls</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 mt-4">We reserve the right to suspend or terminate accounts that violate these terms without prior notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. AI-generated content</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Currly uses AI (OpenAI&apos;s models) to generate search results, tool summaries, and comparisons. These are generated automatically and may contain inaccuracies. They do not constitute professional advice (legal, financial, technical, or otherwise).
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-3">
              Always verify tool information directly with the tool&apos;s provider before making purchasing or integration decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Intellectual property</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Currly&apos;s platform, design, curation methodology, and original content are owned by Currly and protected by copyright and other laws. Tool names, logos, and descriptions belong to their respective owners. You may not reproduce or distribute our content without permission.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-3">
              You retain ownership of any data you submit (saved lists, preferences). By submitting it, you grant Currly a license to store and display it to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Third-party tools and links</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Currly lists and links to third-party tools and websites. We do not control them and are not responsible for their content, practices, or terms. We do not accept affiliate payments or sponsored placements that influence our rankings. Tool listings are editorial decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Disclaimers</h2>
            <p className="text-gray-600 dark:text-gray-400">
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not guarantee that the Service will be error-free, uninterrupted, or that tool information will be accurate or up-to-date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">9. Limitation of liability</h2>
            <p className="text-gray-600 dark:text-gray-400">
              To the maximum extent permitted by law, Currly and its founders shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of the Service. Our total liability for any claim shall not exceed the amount you paid to Currly in the 12 months preceding the claim (or $10, if no payment was made).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">10. Termination</h2>
            <p className="text-gray-600 dark:text-gray-400">
              You may delete your account at any time from your <Link href="/profile" className="text-[#0066FF] hover:underline">Profile page</Link>. We may suspend or terminate your access for violations of these Terms or for operational reasons, with or without notice.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-3">
              Upon termination, your saved data will be deleted per our retention policy. Sections 6, 8, 9, and 11 survive termination.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">11. Governing law</h2>
            <p className="text-gray-600 dark:text-gray-400">
              These Terms are governed by the laws of India. Disputes shall be resolved in the courts of Bangalore, Karnataka, India. If you are located in the EU or UK, mandatory local consumer protection laws in your jurisdiction also apply.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">12. Changes to these Terms</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We may update these Terms. We will notify you of material changes by updating the effective date and, for significant changes, by email. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">13. Contact</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Questions about these Terms: <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0066FF] hover:underline">{CONTACT_EMAIL}</a>
            </p>
          </section>

        </div>

        <div className="mt-14 pt-8 border-t border-gray-100 dark:border-white/10 flex gap-4 text-sm text-gray-400">
          <Link href="/privacy" className="hover:text-[#0066FF] transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-[#0066FF] transition-colors">← Home</Link>
        </div>
      </main>
    </div>
  );
}
