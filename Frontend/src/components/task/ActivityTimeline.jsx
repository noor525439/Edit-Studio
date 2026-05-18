import { Clock, User } from "lucide-react";

const ACTION_LABELS = {
  project_created: "Project created",
  project_published: "Project published",
  application_submitted: "Editor applied",
  editor_hired: "Editor hired",
  progress_updated: "Progress updated",
  submission_uploaded: "Delivery submitted",
  revision_requested: "Revision requested",
  delivery_confirmed: "Delivery confirmed",
  project_completed: "Project completed",
  review_submitted: "Review submitted",
  comment_added: "Comment added",
};

const ActivityTimeline = ({ activity = [] }) => {
  if (!activity.length) {
    return <p className="text-sm text-slate-400 italic py-4">No activity yet.</p>;
  }

  return (
    <ol className="relative border-l-2 border-slate-100 ml-3 space-y-6 py-2">
      {activity.map((item) => (
        <li key={item._id} className="ml-6 relative">
          <span className="absolute -left-[1.65rem] top-1.5 h-3 w-3 rounded-full bg-green-500 ring-4 ring-green-50" />
          <p className="text-sm font-bold text-slate-800">
            {ACTION_LABELS[item.action] || item.action}
          </p>
          {item.details && (
            <p className="text-xs text-slate-500 mt-0.5">{item.details}</p>
          )}
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 uppercase tracking-wider font-bold">
            <User size={10} />
            {item.actorName}
            <span className="text-slate-300">·</span>
            <Clock size={10} />
            {new Date(item.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ol>
  );
};

export default ActivityTimeline;
