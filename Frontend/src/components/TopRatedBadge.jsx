import { Award } from "lucide-react";

const TopRatedBadge = ({ show, className = "" }) => {
  if (!show) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 text-[9px] font-black uppercase tracking-wider shadow-sm ${className}`}
    >
      <Award size={12} strokeWidth={2.5} />
      Top Rated Editor
    </span>
  );
};

export default TopRatedBadge;
