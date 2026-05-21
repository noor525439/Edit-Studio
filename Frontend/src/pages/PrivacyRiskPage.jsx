import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Trash2, Lock, EyeOff, 
  AlertTriangle, Database, ArrowLeft, 
  ChevronRight, Fingerprint, 
  Check
} from 'lucide-react';

const PrivacyRiskPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* Background Decorative Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12">
        
        {/* Navigation & Header */}
        <nav className="flex justify-between items-center mb-16">
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all"
          >
            <div className="h-8 w-8 rounded-full border border-slate-700 flex items-center justify-center group-hover:border-indigo-500 group-hover:bg-indigo-500/10 transition-all">
              <ArrowLeft size={14} />
            </div>
            Back to Home
          </button>
          <div className="flex items-center gap-2 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 px-4 py-1.5 rounded-full">
            <Fingerprint size={14} className="text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Encryption Active</span>
          </div>
        </nav>

        <header className="mb-16">
          <h1 className="text-6xl font-bold text-white tracking-tighter mb-4 italic">
            Privacy <span className="text-indigo-500 font-normal">Protocol</span>
          </h1>
          <p className="text-slate-400 max-w-xl leading-relaxed">
            Ensuring the integrity of editor data and the transparency of our automated erasure systems.
          </p>
        </header>

        <div className="grid gap-6">
          
          {/* Main Card: Data Rights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[2.5rem] hover:border-slate-600 transition-colors">
              <Database className="text-indigo-400 mb-6" size={28} />
              <h2 className="text-xl font-bold text-white mb-3">Data Retention</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                We collect only what is necessary for your Editor Profile—Rates, Skills, and Experience. This data is siloed and encrypted.
              </p>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[2.5rem] hover:border-slate-600 transition-colors">
              <Lock className="text-blue-400 mb-6" size={28} />
              <h2 className="text-xl font-bold text-white mb-3">Access Security</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Only authenticated Administrators can view your profile details. All actions are logged via JWT validation protocols.
              </p>
            </div>
          </div>

          {/* Highlighted Card: Rejection Policy */}
          <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 p-10 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Trash2 size={120} />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">Automated Erasure</h2>
            </div>

            <h3 className="text-3xl font-bold text-white mb-4">Right to be Forgotten</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mb-8">
              Our system architecture prioritizes your privacy. In the event of an application rejection, our backend executes a 
              <span className="text-white font-bold"> Cascaded Delete</span>. This completely scrubs your User identity and 
              Editor profile from our active database within milliseconds.
            </p>

            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-[10px] font-bold text-red-500/80 uppercase">
                 <Check size={12} /> User Account Wiped
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-red-500/80 uppercase">
                 <Check size={12} /> Profile Bio Deleted
               </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem]">
                <EyeOff className="text-amber-500 mb-4" size={20} />
                <h4 className="text-white font-bold text-sm mb-2">No Shadow Profiles</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">We never keep hidden logs of your personal professional data after deletion.</p>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem]">
                <AlertTriangle className="text-indigo-500 mb-4" size={20} />
                <h4 className="text-white font-bold text-sm mb-2">Information Risk</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">Public bios are visible to admins. Avoid sharing physical addresses or private phone numbers.</p>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem]">
                <ShieldCheck className="text-green-500 mb-4" size={20} />
                <h4 className="text-white font-bold text-sm mb-2">System Audit</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">Our data handling is reviewed monthly to ensure zero-latency deletion and API security.</p>
             </div>
          </div>

          {/* Minimal Footer */}
          <footer className="mt-20 flex flex-col items-center gap-4">
             <div className="h-px w-20 bg-slate-800" />
             <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-600">
               Secure Terminal // Feb 2026 // v4.0.1
             </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default PrivacyRiskPage;