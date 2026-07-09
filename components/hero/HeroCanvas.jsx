import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';
import { useReduceMotion } from '../ui/motion';
import HeroFallback from './HeroFallback';

// Animated hero background: a sparse, low-opacity drift of soft motes in muted
// brand tones — a subtle ambient texture rather than a dense starfield. This
// module is imported only via next/dynamic({ ssr:false }) from Profile.jsx, so
// its WebGL code never runs during server rendering. Any window/document access
// stays inside components/effects (never at module top level) to remain SSR-safe.

/** Uniformly distribute `count` points inside a ball of the given radius. */
function generateSpherePositions(count, radius) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * Math.cbrt(Math.random());
    const sinPhi = Math.sin(phi);
    positions[i * 3] = r * sinPhi * Math.cos(theta);
    positions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

/** Feature-detect a usable WebGL context so we can fall back to the static hero. */
function detectWebGL() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch (err) {
    return false;
  }
}

/** One slowly-drifting cloud of soft round motes; low opacity + normal blending
 *  keeps it a faint, low-contrast texture rather than a field of bright points. */
function ParticleLayer({ count, radius, color, size, speed, opacity }) {
  const ref = useRef();
  const positions = useMemo(() => generateSpherePositions(count, radius), [count, radius]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    // Clamp delta so returning from a paused tab does not produce a large jump.
    // Divisors are intentionally large: the drift should be calm, near-imperceptible.
    const step = Math.min(delta, 0.05) * speed;
    ref.current.rotation.x -= step / 26;
    ref.current.rotation.y -= step / 34;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation
        depthWrite={false}
        opacity={opacity}
      />
    </Points>
  );
}

/** Two thin layers of motes (~410 total) that ease *barely* toward the pointer,
 *  so the parallax is felt more than seen. */
function Scene() {
  const group = useRef();

  useFrame((state) => {
    if (!group.current) return;
    const targetX = state.pointer.y * 0.04;
    const targetY = state.pointer.x * 0.04;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.02;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.02;
  });

  return (
    <group ref={group}>
      <ParticleLayer count={260} radius={1.5} color="#7b74c9" size={0.013} speed={0.35} opacity={0.28} />
      <ParticleLayer count={150} radius={1.05} color="#6f93c9" size={0.017} speed={0.22} opacity={0.2} />
    </group>
  );
}

/**
 * Hero 3D background. Renders the animated canvas when motion is allowed and
 * WebGL is available, otherwise the static HeroFallback. The render loop pauses
 * when the hero scrolls offscreen or the tab is hidden, to save the GPU.
 */
export default function HeroCanvas() {
  const reduceMotion = useReduceMotion();
  const [webglOk] = useState(detectWebGL);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const rootRef = useRef(null);

  const animate = !reduceMotion && webglOk;

  // Pause on tab-blur and when scrolled out of view so the GPU idles off-hero.
  useEffect(() => {
    if (!animate) return;
    const el = rootRef.current;
    const syncPaused = (offscreen) => setPaused(document.hidden || offscreen);
    const onVisibility = () => syncPaused(false);
    document.addEventListener('visibilitychange', onVisibility);

    let observer;
    if (el && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => syncPaused(!entry.isIntersecting),
        { threshold: 0.01 }
      );
      observer.observe(el);
    }
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (observer) observer.disconnect();
    };
  }, [animate]);

  // Expose the motion mode on the root element (read by CSS and tests).
  const motionState = reduceMotion ? 'reduce' : 'animate';

  if (!animate) {
    return (
      <div ref={rootRef} data-motion={motionState} className="absolute inset-0 overflow-hidden">
        <HeroFallback />
      </div>
    );
  }

  const maxDpr = typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1;

  return (
    <div ref={rootRef} data-motion={motionState} className="absolute inset-0 overflow-hidden">
      <HeroFallback />
      {/* Fade the canvas in over the static fallback once WebGL is ready, so the
          particles ease in instead of popping once the code-split chunk loads. */}
      <div
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <Canvas
          className="!absolute !inset-0"
          frameloop={paused ? 'never' : 'always'}
          dpr={[1, maxDpr]}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0, 1] }}
          onCreated={({ scene }) => {
            // Set fog imperatively rather than with a <fog/> element: the JSX form
            // trips the react/no-unknown-property lint rule, and we'd rather not
            // touch the shared ESLint config.
            scene.fog = new THREE.Fog('#07070f', 1.8, 3.4);
            setReady(true);
          }}
        >
          <Scene />
          <AdaptiveDpr pixelated />
        </Canvas>
      </div>
    </div>
  );
}
