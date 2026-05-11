import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { 
  HiOutlinePlay, 
  HiOutlinePause, 
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineUser,
  HiPlus,
  HiOutlineBriefcase
} from "react-icons/hi2";

const API_BASE = "http://localhost:3000/workflow";

const TaskManager = ({ orders, tasks, editors, onSuccess, getAuthHeader, currentUserRole }) => {
  const [form, setForm] = useState({ orderId: "", assignedEditorId: "", title: "" });
  const [localTasks, setLocalTasks] = useState([]);

  const fmt = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => { setLocalTasks(tasks); }, [tasks]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLocalTasks(prev => prev.map(t => 
        t.timerStatus === "running" ? { ...t, elapsedSeconds: (t.elapsedSeconds || 0) + 1 } : t
      ));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const canControlTimer = currentUserRole === "editor";
  const canCreateTask = currentUserRole === "client" || currentUserRole === "admin";
  const canSeeTimer = currentUserRole === "editor";

  const updateTimer = async (taskId, action) => {
    if (!canControlTimer) {
      toast.error("Only editors can manage timers");
      return;
    }
    try {
      await axios.put(`${API_BASE}/tasks/${taskId}/timer`, { action }, getAuthHeader());
      onSuccess();
    } catch {
      toast.error("Update failed");
    }
  };

  const activeTasks = localTasks.filter(t => t.timerStatus !== "completed");

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      
      {canCreateTask && (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-800 p-1.5 rounded-md">
            <HiPlus className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Create New Task</h2>
            <p className="text-sm text-gray-500">Assign an objective to your team</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Project</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={form.orderId}
              onChange={(e) => setForm({...form, orderId: e.target.value})}
            >
              <option value="">Select Project</option>
              {orders.map(o => <option key={o._id} value={o._id}>{o.projectTitle}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Editor</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={form.assignedEditorId}
              onChange={(e) => setForm({...form, assignedEditorId: e.target.value})}
            >
              <option value="">Select Editor</option>
              {editors.map(ed => <option key={ed.userId} value={ed.userId}>{ed.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Task Title</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="e.g. Color Grading"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
            />
          </div>

          <button
            onClick={async () => {
              if (!canCreateTask) return toast.error("Unauthorized");
              if (!form.title || !form.orderId) return toast.error("Fill details");
              await axios.post(`${API_BASE}/tasks`, form, getAuthHeader());
              setForm({ orderId: "", assignedEditorId: "", title: "" });
              onSuccess();
              toast.success("Task Deployed Successfully");
            }}
            className="bg-gray-800 hover:bg-gray-900 text-white h-10 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            Deploy Task
          </button>
        </div>
      </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold px-3">Active Tasks</h3>
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {activeTasks.length} Live
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {activeTasks.map((task) => (
            <div
              key={task._id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${
                  task.timerStatus === 'running' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <HiOutlineBriefcase size={20} />
                </div>
                <div className="truncate">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {task.orderId?.projectTitle || 'No Project'}
                  </p>
                  <h4 className="text-base font-semibold text-gray-800 truncate">{task.title}</h4>
                  <div className="flex items-center gap-1 mt-0.5 text-gray-400 text-xs">
                    <HiOutlineUser size={12} />
                    <span>{task.assignedEditorId?.username || task.assignedEditorId?.name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              {canSeeTimer && (
              <div className="flex items-center gap-3 md:gap-6 md:border-l md:border-gray-200 md:pl-6">
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Elapsed</div>
                  <div className={`font-mono text-2xl font-bold tabular-nums ${
                    task.timerStatus === 'running' ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {fmt(task.elapsedSeconds || 0)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {task.timerStatus !== "running" ? (
                    <button
                      type="button"
                      onClick={() => updateTimer(task._id, "start")}
                      disabled={!canControlTimer}
                      className="p-2 rounded-md bg-green-50 text-green-700 hover:bg-green-600 hover:text-white transition-colors disabled:opacity-50"
                    >
                      <HiOutlinePlay size={18} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateTimer(task._id, "pause")}
                      disabled={!canControlTimer}
                      className="p-2 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-colors disabled:opacity-50"
                    >
                      <HiOutlinePause size={18} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => updateTimer(task._id, "complete")}
                    disabled={!canControlTimer}
                    className="px-3 py-1.5 rounded-md bg-gray-800 text-white text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <HiOutlineCheckCircle size={16} /> Done
                  </button>
                </div>
              </div>
              )}
            </div>
          ))}

          {activeTasks.length === 0 && (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
              <div className="text-gray-300 mb-2">
                <HiOutlineClock size={40} className="mx-auto" />
              </div>
              <h4 className="text-gray-500 font-medium">No active tasks</h4>
              <p className="text-gray-400 text-sm">Create a new task to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskManager;