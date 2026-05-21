const ProgressBar = ({ percent = 0, showLabel = true, size = "md" }) => {
  const value = Math.min(100, Math.max(0, Number(percent) || 0));
  const height = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
          <span>Progress</span>
          <span className="text-green-600">{value}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-slate-100 rounded-full overflow-hidden`}>
        <div
          className={`${height} rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
