import { useEffect, useState } from "react";
import { Play, Pause, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { apiPut, WORKFLOW_API } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmt = (totalSecs) => {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return `${h > 0 ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const fmtMinutes = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const computeLive = (task) => {
  const estimatedSecs = (task.estimatedDuration || 60) * 60;
  let elapsed = task.elapsedSeconds || 0;
  if (task.timerStatus === "running" && task.startedAt) {
    elapsed += Math.floor(
      (Date.now() - new Date(task.startedAt).getTime()) / 1000,
    );
  }
  const remaining = Math.max(0, estimatedSecs - elapsed);
  const overdue =
    task.isOverdue || task.isOverdueLive || elapsed >= estimatedSecs;
  return { elapsed, remaining, overdue, estimatedSecs };
};

const TaskTimerPanel = ({
  tasks = [],
  orderId,
  canControl,
  onRefresh,
  canCreate,
  onCreateTask,
}) => {
  const [localTasks, setLocalTasks] = useState(tasks);
  const [newTask, setNewTask] = useState({ title: "", estimatedDuration: 60 });

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    const hasRunning = localTasks.some((t) => t.timerStatus === "running");
    if (!hasRunning) return;
    const id = setInterval(() => setLocalTasks((prev) => [...prev]), 1000);
    return () => clearInterval(id);
  }, [localTasks]);

  const updateTimer = async (taskId, action) => {
    try {
      await apiPut(`${WORKFLOW_API}/tasks/${taskId}/timer`, { action });
      toast.success(
        action === "complete" ? "Task completed" : `Timer ${action}ed`,
      );
      onRefresh?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Timer update failed");
    }
  };

  const handleCreate = async () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    try {
      await onCreateTask?.({
        orderId,
        title: newTask.title.trim(),
        estimatedDuration: Number(newTask.estimatedDuration) || 60,
      });
      setNewTask({ title: "", estimatedDuration: 60 });
      toast.success("Task created");
      onRefresh?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create task");
    }
  };

  if (!localTasks.length && !canCreate) {
    return (
      <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-xl">
        <p className="text-sm text-slate-400">No tasks yet for this project.</p>
      </section>
    );
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
      <h2 className="font-bold text-slate-900 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
        <Clock size={14} className="text-green-600" /> Task Panel
      </h2>

      {canCreate && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="sm:col-span-2">
            <Label className="text-xs">Task title</Label>
            <Input
              className="mt-1"
              value={newTask.title}
              onChange={(e) =>
                setNewTask((t) => ({ ...t, title: e.target.value }))
              }
              placeholder="e.g. Color grading pass 1"
            />
          </div>
          <div>
            <Label className="text-xs">Est. duration (min)</Label>
            <Input
              type="number"
              min={1}
              className="mt-1"
              value={newTask.estimatedDuration}
              onChange={(e) =>
                setNewTask((t) => ({ ...t, estimatedDuration: e.target.value }))
              }
            />
          </div>
          <Button
            onClick={handleCreate}
            className="sm:col-span-3 bg-slate-900 hover:bg-green-600"
          >
            Add task
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {localTasks.map((task) => {
          const { elapsed, remaining, overdue } = computeLive(task);
          const isDone = task.timerStatus === "completed";

          return (
            <div
              key={task._id}
              className={`p-4 rounded-xl border ${overdue && !isDone ? "border-red-200 bg-red-50/50" : "border-slate-100 bg-slate-50"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <p className="font-bold text-slate-800">{task.title}</p>
                  {task.details && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {task.details}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {overdue && !isDone && (
                    <Badge
                      variant="destructive"
                      className="text-[10px] uppercase font-bold"
                    >
                      <AlertTriangle size={10} className="mr-1" /> Overdue
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {task.timerStatus.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                  {isDone ? fmt(elapsed) : fmt(remaining)}
                  <span className="text-[10px] font-sans font-bold text-slate-400 ml-2 uppercase">
                    {isDone ? "actual" : "remaining"}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Est: {fmtMinutes(task.estimatedDuration || 60)}
                  {isDone && (
                    <span className="ml-2 text-green-700 font-medium">
                      · Actual: {fmtMinutes(Math.ceil(elapsed / 60))}
                    </span>
                  )}
                </p>
              </div>

              {canControl && !isDone && (
                <div className="flex gap-2 mt-3">
                  {task.timerStatus === "not_started" ||
                  task.timerStatus === "paused" ? (
                    <Button
                      size="sm"
                      onClick={() => updateTimer(task._id, "start")}
                      className="gap-1 bg-green-600 hover:bg-green-700"
                    >
                      <Play size={14} /> Start task
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTimer(task._id, "pause")}
                      className="gap-1"
                    >
                      <Pause size={14} /> Pause
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateTimer(task._id, "complete")}
                    className="gap-1"
                  >
                    <CheckCircle size={14} /> Complete
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TaskTimerPanel;
