import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { getSocket } from "../lib/socket";

const API_BASE = "http://localhost:3000/workflow";

const StatusBadge = ({ status }) => {
  const map = {
    completed:  { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Completed" },
    pending:    { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",  label: "Pending"   },
    processing: { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500",   label: "Processing"},
    failed:     { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500",    label: "Failed"    },
    refunded:   { bg: "bg-gray-100",   text: "text-gray-600",    dot: "bg-gray-400",   label: "Refunded"  },
    cancelled:  { bg: "bg-gray-100",   text: "text-gray-500",    dot: "bg-gray-400",   label: "Cancelled" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const PaymentsPanel = ({
  orders,
  payments,
  onSuccess,
  getAuthHeader,
  currentUserRole = "",
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [startingCheckout, setStartingCheckout] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("payment_received", (data) => {
      if (currentUserRole === "admin" || currentUserRole === "editor") {
        toast.success(`💰 New Payment Received!`, {
          description: `PKR ${data.amount.toLocaleString()} for "${data.projectTitle}" by ${data.clientName}`,
          duration: 8000,
        });
        if (onSuccess) onSuccess();
      }
    });
    return () => socket.off("payment_received");
  }, [currentUserRole, onSuccess]);

  const resetForm = () => {
    setSelectedOrderId("");
    setTotalAmount("");
    if (onSuccess) onSuccess();
  };

  const isFormReady = selectedOrderId && totalAmount && Number(totalAmount) > 0;
  const amountLabel = `PKR ${Number(totalAmount || 0).toLocaleString()}`;

  const startStripeCheckout = async () => {
    if (!isFormReady) {
      toast.error("Select an order and enter a valid amount");
      return;
    }
    setStartingCheckout(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/payments/create-checkout-session`,
        { orderId: selectedOrderId, totalAmount: Number(totalAmount) },
        getAuthHeader()
      );

      if (!data?.success || !data?.url) {
        throw new Error(data?.message || "Unable to start checkout");
      }

      window.location.assign(data.url);
      resetForm();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to start Stripe checkout. Please try again."
      );
    } finally {
      setStartingCheckout(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {currentUserRole === "client" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Make a Payment</h2>
              <p className="text-xs text-gray-400 mt-0.5">Pay securely with your card</p>
            </div>
            <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <span className="text-xs font-medium text-gray-500">Secure</span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Select Order
                </label>
                <select
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  disabled={startingCheckout}
                >
                  <option value="">Choose project...</option>
                  {orders.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.projectTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Amount (PKR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                    ₨
                  </span>
                  <input
                    className="w-full pl-7 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
                    type="number"
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    min="1"
                    disabled={startingCheckout}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex justify-between items-center">
              <span className="text-sm text-gray-500">Total to pay</span>
              <span className="text-lg font-semibold text-gray-900">{amountLabel}</span>
            </div>
            <button
              type="button"
              onClick={startStripeCheckout}
              disabled={startingCheckout}
              className="w-full py-3 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {startingCheckout ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Pay with Stripe
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Payment History</h2>
          <p className="text-xs text-gray-400 mt-0.5">{payments.length} transaction{payments.length !== 1 ? "s" : ""}</p>
        </div>

        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-5">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-400">No payments yet</p>
            <p className="text-xs text-gray-300 mt-1">Transactions will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {payments.map((payment) => (
              <div key={payment._id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {payment.orderId?.projectTitle || "Project"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(payment.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-sm font-semibold text-gray-900">
                      PKR {(payment.totalAmount || 0).toLocaleString()}
                    </span>
                    <StatusBadge status={payment.status} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {typeof payment.adminCommissionAmount === "number" && (
                    <span className="text-xs text-gray-400">
                      Admin (20%):{" "}
                      <span className="text-gray-600 font-medium">
                        PKR {(payment.adminCommissionAmount || 0).toLocaleString()}
                      </span>
                    </span>
                  )}
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">
                    Editor:{" "}
                    <span className="text-gray-600 font-medium">
                      PKR {(payment.editorPayoutAmount || 0).toLocaleString()}
                    </span>
                  </span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    {payment.method === "stripe_checkout"
                      ? "Stripe Checkout"
                      : payment.method === "stripe_card"
                      ? "Stripe Elements"
                      : payment.method}
                  </span>
                  {payment.receiptUrl && (
                    <>
                      <span className="text-xs text-gray-300">·</span>
                      <a
                        href={payment.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-500 hover:text-indigo-700 underline underline-offset-2"
                      >
                        Receipt
                      </a>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPanel;