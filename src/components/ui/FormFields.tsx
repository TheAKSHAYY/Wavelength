import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
  forwardRef,
} from "react";

/* ─── shared field styles ────────────────────────────────────────────────── */
const fieldBase = [
  "w-full bg-[var(--color-input)] text-token-text text-token-base",
  "border border-token-border rounded-token-md px-token-3 py-token-2",
  "placeholder:text-token-text-muted outline-none",
  "transition-all duration-150",
  "focus:border-token-accent focus:ring-2 focus:ring-[var(--accent-glow)]",
  "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

const labelBase =
  "block text-token-xs font-semibold text-token-text-secondary mb-token-1 uppercase tracking-wide";

/* ─── Input ──────────────────────────────────────────────────────────────── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, wrapperClassName = "", className = "", id, ...rest }, ref) => {
    const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={["flex flex-col", wrapperClassName].join(" ")}>
        {label && (
          <label htmlFor={fieldId} className={labelBase}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={fieldId}
          className={[fieldBase, error ? "border-token-accent-red" : "", className].join(" ")}
          {...rest}
        />
        {error && (
          <span className="mt-token-1 text-token-xs text-token-accent-red">{error}</span>
        )}
        {hint && !error && (
          <span className="mt-token-1 text-token-xs text-token-text-muted">{hint}</span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

/* ─── Textarea ───────────────────────────────────────────────────────────── */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, wrapperClassName = "", className = "", id, ...rest }, ref) => {
    const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={["flex flex-col", wrapperClassName].join(" ")}>
        {label && (
          <label htmlFor={fieldId} className={labelBase}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          className={[fieldBase, "resize-y min-h-[80px]", error ? "border-token-accent-red" : "", className].join(" ")}
          {...rest}
        />
        {error && (
          <span className="mt-token-1 text-token-xs text-token-accent-red">{error}</span>
        )}
        {hint && !error && (
          <span className="mt-token-1 text-token-xs text-token-text-muted">{hint}</span>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

/* ─── Select ─────────────────────────────────────────────────────────────── */
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, options, wrapperClassName = "", className = "", id, ...rest }, ref) => {
    const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={["flex flex-col", wrapperClassName].join(" ")}>
        {label && (
          <label htmlFor={fieldId} className={labelBase}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={fieldId}
          className={[fieldBase, "cursor-pointer", error ? "border-token-accent-red" : "", className].join(" ")}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="mt-token-1 text-token-xs text-token-accent-red">{error}</span>
        )}
        {hint && !error && (
          <span className="mt-token-1 text-token-xs text-token-text-muted">{hint}</span>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";
