import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RoleGuard from "@/components/RoleGuard";
import TaskDetailView from "@/components/task/TaskDetailView";
import { apiGet, apiPost, WORKFLOW_API } from "@/lib/api";
import { toast } from "sonner";

const AdminProjectDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet(`${WORKFLOW_API}/orders/${id}`);
      setData(res.data.data);
    } catch (err) {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <TaskDetailView
        mode="admin"
        data={data}
        loading={loading}
        backLink="/admin/projects"
        backLabel="← Back to projects"
        onTaskRefresh={load}
      />
    </RoleGuard>
  );
};

export default AdminProjectDetail;