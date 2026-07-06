import { useSyncExternalStore } from 'react';

// Shared framer-motion helpers and variants for the 2026 redesign (T-003).
// Centralizing the reveal variants keeps the section components consistent and
// makes the reduced-motion gate (D14) verifiable from a single source.

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
 * SSR-safe hook reporting the user's `prefers-reduced-motion` setting.
 * Drives the hard motion gates in D14 — disabling the r3f render loop
 * (HeroCanvas.jsx) and Lenis smooth scroll (_app.jsx) — without risking a
 * hydration mismatch (server snapshot is always `false`).
 */
export function useReduceMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Easing tuned for calm, premium reveals rather than bouncy motion.
const EASE_OUT = [0.22, 1, 0.36, 1];

/** Vertical reveal used for section blocks and cards (D13). */
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
