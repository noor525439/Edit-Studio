import { Download, Film, Music, FileText } from "lucide-react";

const iconFor = (type) => {
  if (type === "video") return Film;
  if (type === "audio") return Music;
  return FileText;
};

const TaskAttachments = ({ attachments = [] }) => {
  if (!attachments.length) {
    return <p className="text-sm text-slate-400">No attachments provided.</p>;
  }

  return (
    <ul className="space-y-2">
      {attachments.map((att, i) => {
        const Icon = iconFor(att.type);
        return (
          <li
            key={`${att.url}-${i}`}
            className="flex items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-green-300 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-white rounded-lg text-green-600 border border-slate-100">
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{att.label}</p>
                <p className="text-xs text-slate-400 truncate">{att.url}</p>
              </div>
            </div>
            <a
              href={att.url}
              target="_blank"
              rel="noreferrer"
              download
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-green-600 transition-colors"
            >
              <Download size={14} />
              Download
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default TaskAttachments;
