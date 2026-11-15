import { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export type RevealDirection = 'up' | 'left' | 'right';

export interface RevealProps {
  children: ReactNode;
  delay?: number;
  direction?: RevealDirection;
  className?: string;
}

/**
 * GPU-friendly scroll reveal wrapper.
 * Animates only opacity and transform (translateY or translateX 24px -> 0px).
 * Triggers once when 15% in view, duration 0.6s, ease-out.
 * Automatically disables movement if prefers-reduced-motion is enabled.
 */
export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const initialOffset =
    direction === 'left'
      ? { opacity: 0, x: -24, y: 0 }
      : direction === 'right'
      ? { opacity: 0, x: 24, y: 0 }
      : { opacity: 0, x: 0, y: 24 };

  return (
    <motion.div
      className={className}
      initial={initialOffset}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.6,
        delay,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}
