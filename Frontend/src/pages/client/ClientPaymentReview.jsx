import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CreditCard, Calendar, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import RoleGuard from "@/components/RoleGuard";
import { apiGet, WORKFLOW_API } from "@/lib/api";
import { CLIENT_ROLES } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const paymentDisplayStatus = (status) => {
  if (status === "completed") return { label: "Paid", variant: "success" };
  if (["failed", "cancelled", "refunded"].includes(status)) return { label: "Unpaid", variant: "danger" };
  return { label: "Pending", variant: "warning" };
};

const StatusBadge = ({ status }) => {
  const { label, variant } = paymentDisplayStatus(status);
  const styles = {
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    danger: "bg-red-100 text-red-800 border-red-200",
  };
  const icons = {
    success: CheckCircle,
    warning: Clock,
    danger: XCircle,
  };
  const Icon = icons[variant];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase border ${styles[variant]}`}>
      <Icon size={14} />
      {label}
    </span>
  );
};

const ClientPaymentReview = () => {
  const { projectId } = useParams();
  const [order, setOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [detailRes, payRes] = await Promise.all([
          apiGet(`${WORKFLOW_API}/orders/${projectId}/detail`),
          apiGet(`${WORKFLOW_API}/payments`),
        ]);
        setOrder(detailRes.data.data.order);
        const forOrder = (payRes.data.data || []).filter(
          (p) => String(p.orderId?._id || p.orderId) === String(projectId)
        );
        setPayments(forOrder);
      } catch {
        toast.error("Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const latest = payments[0];
  const amount = latest?.totalAmount ?? order?.autoPriceEstimate ?? 0;
  const dueDate = order?.deadline ? new Date(order.deadline).toLocaleDateString() : "—";
  const status = latest?.status || (order?.status === "completed" ? "completed" : "pending");

  if (loading) {
    return <p className="p-10 text-slate-400">Loading payment details…</p>;
  }

  return (
    <RoleGuard allowedRoles={CLIENT_ROLES}>
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
        <div className="max-w-2xl mx-auto">
          <Link
            to={`/client/projects/${projectId}`}
            className="text-sm font-bold text-green-600 hover:underline mb-6 inline-block"
          >
            ← Back to project
          </Link>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-xl">
                  <CreditCard className="text-green-600" size={22} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Payment Review</h1>
                  <p className="text-sm text-slate-500">{order?.projectTitle}</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1 mb-2">
                    <DollarSign size={12} /> Amount
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    PKR {Number(amount).toLocaleString()}
                  </p>
                </div>
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1 mb-2">
                    <Calendar size={12} /> Due date
                  </p>
                  <p className="text-lg font-bold text-slate-800">{dueDate}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Status</p>
                  <StatusBadge status={status} />
                </div>
              </div>

              {payments.length > 0 ? (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    Payment history
                  </p>
                  <ul className="space-y-2">
                    {payments.map((p) => (
                      <li
                        key={p._id}
                        className="flex flex-wrap items-center justify-between gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm"
                      >
                        <span className="font-bold text-slate-800">
                          PKR {Number(p.totalAmount).toLocaleString()}
                        </span>
                        <span className="text-slate-500 text-xs">
                          {p.paidAt
                            ? new Date(p.paidAt).toLocaleDateString()
                            : new Date(p.createdAt).toLocaleDateString()}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {paymentDisplayStatus(p.status).label}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  No payments recorded yet. Use the button below to pay when your project is ready.
                </p>
              )}

              {status !== "completed" && (
                <Link to={`/checkout?orderId=${projectId}`}>
                  <Button className="w-full py-6 bg-slate-900 hover:bg-green-600 font-black uppercase tracking-widest text-xs">
                    Pay now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default ClientPaymentReview;
