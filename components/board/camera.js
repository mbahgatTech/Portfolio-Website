import { useEffect, useRef } from 'react';
import { LAYOUT_QUERY, sectionRanges } from './layout';
import { FLASH_EVENT, HOLD, STEP, clamp, coverageOf, ease, framesFor, pathsFor, transformOf, viewAt } from './frames';

// The camera that works the board. Page scroll is the camera's position along the
// shots: each shot holds for a moment, then the camera travels to the next on a
// smooth zoom-and-pan path (pulling back for long moves, pushing in to land), and
// reaching a new lead fires a flash. Scrolling that stops between two shots
// settles on one, in the direction the visitor was going. The rig is a plain CSS
// transform with no will-change, so the browser redraws text sharp at any scale.

const SETTLE_MS = 170;

/** The free area the fixed controls leave, as the stylesheet declares it (--il, --ir, --it, --ib). */
function insetsOf(root) {
  const css = getComputedStyle(root);
  const read = (name) => {
    const value = parseFloat(css.getPropertyValue(name));
    return Number.isFinite(value) ? value : 0;
  };
  return { left: read('--il'), right: read('--ir'), top: read('--it'), bottom: read('--ib') };
}

/**
 * Drives the camera from the page scroll while `enabled`. Returns a ref whose
 * .current, once mounted, is { goTo(index), reveal(element) }.
 *
 * refs: rootRef (design root), trackRef (the tall scroll track), viewportRef (the
 * sticky frame), rigRef (the board the camera moves), stateRef (camera state the
 * atmosphere reads: { cx, cy, s }), lenisRef (smooth scroll).
 * onShot(index, shot, layoutKey) runs when the shot mostly in view changes.
 */
