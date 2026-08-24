import {
  type ReactNode,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Max width of the modal panel. Default: "max-w-lg" */
  maxWidth?: string;
  /** Show the close button in the header. Default: true */
  showClose?: boolean;
}

/** Focusable elements we will trap focus within */
const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  showClose = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Focus trap
  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    );
    if (!focusable.length) { e.preventDefault(); return; }
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", trapFocus as unknown as EventListener);
    // Move focus into panel
    setTimeout(() => {
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      focusable?.[0]?.focus();
    }, 50);
    // Lock body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", trapFocus as unknown as EventListener);
      document.body.style.overflow = "";
    };
  }, [open, trapFocus]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-token-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        ref={panelRef}
        className={[
          "relative w-full bg-token-surface border border-token-border rounded-token-lg shadow-token-xl",
          "flex flex-col max-h-[90vh]",
          maxWidth,
        ].join(" ")}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-token-4 py-token-3 border-b border-token-border shrink-0">
            {title && (
              <span className="text-token-base font-semibold text-token-text">{title}</span>
            )}
            {showClose && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="ml-auto text-token-text-muted hover:text-token-text transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-token-accent rounded-token-sm p-token-1"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
        {/* Body */}
        <div className="overflow-y-auto p-token-4">{children}</div>
      </div>
    </div>
  );
}
