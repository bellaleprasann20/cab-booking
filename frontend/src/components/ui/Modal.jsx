
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaXmark } from "react-icons/fa6";

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdrop = true,
}) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const widths = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "gocab-modal-title" : undefined}
        aria-describedby={description ? "gocab-modal-description" : undefined}
        className={`my-auto w-full ${widths[size] || widths.md} overflow-hidden rounded-3xl border border-white/10 bg-[#0d1523] shadow-2xl`}
      >
        {(title || showCloseButton) && (
          <header className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
            <div>
              {title && (
                <h2 id="gocab-modal-title" className="text-lg font-bold text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p id="gocab-modal-description" className="mt-1 text-sm text-slate-400">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-xl border border-white/10 p-2.5 text-slate-300 hover:bg-white/5 hover:text-white"
              >
                <FaXmark />
              </button>
            )}
          </header>
        )}

        <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </section>
    </div>,
    document.body
  );
}
