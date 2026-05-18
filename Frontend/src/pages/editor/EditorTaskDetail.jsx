import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import RoleGuard from "@/components/RoleGuard";
import TaskDetailView from "@/components/task/TaskDetailView";
import { apiGet, apiPost, WORKFLOW_API } from "@/lib/api";

const EditorTaskDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [applyMsg, setApplyMsg] = useState("");
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

  const apply = async () => {
    try {
      await apiPost(`${WORKFLOW_API}/orders/${id}/apply`, { message: applyMsg });
      toast.success("Application submitted");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to apply");
    }
  };

  const clientId = data?.order?.clientId?._id || data?.order?.clientId;

  return (
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
        clientProfileLink={clientId ? `/editor/client-profile/${clientId}` : null}
      />
    </RoleGuard>
  );
};

export default EditorTaskDetail;
