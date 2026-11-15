import { RefObject, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

export interface UseCountUpOptions {
  target: number;
  durationMs?: number;
  threshold?: number;
}

/**
 * Animates a number from 0 to `target` over `durationMs` (default 2000ms) using
 * an ease-out cubic curve when the observed element enters the viewport.
 * Runs once only, respects `prefers-reduced-motion`, and cleans up all
 * IntersectionObserver and requestAnimationFrame handles on unmount.
 */
export function useCountUp<T extends HTMLElement = HTMLDivElement>({
  target,
  durationMs = 2000,
  threshold = 0.2,
}: UseCountUpOptions): {
  count: number;
  elementRef: RefObject<T | null>;
} {
  const prefersReducedMotion = useReducedMotion();
  const [count, setCount] = useState<number>(() => (prefersReducedMotion ? target : 0));
  const elementRef = useRef<T | null>(null);
  const hasTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    const element = elementRef.current;
    if (!element || hasTriggeredRef.current) {
      return;
    }

    let rafId: number | null = null;
    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (startTimestamp === null) {
        startTimestamp = timestamp;
      }

      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(1, elapsed / durationMs);
      // Cubic ease-out: 1 - (1 - t)^3
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(easedProgress * target);

      setCount(currentValue);

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        setCount(target);
        rafId = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          observer.disconnect();
          rafId = window.requestAnimationFrame(step);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [target, durationMs, threshold, prefersReducedMotion]);

  return { count: prefersReducedMotion ? target : count, elementRef };
}
