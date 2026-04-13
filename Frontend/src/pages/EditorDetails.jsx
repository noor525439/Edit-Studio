import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, Clock, Star, Zap, Briefcase, ShieldCheck } from 'lucide-react';

const EditorDetails = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [editor, setEditor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEditorDetail = async () => {
            try {
        
                const res = await axios.get(`http://localhost:3000/user/all-editors`);
                const foundEditor = res.data.data.find(e => e._id === id);
                setEditor(foundEditor);
            } catch (err) {
                console.error("Error fetching editor details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEditorDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!editor) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
                <h2 className="text-2xl font-bold text-slate-800">Profile not found</h2>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-medium flex items-center gap-2">
                    <ArrowLeft size={18}/> Return to list
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-medium text-sm"
                    >
                        <ArrowLeft size={18} /> Back to Search
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Verified Expert</span>
                        <ShieldCheck size={20} className="text-blue-500" />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 pt-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* Profile Card Side */}
                    <aside className="w-full lg:w-1/3">
                        <div className="lg:sticky lg:top-28 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
                            <div className="relative w-32 h-32 mx-auto mb-6">
                                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] flex items-center justify-center text-white text-5xl font-black shadow-lg">
                                    {editor.name?.charAt(0)}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white shadow-sm bg-green-500"></div>
                            </div>

                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-black text-slate-900 leading-tight">{editor.name}</h1>
                                <p className="text-blue-600 font-semibold mt-1">{editor.role}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 mb-8">
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium"><Clock size={16}/> Rate</div>
                                    <span className="font-bold text-slate-900">${editor.rate}/hr</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium"><Star size={16}/> Exp</div>
                                    <span className="font-bold text-slate-900">{editor.experience}</span>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-300 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                                <Zap size={18} fill="currentColor" /> Instant Hire
                            </button>
                        </div>
                    </aside>

                    {/* Bio & Details Side */}
                    <section className="w-full lg:w-2/3 space-y-12">
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">About</h2>
                                <div className="h-[2px] flex-1 bg-slate-100"></div>
                            </div>
                            <p className="text-slate-600 text-xl leading-relaxed font-medium italic">
                                "{editor.bio || "Editor hasn't shared a bio yet."}"
                            </p>
                        </div>

                        {/* Core Stack */}
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Core Stack</h2>
                                <div className="h-[2px] flex-1 bg-slate-100"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {editor.skills?.map((skill, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-4 bg-white border border-slate-200/50 rounded-2xl hover:border-blue-500/30 transition-all group">
                                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <CheckCircle size={18} />
                                        </div>
                                        <span className="font-bold text-slate-700">{skill}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer CTA */}
                        <div className="p-10 bg-gradient-to-br from-slate-900 to-blue-950 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black mb-4 tracking-tight">Ready to collaborate?</h3>
                                <p className="text-slate-400 max-w-md mb-8">Start a secure project with {editor.name?.split(' ')[0]} using our smart-escrow system.</p>
                                <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all">
                                    Start Secure Project
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default EditorDetails;