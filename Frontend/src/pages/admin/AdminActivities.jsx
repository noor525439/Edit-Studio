import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import { apiGet, WORKFLOW_API } from "@/lib/api";

const AdminActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet(`${WORKFLOW_API}/admin/activities`);
      setActivities(res.data.data || []);
    } catch (e) {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Admin — Activity Feed</h1>
          <p className="text-slate-500 mb-6">All platform activities from clients and editors.</p>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <p className="p-6 text-slate-400">Loading…</p>
            ) : activities.length === 0 ? (
              <p className="p-6 text-slate-400">No recent activity</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {activities.map((a) => (
                  <li key={a._id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{a.actorName || a.actorId?.username || 'User'}</p>
                        <p className="text-xs text-slate-500 mt-1">{a.action} · {a.actorRole}</p>
                        <p className="text-sm text-slate-600 mt-2">{a.details}</p>
                        <p className="text-[11px] text-slate-400 mt-2">{new Date(a.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-700">Project</p>
                        <p className="text-xs text-slate-500">{a.orderId?.projectTitle || '—'}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default AdminActivities;
