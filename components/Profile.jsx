import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { PROFILE, NAVIGATION } from '../utils/json/constants';
import { fadeUp, staggerContainer, useReduceMotion } from './ui/motion';
import HeroFallback from './hero/HeroFallback';

// T-005/D11: the animated three.js background is code-split and client-only
// (ssr:false) so WebGL never runs on the server and the "/" SSR HTML has no
// <canvas>. A static HeroFallback is server-rendered as the base layer.
const HeroBackground = dynamic(() => import('./hero/HeroCanvas'), {
  ssr: false,
  loading: () => null,
});

/**
 * Résumé call-to-action with a magnetic hover (D13 micro-interaction) that
 * preserves the original `<a href="/resume.pdf" download>` contract (D7).
 * The magnetic pull is skipped under prefers-reduced-motion (D14).
 */
function MagneticResumeButton() {
  const reduceMotion = useReduceMotion();
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const handleMove = (event) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * 0.3);
    y.set((event.clientY - (rect.top + rect.height / 2)) * 0.5);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href="/resume.pdf"
      download
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.96 }}
      className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-gradient px-8 py-4 font-semibold text-white shadow-glow transition-shadow duration-500 hover:shadow-glow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
    >
      <span className="relative z-10">{PROFILE.RESUME_BUTTON}</span>
      <svg
        aria-hidden="true"
        className="relative z-10 h-5 w-5 transition-transform duration-500 group-hover:translate-y-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
      </svg>
    </motion.a>
  );
}

/**
 * Hero section (T-005). Glass nav, gradient display headline, and a staggered
 * framer-motion entrance sit above the code-split 3D particle background while
 * preserving every content string and link sourced from the frozen constants.js
 * (name, job title, all three briefs, résumé download, GitHub/LinkedIn nav).
 */
const Profile = () => {
  return (
    <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-ink-950 text-white">
      {/* D11: server-rendered static backdrop + client-only animated canvas. */}
      <div className="absolute inset-0 -z-0">
        <HeroFallback />
        <HeroBackground />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 bg-gradient-to-b from-transparent to-ink-950" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 sm:px-8">
        {/* D12: glassmorphic navigation with the preserved GitHub/LinkedIn links. */}
        <nav className="glass mt-5 flex items-center justify-between rounded-2xl px-5 py-3 shadow-inset-hair sm:px-7" aria-label="Global">
          <span className="font-display text-lg font-bold tracking-tight">
            <span className="text-gradient">MB</span>
            <span className="text-white/90">.</span>
          </span>
          <div className="flex items-center gap-6 sm:gap-8">
            {NAVIGATION.map((item) => (
              <a
                key={item.name}
                target="_blank"
                rel="noreferrer"
                href={item.href}
                className="group relative pb-1 text-sm font-medium text-blue-100/90 transition-colors duration-300 hover:text-white sm:text-base"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-gradient-to-r from-brand-400 via-brand-500 to-electric-400 transition-transform duration-500 ease-out group-hover:scale-x-100" />
              </a>
            ))}
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:py-16">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-2xl text-center lg:text-left"
          >
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
            >
              <span className="block text-white">{PROFILE.MAZEN_BAHGAT}</span>
              <span className="mt-1 block bg-[length:220%_auto] text-gradient-animated animate-gradient-pan">
                {PROFILE.JOB_TITLE}
              </span>
            </motion.h1>

            <div className="mt-7 space-y-3">
              {PROFILE.BRIEF.map((sentence) => (
                <motion.p
                  key={sentence}
                  variants={fadeUp}
                  className="mx-auto max-w-xl text-base leading-relaxed text-blue-100/75 sm:text-lg lg:mx-0"
                >
                  {sentence}
                </motion.p>
              ))}
            </div>

            <motion.div variants={fadeUp} className="mt-10 flex justify-center lg:justify-start">
              <MagneticResumeButton />
            </motion.div>
          </motion.div>

          {/* Profile photo in a glowing glass frame; alt text preserved. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="relative mx-auto w-full max-w-sm lg:max-w-md"
          >
            <div className="absolute -inset-4 rounded-[2rem] bg-brand-gradient opacity-30 blur-2xl" />
            <div className="glass-strong relative overflow-hidden rounded-[2rem] p-2 shadow-glow">
              <picture>
                <img
                  className="h-full w-full rounded-[1.6rem] object-cover object-top"
                  src="/images/profile.jpg"
                  alt="Photo of Mazen"
                />
              </picture>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="hidden justify-center pb-6 lg:flex"
          aria-hidden="true"
        >
          <span className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
            <span className="h-2 w-1 animate-float rounded-full bg-white/70" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}

export default Profile;