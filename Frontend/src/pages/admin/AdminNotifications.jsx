import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import { apiGet, apiPatch, WORKFLOW_API } from "@/lib/api";

const AdminNotifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet(`${WORKFLOW_API}/notifications`);
      setItems(res.data.data || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    await apiPatch(`${WORKFLOW_API}/notifications/${id}/read`);
    load();
  };

  const markAll = async () => {
    await apiPatch(`${WORKFLOW_API}/notifications/read-all`);
    load();
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Admin — Notifications</h1>
            <div>
              <button onClick={markAll} className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-green-600">Mark all read</button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            {loading ? (
              <p className="p-6 text-slate-400">Loading…</p>
            ) : items.length === 0 ? (
              <p className="p-6 text-slate-400">No notifications</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((n) => (
                  <li key={n._id} className={`p-4 ${!n.read ? "bg-green-50/50" : ""}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {!n.read && (
                          <button onClick={() => markRead(n._id)} className="text-xs font-bold text-green-600">Mark read</button>
                        )}
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

export default AdminNotifications;
