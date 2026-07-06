import { motion, useScroll, useSpring } from 'framer-motion';
import { useReduceMotion } from './motion';

/**
 * Fixed scroll-progress bar (T-009 / D13). Binds page scroll to scaleX via
 * framer-motion's useScroll; spring smoothing is bypassed under reduced-motion
 * (D14) while the indicator itself stays visible and content is unaffected.
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
