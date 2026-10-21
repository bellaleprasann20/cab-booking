
import { FaSpinner } from "react-icons/fa6";

const variants = {
  primary:
    "bg-lime-300 text-slate-950 hover:bg-lime-200 focus-visible:ring-lime-300",
  secondary:
    "bg-white/10 text-white hover:bg-white/15 focus-visible:ring-white/30",
  outline:
    "border border-white/15 bg-transparent text-slate-200 hover:border-lime-300/50 hover:text-lime-300 focus-visible:ring-lime-300",
  danger:
    "bg-red-500/15 text-red-300 hover:bg-red-500/25 focus-visible:ring-red-400",
};

const sizes = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-3 text-sm",
  lg: "px-6 py-3.5 text-sm",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl font-bold",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080d18]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      ].join(" ")}
      {...props}
    >
      {loading && <FaSpinner className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
