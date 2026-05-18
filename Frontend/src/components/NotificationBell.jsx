import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { apiGet, apiPatch, WORKFLOW_API } from "@/lib/api";
import { getSocket } from "@/lib/socket";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const load = async () => {
    try {
      const res = await apiGet(`${WORKFLOW_API}/notifications`);
      setItems(res.data.data || []);
      setUnread(res.data.unreadCount || 0);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    if (!socket) return;
    const handler = () => load();
    socket.on("workflow:notification", handler);
    return () => socket.off("workflow:notification", handler);
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
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl border border-slate-200 bg-white hover:border-green-300 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-slate-600" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 max-h-96 overflow-auto bg-white border border-slate-200 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notifications</span>
              {unread > 0 && (
                <button onClick={markAll} className="text-[10px] font-bold text-green-600 hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <p className="p-6 text-sm text-slate-400 text-center">No notifications yet</p>
            ) : (
              <ul className="divide-y divide-slate-50">
                {items.map((n) => (
                  <li
                    key={n._id}
                    className={`p-4 cursor-pointer hover:bg-slate-50 ${!n.read ? "bg-green-50/50" : ""}`}
                    onClick={() => markRead(n._id)}
                  >
                    <p className="text-sm font-bold text-slate-800">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                    <p className="text-[9px] text-slate-400 mt-2 uppercase">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
