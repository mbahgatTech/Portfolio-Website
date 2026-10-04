// The camera's arithmetic, kept free of React so it can be checked on its own.
// A view is { cx, cy, w, r }: the board point at the centre of the screen, how
// much of the board fits across the screen (in board px), and the camera's roll.

export const HOLD = 0.3; // each shot holds for this share of its scroll step
export const STEP = 0.9; // scroll per shot, in viewport heights
export const FLASH_EVENT = 'board:flash'; // fired on window when the camera reaches a new lead

const MAX_SCALE = { l: 1.05, p: 1 };
const MIN_READABLE = { l: 0.66, p: 0.7 };
const TILT_FOLLOW = 0.75; // how far the camera rolls to level a tilted card
const PAD = 16; // room around a shot for tilted corners and pins

export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Van Wijk and Nuij's smooth zoom-pan path between two views [cx, cy, width],
 * as in d3-interpolate: the camera rises to cover long distances and descends to
 * land. rho sets how much it pulls back.
 */
function zoomPath(from, to, rho = Math.SQRT2) {
  const rho2 = rho * rho;
  const rho4 = rho2 * rho2;
  const [ux0, uy0, w0] = from;
  const [ux1, uy1, w1] = to;
  const dx = ux1 - ux0;
  const dy = uy1 - uy0;
  const d2 = dx * dx + dy * dy;
  if (d2 < 1e-6) {
    const S = Math.log(w1 / w0) / rho;
    return (t) => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)];
  }
  const d1 = Math.sqrt(d2);
  const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1);
  const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1);
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
  const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  const S = (r1 - r0) / rho;
  const coshR0 = Math.cosh(r0);
  const sinhR0 = Math.sinh(r0);
  return (t) => {
    const s = t * S;
    const u = (w0 / (rho2 * d1)) * (coshR0 * Math.tanh(rho * s + r0) - sinhR0);
    return [ux0 + u * dx, uy0 + u * dy, (w0 * coshR0) / Math.cosh(rho * s + r0)];
  };
}

const boundsOfIds = (ids, items, key) => {
  const boxes = ids.map((id) => items[id] && items[id][key]).filter(Boolean);
  const x0 = Math.min(...boxes.map((b) => b.x)) - PAD;
  const y0 = Math.min(...boxes.map((b) => b.y)) - PAD;
  const x1 = Math.max(...boxes.map((b) => b.x + b.w)) + PAD;
  const y1 = Math.max(...boxes.map((b) => b.y + b.h)) + PAD;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
};

/**
 * One view per shot for a viewport vw x vh. Shots are framed inside the area the
 * fixed controls leave free (`insets`: { left, right, top, bottom } in px), and
 * fitted with the camera's roll taken into account. The first shot (no items)
 * is the whole board, framed exactly as the stylesheet frames it before scripts run.
 */
export function framesFor(board, key, vw, vh, insets) {
  const layout = board.layouts[key];
  const availW = Math.max(120, vw - insets.left - insets.right);
  const availH = Math.max(120, vh - insets.top - insets.bottom);
  // The board point that lands at the centre of the free area, for a view of `box`.
  const view = (box, s, r) => {
    const dx = insets.left + availW / 2 - vw / 2;
    const dy = insets.top + availH / 2 - vh / 2;
    const rad = (-r * Math.PI) / 180;
    const ux = (dx * Math.cos(rad) - dy * Math.sin(rad)) / s;
    const uy = (dx * Math.sin(rad) + dy * Math.cos(rad)) / s;
    return { cx: box.x + box.w / 2 - ux, cy: box.y + box.h / 2 - uy, w: vw / s, r };
  };
  const fit = (ids, r) => {
    const box = boundsOfIds(ids, board.items, key);
    const rad = (Math.abs(r) * Math.PI) / 180;
    const w = box.w * Math.cos(rad) + box.h * Math.sin(rad);
    const h = box.w * Math.sin(rad) + box.h * Math.cos(rad);
    return { box, s: Math.min(availW / w, availH / h, MAX_SCALE[key]) };
  };
  return layout.shots.map((shot) => {
    if (!shot.items) {
      const box = { x: 0, y: 0, w: layout.W, h: layout.H };
      return view(box, Math.min(availW / layout.W, availH / layout.H), 0);
    }
    const main = board.items[shot.items[0]][key];
    const r = shot.wide ? 0 : -main.r * TILT_FOLLOW;
    let framed = fit(shot.items, r);
    if (framed.s < MIN_READABLE[key] && !shot.wide) {
      // Too much to read at once: frame the shot's core, or just its main item.
      if (shot.core) framed = fit(shot.core, r);
      if (framed.s < MIN_READABLE[key] && shot.items.length > 1) framed = fit([shot.items[0]], r);
    }
    return view(framed.box, framed.s, r);
  });
}

