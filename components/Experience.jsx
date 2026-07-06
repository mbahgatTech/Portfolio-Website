import Link from 'next/link';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { fadeUp, staggerContainer, viewportOnce, useReduceMotion } from './ui/motion';

const experiences = require('../utils/json/experience.json');

/**
 * Glass experience card that fades in on scroll and tilts toward the pointer for
 * a subtle depth effect. The tilt is disabled when the user prefers reduced motion.
 */
function TiltCard({ children, className }) {
  const reduceMotion = useReduceMotion();
  const ref = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const handleMove = (event) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 5);
    rotateX.set(-py * 5);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.article
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 1200 }}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={className}
    >
      {children}
    </motion.article>
  );
}

/**
 * Work-experience section: renders each entry from experience.json as a glass
 * card with a "Read More" link to its detail page and a tech-stack grid.
 */
const Experience = () => {
  return (
    <>
      {experiences?.length && (
        <section id="experience" className="relative w-full overflow-hidden bg-ink-950 py-24 sm:py-28">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-700/10 blur-[130px]" />

          <div className="relative mx-auto w-[92%] max-w-6xl">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="mx-auto max-w-2xl text-center"
            >
              <motion.span variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-300">
                Career
              </motion.span>
              <motion.h2 variants={fadeUp} className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                My Work <span className="text-gradient">Experience</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-4 text-base text-blue-100/60">
                A track record of shipping robust, scalable software across enterprise and startup teams.
              </motion.p>
            </motion.div>

            <div className="mt-16 space-y-10">
              {experiences.map((experience) => (
                <TiltCard
                  key={experience.report}
                  className="glass group relative overflow-hidden rounded-3xl p-6 shadow-inset-hair transition-shadow duration-500 hover:shadow-glow sm:p-8"
                >
                  {/* Gradient hairline that lights up on hover. */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="items-start gap-7 md:flex">
                    <div className="mb-6 flex shrink-0 justify-center md:mb-0">
                      <div className="glass-strong flex h-28 w-28 items-center justify-center rounded-2xl p-4">
                        <picture>
                          <img className="max-h-full max-w-full object-contain" src={experience.image} alt={experience.alt} />
                        </picture>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="text-sm font-semibold uppercase tracking-wide text-brand-300">{experience.company}</div>
                      <h3 className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">{experience.position}</h3>
                      <p className="mt-3 leading-relaxed text-blue-100/70">{experience.description}</p>

                      <div className="mt-6 flex justify-start">
                        {/* Next.js Link styled as a button (no nested anchor). */}
                        <Link
                          href={experience.report}
                          className="group/btn inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-brand-400/50 hover:bg-brand-600/20 hover:shadow-glow"
                        >
                          Read More
                          <span aria-hidden="true" className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {experience?.techStack?.length && (
                    <div className="mt-10 border-t border-white/10 pt-8">
                      <h4 className="mb-6 text-center text-lg font-semibold text-white/90">Tech Stack</h4>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {experience.techStack.map((elem) => (
                          <a
                            key={elem.name}
                            href={elem.link}
                            target="_blank"
                            rel="noreferrer"
                            className="glass group/tech flex flex-col items-center gap-3 rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/40 hover:shadow-glow"
                          >
                            <picture>
                              <img
                                className="h-14 w-14 object-contain opacity-85 transition-opacity duration-300 group-hover/tech:opacity-100"
                                src={elem.source}
                                alt={elem.alt}
                              />
                            </picture>
                            <div className="text-sm font-medium text-blue-100/70 transition-colors duration-300 group-hover/tech:text-white">
                              {elem.name}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </TiltCard>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default Experience;
