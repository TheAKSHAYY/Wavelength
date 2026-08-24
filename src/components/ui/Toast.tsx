/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
export type ToastVariant = "success" | "error";

interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

/* ─── Context ────────────────────────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue>({
  toast: () => undefined,
});

/* ─── Hook ───────────────────────────────────────────────────────────────── */
export function useToast() {
  return useContext(ToastContext);
}

/* ─── Provider ───────────────────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, variant, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast stack — fixed bottom-right */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-token-6 right-token-6 z-50 flex flex-col gap-token-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ─── Single Toast ───────────────────────────────────────────────────────── */
function ToastItem({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const isSuccess = item.variant === "success";

  return (
    <div
      role="alert"
      className={[
        "pointer-events-auto flex items-center gap-token-3 px-token-4 py-token-3",
        "rounded-token-md border shadow-token-lg text-token-sm font-medium",
        "animate-pop-in",
        isSuccess
          ? "bg-[var(--accent-mint-dim)] border-[var(--accent-mint)] text-token-accent-mint"
          : "bg-[var(--accent-red-dim)] border-[var(--accent-red)] text-token-accent-red",
      ].join(" ")}
    >
      {isSuccess ? (
        <CheckCircle2 size={16} className="shrink-0" />
      ) : (
        <XCircle size={16} className="shrink-0" />
      )}
      <span className="flex-1 text-token-text">{item.message}</span>
      <button
        aria-label="Dismiss"
        onClick={() => onDismiss(item.id)}
        className="text-token-text-muted hover:text-token-text transition-colors outline-none"
      >
        <X size={14} />
      </button>
    </div>
  );
}
