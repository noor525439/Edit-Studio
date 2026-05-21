import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Shield, Star, FolderOpen, DollarSign, Activity } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import { apiGet, WORKFLOW_API } from "@/lib/api";
import StarRating from "@/components/StarRating";

const TRUST_STYLES = {
  gold: "from-amber-400 to-yellow-500 text-slate-900",
  silver: "from-slate-300 to-slate-400 text-slate-900",
  bronze: "from-orange-300 to-orange-400 text-slate-900",
};

const EditorClientProfile = () => {
  const { clientId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet(`${WORKFLOW_API}/clients/${clientId}/profile`)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) return <p className="p-10 text-slate-400">Loading client profile…</p>;
  if (!data) return <p className="p-10">Client not found</p>;

  const { client, previousProjects, budgetHistory, avgRatingGiven, trustBadge, trustLevel, activeProjectsCount } = data;
  const badgeGradient = TRUST_STYLES[trustLevel] || TRUST_STYLES.bronze;

  return (
    <RoleGuard allowedRoles={["editor", "admin"]}>
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          <Link to="/editor/tasks" className="text-sm font-bold text-green-600 hover:underline mb-6 inline-block">
            ← Back to tasks
          </Link>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {client.avatar ? (
                  <img src={client.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  client.username?.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900">{client.username}</h1>
                <p className="text-slate-500 text-sm mt-1">{client.email}</p>
                <span className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-gradient-to-r ${badgeGradient} text-[10px] font-bold uppercase tracking-wider`}>
                  <Shield size={14} />
                  {trustBadge}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <StatCard icon={DollarSign} label="Total spent" value={`$${budgetHistory.totalSpent}`} />
              <StatCard icon={FolderOpen} label="Completed" value={budgetHistory.projectCount} />
              <StatCard icon={Activity} label="Active now" value={activeProjectsCount} />
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Star size={12} className="text-amber-500" /> Avg rating given
                </p>
                <div className="mt-2">
                  <StarRating value={avgRatingGiven} readonly size={16} />
                </div>
              </div>
            </div>
          </div>

          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-bold text-slate-900 mb-4 uppercase text-[10px] tracking-widest">Previous projects</h2>
            {previousProjects.length === 0 ? (
              <p className="text-slate-400 text-sm">No projects yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {previousProjects.map((p) => (
                  <li key={p._id} className="py-4 flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-800">{p.title}</p>
                      <p className="text-xs text-slate-400">{new Date(p.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${p.budget || 0}</p>
                      <p className="text-[10px] uppercase font-bold text-slate-400">{p.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </RoleGuard>
  );
};

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
      <Icon size={12} className="text-green-600" /> {label}
    </p>
    <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

export default EditorClientProfile;
