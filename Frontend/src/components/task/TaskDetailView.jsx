import { Link } from "react-router-dom";
import {
  Calendar,
  DollarSign,
  Send,
  RotateCcw,
  CheckCircle,
  Star,
  User,
  CreditCard,
  ShieldCheck,
  Eye,
} from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import StarRating from "@/components/StarRating";
import ActivityTimeline from "@/components/task/ActivityTimeline";
import TaskAttachments from "@/components/task/TaskAttachments";
import TaskComments from "@/components/task/TaskComments";
import ClientInfoCard from "@/components/task/ClientInfoCard";
import TaskTimerPanel from "@/components/task/TaskTimerPanel";
import TaskListSection from "@/components/task/TaskListSection";
import { statusBadgeClass, statusLabel } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TaskDetailView = ({
  mode,
  data,
  loading,
  backLink,
  backLabel,
  applyMsg,
  setApplyMsg,
  onApply,
  revisionReason,
  setRevisionReason,
  onRequestRevision,
  onConfirmDelivery,
  onPublish,
  rating,
  setRating,
  reviewText,
  setReviewText,
  onSubmitReview,
  onCommentPosted,
  clientProfileLink,
  onAcceptApplication,
  onRejectApplication,
  onTaskRefresh,
  onCreateTask,
}) => {
  if (loading) return <p className="p-10 text-slate-400">Loading project…</p>;
  if (!data?.order)
    return <p className="p-10 text-slate-600">Project not found.</p>;

  const order = data?.order || {};
  const activity = data?.activity || [];
  const comments = data?.comments || [];
  const attachments = data?.attachments || [];
  const isAdmin = mode === "admin";

  const canApply =
    mode === "editor" &&
    order.status === "published" &&
    !order.assignedEditorId;
  const isAssignedEditor = mode === "editor" && order.assignedEditorId;

  const allApps = data.applications || [];
  const pendingApps = allApps.filter((a) => a.status === "pending");
  const showApplications =
    (mode === "client" && !order.assignedEditorId && pendingApps.length > 0) ||
    (isAdmin && allApps.length > 0);

  const applicationsToShow = isAdmin ? allApps : pendingApps;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 lg:py-10">
      <div className="max-w-6xl mx-auto">
        <Link
          to={backLink}
          className="text-sm font-bold text-green-600 hover:underline mb-6 inline-block"
        >
          {backLabel}
        </Link>
        <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-6">
          <div className="flex flex-wrap justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                {order.projectTitle}
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                {order.videoType} · {order.editingStyle}
              </p>
              {isAdmin && (
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  ID: {order._id}
                </p>
              )}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase h-fit ${statusBadgeClass(order.status)}`}
            >
              {statusLabel(order.status)}
            </span>
          </div>

          <ProgressBar percent={order.progressPercent} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-sm">
              <Calendar className="text-green-600" size={18} />
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Deadline
                </p>
                <p className="font-bold text-slate-800">
                  {new Date(order.deadline).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-sm">
              <DollarSign className="text-green-600" size={18} />
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Budget
                </p>
                <p className="font-bold text-slate-800">
                  ${order.autoPriceEstimate || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-sm">
              <p className="text-[10px] font-black uppercase text-slate-400 w-full">
                Stage
              </p>
              <p className="font-bold text-slate-800 text-xs">
                {order.progressStage}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Description
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {order.instructions}
            </p>
          </div>

          {mode === "editor" && order.clientId && clientProfileLink && (
            <p className="mt-4 text-sm">
              Client:{" "}
              <Link
                to={clientProfileLink}
                className="font-bold text-green-600 hover:underline"
              >
                {order.clientId.username}
              </Link>
            </p>
          )}

          {mode === "client" && order.assignedEditorId && (
            <p className="mt-4 text-sm text-slate-600">
              Editor: <strong>{order.assignedEditorId.username}</strong>
              {order.status === "project_started" && (
                <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full">
                  Project Started
                </span>
              )}
            </p>
          )}

          {isAdmin && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {order.clientId && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={order.clientId.avatar} />
                    <AvatarFallback>
                      {(order.clientId.username || "C")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Client
                    </p>
                    <Link
                      to={`/admin/users/${order.clientId._id}`}
                      className="font-bold text-slate-800 hover:text-green-600 flex items-center gap-1"
                    >
                      {order.clientId.username}
                      <Eye size={12} className="text-slate-400" />
                    </Link>
                    <p className="text-xs text-slate-500">
                      {order.clientId.email}
                    </p>
                  </div>
                </div>
              )}
              {order.assignedEditorId ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={order.assignedEditorId.avatar} />
                    <AvatarFallback>
                      {(order.assignedEditorId.username || "E")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Assigned Editor
                    </p>
                    <Link
                      to={`/admin/users/${order.assignedEditorId._id}`}
                      className="font-bold text-slate-800 hover:text-green-600 flex items-center gap-1"
                    >
                      {order.assignedEditorId.username}
                      <Eye size={12} className="text-slate-400" />
                    </Link>
                    <p className="text-xs text-slate-500">
                      {order.assignedEditorId.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
                  No editor assigned yet
                </div>
              )}
            </div>
          )}

          {order.status === "draft" && mode === "client" && onPublish && (
            <Button
              onClick={onPublish}
              className="mt-6 bg-green-600 hover:bg-green-700"
            >
              Publish project
            </Button>
          )}

          {canApply && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h2 className="font-bold text-slate-800 mb-3">
                Apply for this task
              </h2>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-3 text-sm mb-3"
                rows={3}
                value={applyMsg}
                onChange={(e) => setApplyMsg(e.target.value)}
                placeholder="Why you're a great fit…"
              />
              <Button
                onClick={onApply}
                className="gap-2 bg-slate-900 hover:bg-green-600"
              >
                <Send size={16} /> Submit application
              </Button>
            </div>
          )}
        </div>
        {showApplications && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
            <h2 className="font-black text-slate-900 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
              {isAdmin && <ShieldCheck size={12} className="text-amber-500" />}
              Editor applications ({applicationsToShow.length})
            </h2>
            <div className="space-y-4">
              {applicationsToShow.map((app) => {
                const ed = app.editorId;
                const edId = ed?._id || ed;
                const statusColors = {
                  pending: "bg-yellow-100 text-yellow-700",
                  accepted: "bg-green-100 text-green-700",
                  rejected: "bg-red-100 text-red-700",
                };
                return (
                  <div
                    key={app._id}
                    className="flex flex-wrap items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={ed?.avatar} />
                      <AvatarFallback>
                        {(ed?.username || "E").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-[200px]">
                      <Link
                        to={
                          isAdmin
                            ? `/admin/users/${edId}`
                            : `/editor/profile/${edId}`
                        }
                        className="font-bold text-slate-900 hover:text-green-600 flex items-center gap-1"
                      >
                        <User size={14} /> {ed?.username || "Editor"}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {ed?.email}
                      </p>
                      {isAdmin && (
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          ID: {edId}
                        </p>
                      )}
                      {app.message && (
                        <p className="text-sm text-slate-600 mt-2 italic">
                          &quot;{app.message}&quot;
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {isAdmin && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusColors[app.status] || "bg-slate-100 text-slate-500"}`}
                        >
                          {app.status}
                        </span>
                      )}
                      {(mode === "client" || isAdmin) &&
                        app.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => onAcceptApplication?.(app._id)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRejectApplication?.(app._id)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {isAssignedEditor && order.clientId && (
          <ClientInfoCard
            client={order.clientId}
            order={order}
            attachments={attachments}
          />
        )}

        {isAdmin && order.clientId && (
          <ClientInfoCard
            client={order.clientId}
            order={order}
            attachments={attachments}
          />
        )}
        {data.tasks?.length > 0 && (
          <TaskListSection
            tasks={data.tasks}
            projectId={order._id}
            mode={mode}
          />
        )}

        {(isAssignedEditor || isAdmin) && (
          <TaskTimerPanel
            tasks={data.tasks || []}
            orderId={order._id}
            canControl={isAssignedEditor}
            canCreate={isAssignedEditor || isAdmin}
            onRefresh={onTaskRefresh}
            onCreateTask={onCreateTask}
          />
        )}

        {(mode === "client" || isAdmin) && order.assignedEditorId && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
            <h2 className="font-black text-slate-900 mb-3 uppercase text-[10px] tracking-widest flex items-center gap-2">
              <CreditCard size={14} className="text-green-600" /> Payment
              {isAdmin && <span className="ml-1 text-amber-500">(Admin)</span>}
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Review amount, due date, and payment status for this project.
            </p>
            <Link
              to={
                isAdmin
                  ? `/admin/orders/${order._id}/payment`
                  : `/client/projects/${order._id}/payment`
              }
            >
              <Button
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                View payment details
              </Button>
            </Link>
          </section>
        )}

        <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
          <h2 className="font-black text-slate-900 mb-4 uppercase text-[10px] tracking-widest">
            Attachments
          </h2>
          <TaskAttachments attachments={attachments} />
        </section>
        {data.submissions?.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-slate-800 mb-4">Editor deliveries</h2>
            {data.submissions.map((s) => (
              <a
                key={s._id}
                href={s.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-2 hover:bg-green-50 text-sm"
              >
                <span className="font-medium text-slate-800">
                  v{s.version}: {s.fileName || "Delivery"}
                </span>
                <span className="text-green-600 font-bold text-xs uppercase">
                  Download
                </span>
              </a>
            ))}
          </section>
        )}

        <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
          <h2 className="font-black text-slate-900 mb-4 uppercase text-[10px] tracking-widest">
            Activity history
          </h2>
          <ActivityTimeline activity={activity} />
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
          <h2 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">
            Messages
          </h2>
          <TaskComments
            orderId={order._id}
            comments={comments}
            onPosted={onCommentPosted}
          />
        </section>

        {(mode === "client" || isAdmin) &&
          ["delivered", "revision_requested"].includes(order.status) && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 space-y-4">
              <h2 className="font-bold text-slate-800">Review & delivery</h2>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400">
                  Revision reason
                </label>
                <textarea
                  className="w-full mt-1 border border-slate-200 rounded-xl p-3 text-sm"
                  rows={3}
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                />
                <Button
                  onClick={onRequestRevision}
                  variant="outline"
                  className="mt-2 gap-2"
                >
                  <RotateCcw size={16} /> Request revision
                </Button>
              </div>
              <Button
                onClick={onConfirmDelivery}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle size={16} /> Confirm delivery
              </Button>
            </section>
          )}

        {mode === "client" &&
          order.status === "completed" &&
          !order.clientRating && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Star className="text-amber-500" size={20} /> Rate your editor
              </h2>
              <StarRating value={rating} onChange={setRating} size={28} />
              <textarea
                className="w-full border border-slate-200 rounded-xl p-3 text-sm mt-4 mb-3"
                rows={4}
                placeholder="Write your review (optional)"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <Button
                onClick={onSubmitReview}
                className="bg-slate-900 hover:bg-green-600"
              >
                Submit review
              </Button>
            </section>
          )}

        {data.editorReview && (
          <section className="bg-green-50 border border-green-100 rounded-2xl p-6 mb-6">
            <p className="text-[10px] font-black uppercase text-green-700 mb-2">
              {isAdmin ? "Client review (submitted)" : "Your review"}
            </p>
            <StarRating value={data.editorReview.rating} readOnly size={20} />
            {data.editorReview.feedback && (
              <p className="text-sm text-slate-600 mt-2 italic">
                "{data.editorReview.feedback}"
              </p>
            )}
            {isAdmin && (
              <p className="text-[10px] font-mono text-slate-400 mt-2">
                Review ID: {data.editorReview._id} · Rating:{" "}
                {data.editorReview.rating}/5
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default TaskDetailView;
