import { Clock, User, ShieldCheck } from "lucide-react";

const ACTION_LABELS = {
  project_created: "Project created",
  project_published: "Project published",
  application_submitted: "Editor applied",
  editor_hired: "Editor hired",
  editor_reassigned: "Editor reassigned",
  progress_updated: "Progress updated",
  submission_uploaded: "Delivery submitted",
  revision_requested: "Revision requested",
  delivery_confirmed: "Delivery confirmed",
  project_completed: "Project completed",
  project_cancelled: "Project cancelled",
  review_submitted: "Review submitted",
  comment_added: "Comment added",
};

const ROLE_COLORS = {
  admin: "bg-amber-100 text-amber-700",
  client: "bg-blue-100 text-blue-700",
  editor: "bg-green-100 text-green-700",
  freelancer: "bg-blue-100 text-blue-700",
};

const ActivityTimeline = ({ activity = [], isAdmin = false }) => {
  if (!activity.length) {
    return (
      <p className="text-sm text-slate-400 italic py-4">No activity yet.</p>
    );
  }

  return (
    <ol className="relative border-l-2 border-slate-100 ml-3 space-y-6 py-2">
      {activity.map((item) => {
        const roleKey = String(item.actorRole || "").toLowerCase();
        const roleColor = ROLE_COLORS[roleKey] || "bg-slate-100 text-slate-600";

        return (
          <li key={item._id} className="ml-6 relative">
            <span className="absolute -left-[1.65rem] top-1.5 h-3 w-3 rounded-full bg-green-500 ring-4 ring-green-50" />
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-slate-800">
                {ACTION_LABELS[item.action] || item.action}
              </p>
              {isAdmin && item.actorRole && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${roleColor}`}
                >
                  {item.actorRole}
                </span>
              )}
            </div>

            {item.details && (
              <p className="text-xs text-slate-500 mt-0.5">{item.details}</p>
            )}
            {isAdmin && item.meta && Object.keys(item.meta).length > 0 && (
              <p className="text-[10px] font-mono text-slate-400 mt-0.5 bg-slate-50 rounded px-2 py-1 inline-block">
                {JSON.stringify(item.meta)}
              </p>
            )}

            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 uppercase tracking-wider font-bold">
              <User size={10} />
              {item.actorName}
              <span className="text-slate-300">·</span>
              <Clock size={10} />
              {new Date(item.createdAt).toLocaleString()}
              {isAdmin && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="font-mono normal-case tracking-normal text-slate-300">
                    {item._id}
                  </span>
                </>
              )}
            </p>
          </li>
        );
      })}
    </ol>
  );
};

export default ActivityTimeline;
