import { memo } from 'react';
import styles from './Board.module.css';

// The strings and the pins, one pair of SVGs per layout (CSS shows the pair in
// use). Strings run under the paper from pin to pin, sagging a little, with a
// wool twist and a soft shadow on the cork; the pins sit on top of the paper.
// Highlighting is done with attributes the board sets (data-on on a lit string,
// data-lit-active on the root), so nothing here re-renders.

const cx = (...names) => names.filter(Boolean).join(' ');

const PIN_COLOR = {
  subject: 'red', profile: 'blue', resume: 'yellow', link: 'green', role: 'red',
  picture: 'white', desc: 'blue', tech: 'yellow', contact: 'green',
};
const PIN_SHADES = {
  red: ['#ff8a86', '#d1232f', '#6e0912'],
  blue: ['#9cc0ff', '#2e62c4', '#122b63'],
  yellow: ['#fff1a8', '#e8b51b', '#7d5a03'],
  green: ['#9be8c0', '#1f9a6a', '#0b4a33'],
  white: ['#ffffff', '#e4e2db', '#86847c'],
};

/** A string from pin a to pin b, sagging under its own weight (less when it hangs steeply). */
function stringPath(a, b) {
  const dx = b.ax - a.ax;
  const dy = b.ay - a.ay;
  const length = Math.hypot(dx, dy) || 1;
  const sag = Math.min(90, Math.max(8, length * 0.07)) * (0.35 + (0.65 * Math.abs(dx)) / length);
  const qx = (a.ax + b.ax) / 2;
  const qy = (a.ay + b.ay) / 2 + sag;
  return `M${a.ax} ${a.ay} Q${qx.toFixed(1)} ${qy.toFixed(1)} ${b.ax} ${b.ay}`;
}

const layerClass = (layoutKey) => (layoutKey === 'l' ? styles.layerL : styles.layerP);

export const Strings = memo(function Strings({ board, layoutKey }) {
  const layout = board.layouts[layoutKey];
  const strings = board.edges
    .map((edge) => {
      const a = board.items[edge.from][layoutKey];
      const b = board.items[edge.to][layoutKey];
      return a && b ? { edge, d: stringPath(a, b) } : null;
    })
    .filter(Boolean);

  return (
    <svg
      className={cx(styles.strings, layerClass(layoutKey))}
      width={layout.W}
      height={layout.H}
      viewBox={`0 0 ${layout.W} ${layout.H}`}
      aria-hidden="true"
      focusable="false"
    >
      <g className={styles.stringShadows}>
        {strings.map(({ edge, d }) => (
          <path key={edge.id} d={d} transform="translate(5 10)" />
        ))}
      </g>
      {strings.map(({ edge, d }) => (
        <g key={edge.id} className={cx(styles.string, styles[`string_${edge.kind}`])} data-from={edge.from} data-to={edge.to}>
          <path d={d} className={styles.stringBase} />
          <path d={d} className={styles.stringTwist} />
        </g>
      ))}
    </svg>
  );
});

export const Pins = memo(function Pins({ board, layoutKey }) {
  const layout = board.layouts[layoutKey];
  const gradient = (color) => `board-pin-${color}-${layoutKey}`;
  return (
    <svg
      className={cx(styles.pins, layerClass(layoutKey))}
      width={layout.W}
      height={layout.H}
      viewBox={`0 0 ${layout.W} ${layout.H}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {Object.entries(PIN_SHADES).map(([color, [light, mid, dark]]) => (
          <radialGradient key={color} id={gradient(color)} cx="36%" cy="30%" r="72%">
            <stop offset="0%" stopColor={light} />
            <stop offset="48%" stopColor={mid} />
            <stop offset="100%" stopColor={dark} />
          </radialGradient>
        ))}
      </defs>
      {board.order.map((id) => {
        const item = board.items[id];
        const box = item[layoutKey];
        if (!box) return null;
        const color = PIN_COLOR[item.kind] || 'red';
        return (
          <g key={id} transform={`translate(${box.ax} ${box.ay})`}>
            <ellipse cx="6" cy="11" rx="10" ry="7.5" className={styles.pinShadow} />
            <circle r="10.5" fill={`url(#${gradient(color)})`} className={styles.pinHead} />
            <ellipse cx="-3.4" cy="-4" rx="3.2" ry="2.4" className={styles.pinGlint} />
          </g>
        );
      })}
    </svg>
  );
});
