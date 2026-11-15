import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';

/**
 * 3px Signal Red scroll progress indicator pinned to the top of the viewport.
 * Uses GPU-accelerated transform scaleX (origin-left) rather than animating width.
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  const smoothScaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 h-[3px] w-full bg-midnight/40 pointer-events-none overflow-hidden"
    >
      <motion.div
        className="h-full w-full bg-signal origin-left"
        style={{
          scaleX: prefersReducedMotion ? scrollYProgress : smoothScaleX,
        }}
      />
    </div>
  );
}
