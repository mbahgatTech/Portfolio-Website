import '../styles/globals.css'
import { useEffect, useState } from 'react'
import { Sora } from 'next/font/google'
import { MotionConfig } from 'framer-motion'
import { ReactLenis } from 'lenis/react'
import { useReduceMotion } from '../components/ui/motion'

// T-003/A5: self-hosted display font (zero layout shift) exposed as a CSS variable
// that tailwind's `fontFamily.display` consumes for headings across the redesign.
const displayFont = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

// Stable Lenis tuning kept at module scope so the ReactLenis effect's options
// identity doesn't churn across renders (T-009).
const LENIS_OPTIONS = { lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 }

/**
 * App shell (T-009). Wires global smooth scroll and the framer-motion
 * reduced-motion contract. `ReactLenis` mounts client-only and only when motion
 * is allowed — under `prefers-reduced-motion` it is never initialized (D14) —
 * and is a sibling of `<Component>` so toggling it never remounts the page tree.
 * `MotionConfig reducedMotion="user"` makes every reveal respect the same
 * preference (transforms suppressed, opacity/content preserved).
 */
const MyApp = ({ Component, pageProps }) => {
  const reduceMotion = useReduceMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const smoothScroll = mounted && !reduceMotion

  return (
    <MotionConfig reducedMotion="user">
      <div className={displayFont.variable}>
        {smoothScroll && <ReactLenis root options={LENIS_OPTIONS} />}
        <Component {...pageProps} />
      </div>
    </MotionConfig>
  )
}

export default MyApp
