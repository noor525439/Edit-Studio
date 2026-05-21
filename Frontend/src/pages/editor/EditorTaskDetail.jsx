import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import RoleGuard from "@/components/RoleGuard";
import TaskDetailView from "@/components/task/TaskDetailView";
import { apiGet, apiPost, REVIEWS_API, WORKFLOW_API } from "@/lib/api";
import StarRating from "@/components/StarRating";

const EditorTaskDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [applyMsg, setApplyMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [projectReviews, setProjectReviews] = useState([]);
  const [reviewsAvg, setReviewsAvg] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet(`${WORKFLOW_API}/orders/${id}/detail`);
      setData(res.data.data);
    } catch {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const loadProjectReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await apiGet(`${REVIEWS_API}/project/${id}`);
      const payload = res.data.data || {};
      setProjectReviews(payload.reviews || []);
      setReviewsAvg(payload.averageRating || 0);
      setReviewsCount(payload.totalCount || 0);
    } catch {
      setProjectReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadProjectReviews();
  }, [id]);

  const apply = async () => {
    try {
      await apiPost(`${WORKFLOW_API}/orders/${id}/apply`, { message: applyMsg });
      toast.success("Application submitted");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to apply");
    }
  };

  const createTask = async (payload) => {
    await apiPost(`${WORKFLOW_API}/tasks`, payload);
  };

  const clientId = data?.order?.clientId?._id || data?.order?.clientId;

  return (
    <div className="bg-gray-50">
    <RoleGuard allowedRoles={["editor", "admin"]}>
      <TaskDetailView
        mode="editor"
        data={data}
        loading={loading}
        backLink="/editor/tasks"
        backLabel="← Back to tasks"
        applyMsg={applyMsg}
        setApplyMsg={setApplyMsg}
        onApply={apply}
        onCommentPosted={load}
        onTaskRefresh={load}
        onCreateTask={createTask}
        clientProfileLink={clientId ? `/editor/client-profile/${clientId}` : null}
      />

      {/* Project reviews — editor view */}
      <div className="max-w-6xl mx-auto pb-10 -mt-4">
        <section className="bg-white border border-slate-200 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Client reviews</h2>
          {reviewsLoading ? (
            <p className="text-slate-400 text-sm mt-4">Loading reviews…</p>
          ) : (
            <>
              <div className="flex items-center gap-4 mt-4 mb-6 p-4 bg-slate-50 rounded-xl">
                <StarRating value={reviewsAvg} readonly size={22} />
                <div>
                  <p className="font-bold text-slate-900">{reviewsAvg} / 5</p>
                  <p className="text-xs text-slate-500">{reviewsCount} review{reviewsCount !== 1 ? "s" : ""}</p>
                </div>
              </div>
              {projectReviews.length === 0 ? (
                <p className="text-sm text-slate-500">No client reviews for this project yet.</p>
              ) : (
                <ul className="space-y-4">
                  {projectReviews.map((r) => (
                    <li key={r._id} className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                      <div className="flex flex-wrap justify-between gap-2 mb-2">
                        <p className="font-bold text-slate-800">
                          {r.clientName || r.clientId?.username || "Client"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <StarRating value={r.rating} readonly size={18} />
                      <p className="text-sm text-slate-600 mt-2 italic">
                        &quot;{r.comment || r.feedback}&quot;
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
    </RoleGuard>
    </div>
  );
};

export default EditorTaskDetail;
