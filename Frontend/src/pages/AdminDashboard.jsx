import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Check, X, UserCircle, ShieldAlert, Users, Clock, DollarSign, Briefcase, FileText, ExternalLink } from 'lucide-react';
import { getData } from '@/context/UserContext';

const AdminDashboard = () => {
  const { user, loading } = getData();
  const [pendingEditors, setPendingEditors] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const getAuthHeader = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
  }), []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsFetching(true);
      try {
        const [pendingRes, profilesRes] = await Promise.all([
          axios.get('http://localhost:3000/user/pending-editors', getAuthHeader()),
          axios.get('http://localhost:3000/user/all-editors')
        ]);
        setPendingEditors(pendingRes.data.editors || []);
        setAllProfiles(profilesRes.data.data || []);
      } catch (err) {
        toast.error("Failed to sync dashboard data");
      } finally {
        setIsFetching(false);
      }
    };
    if (user?.role === 'admin') fetchDashboardData();
  }, [user, getAuthHeader]);

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await axios.put(`http://localhost:3000/user/approve-editor/${id}`, {}, getAuthHeader());
        toast.success("Editor Approved!");
      } else {
        await axios.delete(`http://localhost:3000/user/reject-editor/${id}`, getAuthHeader());
        toast.error("Request Rejected");
      }
      setPendingEditors(prev => prev.filter(ed => ed._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  if (loading) return <LoadingSpinner message="Securing Session..." />;
  if (!user || user.role !== "admin") return <Navigate to="/" />;

  return (
    <div className="p-6 md:p-12 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        
        <header className="text-center flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm">
            <ShieldAlert className="text-indigo-600" size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Admin Terminal</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-2">Management</h1>
          <div className="flex gap-6 mt-4">
             <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <Clock size={16} className="text-amber-500" /> {pendingEditors.length} Pending
             </div>
             <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <Users size={16} className="text-indigo-500" /> {allProfiles.length} Active
             </div>
          </div>
        </header>

        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <h2 className="text-lg font-bold text-slate-800">Priority Approvals</h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          
          {isFetching ? (
            <div className="h-32 bg-white rounded-[2rem] animate-pulse border border-slate-100" />
          ) : pendingEditors.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingEditors.map(editor => (
                <PendingCard key={editor._id} editor={editor} onAction={handleAction} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <h2 className="text-lg font-bold text-slate-800">Active Directory</h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          
          <div className="flex flex-col gap-4">
            {allProfiles.length === 0 ? (
               <div className="text-center p-12 bg-white rounded-[2rem] border border-dashed border-slate-300 text-slate-400">
                  No active profiles available in the roster.
               </div>
            ) : (
              allProfiles.map(profile => (
                <WideProfileRow key={profile._id} profile={profile} />
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

// --- Updated PendingCard with Document Link ---
const PendingCard = ({ editor, onAction }) => {
  // Replace backslashes with forward slashes fo
  // 8r URL compatibility
  const documentUrl = editor.document 
    ? `http://localhost:3000/${editor.document.replace(/\\/g, '/')}` 
    : null;

  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-sm">
          {editor.username?.charAt(0).toUpperCase() || <UserCircle size={16} />}
        </div>
        <div className="flex flex-col">
          <h3 className="font-bold text-slate-900 text-sm leading-tight">{editor.username}</h3>
          <p className="text-[10px] text-slate-400 truncate max-w-[120px] mb-1">{editor.email}</p>
          
          {documentUrl ? (
            <a 
              href={documentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold hover:text-indigo-800 transition-colors w-fit"
            >
              <FileText size={12} /> View CV <ExternalLink size={10} />
            </a>
          ) : (
            <span className="text-[9px] text-amber-500 font-medium italic">No document found</span>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        <button onClick={() => onAction(editor._id, 'reject')} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <X size={18} />
        </button>
        <button onClick={() => onAction(editor._id, 'approve')} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
          <Check size={18} />
        </button>
      </div>
    </div>
  );
};

const WideProfileRow = ({ profile }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-6">
      <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200">
        <UserCircle size={28} />
      </div>
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h4 className="font-bold text-slate-900">{profile.username || profile.name}</h4>
          <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter italic">
            {profile.role}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1"><DollarSign size={12} className="text-green-500"/>{profile.rate || 0}/hr</span>
          <span className="flex items-center gap-1 uppercase tracking-widest text-[9px]"><Briefcase size={12} className="text-slate-400"/>Exp: {profile.experience || 'N/A'}</span>
        </div>
      </div>
    </div>
    
    <div className="flex flex-wrap gap-2 md:max-w-[200px] justify-end">
      {profile.skills?.slice(0, 3).map((skill, i) => (
        <span key={i} className="text-[10px] bg-slate-50 border border-slate-100 text-slate-500 px-3 py-1 rounded-full">
          {skill}
        </span>
      )) || <span className="text-[10px] text-slate-300 italic">No skills listed</span>}
    </div>
  </div>
);

const EmptyState = () => (
  <div className="p-16 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
    <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
      <Check className="text-green-500" size={32} />
    </div>
    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Queue Clear</p>
  </div>
);

const LoadingSpinner = ({ message }) => (
  <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-4">
    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{message}</p>
  </div>
);

export default AdminDashboard;