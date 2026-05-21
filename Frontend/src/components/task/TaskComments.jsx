import { useState } from "react";
import { Send, ShieldCheck } from "lucide-react";
import { getData } from "@/context/userContext";
import { apiPost, WORKFLOW_API } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const TaskComments = ({ orderId, comments = [], onPosted, isAdmin = false }) => {
  const { user } = getData();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await apiPost(`${WORKFLOW_API}/orders/${orderId}/comments`, { text });
      setText("");
      toast.success("Comment posted");
      onPosted?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to post");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <ul className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <li className="text-sm text-slate-400 italic">No messages yet. Start the conversation.</li>
        ) : (
          comments.map((c) => {
            const mine = String(c.senderId?._id || c.senderId) === String(user?._id);
            const senderRole = c.senderId?.role || "";
            const isAdminSender = String(senderRole).toLowerCase() === "admin";

            return (
              <li
                key={c._id}
                className={`p-3 rounded-2xl text-sm max-w-[85%] ${
                  mine
                    ? "ml-auto bg-slate-900 text-white"
                    : "bg-slate-50 border border-slate-100 text-slate-700"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1 flex items-center gap-1">
                  {c.senderId?.username || "User"}
                  {/* Admin: show role badge next to sender name */}
                  {isAdmin && senderRole && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                      isAdminSender
                        ? "bg-amber-200 text-amber-800"
                        : mine
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}>
                      {senderRole}
                    </span>
                  )}
                </p>
                <p>{c.text}</p>
                <p className="text-[9px] mt-2 opacity-50">{new Date(c.createdAt).toLocaleString()}</p>
                {/* Admin: show sender ID and comment ID */}
                {isAdmin && (
                  <p className="text-[9px] mt-1 opacity-40 font-mono">
                    msg: {c._id} · sender: {c.senderId?._id || c.senderId}
                  </p>
                )}
              </li>
            );
          })
        )}
      </ul>

      {/* Admin can also post comments */}
      <form onSubmit={submit} className="flex gap-2">
        {isAdmin && (
          <span className="flex items-center px-2 text-amber-600" title="Posting as admin">
            <ShieldCheck size={16} />
          </span>
        )}
        <input
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
          placeholder={isAdmin ? "Write as admin…" : "Write a message…"}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" disabled={sending} className="bg-slate-900 hover:bg-green-600 px-4">
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
};

export default TaskComments;