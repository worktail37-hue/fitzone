import { RefObject, useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * Returns true only when:
 * 1. `prefers-reduced-motion` is NOT enabled,
 * 2. The observed section/element is currently visible in the viewport, and
 * 3. The browser tab is visible (`!document.hidden`).
 *
 * Ensures infinite/looping animations pause automatically off-screen or when the tab is hidden.
 */
export function useAnimationActive<T extends HTMLElement = HTMLElement>(
  elementRef: RefObject<T | null>,
  threshold = 0.05
): boolean {
  const prefersReducedMotion = useReducedMotion();
  const [isInView, setIsInView] = useState<boolean>(false);
  const [isTabVisible, setIsTabVisible] = useState<boolean>(() =>
    typeof document !== 'undefined' ? !document.hidden : true
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element || prefersReducedMotion) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsInView(entry.isIntersecting);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [elementRef, threshold, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [prefersReducedMotion]);

  return !prefersReducedMotion && isInView && isTabVisible;
}
