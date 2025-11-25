import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Users, Zap, Globe, Shield, Search, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: "About Currly - The World's First AI Tools Discovery Engine",
  description: "Learn how Rohit Bangaram and Ashish Singh built the world's first AI-powered tools discovery platform. From 0 to 712+ tools and 420+ members in 3 months.",
  alternates: {
    canonical: 'https://currly.ai/about',
  },
};

export default function AboutPage() {
  const stats = [
    { label: "Founded", value: "2024" },
    { label: "Founders", value: "2" },
    { label: "Community", value: "420+" },
    { label: "Tools Curated", value: "712+" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white font-sans">
      
      {/* --- NAV (Simplified for static page) --- */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-gray-800 dark:bg-black/80">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <span className="font-bold text-xl">Currly</span>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative py-24 px-4 text-center border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl">
            About <span className="text-blue-600">Currly</span>
          </h1>
          <p className="mb-10 text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            The world's first AI-powered tools discovery platform. <br />
            Built by tool obsessives, for professionals who refuse to waste time.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        
        {/* --- ORIGIN STORY --- */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-500" /> The Problem That Started It All
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              Currly was founded in 2024 by <strong>Rohit Bangaram</strong> (Marketing Leader) and <strong>Ashish Singh</strong> (Strategy Expert) after experiencing the same frustration repeatedly: finding the right AI tool was unnecessarily hard.
            </p>
            <div className="my-8 rounded-2xl border-l-4 border-blue-600 bg-blue-50 p-6 dark:bg-blue-900/20">
              <p className="font-medium italic text-gray-800 dark:text-gray-200 mb-4">
                "In August 2024, Rohit spent 12 hours researching email marketing automation tools. He visited 20+ websites, read dozens of outdated reviews, and still made the wrong choice."
              </p>
              <p className="text-sm">
                He messaged Ashish: <em>"Why is tool discovery so broken?"</em><br/>
                Ashish replied: <em>"Because no one's built the platform we actually need. Let's fix it."</em>
              </p>
            </div>
            <p>That conversation became Currly.</p>
          </div>
        </section>

        {/* --- TIMELINE --- */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-8">From WhatsApp to AI Platform</h2>
          <div className="space-y-8 border-l-2 border-gray-200 dark:border-gray-800 ml-4 pl-8 relative">
            <div className="relative">
              <span className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-white bg-blue-600 dark:border-black"></span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Week 1 (Sept 2024)</h3>
              <p className="text-gray-600 dark:text-gray-400">Started a WhatsApp group with one rule: Share tools you've personally tested. 50 members in 48 hours.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-white bg-blue-600 dark:border-black"></span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Week 4 (Oct 2024)</h3>
              <p className="text-gray-600 dark:text-gray-400">Built a Notion database to organize 200+ tools. The manual curation process begins.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-white bg-blue-600 dark:border-black"></span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Launch (Jan 2025)</h3>
              <p className="text-gray-600 dark:text-gray-400">Currly platform launches with 712+ tools, AI search, and 420+ active members.</p>
            </div>
          </div>
        </section>

        {/* --- FOUNDERS --- */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-12 text-center">Meet the Founders</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Rohit */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-6 h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                 {/* Placeholder for Founder Image */}
                 <div className="flex h-full w-full items-center justify-center bg-blue-600 text-white font-bold text-2xl">R</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Rohit Bangaram</h3>
              <p className="text-sm text-blue-600 font-medium mb-4">Co-Founder & Chief Curator</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Marketing Leader at Grid Dynamics India. 8+ years in MarTech. Personally tested over 1,000 AI tools.
              </p>
              <blockquote className="border-l-2 border-blue-500 pl-4 text-sm italic text-gray-700 dark:text-gray-300">
                "Tool discovery should feel like asking a knowledgeable friend, not scrolling through pages of ads."
              </blockquote>
            </div>

            {/* Ashish */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-6 h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                 <div className="flex h-full w-full items-center justify-center bg-purple-600 text-white font-bold text-2xl">A</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ashish Singh</h3>
              <p className="text-sm text-purple-600 font-medium mb-4">Co-Founder & Strategy Lead</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Strategy expert specializing in community-driven growth. Led the community from 0 to 420+ members.
              </p>
              <blockquote className="border-l-2 border-purple-500 pl-4 text-sm italic text-gray-700 dark:text-gray-300">
                "We're not guessing what users need—we were the users."
              </blockquote>
            </div>
          </div>
        </section>

        {/* --- VALUES --- */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-10">Why Currly is Different</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "Expertise Over Crowd-Sourcing", desc: "Every tool is tested by founders. No unvetted submissions.", icon: Shield },
              { title: "Zero Bias", desc: "We do not earn affiliate commissions. Recommendations are based purely on merit.", icon: CheckCircle2 },
              { title: "Community Validation", desc: "420+ professionals provide real-world testing and honest feedback.", icon: Users },
              { title: "Speed Meets Depth", desc: "Instant AI recommendations backed by human-tested data.", icon: Zap },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4">
                <div className="shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- CTA --- */}
        <section className="rounded-3xl bg-black p-12 text-center text-white dark:bg-white dark:text-black">
          <h2 className="mb-4 text-3xl font-bold">Join Our Journey</h2>
          <p className="mb-8 text-gray-400 dark:text-gray-600 max-w-xl mx-auto">
            Currly is community-powered. Share tools, write reviews, and help us build the best discovery engine on the planet.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/community" className="rounded-full bg-blue-600 px-8 py-3 font-bold text-white hover:bg-blue-700">
              Join Community
            </Link>
            <a href="mailto:founders@currly.ai" className="rounded-full border border-gray-700 bg-transparent px-8 py-3 font-bold hover:bg-white/10 dark:border-gray-300 dark:hover:bg-black/5">
              Contact Founders
            </a>
          </div>
        </section>

      </main>
      
      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Currly",
            "url": "https://currly.ai",
            "foundingDate": "2024-09",
            "founders": [
              { "@type": "Person", "name": "Rohit Bangaram" },
              { "@type": "Person", "name": "Ashish Singh" }
            ],
            "description": "The world's first AI-powered tools discovery platform."
          })
        }}
      />
    </div>
  );
}