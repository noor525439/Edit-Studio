import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Mic2, ArrowLeft, Settings2, AudioLines, Volume2, 
    Sparkles, Trash2, Play, Pause, Download, RefreshCw,
    Plus, History, Sliders, ChevronRight, Speaker
} from 'lucide-react';

const VoiceGenerator = () => {
    const navigate = useNavigate();
    const synth = window.speechSynthesis;

    // Logic States
    const [text, setText] = useState("");
    const [voices, setVoices] = useState([]);
    const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    // History & Player States
    const [tracks, setTracks] = useState([]);
    const [activeTrack, setActiveTrack] = useState(null);
    const [playbackProgress, setPlaybackProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    
    const utteranceRef = useRef(null);
    const progressIntervalRef = useRef(null);

    // Initialize Voices with better browser compatibility
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = synth.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };

        loadVoices();
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = loadVoices;
        }

        // Fallback for some browsers
        const timer = setInterval(() => {
            if (synth.getVoices().length !== 0) {
                loadVoices();
                clearInterval(timer);
            }
        }, 100);

        return () => {
            synth.cancel();
            clearInterval(timer);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [synth]);

    const handleGenerate = () => {
        if (!text || voices.length === 0) return;
        
        const newTrack = {
            id: Date.now(),
            content: text,
            preview: text.substring(0, 60) + (text.length > 60 ? "..." : ""),
            voiceName: voices[selectedVoiceIndex]?.name || "Default Voice",
            voiceObj: voices[selectedVoiceIndex],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setTracks(prev => [newTrack, ...prev]);
        playVoice(newTrack);
    };

    const playVoice = (track) => {
        synth.cancel();
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        
        const utterance = new SpeechSynthesisUtterance(track.content);
        utterance.voice = track.voiceObj;
        utterance.volume = volume;
        utteranceRef.current = utterance;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setActiveTrack(track);
            
            // Progress Simulation
            setPlaybackProgress(0);
            const durationEstimate = (track.content.length * 80); // Adjusted estimate
            progressIntervalRef.current = setInterval(() => {
                setPlaybackProgress(prev => (prev < 100 ? prev + 1 : 100));
            }, durationEstimate / 100);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setPlaybackProgress(0);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };

        synth.speak(utterance);
    };

    const stopVoice = () => {
        synth.cancel();
        setIsSpeaking(false);
        setPlaybackProgress(0);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    const deleteTrack = (id) => {
        if (activeTrack?.id === id) stopVoice();
        setTracks(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#080809] text-slate-300 font-['Inter',_sans-serif] p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto relative z-10">
                
                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl md:rounded-3xl backdrop-blur-md">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-all font-bold text-[10px] uppercase tracking-[0.3em]"
                    >
                        <ArrowLeft className="w-4 h-4" /> Studio Core
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-green-500 animate-ping' : 'bg-blue-500 animate-pulse'}`} />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                {isSpeaking ? "Streaming" : "Ready"}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    
                    {/* Main Workspace */}
                    <div className="lg:col-span-8 space-y-6 md:space-y-8">
                        <div className="bg-[#111113] border border-white/10 rounded-[2rem] md:rounded-[3rem] p-5 md:p-8 shadow-2xl relative overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xs md:text-sm font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                    <AudioLines className="w-4 h-4 text-blue-500" /> Script Processor
                                </h2>
                                <span className="text-[9px] md:text-[10px] text-slate-600 font-bold uppercase tracking-widest">{text.length} Characters</span>
                            </div>
                            
                            <textarea 
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Paste your script here..."
                                className="w-full min-h-[250px] md:h-72 bg-white/[0.01] border border-white/5 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 text-white text-base md:text-lg focus:outline-none focus:border-blue-500/30 transition-all resize-none placeholder:text-slate-800 font-medium"
                            />

                            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-4">
                                <button 
                                    onClick={handleGenerate}
                                    disabled={!text || isSpeaking}
                                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 md:py-5 rounded-2xl font-bold text-[10px] md:text-[11px] uppercase tracking-widest transition-all shadow-xl bg-white text-black hover:bg-blue-600 hover:text-white disabled:bg-slate-900 disabled:text-slate-700"
                                >
                                    <Sparkles className="w-4 h-4" /> Generate Voice
                                </button>
                                <button 
                                    className="p-4 md:p-5 flex justify-center items-center rounded-2xl bg-white/5 border border-white/10 text-slate-500 hover:text-red-500 transition-all" 
                                    onClick={() => { setText(""); stopVoice(); }}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Tracks History List */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 px-4">
                                <History className="w-4 h-4 text-slate-600" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Session Tracks</h3>
                                <div className="h-[1px] flex-1 bg-white/5" />
                            </div>

                            {tracks.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-[2rem] text-slate-700 text-[10px] font-bold uppercase tracking-widest">
                                    No tracks generated yet
                                </div>
                            )}

                            {tracks.map((track) => (
                                <div key={track.id} className={`group bg-[#111113] border ${activeTrack?.id === track.id ? 'border-blue-500/50' : 'border-white/5'} rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 transition-all hover:bg-[#161619]`}>
                                    <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
                                        <button 
                                            onClick={() => activeTrack?.id === track.id && isSpeaking ? stopVoice() : playVoice(track)}
                                            className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${activeTrack?.id === track.id && isSpeaking ? 'bg-red-500/20 text-red-500' : 'bg-blue-600 text-white hover:scale-105'}`}
                                        >
                                            {activeTrack?.id === track.id && isSpeaking ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                                        </button>
                                        <div className="overflow-hidden">
                                            <p className="text-white font-bold text-xs md:text-sm truncate italic opacity-80">"{track.preview}"</p>
                                            <div className="flex items-center gap-3 mt-1.5 md:mt-2">
                                                <span className="text-[8px] md:text-[9px] font-bold text-blue-500 uppercase tracking-widest truncate">{track.voiceName}</span>
                                                <span className="text-[8px] md:text-[9px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">{track.timestamp}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full md:w-1/3">
                                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-500 transition-all duration-300"
                                                style={{ width: `${activeTrack?.id === track.id ? playbackProgress : 0}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button className="p-2 text-slate-500 hover:text-white transition-colors"><Download size={14}/></button>
                                            <button 
                                                onClick={() => deleteTrack(track.id)}
                                                className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#111113] border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl lg:sticky lg:top-8">
                            <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-6 md:mb-8 flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-blue-500" /> Voice Config
                            </h3>
                            
                            <div className="space-y-6 md:space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Select Neural Voice</label>
                                    <div className="relative group">
                                        <select 
                                            value={selectedVoiceIndex}
                                            onChange={(e) => setSelectedVoiceIndex(parseInt(e.target.value))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-[11px] font-bold text-slate-300 outline-none appearance-none cursor-pointer focus:border-blue-500/50 transition-all"
                                        >
                                            {voices.length > 0 ? voices.map((voice, i) => (
                                                <option key={i} value={i} className="bg-[#111113]">{voice.name}</option>
                                            )) : <option>Loading Voices...</option>}
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 rotate-90 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Output Volume</label>
                                        <span className="text-[10px] font-bold text-blue-500">{Math.round(volume * 100)}%</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Speaker size={14} className="text-slate-600" />
                                        <input 
                                            type="range" 
                                            min="0" max="1" step="0.1" 
                                            value={volume} 
                                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                                            className="flex-1 h-1 bg-white/5 rounded-full appearance-none accent-blue-500 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={() => { setText(""); stopVoice(); }}
                                    className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} /> New Session
                                </button>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5">
                                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-2">
                                    <span>AI Neural Engine</span>
                                    <span>v4.0.2 Stable</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[92%] bg-gradient-to-r from-blue-600 to-indigo-500" />
                                </div>
                            </div>
                        </div>

                        {/* <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden group shadow-xl">
                            <div className="relative z-10">
                                <h4 className="text-base md:text-lg font-bold uppercase mb-2">Studio Export</h4>
                                <p className="text-[10px] md:text-[11px] text-blue-100/70 font-medium leading-relaxed mb-6">
                                    All generated tracks are stored in your local session. Export to WAV for high-fidelity audio.
                                </p>
                                <button className="w-full py-3 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-xl text-[9px] font-bold transition-all border border-white/10 uppercase tracking-widest">
                                    Bulk Export Tracks
                                </button>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceGenerator;