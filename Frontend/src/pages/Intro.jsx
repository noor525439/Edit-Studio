import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import myImg from '../assets/imageMy.jpg';
import vedio from '../assets/introVideo1.mp4';
import {
    ShieldCheck,
    UserCheck,
    ClipboardList,
    ArrowRight,
    Sparkles,
    Lock,
    CheckCircle2,
    Video,
    ChevronRight,
    Youtube,
    Trophy,
    BookOpen,
    Mic2,
    AudioLines,
    FileVideo,
    MessageSquareQuote,
    Zap
} from 'lucide-react';

const Intro = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-slate-300 font-['Inter',_sans-serif] selection:bg-indigo-500/30 selection:text-white">

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[1200px]">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex justify-between items-center shadow-2xl">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tighter text-white">EDIT<span className="text-indigo-400 font-extrabold">STUDIO</span></span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-semibold hover:text-white transition-colors">Login</Link>
                        <Link to="/login" className="bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 text-center">
                <div className="max-w-5xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-8">
                        <Sparkles className="w-3 h-3" /> Exclusively Vetted Talent
                    </div>

                    <h1 className="text-5xl md:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-8">
                        Precision Editing. <br />
                        <span className="bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">Zero Risk Involved.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed tracking-tight">
                        <span className="block text-white font-semibold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Quality is our primary currency.
                        </span>
                        <span className="opacity-90">
                            The bridge between world-class editing and seamless client collaboration. Our platform remains exclusive to the best; editors must first clear our vetting phase.
                        </span>
                    </p>

                    <div className="relative group max-w-4xl mx-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                        <div className="relative bg-[#121214] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                            <div className="h-10 border-b border-white/5 bg-white/5 flex items-center px-4 justify-between">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/40" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/10" />
                                </div>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Secure Marketplace Protocol</span>
                            </div>
                            <video
                                src={vedio}
                                autoPlay
                                loop
                                muted
                                playsInline
                                controls
                                className="w-full h-full object-cover opacity-60  grayscale-0 group-hover:opacity-100 transition-all duration-1000 ease-in-out"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* AI MEDIA SUITE SECTION (NEW ADDITION) */}
            <section className="py-24 px-6 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                        <Zap className="w-3 h-3" /> Creative Automation
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">AI Media <span className="text-indigo-400">Toolkit</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Voice Generator */}
                    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all group relative overflow-hidden">
                        <Mic2 className="w-10 h-10 text-indigo-400 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Voice Generator</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">
                            Transform scripts into studio-quality neural narration with human-like prosody.
                        </p>
                        <button
                            onClick={() => navigate('/voice-generator')}
                            className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all"
                        >
                            Launch Engine <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Video to Audio */}
                    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all group">
                        <FileVideo className="w-10 h-10 text-blue-400 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Video to Audio</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">
                            Extract high-fidelity audio tracks from video files using local neural decoding.
                        </p>
                        <button
                            onClick={() => navigate('/vedio-to-audio')}
                            className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all"
                        >
                            Extract Now <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Speech to Audio (Text) */}
                    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all group">
                        <MessageSquareQuote className="w-10 h-10 text-emerald-400 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Speech to Text</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">
                            Transcribe narration and dialogue into editable text with 98% accuracy.
                        </p>
                        <button
                            onClick={() => navigate('/speech-to-audio')}
                            className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all"
                        >
                            Open Transcriber <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent border border-white/5 relative overflow-hidden group">
                        <UserCheck className="w-10 h-10 text-indigo-400 mb-6" />
                        <h3 className="text-3xl font-bold text-white mb-4">The Vetting Protocol</h3>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                            We bypass the noise of open registration. Every editor undergoes a rigorous manual interview and technical assessment.
                        </p>
                        <Lock className="absolute right-12 bottom-12 w-16 h-16 text-white/5 group-hover:text-indigo-500/10 transition-colors" />
                    </div>

                    <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all group">
                        <ClipboardList className="w-10 h-10 text-blue-400 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-4">Elite Commissions</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Deploy high-level project briefs and get matched with certified post-production experts within minutes.
                        </p>
                    </div>

                    <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all group">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-4">Risk-Free Workflow</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Secured financial transacting and manual quality oversight ensure every export meets industry standards.
                        </p>
                    </div>

                    <div className="md:col-span-2 p-10 rounded-[2.5rem] bg-indigo-600/5 border border-indigo-500/20 flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1 text-left">
                            <h3 className="text-3xl font-bold text-white mb-4">Industrial Grade Standards</h3>
                            <p className="text-slate-400 text-lg">
                                Our talent pool is restricted to masters of Premiere Pro, After Effects, and CapCut.
                            </p>
                        </div>
                        <button onClick={() => navigate('/vetting-editor-standards')} className="whitespace-nowrap bg-white text-black px-8 py-4 rounded-2xl font-extrabold flex items-center gap-2 hover:scale-105 hover:bg-indigo-600 hover:text-white transition-transform">
                            View Standards <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Mastery Academy Section */}
            <section className="py-24 px-6 max-w-6xl mx-auto">
                <div className="relative p-1 border border-white/5 rounded-[3rem] bg-gradient-to-b from-white/5 to-transparent">
                    <div className="bg-[#0A0A0B] rounded-[2.8rem] p-10 md:p-20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
                        <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
                            <div className="flex-1 space-y-8 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                                    Growth & Development
                                </div>
                                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-tight">
                                    Unlock Professional <br />
                                    <span className="italic bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">Creative Mastery</span>
                                </h2>
                                <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-xl">
                                    Excellence is a habit. We provide the blueprint for upcoming talent to reach our certification benchmarks.
                                </p>
                                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                    {['Color Theory', 'Dynamic VFX', 'Narrative Flow'].map((tag) => (
                                        <span key={tag} className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 w-full max-w-md">
                                <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-xl relative group">
                                    <div className="flex flex-col gap-6 text-center lg:text-left">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto lg:mx-0">
                                            <Trophy className="w-7 h-7 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-2xl mb-2">The Mastery Roadmap</h4>
                                            <p className="text-slate-500 text-sm leading-relaxed">
                                                Access curated high-level insights and industry workflows used by the top 1% of editors.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/top-tutors-channel')}
                                            className="w-full bg-white text-black hover:bg-indigo-600 hover:text-white px-8 py-5 rounded-2xl font-bold flex justify-center items-center gap-3 transition-all duration-300"
                                        >
                                            Begin Your Journey <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-32 px-6 border-y border-white/5">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-xs font-bold text-indigo-500 tracking-[0.4em] uppercase mb-10">Founder Insight</p>
                    <h2 className="text-3xl md:text-5xl text-white font-semibold leading-tight mb-16 italic">
                        "We built this to protect the art. Our vetting process is the shield that ensures every frame delivered is a masterpiece."
                    </h2>
                    <div className="inline-flex items-center gap-5 text-left p-2 pr-8 rounded-full bg-white/5 border border-white/10">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500/50">
                            <img className='w-full h-full object-cover' src={myImg} alt="Founder" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-xl tracking-tight">Waseeq</p>
                            <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest">Founder, Edit Studio</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-20 px-6">
                <div className="max-w-6xl mx-auto border-t border-white/5 pt-16">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                        <div className="space-y-4">
                            <span className="text-2xl font-bold tracking-tighter text-white uppercase">EDITSTUDIO</span>
                            <p className="text-slate-500 text-sm max-w-xs">
                                The definitive marketplace for certified video post-production excellence.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-12 text-sm font-semibold text-slate-400">
                            <div className="flex flex-col gap-3">
                                <span className="text-white uppercase text-[10px] tracking-[0.2em] opacity-50">Platform</span>
                                <a href="/risk-privacy" className="hover:text-indigo-400 transition-colors">Risk Protocol</a>
                                <a href="/vetting-standards" className="hover:text-indigo-400 transition-colors">Vetting Standards</a>
                            </div>
                            <div className="flex flex-col gap-3">
                                <span className="text-white uppercase text-[10px] tracking-[0.2em] opacity-50">Legal</span>
                                <a href="/aboutus" className="hover:text-indigo-400 transition-colors">About</a>
                                <a href="/contact-admin" className="hover:text-indigo-400 transition-colors">Contact us</a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-20 text-slate-600 text-[10px] uppercase tracking-[0.3em] text-center md:text-left">
                        &copy; {new Date().getFullYear()} Edit Studio. Precision Engineering for Visuals.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Intro;