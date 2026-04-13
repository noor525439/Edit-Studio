import React, { useEffect, useState } from 'react';
import { Sparkles, User, Briefcase, DollarSign, Award, CheckCircle2, Save ,Loader2} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const initialState = {
    name: "",
    role: "",
    rate: "",
    status: "Available",
    experience: "1-3 Years",
    skills: "",
    bio: ""
};

const EditorInfoForm = () => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState(initialState);


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('accessToken');

                const response = await axios.get('http://localhost:3000/user/editor/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data.success && response.data.data) {
                    const profile = response.data.data;
                    setFormData({
                        ...profile,
                        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills
                    });
                }
            } catch (error) {
                console.error("Fetch Error:", error);

            } finally {
                setFetching(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const token = localStorage.getItem('accessToken');
            
            const dataToSend = {
                ...formData,
                skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
            }; 

            const response = await axios.post(
                'http://localhost:3000/user/editor/update-profile', 
                dataToSend, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success("Profile updated successfully");
                
                setFormData(initialState);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Sync Failed");
        } finally {
            setLoading(false);
        }
    };
  
    if (fetching) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
            <Loader2 className="animate-spin text-green-600" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fafafa] p-6 lg:p-12 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">System Configuration</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                            Editor <span className="text-green-600">Profile</span>
                        </h1>
                    </div>
                    <Sparkles className="h-8 w-8 text-slate-200" />
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] p-8 lg:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                <User size={14} className="text-green-600" /> Legal Identity
                            </label>
                            <input 
                                name="name"
                                placeholder="e.g. Waseeq Niaz"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                <Briefcase size={14} className="text-green-600" /> Designation
                            </label>
                            <input 
                                name="role"
                                placeholder="e.g. Senior Video Editor & Motion Artist"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                <DollarSign size={14} className="text-green-600" /> Hourly Credits ($)
                            </label>
                            <input 
                                name="rate"
                                type="number"
                                placeholder="Enter amount (e.g. 25)"
                                value={formData.rate}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                <Award size={14} className="text-green-600" /> Sector Tenure
                            </label>
                            <select 
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-green-500/20 transition-all outline-none appearance-none"
                            >
                                <option>1 Year</option>
                                <option>2 Years</option>
                                <option>3 Years</option>
                                <option>4 Years</option>
                                <option>5 Years</option>
                                <option>6-10 Years</option>
                            </select>
                        </div>

                        {/* Skills - Full Width */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                <Sparkles size={14} className="text-green-600" /> Technology Stack (Comma Separated)
                            </label>
                            <input 
                                name="skills"
                                value={formData.skills}
                                placeholder="Premiere Pro, After Effects, DaVinci Resolve, Color Grading..."
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                            />
                        </div>

                        {/* Bio - Full Width */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                <CheckCircle2 size={14} className="text-green-600" /> Professional Narrative
                            </label>
                            <textarea 
                                name="bio"
                                rows={5}
                                value={formData.bio}
                                placeholder="Briefly describe your creative journey, the type of projects you love, and what makes your editing style unique..."
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-none rounded-[2rem] px-8 py-6 text-sm font-medium leading-relaxed text-slate-600 focus:ring-2 focus:ring-green-500/20 transition-all outline-none resize-none"
                            />
                        </div>
                    </div>

                    <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-50">
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Profile Status</p>
                            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mt-1">Ready for Sync</p>
                        </div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="bg-slate-900 text-white flex items-center gap-3 px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-green-600 hover:-translate-y-1 transition-all active:scale-95"
                        >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {loading ? "Processing..." : "Commit Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditorInfoForm;