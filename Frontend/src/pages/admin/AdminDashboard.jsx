import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Check, X, UserCircle, Users, Clock, DollarSign, Briefcase, 
  FileText, ExternalLink, UserPlus, TrendingUp, Wallet, CheckCircle2 
} from 'lucide-react';
import { getData } from '@/context/userContext';
import { apiDelete, apiGet, REVIEWS_API } from '@/lib/api';
import StarRating from '@/components/StarRating';

const AdminDashboard = () => {
  const { user, loading } = getData();
  const [pendingEditors, setPendingEditors] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [commissionOverview, setCommissionOverview] = useState({
    totals: { totalVolume: 0, totalAdminCommission: 0, totalEditorPayout: 0 },
    payments: [],
  });
  const [isFetching, setIsFetching] = useState(true);
  const [adminReviews, setAdminReviews] = useState([]);
  const [reviewsSummary, setReviewsSummary] = useState({ averageRating: 0, totalCount: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [filterEditorId, setFilterEditorId] = useState("");
  const [filterProjectId, setFilterProjectId] = useState("");
  const [filterRating, setFilterRating] = useState("");

  const getAuthHeader = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
  }), []);

  const fetchDashboardData = useCallback(async () => {
    setIsFetching(true);
    try {
      const [pendingRes, profilesRes, commissionRes] = await Promise.all([
        axios.get('http://localhost:3000/user/pending-editors', getAuthHeader()),
        axios.get('http://localhost:3000/user/all-editors', getAuthHeader()),
        axios.get('http://localhost:3000/workflow/admin/commissions', getAuthHeader())
      ]);

      setPendingEditors(pendingRes.data.editors || []);
      setAllProfiles(profilesRes.data.data || []);
      setCommissionOverview(commissionRes.data.data || {
        totals: { totalVolume: 0, totalAdminCommission: 0, totalEditorPayout: 0 },
        payments: [],
      });
    } catch (err) {
      toast.error("Failed to sync dashboard data");
    } finally {
      setIsFetching(false);
    }
  }, [getAuthHeader]);

  const fetchAdminReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterEditorId.trim()) params.set("editorId", filterEditorId.trim());
      if (filterProjectId.trim()) params.set("projectId", filterProjectId.trim());
      if (filterRating) params.set("rating", filterRating);
      const qs = params.toString();
      const res = await apiGet(`${REVIEWS_API}/admin/all${qs ? `?${qs}` : ""}`);
      const payload = res.data.data || {};
      setAdminReviews(payload.reviews || []);
      setReviewsSummary({
        averageRating: payload.averageRating || 0,
        totalCount: payload.totalCount || 0,
      });
    } catch {
      toast.error("Failed to load reviews");
      setAdminReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [filterEditorId, filterProjectId, filterRating]);

  useEffect(() => {
    if (user?.role === 'admin') fetchDashboardData();
  }, [user, fetchDashboardData]);

  useEffect(() => {
    if (user?.role === 'admin') fetchAdminReviews();
  }, [user, fetchAdminReviews]);

  const handleDeleteReview = async (reviewId) => {
    try {
      await apiDelete(`${REVIEWS_API}/${reviewId}`);
      toast.success("Review deleted");
      fetchAdminReviews();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleEditorAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await axios.put(`http://localhost:3000/user/approve-editor/${id}`, {}, getAuthHeader());
        toast.success("Editor Approved!");
      } else {
        await axios.delete(`http://localhost:3000/user/reject-editor/${id}`, getAuthHeader());
        toast.error("Request Rejected");
      }
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const handlePaymentApprove = async (paymentId) => {
    try {
      const { data } = await axios.patch(
        `http://localhost:3000/workflow/payments/${paymentId}/approve`,
        {},
        getAuthHeader()
      );
      if (data.success) {
        toast.success("Payment Approved Successfully");
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    }
  };

  if (loading) return <LoadingSpinner message="Securing Session..." />;
  if (!user || user.role !== "admin") return <Navigate to="/" />;

  const pendingPayments = commissionOverview.payments?.filter(p => p.status === 'pending') || [];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto py-8">
        
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Admin Control Panel</h1>
          <p className="text-slate-500 mt-2 text-lg">Platform revenue and management overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <StatCard label="Total Volume" value={commissionOverview.totals.totalVolume} icon={<TrendingUp size={22}/>} color="bg-emerald-50 text-emerald-600 border-emerald-100" />
          <StatCard label="Admin Profit" value={commissionOverview.totals.totalAdminCommission} icon={<Wallet size={22}/>} color="bg-indigo-50 text-indigo-600 border-indigo-100" />
          <StatCard label="Total Payouts" value={commissionOverview.totals.totalEditorPayout} icon={<DollarSign size={22}/>} color="bg-amber-50 text-amber-600 border-amber-100" />
        </div>

        <div className="space-y-12">

          <section className="space-y-6">
            <SectionHeader icon={<CheckCircle2 size={20} className="text-emerald-600"/>} title="Pending Payment Approvals" count={pendingPayments.length} />
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {pendingPayments.length === 0 ? (
                <div className="p-16 text-center text-slate-400 font-medium">All clear! No pending payments.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendingPayments.map(payment => (
                    <div key={payment._id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-800">{payment.orderId?.projectTitle || "Project"}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{payment.method}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{new Date(payment.createdAt).toLocaleDateString('en-GB')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="font-bold text-slate-900 text-lg">PKR {payment.totalAmount.toLocaleString()}</span>
                        <button 
                          onClick={() => handlePaymentApprove(payment._id)}
                          className="px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all shadow-sm hover:shadow-md"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
          <section className="space-y-6">
            <SectionHeader icon={<UserPlus size={20} className="text-amber-600"/>} title="Pending Editor Requests" count={pendingEditors.length} />
            <div className="grid gap-4">
              {pendingEditors.length === 0 ? (
                <div className="p-16 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 font-medium">No new editor applications to review.</div>
              ) : (
                pendingEditors.map(editor => (
                  <PendingCard key={editor._id} editor={editor} onAction={handleEditorAction} />
                ))
              )}
            </div>
          </section>

          <section className="space-y-6">
            <SectionHeader icon={<Users size={20} className="text-indigo-600"/>} title="Active Editor Directory" count={allProfiles.length} />
            <div className="grid gap-4">
              {allProfiles.length === 0 ? (
                <div className="p-10 text-center text-slate-400">No editors registered yet.</div>
              ) : (
                allProfiles.map(profile => <WideProfileRow key={profile._id} profile={profile} />)
              )}
            </div>
          </section>

          <section className="space-y-6">
            <SectionHeader icon={<FileText size={20} className="text-rose-600"/>} title="Client Reviews" count={reviewsSummary.totalCount} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total reviews</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{reviewsSummary.totalCount}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3">
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Average rating</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{reviewsSummary.averageRating} / 5</p>
                </div>
                <StarRating value={reviewsSummary.averageRating} readonly size={20} />
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Filter by editor ID" value={filterEditorId} onChange={(e) => setFilterEditorId(e.target.value)} />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Filter by project ID" value={filterProjectId} onChange={(e) => setFilterProjectId(e.target.value)} />
              <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                <option value="">All ratings</option>
                {[5, 4, 3, 2, 1].map((n) => (<option key={n} value={n}>{n} stars</option>))}
              </select>
              <button type="button" onClick={fetchAdminReviews} className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-black">Apply filters</button>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {reviewsLoading ? (
                <div className="p-12 text-center text-slate-400">Loading reviews…</div>
              ) : adminReviews.length === 0 ? (
                <div className="p-12 text-center text-slate-400">No reviews match your filters.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {adminReviews.map((r) => (
                    <div key={r._id} className="p-5 flex flex-wrap items-start justify-between gap-4 hover:bg-slate-50">
                      <div className="min-w-[200px]">
                        <p className="font-semibold text-slate-800">{r.clientName || r.clientId?.username || "Client"}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Editor: {r.editorId?.username || "—"} · Project: {r.orderId?.projectTitle || r.projectId?.projectTitle || "—"}</p>
                        <div className="mt-2"><StarRating value={r.rating} readonly size={16} /></div>
                        <p className="text-sm text-slate-600 mt-2 italic">&quot;{r.comment || r.feedback}&quot;</p>
                        <p className="text-[11px] text-slate-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button type="button" onClick={() => handleDeleteReview(r._id)} className="px-4 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50">Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};


const StatCard = ({ label, value, icon, color }) => (
  <div className={`bg-white p-6 rounded-2xl border ${color} shadow-sm transition-transform hover:-translate-y-1`}>
    <div className={`w-12 h-12 ${color.split(' ')[0]} ${color.split(' ')[1]} rounded-xl flex items-center justify-center mb-5 shadow-inner`}>{icon}</div>
    <p className="text-2xl font-bold text-slate-900">PKR {Number(value || 0).toLocaleString()}</p>
    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.1em] mt-1">{label}</p>
  </div>
);

const SectionHeader = ({ icon, title, count }) => (
  <div className="flex items-center gap-3 px-2">
    <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">{icon}</div>
    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
    <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{count}</span>
  </div>
);

const PendingCard = ({ editor, onAction }) => {
  const documentUrl = editor.document ? `http://localhost:3000/${editor.document.replace(/\\/g, '/')}` : null;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xl font-bold shadow-lg uppercase">{editor.username?.charAt(0)}</div>
        <div>
          <h3 className="font-semibold text-slate-900">{editor.username}</h3>
          <p className="text-xs text-slate-400 font-medium mb-2">{editor.email}</p>
          {documentUrl && (
            <a href={documentUrl} target="_blank" className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1.5 hover:text-indigo-800 transition-colors">
              <FileText size={14}/> VIEW IDENTITY DOCUMENT
            </a>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => onAction(editor._id, 'reject')} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><X size={22}/></button>
        <button onClick={() => onAction(editor._id, 'approve')} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Check size={22}/></button>
      </div>
    </div>
  );
};

const WideProfileRow = ({ profile }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm hover:border-indigo-100 transition-all">
    <div className="flex items-center gap-5">
      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
        <UserCircle size={32} className="text-slate-400" />
      </div>
      <div>
        <h4 className="font-semibold text-slate-900">{profile.username || profile.name}</h4>
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
           <span className="flex items-center gap-1"><Briefcase size={12}/> {profile.experience || 'New'} Exp</span>
           <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
           <span className="text-indigo-600">Active Editor</span>
        </div>
      </div>
    </div>
    <div className="flex gap-2">
      {profile.skills?.slice(0,3).map((s) => (
        <span key={`${profile._id}-${s}`} className="text-[10px] bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 font-semibold uppercase tracking-wider border border-slate-50">{s}</span>
      ))}
    </div>
  </div>
);

const LoadingSpinner = ({ message }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white">
    <div className="w-12 h-12 border-[5px] border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
    <p className="text-slate-900 text-sm mt-6 font-bold tracking-widest uppercase">{message}</p>
  </div>
);

export default AdminDashboard;