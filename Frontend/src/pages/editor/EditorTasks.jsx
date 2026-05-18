import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import ProjectCard from "@/components/ProjectCard";
import { apiGet, WORKFLOW_API } from "@/lib/api";

const EditorTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet(`${WORKFLOW_API}/marketplace`)
      .then((res) => setTasks(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const open = tasks.filter((t) => t.status === "published" && !t.assignedEditorId);
  const mine = tasks.filter((t) => t.assignedEditorId);

  return (
    <RoleGuard allowedRoles={["editor", "admin"]}>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-slate-900 mb-8">Task List</h1>

          <h2 className="text-lg font-bold text-slate-700 mb-4">Open tasks</h2>
          {loading ? (
            <p className="text-slate-400 mb-10">Loading…</p>
          ) : open.length === 0 ? (
            <p className="text-slate-400 mb-10">No open tasks right now.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {open.map((t) => (
                <ProjectCard key={t._id} project={t} detailPath={`/editor/tasks/${t._id}`} showClient />
              ))}
            </div>
          )}

          <h2 className="text-lg font-bold text-slate-700 mb-4">My assignments</h2>
          {mine.length === 0 ? (
            <p className="text-slate-400">No assignments yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mine.map((t) => (
                <ProjectCard key={t._id} project={t} detailPath={`/editor/tasks/${t._id}`} showClient />
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};

export default EditorTasks;
