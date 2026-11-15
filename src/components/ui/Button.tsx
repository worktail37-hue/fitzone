import { ButtonHTMLAttributes, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  showArrow?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-signal text-cloud border border-transparent hover:bg-signal-hover hover:shadow-signal-glow active:scale-[0.98]',
  outline:
    'bg-slate-navy/70 text-cloud border border-cloud-border hover:border-signal hover:bg-slate-navy active:scale-[0.98]',
  ghost:
    'bg-transparent text-cloud border border-transparent hover:bg-slate-navy/80 active:scale-[0.98]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-[44px] min-w-[44px] px-4 py-2.5 text-xs tracking-wider',
  md: 'min-h-[44px] min-w-[44px] px-6 py-2.5 text-sm tracking-wider',
  lg: 'min-h-[52px] min-w-[44px] px-8 py-3.5 text-base tracking-wider',
};

export function Button({
  variant = 'primary',
  size = 'md',
  showArrow = false,
  type = 'button',
  disabled = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        'group inline-flex items-center justify-center gap-2.5 rounded-xl font-display font-bold uppercase whitespace-nowrap shrink-0 cursor-pointer',
        'transition-[transform,opacity,background-color,border-color,box-shadow] duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-midnight',
        'disabled:opacity-45 disabled:pointer-events-none disabled:cursor-not-allowed disabled:shadow-none',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <span>{children}</span>
      {showArrow && (
        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-1"
        />
      )}
    </button>
  );
}
