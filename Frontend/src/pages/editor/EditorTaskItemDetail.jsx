import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import RoleGuard from "@/components/RoleGuard";
import StandaloneTaskDetail from "@/components/task/StandaloneTaskDetail";
import TaskTimerPanel from "@/components/task/TaskTimerPanel";
import { apiGet, apiPost, WORKFLOW_API } from "@/lib/api";

const EditorTaskItemDetail = () => {
  const { projectId, taskId } = useParams();
  const [task, setTask] = useState(null);
  const [order, setOrder] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [detailRes, tasksRes] = await Promise.all([
        apiGet(`${WORKFLOW_API}/orders/${projectId}/detail`),
        apiGet(`${WORKFLOW_API}/tasks?orderId=${projectId}`),
      ]);
      const detail = detailRes.data.data;
      const list = tasksRes.data.data || [];
      const found = list.find((t) => String(t._id) === String(taskId));
      setTask(found || null);
      setOrder(detail.order);
      setAttachments(detail.attachments || []);
      if (!found) toast.error("Task not found");
    } catch {
      toast.error("Failed to load task");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [projectId, taskId]);

  const createTask = async (payload) => {
    await apiPost(`${WORKFLOW_API}/tasks`, payload);
  };

  if (loading) {
    return <p className="p-10 text-slate-400">Loading task…</p>;
  }

  return (
    <RoleGuard allowedRoles={["editor", "admin"]}>
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
        <StandaloneTaskDetail
          task={task}
          order={order}
          attachments={attachments}
          backLink={`/editor/tasks/${projectId}`}
          backLabel="← Back to project"
          projectLink={`/editor/tasks/${projectId}`}
          projectLinkLabel={order?.projectTitle}
        />
        {task && (
          <div className="max-w-5xl mx-auto mt-6">
            <TaskTimerPanel
              tasks={[task]}
              orderId={projectId}
              canControl
              canCreate={false}
              onRefresh={load}
              onCreateTask={createTask}
            />
          </div>
        )}
      </div>
    </RoleGuard>
  );
};

export default EditorTaskItemDetail;
