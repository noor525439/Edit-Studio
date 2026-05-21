import { Link } from "react-router-dom";
import { Calendar, User, Clock, Paperclip, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TaskAttachments from "@/components/task/TaskAttachments";

const timerLabel = (status) => {
  const map = {
    not_started: "Not started",
    running: "In progress",
    paused: "Paused",
    completed: "Completed",
  };
  return map[status] || status;
};

const StandaloneTaskDetail = ({ task, order, attachments = [], backLink, backLabel, projectLink, projectLinkLabel }) => {
  if (!task) {
    return <p className="p-10 text-slate-500">Task not found.</p>;
  }

  const assignee = task.assignedEditorId;
  const assigneeName = assignee?.username || "Unassigned";
  const dueDate = order?.deadline ? new Date(order.deadline).toLocaleDateString() : "—";
  const isOverdue = task.isOverdue || task.isOverdueLive;

  return (
    <div className="max-w-5xl mx-auto">
      <Link to={backLink} className="text-sm font-bold text-green-600 hover:underline mb-6 inline-block">
        {backLabel}
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Task</p>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{task.title}</h1>
              {projectLink && (
                <Link to={projectLink} className="text-sm text-green-600 font-bold hover:underline mt-2 inline-block">
                  {projectLinkLabel || order?.projectTitle || "View project"}
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {isOverdue && task.timerStatus !== "completed" && (
                <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                  <AlertTriangle size={12} className="mr-1" /> Overdue
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] uppercase font-bold">
                {timerLabel(task.timerStatus)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow icon={User} label="Assigned to" value={assigneeName} avatar={assignee?.avatar} />
          <DetailRow icon={Calendar} label="Due date" value={dueDate} />
          <DetailRow icon={Clock} label="Estimated time" value={`${task.estimatedDuration || 60} minutes`} />
          {task.timerStatus === "completed" && (
            <DetailRow
              icon={Clock}
              label="Actual time"
              value={`${Math.ceil((task.elapsedSeconds || 0) / 60)} minutes`}
            />
          )}
        </div>

        {task.details && (
          <div className="px-8 pb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Description</p>
            <p className="text-slate-600 leading-relaxed">{task.details}</p>
          </div>
        )}

        {attachments?.length > 0 && (
          <div className="px-8 pb-8 border-t border-slate-100 pt-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1">
              <Paperclip size={12} /> Project attachments
            </p>
            <TaskAttachments attachments={attachments} />
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value, avatar }) => (
  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
    {avatar ? (
      <Avatar className="h-10 w-10">
        <AvatarImage src={avatar} />
        <AvatarFallback>{String(value).slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
    ) : (
      <div className="p-2 bg-white rounded-lg border border-slate-100">
        <Icon size={18} className="text-green-600" />
      </div>
    )}
    <div>
      <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
      <p className="font-bold text-slate-800 text-sm">{value}</p>
    </div>
  </div>
);

export default StandaloneTaskDetail;
