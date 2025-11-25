import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Linkedin, ArrowRight, Shield, Search, Clock, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: "About Currly - The Honest AI Tools Discovery Platform",
  description: "We built a lighthouse in a sea of AI tools. Honest, unbiased, and built for you.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#0066FF] selection:text-white">
      
      {/* --- NAV --- */}
      <nav className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-md px-6 py-5">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:text-[#0066FF] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <span className="font-bold text-xl tracking-tight">Currly</span>
        </div>
      </nav>

      {/* --- HERO --- */}
      <header className="container mx-auto px-4 py-24 md:py-40 border-b border-black/10">
        <div className="max-w-5xl">
          <p className="text-[#0066FF] font-bold uppercase tracking-widest mb-6 text-xs">[ About Us ]</p>
          <h1 className="text-5xl md:text-8xl font-bold leading-[1.05] mb-12 tracking-tight">
            We built a lighthouse in a <br />
            sea of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] to-blue-400">AI tools.</span>
          </h1>
          <div className="max-w-2xl text-xl md:text-2xl leading-relaxed text-gray-800 font-medium">
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
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-400 sticky top-32">[ The Problem ]</h3>
            </div>
            <div className="md:col-span-8 prose prose-lg prose-gray max-w-none text-gray-700 leading-loose">
              <p className="text-3xl font-medium text-black mb-8 leading-tight">
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

        {/* --- VALUES GRID (Unique Style) --- */}
        <section className="border-t border-black/10 bg-gray-50">
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/10">
            
            {/* Title Block - Electric Blue */}
            <div className="bg-[#0066FF] p-12 text-white min-h-[400px] flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              <span className="uppercase tracking-widest font-bold text-xs text-white/60 relative z-10">[ Core Values ]</span>
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white mb-6">What we stand for</h2>
                <p className="text-white/90 text-lg leading-relaxed">
                  Our values aren't just buzzwords. They are the guardrails that shape every recommendation we deliver.
                </p>
              </div>
            </div>

            {/* Value 1 */}
            <div className="p-12 bg-white min-h-[400px] flex flex-col justify-between hover:bg-blue-50/30 transition-colors group">
              <Shield className="h-8 w-8 text-gray-300 group-hover:text-[#0066FF] transition-colors mb-auto" />
              <div>
                <h3 className="text-2xl font-bold mb-4">Zero Affiliate Corruption</h3>
                <p className="text-gray-600 leading-relaxed">
                  We don't earn commissions. We don't accept payments for rankings. When we recommend a tool, it's because it genuinely solves your problem.
                </p>
              </div>
            </div>

            {/* Value 2 */}
            <div className="p-12 bg-white min-h-[400px] flex flex-col justify-between hover:bg-blue-50/30 transition-colors group">
              <Users className="h-8 w-8 text-gray-300 group-hover:text-[#0066FF] transition-colors mb-auto" />
              <div>
                <h3 className="text-2xl font-bold mb-4">Individuals Over Enterprises</h3>
                <p className="text-gray-600 leading-relaxed">
                  Currly exists for you—the solo developer, the freelance designer, the marketer on a budget. Not enterprise procurement teams.
                </p>
              </div>
            </div>

          </div>
          
          {/* Row 2 of Grid */}
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/10 border-t border-black/10">
             {/* Value 3 */}
             <div className="p-12 bg-white min-h-[350px] flex flex-col justify-between hover:bg-blue-50/30 transition-colors group">
              <Search className="h-8 w-8 text-gray-300 group-hover:text-[#0066FF] transition-colors mb-auto" />
              <div>
                <h3 className="text-2xl font-bold mb-4">Intelligence Over Lists</h3>
                <p className="text-gray-600 leading-relaxed">
                  We're not a directory. We're a discovery engine. Search by intent, not just keywords. Context matters.
                </p>
              </div>
            </div>

            {/* Value 4 */}
            <div className="p-12 bg-white min-h-[350px] flex flex-col justify-between hover:bg-blue-50/30 transition-colors group">
              <Clock className="h-8 w-8 text-gray-300 group-hover:text-[#0066FF] transition-colors mb-auto" />
              <div>
                <h3 className="text-2xl font-bold mb-4">Current Over Archived</h3>
                <p className="text-gray-600 leading-relaxed">
                  Updated every Sunday at 9 AM IST. Without fail. If it's on Currly, it's current.
                </p>
              </div>
            </div>

            {/* Design Element */}
            <div className="p-12 bg-[#F8FAFC] flex items-center justify-center border-l border-black/10">
                <div className="text-center opacity-50">
                    <div className="text-5xl mb-4 font-serif italic">"Unbiased."</div>
                    <p className="font-bold text-gray-400 uppercase text-xs tracking-[0.2em]">Always.</p>
                </div>
            </div>
          </div>
        </section>

        {/* --- FOUNDERS --- */}
        <section className="bg-[#0A0A0A] text-white py-32">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                 <h2 className="text-4xl md:text-5xl font-bold mb-6">Meet the <br/><span className="text-[#0066FF]">Humans.</span></h2>
                 <p className="text-gray-400 leading-relaxed mb-8">
                   Two founders. One mission: Make AI tool discovery honest, intelligent, and human.
                 </p>
                 <div className="hidden md:block w-12 h-1 bg-[#0066FF]"></div>
              </div>

              <div className="md:col-span-8">
                {/* IMAGE CONTAINER */}
                <div className="aspect-[16/9] relative w-full mb-16 overflow-hidden bg-gray-800 border border-white/10">
                   <img 
                     src="/founders.jpg" 
                     alt="Rohit and Ashish" 
                     className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
                   />
                </div>

                <div className="grid md:grid-cols-2 gap-16">
                  <div>
                    <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                      <h3 className="text-2xl font-bold">Rohit Bangaram</h3>
                      <a href="#" className="text-[#0066FF] hover:text-white transition-colors"><Linkedin size={20}/></a>
                    </div>
                    <p className="text-sm font-bold text-[#0066FF] uppercase tracking-wider mb-3">Product Architect</p>
                    <p className="text-gray-400 leading-relaxed">
                      The engineer who thinks like a researcher. Rohit builds the intelligence layer—the extraction engine and semantic search pipeline that never breaks. He believes great products are built on systems that never lie.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                      <h3 className="text-2xl font-bold">Ashish Singh</h3>
                      <a href="#" className="text-[#0066FF] hover:text-white transition-colors"><Linkedin size={20}/></a>
                    </div>
                    <p className="text-sm font-bold text-[#0066FF] uppercase tracking-wider mb-3">Strategic Vision</p>
                    <p className="text-gray-400 leading-relaxed">
                      The strategist who thinks like a storyteller. Ashish shapes Currly's positioning and principles. He believes trust isn't marketed—it's earned through consistent truth.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- VISION (Simplified) --- */}
        <section className="py-32 container mx-auto px-4 border-b border-black/10">
           <div className="max-w-5xl mx-auto">
             <div className="text-center mb-20">
                <span className="text-[#0066FF] font-bold uppercase tracking-widest text-xs mb-4 block">[ Roadmap ]</span>
                <h2 className="text-3xl md:text-5xl font-bold">The Three-Stage Vision</h2>
             </div>
             
             <div className="grid md:grid-cols-3 gap-8">
               {/* Stage 1 */}
               <div className="border-t-4 border-[#0066FF] pt-8 pr-4">
                 <div className="flex justify-between items-center mb-4">
                    <div className="text-xs font-bold text-black uppercase tracking-wider">Stage 1 (Now)</div>
                    <div className="h-2 w-2 rounded-full bg-[#0066FF]"></div>
                 </div>
                 <h3 className="text-3xl font-bold mb-2 text-black">Discovery</h3>
                 <p className="text-gray-500 text-sm mt-4">Find the right tool. Semantic search. Honest validation. Zero bias.</p>
               </div>

               {/* Stage 2 */}
               <div className="border-t-4 border-gray-200 pt-8 pr-4 opacity-50">
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Stage 2</div>
                 <h3 className="text-3xl font-bold mb-2 text-black">Orchestration</h3>
               </div>

               {/* Stage 3 */}
               <div className="border-t-4 border-gray-200 pt-8 pr-4 opacity-50">
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Stage 3</div>
                 <h3 className="text-3xl font-bold mb-2 text-black">Optimization</h3>
               </div>
             </div>
           </div>
        </section>

        {/* --- CTA --- */}
        <section className="bg-[#0066FF] py-32 text-center px-4 text-white relative overflow-hidden">
          {/* Background decorative circles */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
             <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
             <div className="absolute top-1/2 right-0 w-64 h-64 bg-black rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
              Take back control of your stack.
            </h2>
            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              No affiliate bias. No marketing fluff. Just honest, intelligent discovery.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/" className="group bg-white text-[#0066FF] px-10 py-5 text-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-xl hover:translate-y-[-2px]">
                Start Exploring <ArrowRight className="group-hover:translate-x-1 transition-transform"/>
              </Link>
              <Link href="https://chat.whatsapp.com/GVmP0Pz4ni5IU2znJ3Iibf?mode=hqrt3" target="_blank" className="px-10 py-5 text-lg font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-colors">
                Join Community
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}