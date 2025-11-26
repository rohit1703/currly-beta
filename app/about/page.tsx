import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Users, Zap, Search, Clock, Linkedin, ArrowRight, CheckCircle2, Code, Globe } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/FooterSection'; // Restoring Footer

export const metadata: Metadata = {
  title: "About Currly - The Honest AI Tools Discovery Platform",
  description: "We built a lighthouse in a sea of AI tools. Honest, unbiased, and built for you.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-black text-black dark:text-white font-sans selection:bg-[#0066FF] selection:text-white overflow-x-hidden transition-colors duration-300">
      
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#0066FF] opacity-5 dark:opacity-20 blur-[120px] rounded-full pointer-events-none z-0" />

      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-black/50 backdrop-blur-xl px-6 py-5 transition-colors">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-4">
             <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        
        <header className="container mx-auto px-4 py-24 md:py-40 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white dark:bg-[#0066FF]/10 dark:border-[#0066FF]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0066FF] mb-8 shadow-sm">
            <Zap className="h-3 w-3" /> Est. August 2025
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold leading-[1.1] mb-12 tracking-tight text-black dark:text-white">
            We built a lighthouse in a <br />
            <span className="text-[#0066FF]">sea of AI tools.</span>
          </h1>
          
          <div className="max-w-2xl mx-auto text-xl md:text-2xl leading-relaxed text-gray-800 dark:text-gray-300 font-medium">
            <p>In a world where 10,000+ AI tools compete for your attention, finding the right one shouldn&apos;t feel like gambling.</p>
            <p className="text-black dark:text-white mt-4 font-bold">Yet it does. Because discovery is broken.</p>
          </div>
        </header>

        {/* THE PROBLEM */}
        <section className="container mx-auto px-4 mb-32">
          <div className="max-w-4xl mx-auto rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 md:p-16 shadow-xl dark:shadow-none relative overflow-hidden">
            <h2 className="text-3xl font-bold mb-8 text-black dark:text-white relative z-10">The Problem We Saw</h2>
            <div className="text-lg md:text-xl leading-relaxed space-y-8 relative z-10 text-gray-800 dark:text-gray-300">
              <div className="border-l-4 border-[#0066FF] pl-6 py-2 bg-blue-50 dark:bg-transparent rounded-r-lg">
                <p className="font-semibold text-black dark:text-white italic">&quot;You can&apos;t build honest discovery on dishonest economics.&quot;</p>
              </div>
              <p>August 2025. Two professionals, same frustration: Every search for AI tools led to the same dead ends. Listicles ranked by affiliate commissions. &quot;Reviews&quot; written by marketers who&apos;d never opened the product.</p>
              <p>The entire AI tools discovery ecosystem was built on a corrupted incentive: <strong className="font-bold text-black dark:text-white bg-yellow-100/50 dark:bg-transparent px-1 rounded">Get paid to recommend, regardless of whether it is right for the user.</strong></p>
              <p>So we started over. Different incentives. Different architecture. Different truth. <strong className="font-bold text-black dark:text-white border-b-2 border-[#0066FF]">That is Currly.</strong></p>
            </div>
          </div>
        </section>

        {/* NON-NEGOTIABLES */}
        <section className="container mx-auto px-4 mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-black dark:text-white">Our Non-Negotiables</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Zero Affiliate Corruption", desc: "We don't earn commissions. We don't accept payments for rankings. When we recommend a tool, it's because it genuinely solves your problem.", icon: Shield, color: "text-red-600 dark:text-red-400", bg: "bg-white dark:bg-white/5", border: "border-gray-200 dark:border-white/10" },
              { title: "Individuals Over Enterprises", desc: "Currly exists for you—the solo developer, the freelance designer, the marketer on a budget. Not enterprise procurement teams.", icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-white dark:bg-white/5", border: "border-gray-200 dark:border-white/10" },
              { title: "Intelligence Over Lists", desc: "We're not a directory. We're a discovery engine. Search by intent, not just keywords. Context matters.", icon: Search, color: "text-purple-600 dark:text-purple-400", bg: "bg-white dark:bg-white/5", border: "border-gray-200 dark:border-white/10" },
              { title: "Current Over Archived", desc: "Updated every Sunday at 9 AM IST. Without fail. If it's on Currly, it's current.", icon: Clock, color: "text-green-600 dark:text-green-400", bg: "bg-white dark:bg-white/5", border: "border-gray-200 dark:border-white/10" }
            ].map((item, i) => (
              <div key={i} className={`group p-10 rounded-3xl border ${item.border} ${item.bg} hover:border-[#0066FF] transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md dark:shadow-none`}>
                <div className="absolute top-4 right-4 opacity-5 dark:opacity-20 group-hover:opacity-100 transition-opacity"><item.icon className={`h-24 w-24 ${item.color}`} /></div>
                <item.icon className={`h-10 w-10 mb-6 ${item.color}`} />
                <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">{item.title}</h3>
                <p className="text-gray-700 dark:text-gray-400 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW WE WORK (Restored) */}
        <section className="container mx-auto px-4 mb-32">
          <div className="max-w-5xl mx-auto rounded-3xl bg-black dark:bg-white/5 p-10 md:p-16 text-white">
            <h2 className="text-3xl font-bold mb-12 text-center">How We Actually Work</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="pl-6 border-l-4 border-indigo-500"><h3 className="font-bold text-lg mb-2">Research, Not Aggregation</h3><p className="text-gray-300">We don&apos;t scrape Product Hunt. Every tool is manually evaluated. 700+ tools vetted.</p></div>
                <div className="pl-6 border-l-4 border-purple-500"><h3 className="font-bold text-lg mb-2">Honest Reviews</h3><p className="text-gray-300">No tool is perfect. We show the brilliant parts AND the broken parts.</p></div>
              </div>
              <div className="space-y-6">
                <div className="pl-6 border-l-4 border-pink-500"><h3 className="font-bold text-lg mb-2">Community-Validated</h3><p className="text-gray-300">400+ professionals contribute real experiences. Collective intelligence, not corporate marketing.</p></div>
                <div className="pl-6 border-l-4 border-amber-500"><h3 className="font-bold text-lg mb-2">Forever Free</h3><p className="text-gray-300">Discovery should never be paywalled. Our business model will never compromise our integrity.</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* FOUNDERS */}
        <section className="container mx-auto px-4 mb-32">
          <div className="text-center mb-16"><h2 className="text-4xl font-bold text-black dark:text-white">The Humans Behind Currly</h2><p className="text-gray-600 dark:text-gray-400 mt-4 font-medium">Two founders. One mission.</p></div>
          <div className="max-w-5xl mx-auto rounded-[2rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden shadow-2xl dark:shadow-none">
            <div className="grid md:grid-cols-2">
              <div className="relative h-[400px] md:h-auto border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10"><img src="/founders.jpg" alt="Rohit and Ashish" className="absolute inset-0 w-full h-full object-cover object-top grayscale hover:grayscale-0 transition-all duration-700" /></div>
              <div className="p-10 md:p-16 flex flex-col justify-center space-y-12 bg-white dark:bg-transparent">
                <div>
                  <div className="flex justify-between items-center mb-2"><h3 className="text-2xl font-bold text-black dark:text-white">Rohit Bangaram</h3><a href="#" className="text-gray-400 hover:text-[#0066FF]"><Linkedin size={20}/></a></div>
                  <p className="text-xs font-bold text-[#0066FF] uppercase tracking-wider mb-4">Co-founder, Currly</p>
                  <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed font-medium">The engineer who thinks like a researcher. Rohit builds the intelligence layer—the extraction engine and semantic search pipeline.</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2"><h3 className="text-2xl font-bold text-black dark:text-white">Ashish Singh</h3><a href="#" className="text-gray-400 hover:text-[#0066FF]"><Linkedin size={20}/></a></div>
                  <p className="text-xs font-bold text-[#0066FF] uppercase tracking-wider mb-4">Co-founder, Currly</p>
                  <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed font-medium">The strategist who thinks like a storyteller. Ashish shapes Currly&apos;s positioning and principles.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 mb-24">
          <div className="relative rounded-[2.5rem] bg-gradient-to-b from-[#0066FF] to-blue-900 overflow-hidden text-center px-6 py-24 md:py-32 shadow-2xl">
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">Take back control of <br/> your tech stack.</h2>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/" className="rounded-full bg-white text-[#0066FF] px-10 py-4 text-lg font-bold hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-2">Start Exploring <ArrowRight size={20}/></Link>
                <a href="https://chat.whatsapp.com/GVmP0Pz4ni5IU2znJ3Iibf?mode=hqrt3" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-10 py-4 text-lg font-bold text-white hover:bg-white/20 transition-colors">Join Community</a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}