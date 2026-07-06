/**
 * Static, dependency-free hero backdrop built from CSS layers (aurora, grid, and
 * glow). Shown while the 3D chunk loads and whenever the animated canvas can't
 * run (reduced motion or no WebGL), so the hero is never blank.
 */
export default function HeroFallback() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-ink-950" />
      <div className="absolute inset-0 bg-aurora animate-aurora" />
      <div className="absolute inset-0 bg-grid opacity-[0.35] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="absolute -top-32 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[130px]" />
      <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] translate-x-1/3 translate-y-1/3 rounded-full bg-electric-500/15 blur-[130px]" />
    </div>
  );
}
