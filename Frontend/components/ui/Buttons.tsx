import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "gold" | "navy" | "outline";
  busyLabel?: string | null;
}

export function PrimaryButton({
  children,
  variant = "navy",
  busyLabel,
  className = "",
  disabled,
  ...props
}: PrimaryButtonProps) {
  const busy = Boolean(busyLabel);
  return (
    <button
      className={`primary-button primary-button--${variant} ${className}`}
      type="button"
      disabled={disabled || busy}
      aria-busy={busy}
      {...props}
    >
      <span>{busyLabel || children}</span>
    </button>
  );
}

interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function TextButton({ children, className = "", ...props }: TextButtonProps) {
  return (
    <button className={`text-button ${className}`} type="button" {...props}>
      {children}
    </button>
  );
}
