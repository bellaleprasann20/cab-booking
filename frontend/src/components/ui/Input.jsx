
import { useId } from "react";

export default function Input({
  label,
  hint,
  error,
  id,
  className = "",
  wrapperClassName = "",
  type = "text",
  required = false,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const describedBy = [
    hint ? hintId : null,
    error ? errorId : null,
    props["aria-describedby"],
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-semibold text-slate-200"
        >
          {label}
          {required && <span className="ml-1 text-lime-300">*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={[
          "w-full rounded-xl border bg-[#101827] px-4 py-3.5",
          "text-sm text-white placeholder:text-slate-500",
          "outline-none transition-colors",
          "focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-400/60" : "border-white/10",
          className,
        ].join(" ")}
        {...props}
      />

      {hint && !error && (
        <p id={hintId} className="mt-2 text-xs text-slate-400">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-2 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
