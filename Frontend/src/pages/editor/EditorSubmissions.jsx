import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import { apiGet, apiPost, WORKFLOW_API } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EditorSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ orderId: "", fileUrl: "", fileName: "", notes: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet(`${WORKFLOW_API}/submissions`),
      apiGet(`${WORKFLOW_API}/marketplace`),
    ]).then(([subRes, ordRes]) => {
      setSubmissions(subRes.data.data || []);
      const mine = (ordRes.data.data || []).filter((o) => o.assignedEditorId);
      setOrders(mine);
      if (mine[0]) setForm((f) => ({ ...f, orderId: mine[0]._id }));
    }).finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fileUrl.trim()) {
      toast.error("File URL is required");
      return;
    }
    try {
      await apiPost(`${WORKFLOW_API}/submissions`, form);
      toast.success("Delivery submitted");
      const subRes = await apiGet(`${WORKFLOW_API}/submissions`);
      setSubmissions(subRes.data.data || []);
      setForm((f) => ({ ...f, fileUrl: "", fileName: "", notes: "" }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submit failed");
    }
  };

  return (
    <RoleGuard allowedRoles={["editor", "admin"]}>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Submissions</h1>
          <p className="text-slate-500 mb-8">Upload completed project files for client review.</p>

          <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 space-y-4">
            <div>
              <Label>Project</Label>
              <select
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                value={form.orderId}
                onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}
                required
              >
                {orders.map((o) => (
                  <option key={o._id} value={o._id}>{o.projectTitle}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>File URL (Drive, Dropbox, etc.)</Label>
              <Input value={form.fileUrl} onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))} required className="mt-1" />
            </div>
            <div>
              <Label>File name</Label>
              <Input value={form.fileName} onChange={(e) => setForm((f) => ({ ...f, fileName: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Notes</Label>
              <textarea
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <Button type="submit" className="gap-2 w-full bg-slate-900 hover:bg-green-600">
              <Upload size={16} /> Submit delivery
            </Button>
          </form>

          <h2 className="font-bold text-slate-800 mb-4">Past submissions</h2>
          {loading ? (
            <p className="text-slate-400">Loading…</p>
          ) : submissions.length === 0 ? (
            <p className="text-slate-400">No submissions yet.</p>
          ) : (
            <ul className="space-y-3">
              {submissions.map((s) => (
                <li key={s._id} className="bg-white border border-slate-200 rounded-xl p-4 text-sm">
                  <p className="font-bold text-slate-800">{s.orderId?.projectTitle || "Project"}</p>
                  <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-green-600 hover:underline">
                    {s.fileName || s.fileUrl}
                  </a>
                  <p className="text-slate-400 text-xs mt-1">{new Date(s.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};

export default EditorSubmissions;
