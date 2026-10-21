
import { useEffect } from "react";
import {
  FaCheckCircle,
  FaCircleInfo,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";

const styles = {
  success: {
    icon: FaCheckCircle,
    color: "border-lime-300/20 bg-[#101d1c] text-lime-200",
  },
  error: {
    icon: FaTriangleExclamation,
    color: "border-red-400/20 bg-[#241419] text-red-200",
  },
  warning: {
    icon: FaTriangleExclamation,
    color: "border-amber-300/20 bg-[#241f13] text-amber-200",
  },
  info: {
    icon: FaCircleInfo,
    color: "border-sky-300/20 bg-[#101b2a] text-sky-200",
  },
};

export default function Toast({
  message,
  type = "info",
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (!message || !duration || duration < 0) return undefined;

    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const config = styles[type] || styles.info;
  const Icon = config.icon;

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl ${config.color}`}
    >
      <Icon className="mt-0.5 shrink-0 text-lg" aria-hidden="true" />

      <p className="min-w-0 flex-1 text-sm leading-6">{message}</p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="shrink-0 rounded-lg p-1 opacity-75 hover:bg-white/10 hover:opacity-100"
        >
          <FaXmark />
        </button>
      )}
    </div>
  );
}
