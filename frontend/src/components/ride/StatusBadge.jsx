const statusStyles = {
  requested: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  pending: "border-amber-300/20 bg-amber-300/10 text-amber-200",

  accepted: "border-sky-300/20 bg-sky-300/10 text-sky-200",
  driver_assigned: "border-sky-300/20 bg-sky-300/10 text-sky-200",

  arrived: "border-violet-300/20 bg-violet-300/10 text-violet-200",
  in_progress: "border-sky-300/20 bg-sky-300/10 text-sky-200",

  completed: "border-lime-300/20 bg-lime-300/10 text-lime-200",
  paid: "border-lime-300/20 bg-lime-300/10 text-lime-200",
  verified: "border-lime-300/20 bg-lime-300/10 text-lime-200",
  approved: "border-lime-300/20 bg-lime-300/10 text-lime-200",

  cancelled: "border-red-400/20 bg-red-400/10 text-red-200",
  canceled: "border-red-400/20 bg-red-400/10 text-red-200",
  rejected: "border-red-400/20 bg-red-400/10 text-red-200",
  failed: "border-red-400/20 bg-red-400/10 text-red-200",
  overdue: "border-red-400/20 bg-red-400/10 text-red-200",

  refunded: "border-violet-300/20 bg-violet-300/10 text-violet-200",
};

const statusLabels = {
  driver_assigned: "Driver assigned",
  in_progress: "In progress",
};

export default function StatusBadge({
  status,
  className = "",
  size = "md",
}) {
  const normalized = String(status || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const color =
    statusStyles[normalized] ||
    "border-white/10 bg-white/5 text-slate-300";

  const sizes = {
    sm: "px-2 py-1 text-[10px]",
    md: "px-3 py-1.5 text-xs",
  };

  const label =
    statusLabels[normalized] ||
    normalized.replaceAll("_", " ");

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border font-bold capitalize",
        sizes[size] || sizes.md,
        color,
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}