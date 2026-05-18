import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import RoleGuard from "@/components/RoleGuard";
import ProgressBar from "@/components/ProgressBar";
import { getData } from "@/context/UserContext";
import { apiGet, apiPut, WORKFLOW_API } from "@/lib/api";
import { statusBadgeClass, statusLabel } from "@/lib/roles";
import StarRating from "@/components/StarRating";
import TopRatedBadge from "@/components/TopRatedBadge";

const EditorDashboardPage = () => {
  const { user } = getData();
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState({ avgRating: 0, totalReviews: 0, isTopRated: false, completedProjects: 0 });

  useEffect(() => {
    if (!user?._id) return;
    Promise.all([
      apiGet(`${WORKFLOW_API}/reviews`),
      apiGet(`${WORKFLOW_API}/gig/editor/${user._id}`),
    ]).then(([revRes, gigRes]) => {
      const reviews = revRes.data.data || [];
      const gig = gigRes.data.data;
      const avg = gig?.avgRating ?? (reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0);
      setReviewStats({
        avgRating: Number(avg.toFixed(1)),
        totalReviews: gig?.totalReviews ?? reviews.length,
        isTopRated: avg >= 4.5 && (gig?.totalReviews ?? reviews.length) >= 3,
        completedProjects: gig?.completedTasks ?? 0,
      });
    });
    apiGet(`${WORKFLOW_API}/marketplace`)
      .then((res) => {
        const mine = (res.data.data || []).filter((p) => {
          const aid = p.assignedEditorId?._id || p.assignedEditorId;
          return aid && String(aid) === String(user._id);
        });
        setAssigned(mine);
      })
      .finally(() => setLoading(false));
  }, [user?._id]);

  const updateProgress = async (orderId, percent) => {
    try {
      await apiPut(`${WORKFLOW_API}/orders/${orderId}/progress-percent`, { progressPercent: percent });
      toast.success(`Progress updated to ${percent}%`);
      setAssigned((prev) =>
        prev.map((p) => (p._id === orderId ? { ...p, progressPercent: percent } : p))
      );
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    }
  };

  return (
    <RoleGuard allowedRoles={["editor", "admin"]}>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">Editor Dashboard</h1>
              <p className="text-slate-500">Update progress on your active projects.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 flex items-center gap-4">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Your rating</p>
                <StarRating value={reviewStats.avgRating} readonly size={18} />
              </div>
              <TopRatedBadge show={reviewStats.isTopRated} />
              <p className="text-xs text-slate-500 font-bold">{reviewStats.totalReviews} reviews</p>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <Link to="/editor/tasks" className="text-sm font-bold text-green-600 hover:underline">
              Browse tasks →
            </Link>
            <Link to="/editor/submissions" className="text-sm font-bold text-green-600 hover:underline">
              Submissions →
            </Link>
          </div>

          {loading ? (
            <p className="text-slate-400">Loading…</p>
          ) : assigned.length === 0 ? (
            <div className="bg-white border border-dashed rounded-2xl p-12 text-center text-slate-500">
              No active assignments. <Link to="/editor/tasks" className="text-green-600 font-bold">Find tasks</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {assigned.map((p) => (
                <div key={p._id} className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="flex flex-wrap justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-black text-lg text-slate-900">{p.projectTitle}</h3>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusBadgeClass(p.status)}`}>
                        {statusLabel(p.status)}
                      </span>
                    </div>
                    <Link to={`/editor/tasks/${p._id}`} className="text-sm font-bold text-green-600 hover:underline">
                      View details
                    </Link>
                  </div>
                  <ProgressBar percent={p.progressPercent} />
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={p.progressPercent || 0}
                      onChange={(e) =>
                        setAssigned((prev) =>
                          prev.map((x) =>
                            x._id === p._id ? { ...x, progressPercent: Number(e.target.value) } : x
                          )
                        )
                      }
                      className="flex-1 min-w-[200px]"
                    />
                    <span className="text-sm font-bold text-green-600 w-12">{p.progressPercent || 0}%</span>
                    <button
                      type="button"
                      onClick={() => updateProgress(p._id, p.progressPercent || 0)}
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-black uppercase rounded-xl hover:bg-green-600"
                    >
                      Save progress
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};

export default EditorDashboardPage;
