import { type ReactNode } from "react";
import { Button, type ButtonVariant } from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  heading: string;
  description?: string;
  ctaLabel?: string;
  ctaVariant?: ButtonVariant;
  onCta?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  heading,
  description,
  ctaLabel,
  ctaVariant = "primary",
  onCta,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center gap-token-3",
        "py-token-12 px-token-6",
        "bg-token-surface-2 border border-dashed border-token-border rounded-token-lg",
        className,
      ].join(" ")}
    >
      {icon && (
        <div className="text-token-text-muted opacity-60">{icon}</div>
      )}
      <div className="flex flex-col gap-token-1">
        <span className="text-token-base font-semibold text-token-text">
          {heading}
        </span>
        {description && (
          <span className="text-token-sm text-token-text-muted max-w-xs">
            {description}
          </span>
        )}
      </div>
      {ctaLabel && onCta && (
        <Button variant={ctaVariant} size="sm" onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
