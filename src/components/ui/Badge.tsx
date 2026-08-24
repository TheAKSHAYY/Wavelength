import { type HTMLAttributes } from "react";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "accent";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-token-surface-3 text-token-text-secondary border-token-border",
  success:
    "bg-[var(--accent-mint-dim)] text-token-accent-mint border-[var(--accent-mint)]",
  warning:
    "bg-[var(--accent-amber-dim)] text-token-accent-amber border-[var(--accent-amber)]",
  danger:
    "bg-[var(--accent-red-dim)] text-token-accent-red border-[var(--accent-red)]",
  accent:
    "bg-[var(--accent-primary-dim)] text-token-accent border-token-accent",
};

export function Badge({
  variant = "default",
  className = "",
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-token-2 py-[2px] rounded-token-full border text-token-xs font-bold uppercase tracking-wide",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </span>
  );
}
