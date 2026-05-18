import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import RoleGuard from "@/components/RoleGuard";
import TaskDetailView from "@/components/task/TaskDetailView";
import { apiGet, apiPost, WORKFLOW_API } from "@/lib/api";
import { CLIENT_ROLES } from "@/lib/roles";

const ClientProjectDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [revisionReason, setRevisionReason] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    apiGet(`${WORKFLOW_API}/orders/${id}/detail`)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
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

  return (
    <RoleGuard allowedRoles={CLIENT_ROLES}>
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
    </RoleGuard>
  );
};

export default ClientProjectDetail;
