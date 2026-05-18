import { Star } from "lucide-react";

const StarRating = ({ value = 0, onChange, size = 18, readonly = false }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(n)}
          className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
          aria-label={`${n} stars`}
        >
          <Star
            size={size}
            className={n <= value ? "text-amber-400 fill-amber-400" : "text-slate-200"}
          />
        </button>
      ))}
      {readonly && value > 0 && (
        <span className="ml-2 text-sm font-bold text-slate-700">{Number(value).toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
