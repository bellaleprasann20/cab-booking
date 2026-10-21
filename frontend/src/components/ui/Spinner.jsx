
import { FaSpinner } from "react-icons/fa6";

const sizes = {
  sm: "h-4 w-4",
  md: "h-7 w-7",
  lg: "h-10 w-10",
};

export default function Spinner({
  size = "md",
  label = "Loading...",
  fullScreen = false,
  className = "",
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "flex items-center justify-center gap-3 text-slate-300",
        fullScreen ? "min-h-[60vh] flex-col" : "",
        className,
      ].join(" ")}
    >
      <FaSpinner
        aria-hidden="true"
        className={`animate-spin text-lime-300 ${sizes[size] || sizes.md}`}
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
