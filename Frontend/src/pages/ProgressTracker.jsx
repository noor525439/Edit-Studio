import React from "react";
import axios from "axios";
import { toast } from "sonner";
import { 
  HiOutlineFolderOpen, 
  HiOutlineUser, 
  HiOutlineCalendar, 
  HiChevronDown,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineLightningBolt,
  HiOutlineTrendingUp
} from "react-icons/hi";
import { MdOutlineTrackChanges, MdOutlineArrowForward } from "react-icons/md";
import { FiTarget, FiAlertCircle } from "react-icons/fi";

const API_BASE = "http://localhost:3000/workflow";

const progressStages = [
  "Video Pending",
  "Editing Started",
  "Raw Footage & Voiceover Arranging",
  "Basic Cuts Done",
  "Transitions Added",
  "Color Grading",
  "Text & Captions",
  "Sound Design",
  "First Draft Ready",
  "Waiting for Client Review",
  "Revision 1 Requested",
  "Revision 1 Completed",
  "Revision 2 Requested",
  "Revision 2 Completed",
  "Final Export Ready",
  "Final Video Delivered",
  "Completed",
];

const ProgressTracker = ({ orders, onUpdate, getAuthHeader, currentUserRole = "client" }) => {
  const canChangeStage = currentUserRole === "editor" || currentUserRole === "admin";

  const handleChange = async (orderId, progressStage) => {
    if (!canChangeStage) return;
    try {
      await axios.put(
        `${API_BASE}/orders/${orderId}/progress`,
        { progressStage },
        getAuthHeader()
      );
      toast.success("Progress updated successfully");
      onUpdate();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Progress update failed");
    }
  };

  const getCompletionPercentage = (currentStage) => {
    const index = progressStages.indexOf(currentStage);
    return Math.round((index / (progressStages.length - 1)) * 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage < 30) return "bg-red-500";
    if (percentage < 75) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStageStatus = (currentStage) => {
    if (currentStage === "Completed") 
        return { label: "Completed", bg: "bg-gray-100", text: "text-gray-700", icon: HiOutlineCheckCircle };
    if (currentStage.includes("Waiting") || currentStage.includes("Review"))
      return { label: "Review", bg: "bg-gray-100", text: "text-gray-700", icon: HiOutlineClock };
    if (currentStage.includes("Revision"))
      return { label: "Revision", bg: "bg-gray-100", text: "text-gray-700", icon: HiOutlineLightningBolt };
    return { label: "In Progress", bg: "bg-gray-100", text: "text-gray-700", icon: FiTarget };
  };

  const getNextStage = (currentStage) => {
    const index = progressStages.indexOf(currentStage);
    return index < progressStages.length - 1 ? progressStages[index + 1] : null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <MdOutlineTrackChanges className="text-gray-600" size={20} />
            Project Workflow
          </h2>
          <p className="text-xs text-gray-500">Manage editing milestones</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md text-xs font-medium text-gray-700">
          <HiOutlineTrendingUp size={14} />
          <span>{orders.length} Active</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <HiOutlineFolderOpen size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-medium text-gray-600">No projects found</h3>
          <p className="text-sm text-gray-400 mt-1">Create an order to start tracking</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const percentage = getCompletionPercentage(order.progressStage);
            const status = getStageStatus(order.progressStage);
            const nextStage = getNextStage(order.progressStage);
            const StatusIcon = status.icon;

            return (
              <div
                key={order._id}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <HiOutlineFolderOpen className="text-gray-500" size={18} />
                      <h3 className="text-base font-semibold text-gray-800">
                        {order.projectTitle || "Untitled"}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
                        <HiOutlineUser size={12} />
                        {order.assignedEditorId?.username || order.assignedEditorId?.name || "Unassigned"}
                      </span>
                      {order.deadline && (
                        <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
                          <HiOutlineCalendar size={12} />
                          {new Date(order.deadline).toLocaleDateString()}
                        </span>
                      )}
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded ${status.bg} ${status.text}`}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {canChangeStage ? (
                    <div className="relative w-full lg:w-64">
                      <select
                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 cursor-pointer"
                        value={order.progressStage}
                        onChange={(e) => handleChange(order._id, e.target.value)}
                      >
                        {progressStages.map((stage) => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                      <HiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  ) : (
                    <div className="w-full lg:w-64 text-right">
                      <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
                        Read-only progress
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-700 truncate max-w-[70%]">{order.progressStage}</span>
                    <span className="text-gray-500">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(percentage)} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                  {nextStage && percentage < 100 ? (
                    <div className="flex items-center gap-1 text-gray-500">
                      <span>Up next:</span>
                      <span className="font-medium text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded">
                        {nextStage}
                      </span>
                      <MdOutlineArrowForward size={12} className="text-gray-400" />
                    </div>
                  ) : percentage === 100 ? (
                    <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <HiOutlineCheckCircle size={12} /> Ready for delivery
                    </div>
                  ) : (
                    <div />
                  )}
                  <div className="text-gray-400">
                    ID: {order._id.slice(-6)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;