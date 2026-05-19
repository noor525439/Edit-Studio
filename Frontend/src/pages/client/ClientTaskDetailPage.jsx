import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import RoleGuard from "@/components/RoleGuard";
import StandaloneTaskDetail from "@/components/task/StandaloneTaskDetail";
import { apiGet, WORKFLOW_API } from "@/lib/api";
import { CLIENT_ROLES } from "@/lib/roles";

const ClientTaskDetailPage = () => {
  const { projectId, taskId } = useParams();
  const [task, setTask] = useState(null);
  const [order, setOrder] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [detailRes, tasksRes] = await Promise.all([
          apiGet(`${WORKFLOW_API}/orders/${projectId}/detail`),
          apiGet(`${WORKFLOW_API}/tasks?orderId=${projectId}`),
        ]);
        const detail = detailRes.data.data;
        const found = (tasksRes.data.data || []).find((t) => String(t._id) === String(taskId));
        if (!found) {
          toast.error("Task not found");
          setTask(null);
        } else {
          setTask(found);
        }
        setOrder(detail.order);
        setAttachments(detail.attachments || []);
      } catch {
        toast.error("Failed to load task");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId, taskId]);

  if (loading) {
    return <p className="p-10 text-slate-400">Loading task…</p>;
  }

  return (
    <RoleGuard allowedRoles={CLIENT_ROLES}>
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
        <StandaloneTaskDetail
          task={task}
          order={order}
          attachments={attachments}
          backLink={`/client/projects/${projectId}`}
          backLabel="← Back to project"
          projectLink={`/client/projects/${projectId}`}
          projectLinkLabel={order?.projectTitle}
        />
      </div>
    </RoleGuard>
  );
};

export default ClientTaskDetailPage;
