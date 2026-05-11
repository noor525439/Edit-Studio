import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Star, Send, AlertCircle, MessageSquare } from "lucide-react";

const API_BASE = "http://localhost:3000/workflow";

const initialForm = { orderId: "", editorId: "", rating: 5, feedback: "" };

const StarDisplay = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={14}
        className={s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}
      />
    ))}
  </div>
);


const ReviewCard = ({ review, role }) => {
  const client = review.clientId;
  const editor = review.editorId;
  const order = review.orderId;
  const date = new Date(review.createdAt).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {String(client?.username || "C").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800">
              {client?.username || "Client"}
            </p>
            {role === "admin" && (
              <p className="text-xs text-gray-400">
                → <span className="text-indigo-600 font-medium">{editor?.username || "Editor"}</span>
              </p>
            )}
            {order?.projectTitle && (
              <p className="text-xs text-gray-400 truncate">
                {order.projectTitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StarDisplay rating={review.rating} />
          <span className="text-[11px] text-gray-400">{date}</span>
        </div>
      </div>

      {review.feedback && (
        <p className="mt-3 text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg px-3 py-2">
          "{review.feedback}"
        </p>
      )}
    </div>
  );
};

const ReviewsList = ({ getAuthHeader, role }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_BASE}/reviews`, getAuthHeader());
        setReviews(res.data.data || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-14 text-gray-400">
        <MessageSquare size={36} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm font-medium">No reviews yet</p>
        {role === "editor" && (
          <p className="text-xs mt-1">Complete orders to receive client feedback</p>
        )}
      </div>
    );
  }

  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
        <div className="text-3xl font-bold text-amber-500">{avg}</div>
        <div>
          <StarDisplay rating={Math.round(avg)} />
          <p className="text-xs text-gray-500 mt-0.5">
            {reviews.length} review{reviews.length !== 1 && "s"}
          </p>
        </div>
      </div>
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} role={role} />
      ))}
    </div>
  );
};

const ReviewsPanel = ({ orders, editors, getAuthHeader, currentUserRole = "client" }) => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.orderId || !form.editorId) {
      toast.error("Please select both order and editor");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/reviews`, form, getAuthHeader());
      toast.success("Review submitted successfully");
      setForm(initialForm);
      setHoveredStar(0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (currentUserRole === "editor") {
    return (
      <div>
        <div className="mb-5">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Star size={18} className="text-amber-500" />
            My Reviews
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Feedback from clients on your work</p>
        </div>
        <ReviewsList getAuthHeader={getAuthHeader} role="editor" />
      </div>
    );
  }

  if (currentUserRole === "admin") {
    return (
      <div>
        <div className="mb-5">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Star size={18} className="text-amber-500" />
            All Reviews
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Platform-wide client feedback</p>
        </div>
        <ReviewsList getAuthHeader={getAuthHeader} role="admin" />
      </div>
    );
  }

  const hasOrders = orders && orders.length > 0;
  const hasEditors = editors && editors.length > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
        <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <Star size={18} className="text-amber-500" />
          Submit a Review
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Rate your experience with the editor</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Order</label>
            <select
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition disabled:bg-slate-50 disabled:text-slate-400"
              value={form.orderId}
              onChange={(e) => setField("orderId", e.target.value)}
              required
              disabled={!hasOrders}
            >
              <option value="">{hasOrders ? "Select an order" : "No orders available"}</option>
              {orders.map((order) => (
                <option key={order._id} value={order._id}>
                  {order.projectTitle || order.title || `Order #${order._id?.slice(-6)}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Editor</label>
            <select
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition disabled:bg-slate-50 disabled:text-slate-400"
              value={form.editorId}
              onChange={(e) => setField("editorId", e.target.value)}
              required
              disabled={!hasEditors}
            >
              <option value="">{hasEditors ? "Select an editor" : "No editors available"}</option>
              {editors.map((editor) => (
                <option key={editor.userId} value={editor.userId}>
                  {editor.name || editor.username || "Unnamed Editor"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setField("rating", star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={`${
                    star <= (hoveredStar || form.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300 fill-transparent"
                  } transition-colors duration-100`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm font-medium text-slate-600">{form.rating} / 5</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Feedback (optional)</label>
          <textarea
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 resize-y min-h-[90px] transition"
            placeholder="Share your experience with the editor..."
            value={form.feedback}
            onChange={(e) => setField("feedback", e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !hasOrders || !hasEditors}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm"
        >
          {submitting ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
          ) : (
            <><Send size={16} />Submit Review</>
          )}
        </button>

        {(!hasOrders || !hasEditors) && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg flex items-center gap-2">
            <AlertCircle size={14} />
            <span>
              {!hasOrders && "No orders found. "}
              {!hasEditors && "No editors available."}
            </span>
          </div>
        )}
      </form>
    </div>
  );
};

export default ReviewsPanel;