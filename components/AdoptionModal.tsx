'use client';

import React, { useState } from 'react';
import { X, Terminal, UserCheck, Play, MessageSquare } from 'lucide-react';

interface AdoptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  demoUrl?: string;
}

const AdoptionModal = ({ isOpen, onClose, toolName, demoUrl }: AdoptionModalProps) => {
  const [mode, setMode] = useState<'sandbox' | 'expert'>('sandbox');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      
      {/* THE MISSION CONTROL CONTAINER */}
      <div className="bg-[#0F0F0F] w-full max-w-6xl h-[85vh] rounded-2xl border border-white/10 shadow-2xl flex overflow-hidden relative flex-col md:flex-row">
        
        {/* HEADER (Overlay on Desktop, Top bar on Mobile) */}
        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-center px-6 z-10 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <h2 className="text-white font-bold text-lg">{toolName} <span className="text-neutral-500 font-normal hidden sm:inline">/ Adoption Mode</span></h2>
            <div className="flex bg-neutral-800 rounded-lg p-1 border border-white/5">
              <button 
                onClick={() => setMode('sandbox')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${mode === 'sandbox' ? 'bg-[#D4E6B5] text-black shadow-lg' : 'text-neutral-400 hover:text-white'}`}
              >
                <Terminal className="w-3 h-3" />
                Sandbox
              </button>
              <button 
                onClick={() => setMode('expert')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${mode === 'expert' ? 'bg-[#E6B578] text-black shadow-lg' : 'text-neutral-400 hover:text-white'}`}
              >
                <UserCheck className="w-3 h-3" />
                Hire Expert
              </button>
            </div>
          </div>
          <button onClick={onClose} className="pointer-events-auto p-2 bg-black/50 hover:bg-white/10 rounded-full text-white transition-colors border border-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LEFT PANEL: THE SANDBOX / VISUALS */}
        <div className="w-full md:w-2/3 h-1/2 md:h-full bg-black border-r border-white/10 relative pt-16 md:pt-0">
          {mode === 'sandbox' ? (
            demoUrl ? (
              <iframe 
                src={demoUrl} 
                className="w-full h-full" 
                title={`${toolName} Demo`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center border border-white/5 animate-pulse">
                  <Terminal className="w-8 h-8 opacity-50 text-[#D4E6B5]" />
                </div>
                <p>Initializing Sandbox Environment...</p>
              </div>
            )
          ) : (
            // EXPERT MODE VISUAL
            <div className="h-full flex flex-col items-center justify-center bg-neutral-900/20 p-8">
              <div className="text-center max-w-md">
                <h3 className="text-2xl text-white font-bold mb-3">Currly Verified Experts</h3>
                <p className="text-neutral-400 mb-8">Don't waste time learning. Select a pre-vetted professional to deploy {toolName} for your team in 48 hours.</p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-900 p-4 rounded-xl border border-white/5">
                        <p className="text-2xl font-bold text-[#E6B578]">24h</p>
                        <p className="text-xs text-neutral-500 uppercase">Avg Turnaround</p>
                    </div>
                    <div className="bg-neutral-900 p-4 rounded-xl border border-white/5">
                        <p className="text-2xl font-bold text-[#E6B578]">100%</p>
                        <p className="text-xs text-neutral-500 uppercase">Money Back</p>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: ACTION & CONTEXT */}
        <div className="w-full md:w-1/3 h-1/2 md:h-full bg-[#0A0A0A] p-6 md:pt-20 flex flex-col border-t md:border-t-0 border-white/10">
          
          {mode === 'sandbox' ? (
            <>
              <div className="mb-6">
                <h3 className="text-[#D4E6B5] text-xs font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#D4E6B5] rounded-full animate-pulse"></span> System Status
                </h3>
                <div className="bg-neutral-900 rounded-lg p-4 border border-white/5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Environment</span>
                    <span className="text-white font-mono text-xs bg-white/10 px-2 py-0.5 rounded">v2.4.0 (Stable)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Privacy</span>
                    <span className="text-green-400 flex items-center gap-1 text-xs"><span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Isolated Container</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <h3 className="text-[#D4E6B5] text-xs font-mono uppercase tracking-widest mb-3">Quick Actions</h3>
                <div className="space-y-2">
                   {['Create first project', 'Invite team member', 'Connect API Key', 'Export Data'].map((task, i) => (
                     <button key={i} className="w-full text-left p-3 rounded-lg bg-neutral-800/30 hover:bg-neutral-800 text-sm text-neutral-300 flex items-center gap-3 transition-colors border border-transparent hover:border-white/10">
                       <div className="w-4 h-4 rounded-full border border-neutral-600 flex-shrink-0"></div>
                       {task}
                     </button>
                   ))}
                </div>
              </div>
            </>
          ) : (
            // EXPERT LISTING
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-neutral-900 border border-white/5 p-4 rounded-xl hover:border-[#E6B578]/50 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-xs font-bold text-neutral-500">RV</div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Rahul V.</h4>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Automation Architect</p>
                    </div>
                    <div className="ml-auto text-[#E6B578] font-mono text-sm bg-[#E6B578]/10 px-2 py-1 rounded">$40/hr</div>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed mb-3">
                    "I've deployed {toolName} for 3 agencies. I can set up your workflows in 48 hours."
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-[#E6B578] text-black text-xs font-bold py-2 rounded hover:bg-[#d4a060]">Book Now</button>
                    <button className="px-3 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700"><MessageSquare className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FOOTER CTA */}
          <div className="mt-auto pt-6 border-t border-white/5">
            <button className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              {mode === 'sandbox' ? 'Add to My Stack' : 'View All Experts'}
              <Play className="w-4 h-4 fill-black" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdoptionModal;