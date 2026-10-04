import { useEffect } from 'react';

// The board's three textures, made in the browser rather than shipped as image
// files: cork for the board, fibre grain for every sheet of paper, and the worn
// rubber of the exhibit stamps. Each is a small seamless tile, drawn a slice at a
// time while the browser is idle, once per visit; then all three are set on the
// design's root as --cork, --grain and --wear. Until then the stylesheet's plain
// colours stand in.

let pending = null;

const randomFrom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const canvasOf = (size) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
};

const urlOf = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob((blob) => resolve(blob ? URL.createObjectURL(blob) : null), type, quality));

const wrapIndex = (value, period) => ((value % period) + period) % period;

/** Three passes of a wrap-around box blur (close to a gaussian), so the tile stays seamless. */
function blur(field, size, radius) {
  const span = 2 * radius + 1;
  let src = field;
  for (let pass = 0; pass < 3; pass += 1) {
    const rows = new Float32Array(size * size);
    for (let y = 0; y < size; y += 1) {
      const row = y * size;
      let sum = 0;
      for (let d = -radius; d <= radius; d += 1) sum += src[row + wrapIndex(d, size)];
      for (let x = 0; x < size; x += 1) {
        rows[row + x] = sum / span;
        sum += src[row + wrapIndex(x + radius + 1, size)] - src[row + wrapIndex(x - radius, size)];
      }
    }
    const out = new Float32Array(size * size);
    for (let x = 0; x < size; x += 1) {
      let sum = 0;
      for (let d = -radius; d <= radius; d += 1) sum += rows[wrapIndex(d, size) * size + x];
      for (let y = 0; y < size; y += 1) {
        out[y * size + x] = sum / span;
        sum += rows[wrapIndex(y + radius + 1, size) * size + x] - rows[wrapIndex(y - radius, size) * size + x];
      }
    }
    src = out;
  }
  return src;
}

/** Rescales a field to mean 0, deviation 1. */
function normalize(field) {
  let mean = 0;
  field.forEach((value) => {
    mean += value;
  });
  mean /= field.length;
  let variance = 0;
  field.forEach((value) => {
    variance += (value - mean) ** 2;
  });
  const deviation = Math.sqrt(variance / field.length) || 1;
  return field.map((value) => (value - mean) / deviation);
}

const noise = (size, random) => {
  const field = new Float32Array(size * size);
  for (let i = 0; i < field.length; i += 1) field[i] = random() + random() + random() - 1.5;
  return field;
};

/** Pressed cork: soft mottling, granules in several browns, dark pits and a few old pin holes. */
function* cork(size = 512) {
  const random = randomFrom(4417);
  const lattice = (cells) => {
    const grid = new Float32Array(cells * cells);
    for (let i = 0; i < grid.length; i += 1) grid[i] = random();
    return (x, y) => {
      const fx = (x / size) * cells;
      const fy = (y / size) * cells;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const sx = (fx - x0) * (fx - x0) * (3 - 2 * (fx - x0));
      const sy = (fy - y0) * (fy - y0) * (3 - 2 * (fy - y0));
      const at = (i, j) => grid[wrapIndex(j, cells) * cells + wrapIndex(i, cells)];
      const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
      const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
      return top + (bottom - top) * sy;
    };
  };
  const mottle = [[lattice(4), 0.5], [lattice(8), 0.3], [lattice(16), 0.2]];
  const fine = lattice(128);
  const canvas = canvasOf(size);
  const context = canvas.getContext('2d');
  const image = context.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const m = mottle.reduce((sum, [layer, weight]) => sum + layer(x, y) * weight, 0);
      const tone = (m - 0.5) * 34 + (fine(x, y) - 0.5) * 16;
      const i = (y * size + x) * 4;
      image.data[i] = 176 + tone;
      image.data[i + 1] = 126 + tone * 0.86;
      image.data[i + 2] = 78 + tone * 0.7;
      image.data[i + 3] = 255;
    }
    if (y % 32 === 31) yield;
  }
  context.putImageData(image, 0, 0);

  // Marks near an edge are drawn again across it, so the tile repeats without seams.
  const wrapped = (x, y, reach, draw) => {
    [-size, 0, size].forEach((ox) => {
      [-size, 0, size].forEach((oy) => {
        if (x + ox > -reach && x + ox < size + reach && y + oy > -reach && y + oy < size + reach) draw(x + ox, y + oy);
      });
    });
  };
  const tones = ['122, 82, 44', '146, 100, 58', '196, 148, 96', '214, 170, 116', '104, 68, 36', '228, 188, 136', '160, 112, 66'];
  for (let k = 0; k < 9000; k += 1) {
    const x = random() * size;
    const y = random() * size;
    const r = 0.7 + random() * random() * 3.4;
    const color = `rgba(${tones[Math.floor(random() * tones.length)]}, ${0.35 + random() * 0.5})`;
    const sides = 5 + Math.floor(random() * 4);
    const turn = random() * Math.PI * 2;
    const points = [];
    for (let s = 0; s < sides; s += 1) {
      const a = turn + (s / sides) * Math.PI * 2;
      const rr = r * (0.55 + random() * 0.6);
      points.push([Math.cos(a) * rr, Math.sin(a) * rr * (0.7 + random() * 0.5)]);
    }
    wrapped(x, y, r + 2, (px, py) => {
      context.beginPath();
      points.forEach(([dx, dy], index) => (index ? context.lineTo(px + dx, py + dy) : context.moveTo(px + dx, py + dy)));
      context.fillStyle = color;
      context.fill();
    });
    if (k % 300 === 299) yield;
  }
  for (let k = 0; k < 2600; k += 1) {
    const x = random() * size;
    const y = random() * size;
    const r = 0.35 + random() * 0.9;
    const alpha = 0.25 + random() * 0.45;
    const squash = 0.6 + random() * 0.6;
    const turn = random() * Math.PI;
    wrapped(x, y, 2, (px, py) => {
      context.beginPath();
      context.ellipse(px, py, r, r * squash, turn, 0, Math.PI * 2);
      context.fillStyle = `rgba(58, 34, 16, ${alpha})`;
      context.fill();
    });
    if (k % 400 === 399) yield;
  }
  for (let k = 0; k < 26; k += 1) {
    const x = random() * size;
    const y = random() * size;
    wrapped(x, y, 3, (px, py) => {
      context.beginPath();
      context.arc(px, py, 1.1, 0, Math.PI * 2);
      context.fillStyle = 'rgba(30, 18, 8, 0.75)';
      context.fill();
    });
  }
  return canvas;
}

/** Paper grain, drawn over each sheet's own colour: soft cloud, fine tooth and short fibres, a few percent dark or light. */
function* grain(size = 192) {
  const random = randomFrom(8491);
  const cloud = normalize(blur(noise(size, random), size, 9));
  yield;
  const tooth = normalize(noise(size, random));
  yield;
  let fibres = new Float32Array(size * size);
  for (let k = 0; k < 70; k += 1) {
    const x = random() * size;
    const y = random() * size;
    const length = 6 + Math.floor(random() * 16);
    const angle = random() * Math.PI;
    for (let t = 0; t < length; t += 1) {
      fibres[wrapIndex(Math.floor(y + t * Math.sin(angle)), size) * size + wrapIndex(Math.floor(x + t * Math.cos(angle)), size)] += 1;
    }
  }
  fibres = normalize(blur(fibres, size, 1));
  yield;
  const canvas = canvasOf(size);
  const context = canvas.getContext('2d');
  const image = context.createImageData(size, size);
  for (let i = 0; i < size * size; i += 1) {
    const value = cloud[i] * 0.55 + tooth[i] * 0.45 - fibres[i] * 0.35;
    const dark = value > 0;
    image.data[i * 4] = dark ? 60 : 255;
    image.data[i * 4 + 1] = dark ? 45 : 255;
    image.data[i * 4 + 2] = dark ? 30 : 250;
    image.data[i * 4 + 3] = Math.min(20, dark ? value * 9 : -value * 7);
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

/** A rubber stamp's ink: mostly solid, worn through in patches, with pinholes where the rubber missed. */
function* wear(size = 256) {
  const random = randomFrom(1923);
  const worn = normalize(blur(noise(size, random), size, 6));
  yield;
  let alpha = new Float32Array(size * size);
  for (let i = 0; i < alpha.length; i += 1) {
    const pin = random();
    alpha[i] = pin > 0.993 || worn[i] > 1.7 ? 0 : worn[i] > 1.05 && pin > 0.6 ? 0.45 : 1;
  }
  alpha = blur(alpha, size, 1);
  yield;
  const canvas = canvasOf(size);
  const context = canvas.getContext('2d');
  const image = context.createImageData(size, size);
  for (let i = 0; i < alpha.length; i += 1) image.data[i * 4 + 3] = Math.min(1, alpha[i] * 0.92 + 0.04) * 255;
  context.putImageData(image, 0, 0);
  return canvas;
}

/**
 * Runs a texture's steps (a generator) in slices of about 8ms while the browser
 * is idle, so making it never holds up scrolling; resolves with the canvas.
 */
function runIdle(steps) {
  return new Promise((resolve, reject) => {
    const later = () => (window.requestIdleCallback ? window.requestIdleCallback(slice, { timeout: 500 }) : setTimeout(slice, 30));
    function slice() {
      try {
        const end = performance.now() + 8;
        do {
          const step = steps.next();
          if (step.done) {
            resolve(step.value);
            return;
          }
        } while (performance.now() < end);
        later();
      } catch (error) {
        reject(error);
      }
    }
    later();
  });
}

/** The three textures, made one after another; resolves with their object URLs. */
async function makeTextures() {
  const grainUrl = await urlOf(await runIdle(grain()), 'image/png');
  const wearUrl = await urlOf(await runIdle(wear()), 'image/png');
  const corkUrl = await urlOf(await runIdle(cork()), 'image/webp', 0.74);
  return { grain: grainUrl, wear: wearUrl, cork: corkUrl };
}

/**
 * Sets the textures on the element in `ref` once they're made (once per visit),
 * all together: each one restyles the whole board, so the page restyles once.
 */
export function useTextures(ref) {
  useEffect(() => {
    let alive = true;
    if (!pending) pending = makeTextures();
    pending
      .then((urls) => {
        const root = ref.current;
        if (!alive || !root) return;
        Object.entries(urls).forEach(([name, url]) => {
          if (url) root.style.setProperty(`--${name}`, `url(${url})`);
        });
      })
      .catch(() => {
        // Without a canvas the plain colours stay; nothing else depends on the textures.
      });
    return () => {
      alive = false;
    };
  }, [ref]);
}
