import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, viewportOnce } from './ui/motion';

/**
 * Contact section (T-007). Glass panel with animated floating-label fields.
 * Behavior is preserved verbatim (D6): `onSubmit` reads name/email/message and
 * calls `setModal({ data, visible: true })` — the confirm/email wiring lives in
 * ConfirmModal.jsx → utils/Message.js (frozen).
 */
const Contact = ({ setModal }) => {
    const fieldClass =
        'peer block w-full appearance-none rounded-lg border border-white/15 bg-white/[0.03] px-4 pt-6 pb-2 text-sm text-white transition-all duration-300 placeholder-transparent focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40';
    // Floating label (T-007 user fix): the label's DEFAULT is the floated (up) state,
    // so it stays clear of the typed value whenever the field has content; only an
    // empty field pulls it back down over the input via `peer-placeholder-shown`, and
    // focus always lifts it. This depends solely on `placeholder-shown` + `focus`
    // (Tailwind sorts `focus` after `placeholder-shown`, so focus wins on an empty
    // field) — no arbitrary `:not(:placeholder-shown)` variant — so it reliably clears
    // on input and never overlaps the typed text.
    const labelClass =
        'pointer-events-none absolute left-4 top-2 origin-left text-xs text-brand-300 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-blue-100/50 peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-300';

    return (
        <section id="contact" className="relative w-full overflow-hidden bg-ink-950 py-24 sm:py-28">
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-electric-500/10 blur-[130px]" />

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="relative mx-auto w-[92%] max-w-xl"
            >
                <motion.div variants={fadeUp} className="text-center">
                    <span className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-300">Contact</span>
                    <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Get in <span className="text-gradient">Touch</span>
                    </h2>
                    <p className="mt-4 text-base text-blue-100/60">
                        Have a project in mind or just want to say hello? Drop me a message.
                    </p>
                </motion.div>

                <motion.form
                    variants={fadeUp}
                    className="glass mt-10 rounded-3xl p-6 shadow-inset-hair sm:p-8"
                    onSubmit={event => {
                        event.preventDefault();

                        // Preserve the original data-capture + modal hand-off (D6); the
                        // confirm step posts to /api/message via the frozen Message.js.
                        let name = event.target.name.value;
                        let email = event.target.email.value;
                        let message = event.target.message.value;
                        setModal({ data: { name, email, message }, visible: true });
                    }}
                >
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="relative">
                            <input type="text" required name="name" id="contact-name" placeholder=" " className={fieldClass} />
                            <label htmlFor="contact-name" className={labelClass}>Name</label>
                        </div>
                        <div className="relative">
                            {/* type="email" + pattern give native format validation (T-007 user fix):
                                an invalid address blocks submit — so the confirm modal only opens for a
                                well-formed email — while a valid one still reaches setModal unchanged (D6). */}
                            <input
                                type="email"
                                required
                                name="email"
                                id="contact-email"
                                placeholder=" "
                                pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                                title="Enter a valid email address, e.g. name@example.com"
                                className={fieldClass}
                            />
                            <label htmlFor="contact-email" className={labelClass}>Email</label>
                        </div>
                        <div className="relative sm:col-span-2">
                            <textarea name="message" id="contact-message" placeholder=" " required rows="5" className={`${fieldClass} resize-none`}></textarea>
                            <label htmlFor="contact-message" className={labelClass}>Message</label>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="mt-6 w-full rounded-full bg-brand-gradient px-10 py-3.5 font-semibold text-white shadow-glow transition-shadow duration-500 hover:shadow-glow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 sm:w-auto"
                    >
                        Send Message
                    </button>
                </motion.form>
            </motion.div>
        </section>
    );
};

export default Contact;