import { Mail, Phone, Calendar, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=client";

const ClientInfoCard = ({ client, order, attachments = [] }) => {
  if (!client || !order) return null;

  const name = client.username || "Client";
  const avatarUrl = client.avatar || DEFAULT_AVATAR;
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
      <h2 className="font-black text-slate-900 mb-4 uppercase text-[10px] tracking-widest">Client Info</h2>

      <div className="flex items-start gap-4 mb-5">
        <Avatar className="h-14 w-14 border-2 border-green-100">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-black text-lg text-slate-900">{name}</p>
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
            <Mail size={14} className="text-green-600" />
            {client.email || "—"}
          </p>
          {client.phone ? (
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
              <Phone size={14} className="text-green-600" />
              {client.phone}
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Phone size={12} /> Phone not provided
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-slate-50 rounded-xl">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Project</p>
          <p className="font-bold text-slate-800 text-sm">{order.projectTitle}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2">
          <Calendar className="text-green-600 shrink-0" size={18} />
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Deadline</p>
            <p className="font-bold text-slate-800 text-sm">
              {order.deadline ? new Date(order.deadline).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
      </div>

      {order.instructions && (
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 flex items-center gap-1">
            <FileText size={12} /> Description
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">{order.instructions}</p>
        </div>
      )}

      {attachments?.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Client files</p>
          <ul className="space-y-2">
            {attachments.map((file, i) => (
              <li key={file.url || i}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-green-600 hover:underline"
                >
                  {file.label || file.name || `Download file ${i + 1}`}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ClientInfoCard;
