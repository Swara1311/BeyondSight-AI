import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white",
  secondary:
    "bg-[var(--color-surface-light)] hover:bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-surface-light)]",
  danger:
    "bg-[var(--color-sos)] hover:bg-[var(--color-sos-dark)] text-white",
  ghost:
    "bg-transparent hover:bg-[var(--color-surface)] text-[var(--color-text-primary)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  md: "min-h-[48px] px-5 py-2.5 text-base",
  lg: "min-h-[56px] px-6 py-3 text-lg",
  xl: "min-h-[64px] px-8 py-4 text-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "lg",
  isLoading = false,
  icon,
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl font-semibold
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? (
        <>
          <span
            className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"
            aria-hidden="true"
          />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span aria-hidden="true">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}