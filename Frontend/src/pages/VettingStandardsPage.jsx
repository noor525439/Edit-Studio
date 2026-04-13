import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, Star, 
  Target, Zap, Award, Microscope, 
  ShieldCheck, Sparkles 
} from 'lucide-react';

const VettingStandardsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300 font-sans selection:bg-emerald-500/30">
      {/* Background Decorative Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] -left-[5%] w-[30%] h-[30%] bg-cyan-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12">
        
        {/* Navigation */}
        <nav className="flex justify-between items-center mb-16">
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all"
          >
            <div className="h-8 w-8 rounded-full border border-slate-700 flex items-center justify-center group-hover:border-emerald-500 group-hover:bg-emerald-500/10 transition-all">
              <ArrowLeft size={14} />
            </div>
            Back to Home
          </button>
          <div className="flex items-center gap-2 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 px-4 py-1.5 rounded-full">
            <Award size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Top 1% Standards</span>
          </div>
        </nav>

        <header className="mb-16">
          <h1 className="text-6xl font-black text-white tracking-tighter mb-4 italic">
            Vetting <span className="text-emerald-500 font-normal">Standards</span>
          </h1>
          <p className="text-slate-400 max-w-xl leading-relaxed">
            Our rigorous multi-layer verification process ensures only the most skilled editors gain access to our elite marketplace.
          </p>
        </header>

        <div className="grid gap-8">
          
          {/* Section 1: Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-6 rounded-[2rem] flex flex-col items-center text-center group hover:border-emerald-500/50 transition-all">
              <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-white font-bold mb-2">Technical Proficiency</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">Mastery of software, color grading, and advanced post-production workflows.</p>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-6 rounded-[2rem] flex flex-col items-center text-center group hover:border-cyan-500/50 transition-all">
              <div className="h-12 w-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="text-cyan-400" size={24} />
              </div>
              <h3 className="text-white font-bold mb-2">Turnaround Speed</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">Ability to meet aggressive deadlines without compromising aesthetic quality.</p>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-6 rounded-[2rem] flex flex-col items-center text-center group hover:border-indigo-500/50 transition-all">
              <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Microscope className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-white font-bold mb-2">Attention to Detail</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">Frame-perfect cutting and sound design synchronization excellence.</p>
            </div>
          </div>

          {/* Detailed Verification Section */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-[3rem] p-10 overflow-hidden relative">
            <div className="absolute -bottom-10 -right-10 opacity-5 rotate-12">
               <ShieldCheck size={280} />
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                <Sparkles className="text-emerald-400" /> The Approval Roadmap
              </h2>
              
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center text-slate-900 font-black shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.4)]">1</div>
                    <div className="w-px h-full bg-slate-700 my-2" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Portfolio Deep-Dive</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">Admins review your bio and skills. We look for niche specialization and a unique visual voice.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 border-2 border-slate-600 rounded-full flex items-center justify-center text-slate-400 font-black shrink-0">2</div>
                    <div className="w-px h-full bg-slate-700 my-2" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Rate & Market Alignment</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">Your rate-to-experience ratio is evaluated. We ensure our editors are paid fairly based on the competitive landscape.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 border-2 border-slate-600 rounded-full flex items-center justify-center text-slate-400 font-black shrink-0 text-sm">3</div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Final Admin Verification</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">A manual security check is performed. Once verified, the 'Approve' toggle is activated, and your profile goes live.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2.5rem]">
                <h4 className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Recommended Background
                </h4>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                    <Star size={12} className="text-emerald-500" /> 3+ Years Professional Experience
                  </li>
                  <li className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                    <Star size={12} className="text-emerald-500" /> Verified Social/Portfolio Links
                  </li>
                  <li className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                    <Star size={12} className="text-emerald-500" /> Active Communication Skills
                  </li>
                </ul>
             </div>

             <div className="bg-slate-800/30 p-8 rounded-[2.5rem] border border-slate-700/50 flex flex-col justify-center">
                <p className="text-slate-400 text-xs italic leading-relaxed text-center">
                  "Our vetting is not about exclusion, it's about curated excellence. We protect the time of our clients by only onboarding editors who can deliver results on Day 1."
                </p>
                <span className="text-center mt-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">— Admin Board</span>
             </div>
          </div>

          {/* Footer */}
          <footer className="mt-20 flex flex-col items-center gap-4">
             <div className="h-px w-20 bg-slate-800" />
             <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">
               Elite Standards // Vetting Policy v2.0
             </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default VettingStandardsPage;