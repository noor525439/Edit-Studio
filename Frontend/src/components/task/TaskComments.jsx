import { useState } from "react";
import { Send } from "lucide-react";
import { getData } from "@/context/userContext";
import { apiPost, WORKFLOW_API } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const TaskComments = ({ orderId, comments = [], onPosted }) => {
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
      <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <li className="text-sm text-slate-400 italic">No messages yet. Start the conversation.</li>
        ) : (
          comments.map((c) => {
            const mine = String(c.senderId?._id || c.senderId) === String(user?._id);
            return (
              <li
                key={c._id}
                className={`p-3 rounded-2xl text-sm max-w-[85%] ${
                  mine
                    ? "ml-auto bg-slate-900 text-white"
                    : "bg-slate-50 border border-slate-100 text-slate-700"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-wider opacity-60 mb-1">
                  {c.senderId?.username || "User"}
                </p>
                <p>{c.text}</p>
                <p className="text-[9px] mt-2 opacity-50">{new Date(c.createdAt).toLocaleString()}</p>
              </li>
            );
          })
        )}
      </ul>
      <form onSubmit={submit} className="flex gap-2">
        <input
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
          placeholder="Write a message…"
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
