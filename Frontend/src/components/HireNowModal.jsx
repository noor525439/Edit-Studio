import { useEffect, useState } from "react";
import { X, CreditCard, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, WORKFLOW_API } from "@/lib/api";
import { Button } from "@/components/ui/button";

const HireNowModal = ({ editorId, editorName, open, onClose }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setFetching(true);
      try {
        const res = await apiGet(`${WORKFLOW_API}/marketplace`);
        const mine = (res.data.data || []).filter(
          (p) => !p.assignedEditorId && ["draft", "published"].includes(p.status)
        );
        setProjects(mine);
        if (mine[0]) setSelectedProject(mine[0]._id);
      } catch {
        toast.error("Could not load your projects");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [open]);

  const handleConfirm = async () => {
    if (!paymentConfirmed) {
      toast.error("Please confirm payment to proceed");
      return;
    }
    setLoading(true);
    try {
      const res = await apiPost(`${WORKFLOW_API}/instant-hire`, {
        editorId,
        orderId: selectedProject || undefined,
        paymentConfirmed: true,
      });
      toast.success(`Hired ${editorName || "editor"} — project started!`);
      onClose?.();
      const orderId = res.data.data?._id;
      navigate(orderId ? `/client/projects/${orderId}` : "/client/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Hire failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl text-green-600">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <h2 className="font-black text-slate-900">Instant Hire</h2>
              <p className="text-xs text-slate-500">{editorName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
              Select project
            </label>
            {fetching ? (
              <p className="text-sm text-slate-400">Loading projects…</p>
            ) : (
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">Create new instant-hire project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.projectTitle} ({p.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-green-300 transition-colors">
            <input
              type="checkbox"
              checked={paymentConfirmed}
              onChange={(e) => setPaymentConfirmed(e.target.checked)}
              className="mt-1 rounded border-slate-300 text-green-600 focus:ring-green-500"
            />
            <div>
              <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CreditCard size={16} className="text-green-600" />
                Confirm escrow payment
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Funds are held securely until you approve the final delivery.
              </p>
            </div>
          </label>

          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-6 rounded-2xl bg-slate-900 hover:bg-green-600 font-black uppercase tracking-widest text-xs"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Confirm Hire"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HireNowModal;
