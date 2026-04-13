import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Mic, FileAudio, Copy, Type, RotateCcw, 
    Check, Volume2, Sparkles, X, MicOff 
} from 'lucide-react';

const SpeechToText = () => {
    const navigate = useNavigate();
    
    // States
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);

    // Refs to persist the recognition object and avoid recreation on render
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            setError("Speech Recognition is not supported in this browser. Try Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let currentTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }
            setTranscript(currentTranscript);
        };

        recognition.onerror = (event) => {
            console.error("Speech Error:", event.error);
            if (event.error === 'not-allowed') setError("Microphone access denied.");
            setIsTranscribing(false);
        };

        recognition.onend = () => {
            setIsTranscribing(false);
        };

        recognitionRef.current = recognition;

        // Cleanup on unmount
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const toggleTranscription = () => {
        if (error) return alert(error);
        
        if (isTranscribing) {
            recognitionRef.current.stop();
            setIsTranscribing(false);
        } else {
            setError(null);
            recognitionRef.current.start();
            setIsTranscribing(true);
        }
    };

    const copyToClipboard = () => {
        if (!transcript) return;
        navigator.clipboard.writeText(transcript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-['Inter']">
            {/* Header */}
            <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <ArrowLeft size={14} /> Studio
                    </button>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                        <div className={`w-1.5 h-1.5 rounded-full ${isTranscribing ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {isTranscribing ? "Listening" : "Ready"}
                        </span>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 lg:p-12">
                <div className="grid lg:grid-cols-12 gap-12">
                    
                    {/* Left Panel: Stats & Controls */}
                    <div className="lg:col-span-4 space-y-6">
                        <div>
                            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Speech to <span className="text-emerald-500">Text</span></h1>
                            <p className="text-slate-500 text-sm leading-relaxed">Neural transcription for scripts and subtitles.</p>
                        </div>

                        <div className="bg-[#0D0D0F] border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                            {/* Visualizer effect when transcribing */}
                            {isTranscribing && (
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-shimmer" />
                            )}

                            <button 
                                onClick={toggleTranscription}
                                className={`w-full py-10 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all border ${
                                    isTranscribing 
                                    ? "bg-red-500/10 border-red-500/30 text-red-500" 
                                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                }`}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isTranscribing ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-white text-black'}`}>
                                    {isTranscribing ? <MicOff size={28} /> : <Mic size={28} />}
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.2em]">
                                    {isTranscribing ? "Stop Recording" : "Start Neural Link"}
                                </span>
                            </button>

                            {error && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400 font-bold uppercase text-center">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="bg-[#0D0D0F] border border-white/5 rounded-2xl p-6">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                                <span>Engine Fidelity</span>
                                <span className="text-emerald-500">Ultra-High</span>
                            </div>
                            <div className="flex gap-1 h-8 items-end">
                                {[...Array(15)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`flex-1 bg-emerald-500/20 rounded-t-sm transition-all duration-300 ${isTranscribing ? 'animate-bounce' : 'h-2'}`}
                                        style={{ animationDelay: `${i * 0.1}s`, height: isTranscribing ? `${Math.random() * 100}%` : '20%' }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Output */}
                    <div className="lg:col-span-8 flex flex-col h-full">
                        <div className="bg-[#0D0D0F] border border-white/10 rounded-[2.5rem] p-8 flex flex-col h-full shadow-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                        <Type size={20} />
                                    </div>
                                    <h3 className="text-white font-bold tracking-tight">Script Output</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setTranscript("")}
                                        className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                    <button 
                                        onClick={copyToClipboard}
                                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${
                                            copied ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-emerald-500 hover:text-white"
                                        }`}
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                        {copied ? "Copied" : "Copy Script"}
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl p-10 min-h-[450px] relative group overflow-hidden">
                                {!transcript && !isTranscribing && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800">
                                        <Volume2 size={40} className="mb-4 opacity-10" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20">Awaiting Signal</p>
                                    </div>
                                )}
                                <div className="relative z-10 text-xl md:text-2xl text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                                    {transcript}
                                    {isTranscribing && (
                                        <span className="inline-block w-1.5 h-7 bg-emerald-500 ml-2 animate-pulse align-middle" />
                                    )}
                                </div>
                                
                                {/* Bottom stats */}
                                <div className="absolute bottom-6 left-8 flex gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-600 uppercase">Words</span>
                                        <span className="text-xs text-white font-bold">{transcript.trim() === "" ? 0 : transcript.trim().split(/\s+/).length}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-600 uppercase">Characters</span>
                                        <span className="text-xs text-white font-bold">{transcript.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SpeechToText;