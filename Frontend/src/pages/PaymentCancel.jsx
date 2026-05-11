import React from "react";
import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <XCircle className="w-6 h-6 text-red-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mt-4">Payment cancelled</h1>
        <p className="text-sm text-gray-500 mt-2">
          No charges were made. You can try again whenever you’re ready.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <Link
            to="/checkout"
            className="flex-1 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black transition-colors"
          >
            Try again
          </Link>
          <Link
            to="/project-workspace"
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to workspace
          </Link>
        </div>
      </div>
    </div>
  );
}

