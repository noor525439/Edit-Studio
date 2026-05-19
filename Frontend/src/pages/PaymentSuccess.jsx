import React, { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = useMemo(() => params.get("session_id"), [params]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mt-4">Payment successful</h1>
        <p className="text-sm text-gray-500 mt-2">
          Thanks! Your payment is being verified. Once the webhook confirms it, it will appear in your payment history.
        </p>

        {sessionId && (
          <div className="mt-4 text-left bg-gray-50 border border-gray-100 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Checkout session</p>
            <p className="text-sm font-mono text-gray-800 break-all mt-1">{sessionId}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <Link
            to="/client/projects"
            className="flex-1 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black transition-colors"
          >
            View projects
          </Link>
          <Link
            to="/checkout"
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            New payment
          </Link>
        </div>
      </div>
    </div>
  );
}

