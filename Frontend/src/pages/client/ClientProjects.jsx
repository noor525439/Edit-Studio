import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import ProjectCard from "@/components/ProjectCard";
import { apiGet, WORKFLOW_API } from "@/lib/api";
import { CLIENT_ROLES } from "@/lib/roles";

const ClientProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet(`${WORKFLOW_API}/marketplace`)
      .then((res) => setProjects(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <RoleGuard allowedRoles={CLIENT_ROLES}>
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-slate-900">My Projects</h1>
            <Link
              to="/client/projects/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-600"
            >
              <Plus size={16} /> Create
            </Link>
          </div>
          {loading ? (
            <p className="text-slate-400">Loading…</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => (
                <ProjectCard key={p._id} project={p} detailPath={`/client/projects/${p._id}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};

export default ClientProjects;
