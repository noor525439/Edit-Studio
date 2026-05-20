import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import ProjectCard from "@/components/ProjectCard";
import { apiGet, WORKFLOW_API } from "@/lib/api";

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet(`${WORKFLOW_API}/marketplace`)
      .then((res) => setProjects(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Admin — Projects</h1>
          <p className="text-slate-500 mb-8">Overview of all platform projects.</p>
          {loading ? (
            <p className="text-slate-400">Loading…</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => (
                <ProjectCard key={p._id} project={p} detailPath={`/client/projects/${p._id}`} showClient />
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};

export default AdminProjects;
