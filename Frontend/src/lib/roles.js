export const CLIENT_ROLES = ["client", "freelancer"];

export const isClient = (role) => CLIENT_ROLES.includes(role);

export const dashboardPath = (role) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "editor") return "/editor/dashboard";
  if (isClient(role)) return "/client/dashboard";
  return "/";
};

export const statusLabel = (status) => {
  const map = {
    draft: "Draft",
    published: "Open",
    project_started: "Project Started",
    in_progress: "In Progress",
    delivered: "Delivered",
    revision_requested: "Revision Requested",
    completed: "Completed",
  };
  return map[status] || status;
};

export const statusBadgeClass = (status) => {
  const map = {
    draft: "bg-slate-100 text-slate-600",
    published: "bg-blue-100 text-blue-700",
    project_started: "bg-emerald-100 text-emerald-700",
    in_progress: "bg-amber-100 text-amber-700",
    delivered: "bg-purple-100 text-purple-700",
    revision_requested: "bg-orange-100 text-orange-700",
    completed: "bg-green-100 text-green-700",
  };
  return map[status] || "bg-slate-100 text-slate-600";
};