/** The zoom-pan path for each move between consecutive shots. Long moves pull back further. */
export function pathsFor(frames) {
  return frames.slice(1).map((to, index) => {
    const from = frames[index];
    const distance = Math.hypot(to.cx - from.cx, to.cy - from.cy) / Math.max(from.w, to.w);
    return zoomPath([from.cx, from.cy, from.w], [to.cx, to.cy, to.w], distance > 1.2 ? 1.75 : 1.35);
  });
}

/**
 * Where the camera is at scroll progress p (in shots): the view, the shot just
 * reached (or null mid-move) and the shot that is mostly in view.
 */
export function viewAt(frames, paths, p) {
  const progress = clamp(p, 0, frames.length - 1);
  if (frames.length < 2) {
    const f = frames[0];
    return { view: [f.cx, f.cy, f.w], r: f.r, arrived: 0, active: 0 };
  }
  const index = Math.min(Math.floor(progress), frames.length - 2);
  const u = progress - index;
  if (u <= HOLD) {
    const f = frames[index];
    return { view: [f.cx, f.cy, f.w], r: f.r, arrived: index, active: index };
  }
  const t = ease((u - HOLD) / (1 - HOLD));
  const r = frames[index].r + (frames[index + 1].r - frames[index].r) * t;
  return { view: paths[index](t), r, arrived: t >= 0.985 ? index + 1 : null, active: t < 0.5 ? index : index + 1 };
}

/** The CSS transform that puts a view on a vw x vh screen. */
export const transformOf = (view, r, vw, vh) => {
  const s = vw / view[2];
  return `translate3d(${(vw / 2).toFixed(2)}px, ${(vh / 2).toFixed(2)}px, 0) rotate(${r.toFixed(3)}deg) scale(${s.toFixed(5)}) translate(${(-view[0]).toFixed(2)}px, ${(-view[1]).toFixed(2)}px)`;
};

/**
 * For each item, the shot keyboard focus should bring into view: the first that
 * frames it on purpose and shows all of it inside the free area, else the first
 * that shows all of it, else the first that frames it. Depends on the viewport,
 * so it is worked out on every measure.
 */
export function coverageOf(board, key, frames, vw, vh, insets) {
  const both = {};
  const shown = {};
  const framed = {};
  const slack = 8;
  frames.forEach((f, index) => {
    if (index === 0) return;
    const s = vw / f.w;
    const rad = (f.r * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const inside = (x, y) => {
      const dx = (x - f.cx) * s;
      const dy = (y - f.cy) * s;
      const sx = vw / 2 + dx * cos - dy * sin;
      const sy = vh / 2 + dx * sin + dy * cos;
      return sx >= insets.left - slack && sx <= vw - insets.right + slack && sy >= insets.top - slack && sy <= vh - insets.bottom + slack;
    };
    const intended = new Set(board.layouts[key].shots[index].items || []);
    board.order.forEach((id) => {
      const box = board.items[id][key];
      if (!box) return;
      const visible = inside(box.x, box.y) && inside(box.x + box.w, box.y) && inside(box.x, box.y + box.h) && inside(box.x + box.w, box.y + box.h);
      if (visible && intended.has(id) && both[id] === undefined) both[id] = index;
      if (visible && shown[id] === undefined) shown[id] = index;
      if (intended.has(id) && framed[id] === undefined) framed[id] = index;
    });
  });
  const coverage = {};
  board.order.forEach((id) => {
    const pick = [both[id], shown[id], framed[id]].find((value) => value !== undefined);
    coverage[id] = pick === undefined ? 0 : pick;
  });
  return coverage;
}
