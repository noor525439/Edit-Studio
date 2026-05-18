import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiPost, WORKFLOW_API } from "@/lib/api";

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("orderId") || "");
  const [totalAmount, setTotalAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const numericAmount = useMemo(() => Number(totalAmount), [totalAmount]);
  const ready = orderId && Number.isFinite(numericAmount) && numericAmount > 0;

  useEffect(() => {
    const fromUrl = searchParams.get("orderId");
    if (fromUrl) setOrderId(fromUrl);
  }, [searchParams]);

  const startCheckout = async () => {
    if (!ready) {
      toast.error("Please enter an Order ID and a valid amount.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiPost(`${WORKFLOW_API}/payments/create-checkout-session`, {
        orderId,
        totalAmount: numericAmount,
      });

      if (!data?.success || !data?.url) {
        throw new Error(data?.message || "Unable to create checkout session");
      }

      window.location.assign(data.url);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to start Stripe checkout."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-gray-900">Checkout</h1>
            <p className="text-sm text-gray-500 mt-1">
              You’ll be redirected to Stripe to complete payment securely.
            </p>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                Order ID
              </label>
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. 663a0b..."
                className="w-full px-3 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100 transition-all text-sm"
              />
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
                  type="number"
                  min="1"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100 transition-all text-sm"
                />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex justify-between items-center">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-lg font-semibold text-gray-900">
                PKR {Number.isFinite(numericAmount) ? numericAmount.toLocaleString() : "0"}
              </span>
            </div>

            <button
              type="button"
              onClick={startCheckout}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Redirecting...
                </>
              ) : (
                "Pay with Stripe"
              )}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link to="/client/projects" className="text-gray-600 hover:text-gray-900">
                Back to projects
              </Link>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                Go back
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Payments are confirmed via webhook (`/webhook/stripe`) and will show up in your Payment History once verified.
        </p>
      </div>
    </div>
  );
}

