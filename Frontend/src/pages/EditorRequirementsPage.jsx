import React from 'react';
import { Video, CheckCircle2, ChevronLeft } from 'lucide-react';
import vedio from '../assets/introVideo1.mp4';

const EditorRequirementsPage = () => {
    const software = [
        {
            name: 'Adobe Premiere Pro',
            desc: 'Industry-standard timeline editing and seamless Creative Cloud integration.',
            color: 'from-blue-600 to-indigo-900',
        },
        {
            name: 'Adobe After Effects',
            desc: 'Mastery of complex keyframing, VFX compositing, and professional motion graphics systems.',
            color: 'from-purple-600 to-indigo-900',
        },
        {
            name: 'CapCut Desktop',
            desc: 'Fast-paced, viral content creation with trendy transitions and efficient workflows.',
            color: 'from-teal-400 to-blue-500',
        },
    ];

    return (
        <div className="min-h-screen bg-[#0a0c10] text-white py-20 px-6 font-sans relative overflow-hidden">
            
            {/* --- STYLISH NAVIGATION BUTTON (TOP LEFT) --- */}
            <div className="absolute top-10 left-10 z-50">
                <a 
                    href="/" 
                    className="group relative flex items-center justify-center p-px rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95"
                >
                    {/* Animated Gradient Border Layer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 opacity-30 group-hover:opacity-100 transition-opacity duration-500 animate-[spin_8s_linear_infinite]"></div>
                    
                    {/* Inner Button Layer */}
                    <div className="relative flex items-center gap-3 px-6 py-3 rounded-[15px] bg-black/80 backdrop-blur-xl border border-white/10 group-hover:bg-black/40 transition-colors">
                        <ChevronLeft size={18} className="text-gray-400 group-hover:text-white group-hover:-translate-x-1 transition-all" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors">
                            Return to home
                        </span>
                    </div>
                </a>
            </div>

            {/* Background Decorative Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full"></div>

            <div className="max-w-6xl mx-auto relative">
                {/* Header Section */}
                <div className="text-center mb-24">
                    <div className="inline-block px-4 py-1 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
                        Talent Acquisition
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                        The Editor's <br /> Standard.
                    </h1>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed italic">
                        "Software is just a tool; mastery is the vision."
                    </p>
                </div>

                {/* Software Cards */}
                <div className="grid md:grid-cols-3 gap-10 mb-24">
                    {software.map((item, index) => (
                        <div 
                            key={index}
                            className="relative group rounded-3xl bg-[#11141b] border border-white/5 hover:border-blue-500/50 transition-all duration-700 p-8 overflow-hidden shadow-2xl"
                        >
                            <div className="absolute -inset-24 bg-blue-500/5 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            
                            <div className="relative">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} mb-8 flex items-center justify-center shadow-2xl transform group-hover:rotate-6 transition-transform duration-500`}>
                                    <Video size={28} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 tracking-tight">{item.name}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {item.desc}
                                </p>
                                <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mb-6"></div>
                                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-blue-400 transition-colors">
                                    Technical Grade: Expert
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Requirements List & Video Section */}
                <div className="relative bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-14 backdrop-blur-md overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h3 className="text-4xl font-bold mb-8 tracking-tighter">Core Competencies</h3>
                            <ul className="space-y-6">
                                {[
                                    "Dynamic Motion Graphics & Typography",
                                    "Sound Design & Audio Leveling",
                                    "Advanced Color Correction & Grading",
                                    "Narrative Pacing & Storytelling Mastery",
                                    "Efficient Proxy Workflows"
                                ].map((skill, i) => (
                                    <li key={i} className="flex items-center space-x-4 group cursor-default">
                                        <div className="w-6 h-6 rounded-full border border-blue-500/50 flex items-center justify-center group-hover:bg-blue-500 transition-all duration-300">
                                            <CheckCircle2 className="text-blue-500 group-hover:text-black transition-colors" size={12} />
                                        </div>
                                        <span className="text-gray-400 group-hover:text-white transition-colors font-medium tracking-tight">
                                            {skill}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="relative group">
                            {/* Outer Glow behind the video */}
                            <div className="absolute -inset-6 bg-blue-500/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            
                            {/* Video Container (The "Player") */}
                            <div className="relative border border-white/10 rounded-2xl overflow-hidden bg-black shadow-2xl transition-all duration-700 group-hover:border-blue-500/30">
                                {/* Browser/Software Header UI */}
                                <div className="bg-[#1c212c] p-3 flex items-center justify-between border-b border-white/5">
                                    <div className="flex space-x-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
                                    </div>
                                    <div className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold">Preview_Master.mp4</div>
                                </div>

                                {/* Video Element */}
                                <div className="bg-black aspect-video relative flex items-center justify-center">
                                    <video
                                        src={vedio}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover opacity-60  grayscale-0 group-hover:opacity-100 transition-all duration-1000 ease-in-out"
                                    />
                                    {/* Overlay Gradient to make text pop if needed */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorRequirementsPage;