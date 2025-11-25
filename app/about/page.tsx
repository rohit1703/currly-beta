import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Linkedin, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: "About Currly - The Honest AI Tools Discovery Platform",
  description: "We built a lighthouse in a sea of AI tools. Honest, unbiased, and built for you.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#FF9F43] selection:text-black">
      
      {/* --- NAV --- */}
      <nav className="sticky top-0 z-50 border-b border-black bg-white px-6 py-5">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:text-[#FF9F43] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <span className="font-bold text-xl tracking-tight">Currly</span>
        </div>
      </nav>

      {/* --- HERO --- */}
      <header className="container mx-auto px-4 py-32 md:py-48 border-b border-gray-100">
        <div className="max-w-5xl">
          <p className="text-[#FF9F43] font-bold uppercase tracking-widest mb-6 text-sm">[ About Us ]</p>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-12 tracking-tight">
            We built a lighthouse in a <br />
            sea of <span className="bg-[#FF9F43] px-2 text-white">AI tools.</span>
          </h1>
          <div className="max-w-2xl text-xl md:text-2xl leading-relaxed text-gray-800">
            <p>
              In a world where 10,000+ AI tools compete for your attention, finding the right one shouldn't feel like gambling. Yet it does. Because discovery is broken.
            </p>
          </div>
        </div>
      </header>

      <main>
        {/* --- THE NARRATIVE --- */}
        <section className="container mx-auto px-4 py-24">
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <h3 className="text-lg font-bold uppercase tracking-wide text-gray-400">[ The Problem ]</h3>
            </div>
            <div className="md:col-span-8 prose prose-lg prose-gray max-w-none text-gray-700 leading-loose">
              <p className="text-2xl font-medium text-black mb-8">
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

        {/* --- VALUES GRID (Dragonfly Style) --- */}
        <section className="border-t border-black">
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black">
            
            {/* Title Block - Orange */}
            <div className="bg-[#FF9F43] p-12 text-white min-h-[400px] flex flex-col justify-between">
              <span className="uppercase tracking-widest font-bold text-sm text-black/60">[ Core Values ]</span>
              <div>
                <h2 className="text-4xl font-bold text-black mb-6">What we stand for</h2>
                <p className="text-black/80 text-lg leading-relaxed">
                  Our values aren't just buzzwords. They are the guardrails that shape every recommendation we deliver.
                </p>
              </div>
            </div>

            {/* Value 1 */}
            <div className="p-12 bg-white min-h-[400px] flex flex-col justify-between hover:bg-gray-50 transition-colors">
              <span className="text-gray-400 font-mono">[ 01 ]</span>
              <div>
                <h3 className="text-2xl font-bold mb-4">Zero Affiliate Corruption</h3>
                <p className="text-gray-600 leading-relaxed">
                  We don't earn commissions. We don't accept payments for rankings. When we recommend a tool, it's because it genuinely solves your problem.
                </p>
              </div>
            </div>

            {/* Value 2 */}
            <div className="p-12 bg-white min-h-[400px] flex flex-col justify-between hover:bg-gray-50 transition-colors">
              <span className="text-gray-400 font-mono">[ 02 ]</span>
              <div>
                <h3 className="text-2xl font-bold mb-4">Individuals Over Enterprises</h3>
                <p className="text-gray-600 leading-relaxed">
                  Currly exists for you—the solo developer, the freelance designer, the marketer on a budget. Not enterprise procurement teams.
                </p>
              </div>
            </div>

          </div>
          
          {/* Row 2 of Grid */}
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black border-t border-black">
             {/* Value 3 */}
             <div className="p-12 bg-white min-h-[300px] flex flex-col justify-between hover:bg-gray-50 transition-colors">
              <span className="text-gray-400 font-mono">[ 03 ]</span>
              <div>
                <h3 className="text-2xl font-bold mb-4">Intelligence Over Lists</h3>
                <p className="text-gray-600 leading-relaxed">
                  We're not a directory. We're a discovery engine. Search by intent, not just keywords. Context matters.
                </p>
              </div>
            </div>

            {/* Value 4 */}
            <div className="p-12 bg-white min-h-[300px] flex flex-col justify-between hover:bg-gray-50 transition-colors">
              <span className="text-gray-400 font-mono">[ 04 ]</span>
              <div>
                <h3 className="text-2xl font-bold mb-4">Current Over Archived</h3>
                <p className="text-gray-600 leading-relaxed">
                  Updated every Sunday at 9 AM IST. Without fail. If it's on Currly, it's current.
                </p>
              </div>
            </div>

            {/* Empty Block / Design Element */}
            <div className="p-12 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🛡️</div>
                    <p className="font-bold text-gray-400 uppercase">Unbiased.<br/>Always.</p>
                </div>
            </div>
          </div>
        </section>

        {/* --- FOUNDERS --- */}
        <section className="bg-[#111] text-white py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-[#FF9F43] font-bold uppercase tracking-widest mb-4 block">[ The Humans ]</span>
              <h2 className="text-4xl md:text-5xl font-bold">Meet the Founders</h2>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* IMAGE CONTAINER */}
              <div className="aspect-[16/9] relative w-full mb-12 overflow-hidden rounded-sm border border-white/10">
                 {/* Ensure you name your uploaded file 'founders.jpg' and put it in the 'public' folder */}
                 <img 
                   src="/founders.jpg" 
                   alt="Rohit and Ashish" 
                   className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
                 />
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <div className="flex justify-between items-start mb-4 border-b border-white/20 pb-4">
                    <div>
                        <h3 className="text-2xl font-bold">Rohit Bangaram</h3>
                        <span className="text-[#FF9F43] text-sm font-bold tracking-wider">PRODUCT ARCHITECT</span>
                    </div>
                    <a href="#" className="text-gray-400 hover:text-white"><Linkedin size={20}/></a>
                  </div>
                  <p className="text-gray-400 leading-relaxed">
                    The engineer who thinks like a researcher. Rohit builds the intelligence layer—the extraction engine and semantic search pipeline that never breaks. He believes great products aren't built on features, but on systems that never lie.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-start mb-4 border-b border-white/20 pb-4">
                    <div>
                        <h3 className="text-2xl font-bold">Ashish Singh</h3>
                        <span className="text-[#FF9F43] text-sm font-bold tracking-wider">STRATEGIC VISION</span>
                    </div>
                    <a href="#" className="text-gray-400 hover:text-white"><Linkedin size={20}/></a>
                  </div>
                  <p className="text-gray-400 leading-relaxed">
                    The strategist who thinks like a storyteller. Ashish shapes Currly's positioning and principles. He believes trust isn't marketed—it's earned through consistent truth, and that ethics and growth aren't opposites.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- VISION (Simplified) --- */}
        <section className="py-32 container mx-auto px-4 border-b border-gray-100">
           <div className="max-w-5xl mx-auto">
             <h2 className="text-3xl font-bold mb-16 text-center">The Three-Stage Vision</h2>
             <div className="grid md:grid-cols-3 gap-8">
               <div className="border-t-4 border-[#FF9F43] pt-6">
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Stage 1 (Now)</div>
                 <h3 className="text-2xl font-bold mb-2">Discovery</h3>
               </div>
               <div className="border-t-4 border-gray-200 pt-6 opacity-60">
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Stage 2</div>
                 <h3 className="text-2xl font-bold mb-2">Orchestration</h3>
               </div>
               <div className="border-t-4 border-gray-200 pt-6 opacity-60">
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Stage 3</div>
                 <h3 className="text-2xl font-bold mb-2">Optimization</h3>
               </div>
             </div>
           </div>
        </section>

        {/* --- CTA (Dragonfly Orange) --- */}
        <section className="bg-[#FF9F43] py-32 text-center px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-black border border-black inline-block p-3 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Take back control of your <br/> technology stack.
            </h2>
            <p className="text-black/80 text-xl mb-12 max-w-2xl mx-auto font-medium">
              No affiliate bias. No marketing fluff. Just honest, intelligent discovery.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/" className="group bg-black text-white px-10 py-4 text-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
                Start Exploring <ArrowRight className="group-hover:translate-x-1 transition-transform"/>
              </Link>
              <Link href="https://chat.whatsapp.com/GVmP0Pz4ni5IU2znJ3Iibf?mode=hqrt3" target="_blank" className="px-10 py-4 text-lg font-bold text-black border-2 border-black hover:bg-white transition-colors">
                Join Community
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}