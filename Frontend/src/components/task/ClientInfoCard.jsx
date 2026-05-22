import {
  Mail,
  Phone,
  Calendar,
  FileText,
  ShieldCheck,
  DollarSign,
  Tag,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=client";

const ClientInfoCard = ({
  client,
  order,
  attachments = [],
  isAdmin = false,
}) => {
  if (!client || !order) return null;

  const name = client.username || "Client";
  const avatarUrl = client.avatar || DEFAULT_AVATAR;
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
      <h2 className="font-bold text-slate-900 mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
        Client Info
        {isAdmin && <ShieldCheck size={12} className="text-amber-500" />}
      </h2>

      <div className="flex items-start gap-4 mb-5">
        <Avatar className="h-14 w-14 border-2 border-green-100">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold text-lg text-slate-900">{name}</p>
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
          {isAdmin && (
            <div className="mt-2 space-y-0.5">
              <p className="text-[10px] font-mono text-slate-400">
                ID: {client._id}
              </p>
              <p className="text-[10px] font-mono text-slate-400">
                Role:{" "}
                <span className="text-amber-600 font-bold uppercase">
                  {client.role || "—"}
                </span>
              </p>
              {client.isVerified !== undefined && (
                <p className="text-[10px] font-mono text-slate-400">
                  Verified:{" "}
                  <span
                    className={
                      client.isVerified ? "text-green-600" : "text-red-500"
                    }
                  >
                    {client.isVerified ? "Yes" : "No"}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-slate-50 rounded-xl">
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
            Project
          </p>
          <p className="font-bold text-slate-800 text-sm">
            {order.projectTitle}
          </p>
          {isAdmin && (
            <p className="text-[10px] font-mono text-slate-400 mt-1">
              ID: {order._id}
            </p>
          )}
        </div>
        <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2">
          <Calendar className="text-green-600 shrink-0" size={18} />
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">
              Deadline
            </p>
            <p className="font-bold text-slate-800 text-sm">
              {order.deadline
                ? new Date(order.deadline).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>
        {isAdmin && (
          <>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2">
              <DollarSign className="text-green-600 shrink-0" size={18} />
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Budget
                </p>
                <p className="font-bold text-slate-800 text-sm">
                  PKR {Number(order.autoPriceEstimate || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2">
              <Tag className="text-green-600 shrink-0" size={18} />
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Hire type
                </p>
                <p className="font-bold text-slate-800 text-sm capitalize">
                  {order.hireType?.replace("_", " ") || "—"}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {order.instructions && (
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
            <FileText size={12} /> Description
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            {order.instructions}
          </p>
        </div>
      )}

      {isAdmin && order.rawFootageLink && (
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
            Raw footage link
          </p>
          <a
            href={order.rawFootageLink}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-green-600 hover:underline break-all"
          >
            {order.rawFootageLink}
          </a>
        </div>
      )}

      {attachments?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
            Client files
          </p>
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
