import { motion, useScroll, useSpring } from 'framer-motion';
import { useReduceMotion } from './motion';

/**
 * Fixed progress bar at the top of the page that fills as you scroll. The spring
 * smoothing is bypassed when the user prefers reduced motion.
 */
export default function ScrollProgress() {
  const reduceMotion = useReduceMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const scaleX = reduceMotion ? scrollYProgress : smooth;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-1 origin-left bg-brand-gradient shadow-glow"
    />
  );
}
