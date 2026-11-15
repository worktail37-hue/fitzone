import { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  as?: 'div' | 'article' | 'section';
  interactive?: boolean;
}

export function Card({
  children,
  as: Component = 'div',
  interactive = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <Component
      className={[
        'bg-slate-navy rounded-2xl border border-cloud-border p-6 sm:p-8',
        interactive
          ? 'transition-[transform,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-signal-border'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Component>
  );
}
