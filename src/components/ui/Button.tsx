import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-token-accent text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-token-accent border-transparent",
  secondary:
    "bg-token-surface-2 text-token-text border-token-border hover:bg-token-surface-3 focus-visible:ring-2 focus-visible:ring-token-accent",
  ghost:
    "bg-transparent text-token-text-secondary border-transparent hover:bg-token-surface-2 focus-visible:ring-2 focus-visible:ring-token-accent",
  danger:
    "bg-token-accent-red text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-token-accent-red border-transparent",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 px-token-3 text-token-sm gap-token-1",
  md: "h-9 px-token-4 text-token-base gap-token-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      className = "",
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center font-semibold rounded-token-md border",
          "transition-all duration-150 outline-none cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...rest}
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin shrink-0" />
            <span className="opacity-0 select-none pointer-events-none absolute">
              {children}
            </span>
            {/* Invisible children keep button width stable */}
            <span aria-hidden className="invisible">
              {children}
            </span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);
Button.displayName = "Button";
