import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield, Users, Zap, Search, Clock, Linkedin, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: "About Currly - The Honest AI Tools Discovery Platform",
  description: "We built a lighthouse in a sea of AI tools. Honest, unbiased, and built for you.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#0066FF] selection:text-white overflow-x-hidden">
      
      {/* --- LIGHTHOUSE BEAM EFFECT --- */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#0066FF] opacity-20 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* --- NAV --- */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl px-6 py-5">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <span className="font-bold text-xl tracking-tight">Currly</span>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* --- HERO --- */}
        <header className="container mx-auto px-4 py-32 md:py-48 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0066FF]/30 bg-[#0066FF]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0066FF] mb-8 shadow-[0_0_20px_rgba(0,102,255,0.3)]">
            <Zap className="h-3 w-3" /> Est. August 2025
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold leading-[1.1] mb-12 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500">
            We built a lighthouse in a <br />
            sea of AI tools.
          </h1>
          
          <div className="max-w-2xl mx-auto text-xl md:text-2xl leading-relaxed text-gray-400 font-medium">
            <p>
              In a world where 10,000+ AI tools compete for your attention, finding the right one shouldn't feel like gambling.
            </p>
            <p className="text-white mt-4">
              Yet it does. Because discovery is broken.
            </p>
          </div>
        </header>

        {/* --- THE PROBLEM (Glass Card) --- */}
        <section className="container mx-auto px-4 mb-32">
          <div className="max-w-4xl mx-auto rounded-3xl border border-white/10 bg-white/5 p-8 md:p-16 backdrop-blur-sm relative overflow-hidden">
            {/* Decorative gradient inside card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full" />
            
            <h2 className="text-3xl font-bold mb-8 text-white relative z-10">The Problem We Saw</h2>
            <div className="prose prose-lg prose-invert max-w-none text-gray-300 leading-relaxed relative z-10">
              <p className="text-xl font-medium text-white mb-8 border-l-4 border-[#0066FF] pl-6 py-2">
                "You can't build honest discovery on dishonest economics."
              </p>
              <p>
                August 2025. Two professionals, same frustration: Every search for AI tools led to the same dead ends. Listicles ranked by affiliate commissions. "Reviews" written by marketers who'd never opened the product.
              </p>
              <p>
                The entire AI tools discovery ecosystem was built on a corrupted incentive: <strong>Get paid to recommend, regardless of whether it's right for the user.</strong>
              </p>
              <p>
                So we started over. Different incentives. Different architecture. Different truth. <strong>That's Currly.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* --- NON-NEGOTIABLES (Grid) --- */}
        <section className="container mx-auto px-4 mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Our Non-Negotiables</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Zero Affiliate Corruption",
                desc: "We don't earn commissions. We don't accept payments for rankings. When we recommend a tool, it's because it genuinely solves your problem.",
                icon: Shield,
                gradient: "from-red-500/20 to-orange-500/5"
              },
              {
                title: "Individuals Over Enterprises",
                desc: "Currly exists for you—the solo developer, the freelance designer, the marketer on a budget. Not enterprise procurement teams.",
                icon: Users,
                gradient: "from-blue-500/20 to-cyan-500/5"
              },
              {
                title: "Intelligence Over Lists",
                desc: "We're not a directory. We're a discovery engine. Search by intent, not just keywords. Context matters.",
                icon: Search,
                gradient: "from-purple-500/20 to-pink-500/5"
              },
              {
                title: "Current Over Archived",
                desc: "Updated every Sunday at 9 AM IST. Without fail. If it's on Currly, it's current.",
                icon: Clock,
                gradient: "from-green-500/20 to-emerald-500/5"
              }
            ].map((item, i) => (
              <div key={i} className={`group p-10 rounded-3xl border border-white/10 bg-gradient-to-br ${item.gradient} hover:border-[#0066FF]/50 transition-all duration-300 relative overflow-hidden`}>
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity">
                  <item.icon className="h-24 w-24 text-white/5 group-hover:text-[#0066FF]/20" />
                </div>
                <item.icon className="h-10 w-10 text-white mb-6" />
                <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- FOUNDERS (Side by Side) --- */}
        <section className="container mx-auto px-4 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">The Humans Behind Currly</h2>
            <p className="text-gray-400 mt-4">Two founders. One mission.</p>
          </div>

          <div className="max-w-5xl mx-auto rounded-[2rem] border border-white/10 bg-white/5 overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Image Side */}
              <div className="relative h-[400px] md:h-auto border-b md:border-b-0 md:border-r border-white/10">
                 <img 
                   src="/founders.jpg" 
                   alt="Rohit and Ashish" 
                   className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0"
                 />
              </div>

              {/* Content Side */}
              <div className="p-10 md:p-16 flex flex-col justify-center space-y-12">
                {/* Rohit */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-2xl font-bold text-white">Rohit Bangaram</h3>
                    <a href="#" className="text-gray-500 hover:text-[#0066FF]"><Linkedin size={20}/></a>
                  </div>
                  <p className="text-xs font-bold text-[#0066FF] uppercase tracking-wider mb-4">Product Architect</p>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    The engineer who thinks like a researcher. Builds the intelligence layer and extraction engine. Believes systems > features.
                  </p>
                </div>

                {/* Ashish */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-2xl font-bold text-white">Ashish Singh</h3>
                    <a href="#" className="text-gray-500 hover:text-[#0066FF]"><Linkedin size={20}/></a>
                  </div>
                  <p className="text-xs font-bold text-[#0066FF] uppercase tracking-wider mb-4">Strategic Vision</p>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    The strategist who thinks like a storyteller. Shapes positioning and principles. Believes trust isn't marketed—it's earned.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- VISION (3 Stages) --- */}
        <section className="container mx-auto px-4 mb-32">
           <h2 className="text-3xl font-bold text-center mb-16">The Three-Stage Vision</h2>
           <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
             
             {/* Stage 1 */}
             <div className="p-8 rounded-2xl bg-[#0066FF] text-white border border-[#0066FF] shadow-[0_0_30px_rgba(0,102,255,0.3)] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-20"><CheckCircle2 size={40}/></div>
               <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Stage 1: Live Now</div>
               <h3 className="text-2xl font-bold mb-2">Discovery</h3>
               <p className="text-white/80 text-sm">Semantic search. Honest validation. Weekly updates. Where trust begins.</p>
             </div>

             {/* Stage 2 */}
             <div className="p-8 rounded-2xl bg-white/5 text-gray-400 border border-white/10 border-dashed">
               <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60">Stage 2</div>
               <h3 className="text-2xl font-bold mb-2 text-white">Orchestration</h3>
               <p className="text-sm opacity-60">In Development</p>
             </div>

             {/* Stage 3 */}
             <div className="p-8 rounded-2xl bg-white/5 text-gray-400 border border-white/10 border-dashed">
               <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60">Stage 3: 2026</div>
               <h3 className="text-2xl font-bold mb-2 text-white">Optimization</h3>
               <p className="text-sm opacity-60">Planned</p>
             </div>

           </div>
        </section>

        {/* --- NUMBERS --- */}
        <section className="container mx-auto px-4 mb-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
            {[
              { num: "700+", label: "Tools Vetted" },
              { num: "400+", label: "Community" },
              { num: "16+", label: "Categories" },
              { num: "100%", label: "Updated Weekly" },
            ].map((stat, i) => (
              <div key={i} className="bg-[#0A0A0A] p-10 text-center hover:bg-white/5 transition-colors">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.num}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* --- REAL ANSWERS (FAQ) --- */}
        <section className="container mx-auto px-4 mb-32">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Real Answers</h2>
            <div className="space-y-8">
              <div className="p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <h3 className="font-bold text-xl text-white mb-3">Q: Why should I trust Currly?</h3>
                <p className="text-gray-400 leading-relaxed">A: Because our incentives are aligned with yours. Most platforms earn affiliate commissions. We earn zero commissions. Our only incentive is accuracy—because if we lose your trust, we lose everything.</p>
              </div>
              <div className="p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <h3 className="font-bold text-xl text-white mb-3">Q: How do you make money?</h3>
                <p className="text-gray-400 leading-relaxed">A: We don't yet. Future revenue will come from premium features (orchestration, analytics), but the discovery engine will always be free.</p>
              </div>
              <div className="p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <h3 className="font-bold text-xl text-white mb-3">Q: Can companies pay for rankings?</h3>
                <p className="text-gray-400 leading-relaxed">A: No. We've already turned down sponsorship offers. Rankings are determined by quality, not payments.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- CTA --- */}
        <section className="container mx-auto px-4 mb-24">
          <div className="relative rounded-[2.5rem] bg-gradient-to-b from-[#0066FF] to-blue-900 overflow-hidden text-center px-6 py-24 md:py-32">
            {/* Glow effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                Take back control of <br/> your tech stack.
              </h2>
              <p className="text-blue-100 text-xl mb-12 font-medium">
                No affiliate bias. No marketing fluff. Just honest discovery.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/" className="rounded-full bg-white text-[#0066FF] px-10 py-4 text-lg font-bold hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-2">
                  Start Exploring <ArrowRight size={20}/>
                </Link>
                <a href="https://chat.whatsapp.com/GVmP0Pz4ni5IU2znJ3Iibf?mode=hqrt3" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-10 py-4 text-lg font-bold text-white hover:bg-white/20 transition-colors">
                  Join Community
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* --- FOOTER NOTE --- */}
        <div className="text-center text-gray-600 text-sm pb-16">
          <p>Currly — Built in August 2025. Updated every Sunday at 9 AM IST.</p>
          <p className="mt-2">Honest forever. Free forever. For you forever.</p>
          <a href="mailto:hello@currly.com" className="mt-4 inline-block hover:text-[#0066FF] transition-colors">hello@currly.com</a>
        </div>

      </main>
    </div>
  );
}