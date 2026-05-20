import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import RoleGuard from "@/components/RoleGuard";
import TaskDetailView from "@/components/task/TaskDetailView";
import { apiGet, apiPost, apiPut, REVIEWS_API, WORKFLOW_API } from "@/lib/api";
import { CLIENT_ROLES } from "@/lib/roles";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { getData } from "@/context/userContext";

const ClientProjectDetail = () => {
  const { id } = useParams();
  const { user } = getData();
  const [data, setData] = useState(null);
  const [revisionReason, setRevisionReason] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(true);
  const [panelReviews, setPanelReviews] = useState([]);
  const [panelAvg, setPanelAvg] = useState(0);
  const [panelLoading, setPanelLoading] = useState(true);
  const [myPanelReview, setMyPanelReview] = useState(null);
  const [panelRating, setPanelRating] = useState(5);
  const [panelComment, setPanelComment] = useState("");
  const [panelSubmitting, setPanelSubmitting] = useState(false);
  const [editingPanel, setEditingPanel] = useState(false);

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

  const loadPanelReviews = async () => {
    setPanelLoading(true);
    try {
      const res = await apiGet(`${REVIEWS_API}/project/${id}`);
      const { reviews = [], averageRating = 0 } = res.data.data || {};
      setPanelReviews(reviews);
      setPanelAvg(averageRating);
      const mine = user
        ? reviews.find((r) => String(r.clientId?._id || r.clientId) === String(user._id || user.id))
        : null;
      setMyPanelReview(mine || null);
      if (mine && !editingPanel) {
        setPanelRating(mine.rating);
        setPanelComment(mine.comment || mine.feedback || "");
      }
    } catch {
      toast.error("Could not load reviews");
      setPanelReviews([]);
    } finally {
      setPanelLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadPanelReviews();
  }, [id]);

  const publish = async () => {
    try {
      await apiPost(`${WORKFLOW_API}/orders/${id}/publish`);
      toast.success("Project published");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  const requestRevision = async () => {
    if (!revisionReason.trim()) {
      toast.error("Please enter a revision reason");
      return;
    }
    try {
      await apiPost(`${WORKFLOW_API}/orders/${id}/request-revision`, { reason: revisionReason });
      toast.success("Revision requested");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  const confirmDelivery = async () => {
    try {
      await apiPost(`${WORKFLOW_API}/orders/${id}/confirm-delivery`);
      toast.success("Delivery confirmed — project completed!");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  const submitRating = async () => {
    try {
      await apiPost(`${WORKFLOW_API}/orders/${id}/rate`, { rating, reviewText });
      toast.success("Review submitted — thank you!");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  const acceptApplication = async (applicationId) => {
    try {
      await apiPost(`${WORKFLOW_API}/orders/${id}/accept-application`, { applicationId });
      toast.success("Editor hired — project started!");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to accept application");
    }
  };

  const rejectApplication = async (applicationId) => {
    try {
      await apiPost(`${WORKFLOW_API}/orders/${id}/reject-application`, { applicationId });
      toast.success("Application rejected");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to reject application");
    }
  };

  const submitPanelReview = async () => {
    if (!panelComment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    setPanelSubmitting(true);
    try {
      if (myPanelReview && editingPanel) {
        await apiPut(`${REVIEWS_API}/${myPanelReview._id}`, {
          rating: panelRating,
          comment: panelComment,
        });
        toast.success("Review updated");
        setEditingPanel(false);
      } else {
        await apiPost(REVIEWS_API, {
          projectId: id,
          rating: panelRating,
          comment: panelComment,
        });
        toast.success("Review submitted — thank you!");
      }
      await loadPanelReviews();
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to submit review");
    } finally {
      setPanelSubmitting(false);
    }
  };

  const canReviewPanel =
    data?.order?.assignedEditorId &&
    ["delivered", "revision_requested", "completed"].includes(data?.order?.status);

  return (
    <div className="bg-gray-50">
    <RoleGuard allowedRoles={CLIENT_ROLES}   className="min-h-screen bg-[#F8FAFC]">
      <TaskDetailView
        mode="client"
        data={data}
        loading={loading}
        backLink="/client/projects"
        backLabel="← Back to projects"
        revisionReason={revisionReason}
        setRevisionReason={setRevisionReason}
        onRequestRevision={requestRevision}
        onConfirmDelivery={confirmDelivery}
        onPublish={publish}
        rating={rating}
        setRating={setRating}
        reviewText={reviewText}
        setReviewText={setReviewText}
        onSubmitReview={submitRating}
        onCommentPosted={load}
        onAcceptApplication={acceptApplication}
        onRejectApplication={rejectApplication}
      />

      {/* Client Review Panel */}
      <div className="max-w-6xl mx-auto pb-10 bg-gray-50">
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-1">Client Review Panel</h2>
          <p className="text-sm text-slate-500 mb-2">
            Share your experience working with the editor on this project.
          </p>

          {panelLoading ? (
            <p className="text-slate-400 text-sm">Loading reviews…</p>
          ) : (
            <>
              {myPanelReview && !editingPanel ? (
                <div className="bg-green-50 border border-green-100 rounded-xl p-5 mb-4">
                  <p className="text-[10px] font-black uppercase text-green-700 mb-2">Your review</p>
                  <StarRating value={myPanelReview.rating} readonly size={22} />
                  <p className="text-sm text-slate-600 mt-3 italic">
                    &quot;{myPanelReview.comment || myPanelReview.feedback}&quot;
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(myPanelReview.createdAt).toLocaleDateString()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setEditingPanel(true);
                      setPanelRating(myPanelReview.rating);
                      setPanelComment(myPanelReview.comment || myPanelReview.feedback || "");
                    }}
                  >
                    Edit review
                  </Button>
                </div>
              ) : canReviewPanel ? (
                <div className="space-y-4 mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400 mb-2">Your rating</p>
                    <StarRating value={panelRating} onChange={setPanelRating} size={28} />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400" htmlFor="panel-comment">
                      Comment
                    </label>
                    <textarea
                      id="panel-comment"
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm mt-1"
                      rows={4}
                      placeholder="Describe your experience…"
                      value={panelComment}
                      onChange={(e) => setPanelComment(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={submitPanelReview}
                      disabled={panelSubmitting}
                      className="bg-slate-900 hover:bg-green-600"
                    >
                      {myPanelReview && editingPanel ? "Save changes" : "Submit review"}
                    </Button>
                    {editingPanel && (
                      <Button variant="outline" onClick={() => setEditingPanel(false)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Reviews open after your editor delivers work on this project.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </RoleGuard>
    </div>
  );
};

export default ClientProjectDetail;
