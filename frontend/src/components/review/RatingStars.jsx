
import { FaStar } from "react-icons/fa6";

const sizes = {
  sm: "text-sm",
  md: "text-xl",
  lg: "text-2xl",
};

export default function RatingStars({
  value = 0,
  onChange,
  max = 5,
  readOnly = false,
  size = "md",
  label = "Rating",
  className = "",
}) {
  const rating = Math.min(max, Math.max(0, Number(value) || 0));
  const interactive = !readOnly && typeof onChange === "function";

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-1 ${className}`}
      role={interactive ? "group" : "img"}
      aria-label={`${label}: ${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const selected = starValue <= rating;

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onChange(starValue)}
              aria-label={`${starValue} ${starValue === 1 ? "star" : "stars"}`}
              aria-pressed={rating === starValue}
              className={`rounded-md p-1 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 ${
                selected ? "text-lime-300" : "text-slate-600 hover:text-lime-200"
              } ${sizes[size] || sizes.md}`}
            >
              <FaStar aria-hidden="true" />
            </button>
          );
        }

        return (
          <span
            key={starValue}
            className={`${sizes[size] || sizes.md} ${
              selected ? "text-lime-300" : "text-slate-700"
            }`}
          >
            <FaStar aria-hidden="true" />
          </span>
        );
      })}

      <span className="ml-2 text-sm font-semibold text-slate-300">
        {rating}/{max}
      </span>
    </div>
  );
}
