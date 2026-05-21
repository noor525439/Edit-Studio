import { Link } from "react-router-dom";
import { ListTodo, ChevronRight, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const statusLabel = (task) => {
  if (task.isOverdue || task.isOverdueLive) return "Overdue";
  const map = {
    not_started: "Not started",
    running: "In progress",
    paused: "Paused",
    completed: "Done",
  };
  return map[task.timerStatus] || task.timerStatus;
};

const TaskListSection = ({ tasks = [], projectId, mode }) => {
  if (!tasks.length) return null;

  const base =
    mode === "client"
      ? `/client/projects/${projectId}/tasks`
      : `/editor/projects/${projectId}/tasks`;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
      <h2 className="font-bold text-slate-900 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
        <ListTodo size={14} className="text-green-600" /> Tasks
      </h2>
      <ul className="space-y-2">
        {tasks.map((task) => {
          const overdue = (task.isOverdue || task.isOverdueLive) && task.timerStatus !== "completed";
          return (
            <li key={task._id}>
              <Link
                to={`${base}/${task._id}`}
                className="flex items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-green-300 hover:bg-green-50/50 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{task.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {task.assignedEditorId?.username
                      ? `Assigned: ${task.assignedEditorId.username}`
                      : "Unassigned"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {overdue && (
                    <Badge variant="destructive" className="text-[9px] uppercase">
                      <AlertTriangle size={10} className="mr-0.5" /> Overdue
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[9px] uppercase">
                    {statusLabel(task)}
                  </Badge>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-green-600" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default TaskListSection;
