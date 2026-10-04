import { useEffect, useRef } from 'react';
import { FLASH_EVENT } from './frames';
import styles from './Board.module.css';

// The air between the camera and the board: dust drifting through the lamp's
// light, carried past the lens a little faster than the board when the camera
// moves (it hangs nearer), and the flash, which whites out the frame for an
// instant and catches every mote. Loaded on the client only, and never mounted
// when the visitor asks for reduced motion.

const MOTES = 84;
const FLASH_MS = 820;
const MAX_SHIFT = 60; // px per frame, so a fast camera move streaks dust rather than scattering it

/** Runs onFrame(elapsed, delta) every animation frame while the tab is visible and the canvas is on screen. */
function useFrameLoop(targetRef, onFrame) {
  const callback = useRef(onFrame);
  callback.current = onFrame;

  useEffect(() => {
    let frame = 0;
    let visible = !document.hidden;
    let onScreen = true;
    let elapsed = 0;
    let last = performance.now();
    const schedule = () => {
      if (!frame && visible && onScreen) frame = requestAnimationFrame(tick);
    };
    function tick(now) {
      frame = 0;
      const delta = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      elapsed += delta;
      callback.current(elapsed, delta);
      schedule();
    }
    const pause = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const resume = () => {
      last = performance.now();
      schedule();
    };
    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) resume();
      else pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) resume();
      else pause();
    });
    observer.observe(targetRef.current);
    document.addEventListener('visibilitychange', onVisibility);
    schedule();
    return () => {
      pause();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [targetRef]);
}

export default function Atmosphere({ stateRef }) {
  const canvasRef = useRef(null);
  const scene = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const size = { width: 0, height: 0, dpr: 1 };
    const resize = () => {
      size.dpr = Math.min(1.5, window.devicePixelRatio || 1);
      size.width = canvas.clientWidth;
      size.height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(size.width * size.dpr));
      canvas.height = Math.max(1, Math.round(size.height * size.dpr));
    };
    resize();
    const motes = Array.from({ length: MOTES }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.2 + Math.random() * 0.8,
      r: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      drift: 0.3 + Math.random() * 0.7,
    }));
    scene.current = { context, size, motes, flashAt: -Infinity, last: null };
    const onFlash = () => {
      scene.current.flashAt = performance.now();
    };
    window.addEventListener(FLASH_EVENT, onFlash);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener(FLASH_EVENT, onFlash);
      window.removeEventListener('resize', resize);
      scene.current = null;
    };
  }, []);

  useFrameLoop(canvasRef, (elapsed, delta) => {
    const current = scene.current;
    if (!current) return;
    const { context, size, motes } = current;
    const { width, height, dpr } = size;
    if (!width || !height) return;

    // How the board moved on screen since the last frame.
    const camera = stateRef.current || {};
    let shiftX = 0;
    let shiftY = 0;
    let zoom = 1;
    if (current.last && camera.s) {
      shiftX = (current.last.cx - camera.cx) * camera.s;
      shiftY = (current.last.cy - camera.cy) * camera.s;
      zoom = camera.s / current.last.s;
    }
    if (camera.s) current.last = { cx: camera.cx, cy: camera.cy, s: camera.s };

    const sinceFlash = (performance.now() - current.flashAt) / FLASH_MS;
    const flash = sinceFlash >= 0 && sinceFlash < 1 ? (1 - sinceFlash) ** 2.4 : 0;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    for (let i = 0; i < motes.length; i += 1) {
      const mote = motes[i];
      const depth = 1 + mote.z * 0.45;
      const dx = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, shiftX * depth));
      const dy = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, shiftY * depth));
      // Rising slowly on the lamp's warmth, swaying.
      mote.x += (dx + Math.sin(elapsed * 0.35 * mote.drift + mote.phase) * 6 * delta) / width;
      mote.y += (dy - 9 * mote.drift * delta) / height;
      if (zoom !== 1) {
        const k = zoom ** depth;
        mote.x = 0.5 + (mote.x - 0.5) * k;
        mote.y = 0.5 + (mote.y - 0.5) * k;
      }
      mote.x -= Math.floor(mote.x);
      mote.y -= Math.floor(mote.y);

      // Brightest in the lamp's cone, which falls from above the board's centre.
      const lx = (mote.x - 0.47) * 1.3;
      const ly = mote.y - 0.22;
      const lamp = Math.max(0, 1 - Math.sqrt(lx * lx + ly * ly) / 0.72);
      const twinkle = 0.55 + 0.45 * Math.sin(elapsed * 1.1 * mote.drift + mote.phase * 3);
      const alpha = (0.05 + lamp * 0.5) * twinkle * mote.z + flash * 0.85 * mote.z;
      if (alpha < 0.012) continue;
      const x = mote.x * width;
      const y = mote.y * height;
      const r = mote.r * (0.6 + mote.z);
      context.fillStyle = `rgba(255, 238, 210, ${(alpha * 0.35).toFixed(3)})`;
      context.beginPath();
      context.arc(x, y, r * 2.4, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = `rgba(255, 244, 226, ${Math.min(1, alpha).toFixed(3)})`;
      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2);
      context.fill();
    }

    if (flash > 0) {
      // The flash fires from above the lens, to the right: hot there, a veil everywhere.
      const gx = width * 0.78;
      const gy = height * 0.06;
      const glow = context.createRadialGradient(gx, gy, 0, gx, gy, Math.hypot(width, height));
      glow.addColorStop(0, `rgba(255, 255, 255, ${flash.toFixed(3)})`);
      glow.addColorStop(0.45, `rgba(248, 250, 255, ${(flash * 0.8).toFixed(3)})`);
      glow.addColorStop(1, `rgba(236, 240, 255, ${(flash * 0.6).toFixed(3)})`);
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
    }
  });

  return <canvas ref={canvasRef} className={styles.atmosphere} aria-hidden="true" />;
}
