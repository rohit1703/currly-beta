import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Users, Zap, Search, CheckCircle2, Globe, TrendingUp, Clock, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: "About Currly - The Honest AI Tools Discovery Platform | Zero Affiliate Bias",
  description: "Meet the team behind Currly—the AI discovery platform with zero affiliate bias. Founded August 2025 by Rohit Mallavarapu & Ashish Singh. 700+ tools vetted weekly, honest reviews, always free.",
  keywords: ["about currly", "ai tools discovery platform", "honest ai tool reviews", "zero affiliate bias", "rohit mallavarapu", "ashish singh", "unbiased ai recommendations", "ai tool comparison", "weekly updated ai tools"],
  openGraph: {
    title: "About Currly - Honest AI Tools Discovery Without Affiliate Bias",
    description: "Two founders. One mission: Make AI tool discovery honest, intelligent, and human. 700+ tools, 400+ community members, zero affiliate corruption.",
    type: "website",
    url: "https://currly.com/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Currly - Honest AI Tools Discovery",
    description: "The AI discovery platform with zero affiliate bias. 700+ tools vetted weekly since August 2025.",
  },
  alternates: {
    canonical: 'https://currly.ai/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      
      {/* --- NAV --- */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-gray-800 dark:bg-black/80">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <span className="font-bold text-xl tracking-tight">Currly</span>
        </div>
      </nav>

      {/* --- HERO: THE LIGHTHOUSE --- */}
      <section className="relative py-24 px-4 text-center border-b border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700 mb-8 dark:bg-blue-900/30 dark:text-blue-300">
            <Zap className="h-3 w-3" /> Established August 2025
          </div>
          <h1 className="mb-8 text-5xl font-extrabold tracking-tight md:text-7xl text-gray-900 dark:text-white leading-tight">
            We Built a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Lighthouse</span> <br />
            in a Sea of AI Tools.
          </h1>
          <div className="prose prose-lg dark:prose-invert mx-auto text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
            <p>
              In a world where 10,000+ AI tools compete for your attention—and new ones launch every single day—finding the right one shouldn't feel like gambling.
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              Yet it does. Because discovery is broken.
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        
        {/* --- THE PROBLEM --- */}
        <section className="mb-32">
          <div className="border-l-4 border-gray-200 dark:border-gray-700 pl-8 py-2">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">The Problem We Saw</h2>
            <div className="text-lg text-gray-600 dark:text-gray-300 space-y-6 leading-relaxed">
              <p>
                August 2025. Two professionals, same frustration: Every search for AI tools led to the same dead ends. Listicles ranked by affiliate commissions. "Reviews" written by marketers who'd never opened the product.
              </p>
              <p>
                The entire AI tools discovery ecosystem was built on a corrupted incentive: <strong>Get paid to recommend, regardless of whether it's right for the user.</strong>
              </p>
              <p className="font-medium text-gray-900 dark:text-white italic">
                "You can't build honest discovery on dishonest economics."
              </p>
              <p>
                So we started over. Different incentives. Different architecture. Different truth. <strong>That's Currly.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* --- NON-NEGOTIABLES --- */}
        <section className="mb-32">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Non-Negotiables</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Zero Affiliate Corruption",
                desc: "We don't earn commissions. We don't accept payments for rankings. When we recommend a tool, it's because it genuinely solves your problem.",
                color: "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400",
                icon: Shield
              },
              {
                title: "Individuals Over Enterprises",
                desc: "Currly exists for you—the solo developer, the freelance designer, the marketer on a budget. Not enterprise procurement teams.",
                color: "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400",
                icon: Users
              },
              {
                title: "Intelligence Over Lists",
                desc: "We're not a directory with a search bar. We're a discovery engine. Search by intent, not just keywords. Context matters.",
                color: "bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400",
                icon: Search
              },
              {
                title: "Current Over Archived",
                desc: "Every Sunday at 9 AM IST since August 2025—without missing a single week—we update. If it's on Currly, it's current.",
                color: "bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400",
                icon: Clock
              }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-3xl border border-gray-100 bg-white dark:bg-[#111] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- HOW WE WORK --- */}
        <section className="mb-32 bg-gray-50 dark:bg-[#111] rounded-3xl p-10 md:p-16">
          <h2 className="text-3xl font-bold mb-12 text-center">How We Actually Work</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="pl-6 border-l-4 border-indigo-500">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Research, Not Aggregation</h3>
                <p className="text-gray-600 dark:text-gray-400">We don't scrape Product Hunt. Every tool is manually evaluated. We test interfaces, read docs, and analyze use cases. 700+ tools vetted.</p>
              </div>
              <div className="pl-6 border-l-4 border-purple-500">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Honest Reviews</h3>
                <p className="text-gray-600 dark:text-gray-400">No tool is perfect. We show the brilliant parts AND the broken parts. Truth over hype. Always.</p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="pl-6 border-l-4 border-pink-500">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Community-Validated</h3>
                <p className="text-gray-600 dark:text-gray-400">400+ professionals contribute real experiences. Collective intelligence, not corporate marketing.</p>
              </div>
              <div className="pl-6 border-l-4 border-amber-500">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Forever Free</h3>
                <p className="text-gray-600 dark:text-gray-400">Discovery should never be paywalled. Our business model will never compromise our editorial integrity.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- VISION --- */}
        <section className="mb-32 text-center">
          <h2 className="text-3xl font-bold mb-4">The Three-Stage Vision</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-12">We're building the operating system for AI-powered work.</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl border border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800">
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">Stage 1: Live Now</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Discovery ✅</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Semantic search. Honest validation. Weekly updates. Where trust begins.</p>
            </div>
            <div className="p-8 rounded-2xl border border-gray-200 bg-white dark:bg-[#111] dark:border-gray-800 opacity-70 hover:opacity-100 transition-opacity">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Stage 2: In Dev</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Orchestration 🔄</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Connect tools. Automate workflows. Build your custom AI stack without coding.</p>
            </div>
            <div className="p-8 rounded-2xl border border-gray-200 bg-white dark:bg-[#111] dark:border-gray-800 opacity-70 hover:opacity-100 transition-opacity">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Stage 3: 2026</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Optimization 📊</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Track usage. Measure ROI. Identify redundancies. Where intelligence becomes strategy.</p>
            </div>
          </div>
        </section>

        {/* --- FOUNDERS --- */}
        <section className="mb-32">
          <h2 className="text-3xl font-bold mb-12 text-center">The Humans Behind Currly</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Rohit */}
            <div className="rounded-3xl border border-gray-200 bg-white p-10 dark:border-gray-800 dark:bg-[#111] relative overflow-hidden group hover:border-blue-500 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Code className="w-32 h-32" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Rohit Mallavarapu</h3>
              <p className="text-sm text-blue-600 font-bold uppercase tracking-wide mb-6">Co-Founder & Product Architect</p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                The engineer who thinks like a researcher. Rohit builds the intelligence layer—the extraction engine, the semantic search, the data pipeline that never breaks.
                When he's not vetting tools, he's debugging code at 2 AM or testing prompt engineering techniques.
              </p>
              <blockquote className="border-l-2 border-blue-500 pl-4 text-sm italic text-gray-700 dark:text-gray-400">
                "Great products aren't built on features. They're built on systems that never lie."
              </blockquote>
            </div>

            {/* Ashish */}
            <div className="rounded-3xl border border-gray-200 bg-white p-10 dark:border-gray-800 dark:bg-[#111] relative overflow-hidden group hover:border-purple-500 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe className="w-32 h-32" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Ashish Singh</h3>
              <p className="text-sm text-purple-600 font-bold uppercase tracking-wide mb-6">Co-Founder & Strategic Vision</p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                The strategist who thinks like a storyteller. Ashish shapes Currly's positioning and principles.
                He believes trust isn't marketed—it's earned through consistent truth. He argues that ethics and growth aren't opposites.
              </p>
              <blockquote className="border-l-2 border-purple-500 pl-4 text-sm italic text-gray-700 dark:text-gray-400">
                "Platforms that start with integrity don't have to fix their reputation later."
              </blockquote>
            </div>
          </div>
        </section>

        {/* --- NUMBERS --- */}
        <section className="mb-32">
          <h2 className="text-center text-sm font-bold text-gray-500 uppercase tracking-wider mb-8">Currly by the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: "700+", label: "Tools Vetted", color: "from-blue-500 to-blue-700" },
              { num: "400+", label: "Community Members", color: "from-purple-500 to-pink-500" },
              { num: "16+", label: "Tool Categories", color: "from-cyan-500 to-blue-500" },
              { num: "100%", label: "Updated Weekly", color: "from-pink-500 to-rose-500" },
            ].map((stat, i) => (
              <div key={i} className={`p-8 rounded-2xl bg-gradient-to-br ${stat.color} text-white text-center shadow-lg`}>
                <div className="text-4xl font-extrabold mb-2">{stat.num}</div>
                <div className="text-sm opacity-90 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* --- REAL ANSWERS (FAQ) --- */}
        <section className="mb-32 bg-gray-50 dark:bg-[#111] rounded-3xl p-10 md:p-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Real Answers</h2>
          <div className="space-y-8 max-w-3xl mx-auto">
            <div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">Q: Why should I trust Currly?</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">A: Because our incentives are aligned with yours. Most platforms earn affiliate commissions. We earn zero commissions. Our only incentive is accuracy—because if we lose your trust, we lose everything.</p>
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">Q: How do you make money?</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">A: We don't yet. Future revenue will come from premium features (orchestration, analytics), but the discovery engine will always be free. We'd rather grow slowly with integrity than quickly with compromise.</p>
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">Q: Can companies pay for rankings?</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">A: No. We've already turned down sponsorship offers. Rankings are determined by quality, not payments.</p>
            </div>
          </div>
        </section>

        {/* --- CTA --- */}
        <section className="relative rounded-3xl bg-black p-12 md:p-20 text-center text-white dark:bg-white dark:text-black overflow-hidden">
          <div className="relative z-10">
            <h2 className="mb-6 text-3xl md:text-5xl font-bold">Ready to Discover AI Tools the Right Way?</h2>
            <p className="mb-10 text-lg text-gray-400 dark:text-gray-600 max-w-2xl mx-auto">
              No affiliate bias. No marketing fluff. Just honest, intelligent discovery—updated every Sunday.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/" className="rounded-full bg-blue-600 px-8 py-4 font-bold text-white hover:bg-blue-700 hover:scale-105 transition-all shadow-lg shadow-blue-500/30">
                Explore 700+ Tools
              </Link>
              <a href="https://chat.whatsapp.com/GVmP0Pz4ni5IU2znJ3Iibf?mode=hqrt3" target="_blank" rel="noopener noreferrer" className="rounded-full border border-gray-700 bg-transparent px-8 py-4 font-bold hover:bg-white/10 dark:border-gray-300 dark:hover:bg-black/5 transition-colors flex items-center gap-2">
                Join WhatsApp Community
              </a>
            </div>
          </div>
        </section>

        {/* --- FOOTER NOTE --- */}
        <div className="text-center text-gray-500 text-sm mt-16">
          <p>Currly — Built in August 2025. Updated every Sunday at 9 AM IST.</p>
          <p className="mt-2">Honest forever. Free forever. For you forever.</p>
          <a href="mailto:hello@currly.com" className="mt-4 inline-block hover:text-blue-600 transition-colors">hello@currly.com</a>
        </div>

      </main>
      
      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About Currly",
            "description": "Currly is an AI tools discovery platform built on honesty and zero affiliate bias. Founded in August 2025.",
            "mainEntity": {
              "@type": "Organization",
              "name": "Currly",
              "foundingDate": "2025-08",
              "founder": [
                { "@type": "Person", "name": "Rohit Mallavarapu", "jobTitle": "Co-Founder & Product Architect" },
                { "@type": "Person", "name": "Ashish Singh", "jobTitle": "Co-Founder & Strategic Vision" }
              ],
              "email": "hello@currly.com"
            },
            "mainEntityOfPage": {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Why should I trust Currly?",
                  "acceptedAnswer": { "@type": "Answer", "text": "We earn zero affiliate commissions. Our only incentive is accuracy." }
                },
                {
                  "@type": "Question",
                  "name": "How does Currly make money?",
                  "acceptedAnswer": { "@type": "Answer", "text": "We don't yet. Future revenue will come from premium features, but discovery is free." }
                }
              ]
            }
          })
        }}
      />
    </div>
  );
}

// Helper icon component
function Code({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}