export function useBoardCamera({ enabled, board, rootRef, trackRef, viewportRef, rigRef, stateRef, lenisRef, onShot }) {
  const controls = useRef(null);
  const onShotRef = useRef(onShot);
  onShotRef.current = onShot;

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const viewport = viewportRef.current;
    const rig = rigRef.current;
    if (!enabled || !root || !track || !viewport || !rig) {
      controls.current = null;
      return undefined;
    }

    const query = window.matchMedia(LAYOUT_QUERY);
    let key = 'l';
    let shots = [];
    let frames = [];
    let paths = [];
    let coverage = {};
    let vw = 0;
    let vh = 0;
    let step = 1;
    let top = 0;
    let frame = 0;
    let restTimer = 0;
    let settleTimer = 0;
    let steerUntil = 0;
    let heading = 0;
    let lastArrived = -1;
    let lastActive = -1;
    let lastTransform = '';
    let lastY = window.scrollY;
    let direction = 0;
    let touching = false;
    let moving = false;
    let started = null;

    const measure = () => {
      key = query.matches ? 'l' : 'p';
      vw = viewport.clientWidth;
      vh = viewport.clientHeight;
      step = vh * STEP;
      top = track.getBoundingClientRect().top + window.scrollY;
      shots = board.layouts[key].shots;
      const insets = insetsOf(root);
      frames = framesFor(board, key, vw, vh, insets);
      paths = pathsFor(frames);
      coverage = coverageOf(board, key, frames, vw, vh, insets);
      const html = document.documentElement;
      html.style.setProperty('--vpw', String(window.innerWidth));
      html.style.setProperty('--vph', String(window.innerHeight));
    };

    const progressNow = () => (window.scrollY - top) / step;
    const restOf = (index) => top + clamp(index, 0, frames.length - 1) * step + 2;
    /**
     * The shot in this layout that shows what `shot`, from the other layout,
     * showed: the shot itself, else the one that frames its focus, else the
     * last of its section.
     */
    const counterpart = (shot) => {
      const same = shots.findIndex((candidate) => candidate.id === shot.id);
      if (same >= 0) return same;
      if (shot.focus && coverage[shot.focus]) return coverage[shot.focus];
      const range = sectionRanges(shots).find((entry) => entry.section === shot.section);
      return range ? range.first + range.count - 1 : 0;
    };

    const apply = () => {
      frame = 0;
      const progress = progressNow();
      const { view, r, arrived, active } = viewAt(frames, paths, progress);
      const transform = transformOf(view, r, vw, vh);
      if (transform !== lastTransform) {
        lastTransform = transform;
        rig.style.transform = transform;
        // While the camera travels, pieces sweep under a still pointer; the
        // stylesheet stops them reacting until it rests. The root's attributes
        // change only when the state does, so the board's styles aren't
        // recalculated every frame.
        if (!moving) {
          moving = true;
          root.setAttribute('data-camera-moving', '');
        }
        clearTimeout(restTimer);
        restTimer = setTimeout(() => {
          moving = false;
          root.removeAttribute('data-camera-moving');
        }, 160);
        if (stateRef.current) Object.assign(stateRef.current, { cx: view[0], cy: view[1], s: vw / view[2] });
      }
      if (started !== progress > 0.04) {
        started = progress > 0.04;
        root.toggleAttribute('data-camera-started', started);
      }
      if (arrived !== null && arrived !== lastArrived) {
        // A flash for a new lead, when the camera reaches it going forward.
        const forward = lastArrived !== -1 && arrived > lastArrived;
        lastArrived = arrived;
        if (forward && shots[arrived] && shots[arrived].flash) {
          window.dispatchEvent(new Event(FLASH_EVENT));
        }
      }
      if (active !== lastActive) {
        lastActive = active;
        if (onShotRef.current) onShotRef.current(active, shots[active], key);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    /** Moves the camera to shot `index` over `duration` seconds. */
    const steer = (index, duration) => {
      const lenis = lenisRef && lenisRef.current;
      heading = clamp(index, 0, frames.length - 1);
      steerUntil = performance.now() + duration * 1000 + 250;
      if (lenis) lenis.scrollTo(restOf(heading), { duration, easing: ease, force: true });
      else window.scrollTo({ top: restOf(heading), behavior: 'smooth' });
    };
    const goTo = (index) => {
      const distance = Math.abs(restOf(index) - window.scrollY) / Math.max(1, step);
      steer(index, clamp(0.7 + distance * 0.3, 0.7, 2.4));
    };

    // Between two shots when the scrolling stops: carry on to the next shot if the
    // visitor was heading there, otherwise fall back to the one they left. Never
    // while a finger is still on the screen.
    const settle = () => {
      if (touching || performance.now() < steerUntil) return;
      const progress = progressNow();
      if (progress <= 0 || progress >= frames.length - 1) return;
      const index = Math.floor(progress);
      const u = progress - index;
      if (u <= HOLD + 0.015) return;
      const t = ease((u - HOLD) / (1 - HOLD));
      if (t >= 0.985) return;
      const forward = direction > 0 ? t > 0.12 : direction < 0 ? t >= 0.88 : t >= 0.5;
      const next = forward ? index + 1 : index;
      steer(next, clamp(0.35 + (Math.abs(restOf(next) - window.scrollY) / step) * 0.5, 0.35, 0.9));
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (y !== lastY) {
        direction = y > lastY ? 1 : -1;
        lastY = y;
      }
      schedule();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, SETTLE_MS);
    };
    const onTouchStart = () => {
      touching = true;
      steerUntil = 0;
      clearTimeout(settleTimer);
    };
    // The visitor's own scrolling takes over from a move (Lenis drops it), so
    // there's no move left to wait for or to resume. Lenis leaves a wheel over
    // the film strip to the strip, and the move with it.
    const onWheel = (event) => {
      const target = event.target;
      if (target && target.closest && target.closest('[data-lenis-prevent]')) return;
      steerUntil = 0;
    };
    const onTouchEnd = () => {
      touching = false;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, SETTLE_MS);
    };

    const remeasure = () => {
      // From the last position the camera saw: by now the browser may have
      // clamped the scroll to a page that got shorter with the window.
      const progress = (lastY - top) / step;
      const oldKey = key;
      const oldStep = step;
      const oldLast = frames.length - 1;
      const showing = shots[lastActive >= 0 ? lastActive : viewAt(frames, paths, progress).active];
      const move = performance.now() < steerUntil ? shots[heading] : null;
      measure();
      const lenis = lenisRef && lenisRef.current;
      let jumped = false;
      const jump = (target) => {
        if (lenis) {
          // Lenis measures the page a moment after it resizes; the target may lie
          // beyond the height it last measured.
          lenis.resize();
          lenis.scrollTo(target, { immediate: true, force: true });
        } else {
          window.scrollTo(0, target);
        }
        lastY = window.scrollY;
        jumped = true;
      };
      if (key !== oldKey) {
        // The layouts number their shots differently: rest on the shot that shows
        // the same thing in this one (past the last by as much as before).
        if (progress > 0) jump(restOf(counterpart(showing)) + Math.max(0, progress - oldLast) * step);
        lastArrived = -1;
      } else if (progress > 0 && Math.abs(step - oldStep) > 1) {
        // A new viewport height changes the scroll per shot; keep the same shot in view.
        jump(top + progress * step);
      }
      // A jump stops a move under way (after a click on the film strip, say); it
      // carries on from here to the shot it was making for.
      if (jumped && move) goTo(counterpart(move));
      lastTransform = '';
      lastActive = -1;
      schedule();
    };

    const shotOf = (element) => {
      const item = element && element.closest ? element.closest('[data-board-item]') : null;
      if (!item) return null;
      const shot = coverage[item.getAttribute('data-board-item')];
      return shot === undefined ? null : shot;
    };
    /** Brings the shot that shows `element` into view, unless the camera is already resting on it. */
    const reveal = (element) => {
      const shot = shotOf(element);
      if (shot === null) return;
      const progress = progressNow();
      if (progress >= shot - 0.02 && progress <= shot + HOLD) return;
      goTo(shot);
    };
    controls.current = { goTo, reveal };

    // The camera's transform is drawn from the board's top left corner.
    rig.style.left = '0px';
    rig.style.top = '0px';
    measure();
    // Arriving at /#experience or /#contact: start at that part of the board.
    const hash = window.location.hash.slice(1);
    const range = hash && sectionRanges(shots).find((entry) => entry.section === hash);
    if (range && window.scrollY < 4) window.scrollTo(0, restOf(range.first));
    lastY = window.scrollY;
    apply();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    window.addEventListener('resize', remeasure);
    query.addEventListener('change', remeasure);
    // Fonts can change the page height above the board; measure again once they settle.
    let alive = true;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (alive) remeasure();
      });
    }
    return () => {
      alive = false;
      if (frame) cancelAnimationFrame(frame);
      clearTimeout(restTimer);
      clearTimeout(settleTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('resize', remeasure);
      query.removeEventListener('change', remeasure);
      rig.style.transform = '';
      rig.style.left = '';
      rig.style.top = '';
      root.removeAttribute('data-camera-moving');
      root.removeAttribute('data-camera-started');
      controls.current = null;
    };
  }, [enabled, board, rootRef, trackRef, viewportRef, rigRef, stateRef, lenisRef]);

  return controls;
}
