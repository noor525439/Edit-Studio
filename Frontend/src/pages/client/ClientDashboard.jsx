import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FolderKanban, Users } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import ProjectCard from "@/components/ProjectCard";
import { apiGet, WORKFLOW_API } from "@/lib/api";
import { CLIENT_ROLES } from "@/lib/roles";

const ClientDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet(`${WORKFLOW_API}/marketplace`)
      .then((res) => setProjects(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const active = projects.filter((p) => !["completed", "draft"].includes(p.status));
  const drafts = projects.filter((p) => p.status === "draft");

  return (
    <RoleGuard allowedRoles={CLIENT_ROLES}>
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Client Dashboard</h1>
              <p className="text-slate-500 mt-2">Manage projects, hire editors, and approve deliveries.</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/client/projects/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-green-600 transition-colors"
              >
                <Plus size={16} /> New Project
              </Link>
              <Link
                to="/client/editors"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold uppercase tracking-widest hover:border-green-500 transition-colors"
              >
                <Users size={16} /> Find Editors
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <Stat label="Total Projects" value={projects.length} />
            <Stat label="Active" value={active.length} />
            <Stat label="Drafts" value={drafts.length} />
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FolderKanban size={20} className="text-green-600" />
              Recent Projects
            </h2>
            <Link to="/client/projects" className="text-sm font-bold text-green-600 hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <p className="text-slate-400">Loading…</p>
          ) : projects.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <p className="text-slate-500 mb-4">No projects yet. Create your first one.</p>
              <Link to="/client/projects/create" className="text-green-600 font-bold text-sm hover:underline">
                Create project →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.slice(0, 4).map((p) => (
                <ProjectCard key={p._id} project={p} detailPath={`/client/projects/${p._id}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};

const Stat = ({ label, value }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6">
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
    <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

export default ClientDashboard;
