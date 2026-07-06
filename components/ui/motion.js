import { useSyncExternalStore } from 'react';

// Shared framer-motion variants and a reduced-motion hook, kept in one place so
// the section components animate consistently.

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(callback) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function getSnapshot() {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia(REDUCED_MOTION_QUERY).matches
    : false;
}

function getServerSnapshot() {
  return false;
}

/**
 * SSR-safe hook that reports the user's prefers-reduced-motion setting. Used to
 * disable the 3D render loop (HeroCanvas) and smooth scroll (_app). The server
 * snapshot is always false so it never causes a hydration mismatch.
 */
export function useReduceMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Easing tuned for calm, premium reveals rather than bouncy motion.
const EASE_OUT = [0.22, 1, 0.36, 1];

/** Fade-and-rise reveal for section blocks and cards. */
export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

/** Parent variant that staggers its children's entrance. */
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

/** Shared `whileInView` viewport config: reveal once, slightly before entry. */
export const viewportOnce = { once: true, margin: '-80px' };
