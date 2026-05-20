import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Youtube,
    ExternalLink,
    PlayCircle,
    Video,
    Layers,
    Zap,
    Sparkles
} from 'lucide-react';

const MasteryAcademy = () => {
    const navigate = useNavigate();

    // Data for the channels - You can easily add more here
    const channels = [
        {
            name: "Premiere Gal",
            specialty: "Creative Workflows",
            description: "Master the intricacies of Adobe Premiere Pro with industry-leading project management and editing techniques.",
            url: "https://youtube.com/@PremiereGal",
            tags: ["Premiere Pro", "Beginner to Pro"]
        },
        {
            name: "Video Copilot",
            specialty: "VFX & Compositing",
            description: "The gold standard for After Effects training. Learn high-end visual effects and motion graphics from Andrew Kramer.",
            url: "https://youtube.com/@videocopilot",
            tags: ["After Effects", "VFX"]
        },
        {
            name: "Justin Odisho",
            specialty: "Style & Transitions",
            description: "Extensive library of creative effects, transitions, and aesthetic styles for modern content creators.",
            url: "https://youtube.com/@JustinOdisho",
            tags: ["Creativity", "Software"]
        },
        {
            name: "Cinecom.net",
            specialty: "Cinematic Lighting",
            description: "Focuses on the art of cinematography, lighting, and camera work to elevate your raw footage quality.",
            url: "https://youtube.com/@CinecomNet",
            tags: ["Cinematography", "Lighting"]
        },
        {
            name: "Max Novak",
            specialty: "Music Video FX",
            description: "High-energy editing styles and advanced masking techniques perfect for music videos and dynamic content.",
            url: "https://youtube.com/@MaxNovak",
            tags: ["Music Videos", "Advanced"]
        },
        {
            name: "Finzar",
            specialty: "Retainment Editing",
            description: "Master the art of fast-paced storytelling and retention-focused editing for social media platforms.",
            url: "https://youtube.com/@Finzar",
            tags: ["Storytelling", "Social Media"]
        }
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-slate-300 font-['Inter',_sans-serif] selection:bg-indigo-500/30 selection:text-white">

            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            {/* Header / Nav */}
            <nav className="relative z-50 pt-10 px-6 max-w-6xl mx-auto flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Studio
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tighter text-white uppercase">Academy</span>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 pt-20 pb-32 px-6 max-w-6xl mx-auto">
                <header className="max-w-3xl mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                        <Sparkles className="w-3 h-3" /> Curated Knowledge Base
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter mb-8">
                        The Master’s <br />
                        <span className="bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent italic">Watchlist.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl">
                        We have vetted thousands of hours of content to bring you the highest-caliber educational resources. These creators define the modern standard of post-production.
                    </p>
                </header>

                {/* Channel Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {channels.map((channel, index) => (
                        <div
                            key={index}
                            className="group relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all duration-500 overflow-hidden"
                        >
                            {/* Card Background Glow on Hover */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/0 group-hover:bg-indigo-600/5 blur-[60px] rounded-full transition-all duration-700" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Youtube className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-end">
                                        {channel.tags.map(tag => (
                                            <span key={tag} className="text-[9px] font-bold uppercase tracking-tighter px-2 py-1 rounded-md bg-white/5 text-slate-500">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-white mb-2">{channel.name}</h3>
                                <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
                                    {channel.specialty}
                                </p>
                                <p className="text-slate-500 text-sm leading-relaxed mb-10 flex-grow">
                                    {channel.description}
                                </p>

                                <a
                                    href={channel.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-white text-black font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all active:scale-95"
                                >
                                    Open Channel <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA at Bottom */}
                <div className="mt-32 p-12 rounded-[3rem] bg-indigo-600/5 border border-indigo-500/20 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-indigo-500/10 blur-[80px] rounded-full" />
                    <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Think you have reached the standard?</h2>
                    <p className="text-slate-400 mb-8 max-w-xl mx-auto relative z-10">
                        Once you have mastered these workflows, apply for our vetting process to join our elite pool of editors.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="relative z-10 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black transition-all"
                    >
                        Apply for Vetting
                    </button>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="py-10 px-6 text-center border-t border-white/5">
                <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Edit Studio Academy. Verified Curriculum.
                </p>
            </footer>
        </div>
    );
};

export default MasteryAcademy;