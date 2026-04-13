import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Video, Music, Download, Play, Pause, 
    RefreshCw, FileVideo, ShieldCheck, Zap, Trash2, Plus, X, Layers
} from 'lucide-react';

const VideoToAudio = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [videoFile, setVideoFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [tracks, setTracks] = useState([]); 
    const audioRefs = useRef({});

    // --- Core Logic (Unchanged for stability) ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setVideoFile(file);
    };

    const processVideo = async () => {
        if (!videoFile) return;
        setIsProcessing(true);
        try {
            const arrayBuffer = await videoFile.arrayBuffer();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(offlineContext.destination);
            source.start();
            const renderedBuffer = await offlineContext.startRendering();
            const wavBlob = bufferToWave(renderedBuffer, renderedBuffer.length);
            const url = URL.createObjectURL(wavBlob);
            
            setTracks(prev => [{
                id: Date.now(),
                url: url,
                name: videoFile.name.replace(/\.[^/.]+$/, ""),
                isPlaying: false,
                currentTime: 0,
                duration: renderedBuffer.duration
            }, ...prev]);
        } catch (error) {
            alert("Extraction failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    const togglePlay = (id) => {
        const audio = audioRefs.current[id];
        setTracks(prev => prev.map(t => {
            if (t.id === id) {
                t.isPlaying ? audio.pause() : audio.play();
                return { ...t, isPlaying: !t.isPlaying };
            }
            if (t.isPlaying) { audioRefs.current[t.id].pause(); return { ...t, isPlaying: false }; }
            return t;
        }));
    };

    function bufferToWave(abuffer, len) {
        let numOfChan = abuffer.numberOfChannels, length = len * numOfChan * 2 + 44, buffer = new ArrayBuffer(length), view = new DataView(buffer), pos = 0;
        const setUint32 = (d) => { view.setUint32(pos, d, true); pos += 4; };
        const setUint16 = (d) => { view.setUint16(pos, d, true); pos += 2; };
        setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
        setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
        setUint32(abuffer.sampleRate); setUint32(abuffer.sampleRate * 2 * numOfChan);
        setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);
        for(let i = 0; i < len; i++) {
            for(let channel = 0; channel < numOfChan; channel++) {
                let s = Math.max(-1, Math.min(1, abuffer.getChannelData(channel)[i]));
                view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                pos += 2;
            }
        }
        return new Blob([buffer], {type: "audio/wav"});
    }

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-['Inter'] selection:bg-blue-500/30">
            {/* Nav Bar */}
            <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="hover:text-white transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
                        <ArrowLeft size={14} className="text-blue-500" /> Studio Dashboard
                    </button>
                    <div className="flex items-center gap-6">
                        <span className="hidden md:block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Workspace: Project Alpha</span>
                        <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
                        <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-md border border-blue-500/20 text-[9px] font-black uppercase">Local Engine</div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 md:p-12">
                {/* Stage 1: The Input Stage */}
                <section className="mb-16">
                    <div className="flex flex-col items-center text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
                            WAV <span className="text-blue-600 italic">RIPPER</span>
                        </h1>
                        <p className="text-slate-500 text-sm max-w-lg leading-relaxed font-medium">
                            The studio-grade tool to strip high-fidelity audio from video files without uploading to a server.
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        {!videoFile ? (
                            <div 
                                onClick={() => fileInputRef.current.click()} 
                                className="relative group cursor-pointer aspect-video md:aspect-[21/9] bg-[#0D0D0F] border border-white/5 rounded-[2rem] flex flex-col items-center justify-center transition-all hover:border-blue-500/50 hover:bg-blue-500/[0.01] overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                    <Plus size={24} className="text-blue-500" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Drag & Drop Source</span>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
                            </div>
                        ) : (
                            <div className="bg-[#0D0D0F] border border-white/10 rounded-[2rem] p-4 flex flex-col md:flex-row items-center gap-4 shadow-2xl">
                                <div className="flex-1 flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5 w-full">
                                    <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                                        <Video size={18} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-white truncate">{videoFile.name}</p>
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Native Container Loaded</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto px-2 md:px-0">
                                    <button onClick={() => setVideoFile(null)} className="p-4 text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
                                    <button 
                                        onClick={processVideo}
                                        disabled={isProcessing}
                                        className="flex-1 md:flex-none px-8 py-4 bg-white text-black hover:bg-blue-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                                    >
                                        {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                                        {isProcessing ? "Ripping..." : "Rip Audio"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Stage 2: The Asset Library */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Layers size={16} /></div>
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Extracted Assets</h2>
                        <div className="h-[1px] flex-1 bg-white/5" />
                        <span className="text-[10px] font-bold text-slate-600">{tracks.length} Samples</span>
                    </div>

                    {tracks.length === 0 ? (
                        <div className="h-48 rounded-[2rem] border border-dashed border-white/5 flex items-center justify-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">No tracks in current session</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tracks.map((track) => (
                                <div key={track.id} className="bg-[#0D0D0F] border border-white/5 rounded-3xl p-5 transition-all hover:bg-[#121214] group">
                                    <audio 
                                        ref={el => audioRefs.current[track.id] = el} 
                                        src={track.url} 
                                        onTimeUpdate={(e) => {
                                            const audio = e.target;
                                            setTracks(prev => prev.map(t => t.id === track.id ? {...t, currentTime: audio.currentTime} : t));
                                        }} 
                                        onEnded={() => setTracks(prev => prev.map(t => t.id === track.id ? {...t, isPlaying: false} : t))} 
                                    />
                                    
                                    <div className="flex items-center gap-4 mb-4">
                                        <button 
                                            onClick={() => togglePlay(track.id)} 
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                                track.isPlaying ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-white hover:bg-white/10'
                                            }`}
                                        >
                                            {track.isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white truncate mb-1">{track.name}.wav</p>
                                            <div className="flex items-center gap-2">
                                                <div className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-black text-slate-500 uppercase tracking-tighter">44.1kHz</div>
                                                <div className="text-[10px] font-bold text-blue-500/80">
                                                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toFixed(0).padStart(2, '0')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a href={track.url} download={`${track.name}.wav`} className="p-2 text-slate-500 hover:text-white transition-colors"><Download size={14} /></a>
                                            <button onClick={() => setTracks(prev => prev.filter(t => t.id !== track.id))} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </div>

                                    {/* Seek Bar */}
                                    <div className="relative pt-2">
                                        <input 
                                            type="range" min="0" max={track.duration || 0} step="0.01" value={track.currentTime}
                                            onChange={(e) => { audioRefs.current[track.id].currentTime = e.target.value; }}
                                            className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-500"
                                        />
                                        <div className="flex justify-between mt-2">
                                            <span className="text-[8px] font-black text-slate-600">{Math.floor(track.currentTime / 60)}:{(track.currentTime % 60).toFixed(0).padStart(2, '0')}</span>
                                            <span className="text-[8px] font-black text-slate-600">PCM AUDIO</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default VideoToAudio;