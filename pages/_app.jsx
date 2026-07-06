import '../styles/globals.css'
import { useEffect, useState } from 'react'
import { Sora } from 'next/font/google'
import { MotionConfig } from 'framer-motion'
import { ReactLenis } from 'lenis/react'
import { useReduceMotion } from '../components/ui/motion'

// Self-hosted display font (no layout shift), exposed as a CSS variable that
// tailwind's fontFamily.display uses for headings.
const displayFont = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

// Kept at module scope so the options object keeps a stable identity across renders.
const LENIS_OPTIONS = { lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 }

/**
 * App shell: sets up global smooth scrolling and reduced-motion handling.
 *
 * ReactLenis (smooth scroll) mounts on the client only, and only when the user
 * hasn't asked for reduced motion. It sits beside <Component> so toggling it never
 * remounts the page. MotionConfig reducedMotion="user" makes framer-motion reveals
 * respect the same preference (transforms are suppressed; content stays visible).
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
