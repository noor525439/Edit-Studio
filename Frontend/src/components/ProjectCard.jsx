import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";
import ProgressBar from "./ProgressBar";
import { statusBadgeClass, statusLabel } from "@/lib/roles";

const ProjectCard = ({ project, detailPath, showClient = false }) => {
  const editor = project.assignedEditorId;
  const client = project.clientId;

  return (
    <Link
      to={detailPath || `#`}
      className="block bg-white border border-slate-200 rounded-2xl p-6 hover:border-green-500/40 hover:shadow-lg transition-all group"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-black text-lg text-slate-900 group-hover:text-green-700 transition-colors">
            {project.projectTitle}
          </h3>
          <p className="text-sm text-slate-500 mt-1">{project.videoType} · {project.videoDuration}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusBadgeClass(project.status)}`}>
          {statusLabel(project.status)}
        </span>
      </div>

      <ProgressBar percent={project.progressPercent} size="sm" />

      <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} />
          {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}
        </span>
        {showClient && client && (
          <span className="flex items-center gap-1.5">
            <User size={14} />
            {client.username || client}
          </span>
        )}
        {!showClient && editor && (
          <span className="flex items-center gap-1.5">
            <User size={14} />
            {editor.username || "Assigned"}
          </span>
        )}
        {project.autoPriceEstimate > 0 && (
          <span className="font-bold text-green-600">${project.autoPriceEstimate}</span>
        )}
      </div>
    </Link>
  );
};

export default ProjectCard;
