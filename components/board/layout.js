import { NAVIGATION, PROFILE } from '../../utils/json/constants';

// Case Board's model and layouts. Every part of the site is an item pinned to
// the board; strings tie related items; the camera's shots are computed from the
// same boxes. Nothing here names a company or a technology: positions follow
// from experience.json alone, and only + - * /, sqrt, sin/cos of fixed angles,
// min, max and rounding are used, so the server and the browser agree exactly.
//
// Two layouts: 'l' (landscape screens) rings the five exhibits around the
// subject on one wide board; 'p' (portrait screens) deals the same items into
// three staggered lanes on a tall board. CSS picks one with the same media query
// as LAYOUT_QUERY below.

export const LAYOUT_QUERY = '(min-width: 900px) and (min-height: 600px) and (min-aspect-ratio: 1/1)';

// --- Kinship: which roles and technologies belong together -----------------------

const STOP_WORDS = new Set(['corporation', 'corp', 'inc', 'ltd', 'llc', 'company', 'co', 'group', 'the', 'of', 'and']);
const key = (text) => String(text || '').trim().toLowerCase();
const slug = (text) => key(text).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const techNodeId = (name) => `tech-${slug(name)}`;
const companyWords = (name) => key(name).replace(/[^a-z0-9]+/g, ' ').split(' ').filter((word) => word && !STOP_WORDS.has(word));
const sameCompany = (a, b) => key(a.company) === key(b.company);
const shareCompanyWord = (a, b) => {
  const theirs = companyWords(b.company);
  return companyWords(a.company).some((word) => theirs.includes(word));
};
/** "React" and "React Native": one name is a whole-word prefix of the other. */
const techKin = (a, b) => {
  const x = key(a);
  const y = key(b);
  return x !== y && (x.startsWith(`${y} `) || y.startsWith(`${x} `));
};
const stackKeys = (item) => (item.techStack || []).map((tech) => key(tech.name));

/** How alike two roles are: same company 3, a shared company word 1.5, +1 per shared technology, +0.5 per related pair. */
const kinship = (a, b) => {
  let score = sameCompany(a, b) ? 3 : shareCompanyWord(a, b) ? 1.5 : 0;
  const theirs = stackKeys(b);
  stackKeys(a).forEach((name) => {
    if (theirs.includes(name)) score += 1;
    theirs.forEach((other) => {
      if (techKin(name, other)) score += 0.5;
    });
  });
  return score;
};

/** Reading order that keeps kin adjacent: the most recent role first, then always the closest remaining kin. */
export const kinChain = (experiences) => {
  if (!experiences.length) return [];
  const rest = experiences.slice(1);
  const chain = [experiences[0]];
  while (rest.length) {
    const last = chain[chain.length - 1];
    let best = 0;
    let bestScore = -1;
    rest.forEach((item, index) => {
      const score = kinship(last, item);
      if (score > bestScore) {
        best = index;
        bestScore = score;
      }
    });
    chain.push(rest.splice(best, 1)[0]);
  }
  return chain;
};

/** Each technology once, with the roles (ids) that used it, in chain order. */
function collectTechs(chain) {
  const techs = [];
  const byId = new Map();
  const introducedBy = {};
  chain.forEach((item) => {
    introducedBy[item.id] = [];
    (item.techStack || []).forEach((tech) => {
      const id = techNodeId(tech.name);
      if (!byId.has(id)) {
        const entry = { ...tech, id, owners: [] };
        byId.set(id, entry);
        techs.push(entry);
        introducedBy[item.id].push(entry);
      }
      const entry = byId.get(id);
      if (!entry.owners.includes(item.id)) entry.owners.push(item.id);
    });
  });
  return { techs, introducedBy };
}

const pairsOf = (list, related) => list.flatMap((a, i) => list.slice(i + 1).filter((b) => related(a, b)).map((b) => [a, b]));

// --- Placement helpers -------------------------------------------------------------

/** Lines a greedy word wrap needs for `text` in `width` px at an average glyph width of `glyph` px. */
function wrapLines(text, width, glyph) {
  let lines = 1;
  let used = 0;
  String(text || '').split(/\s+/).filter(Boolean).forEach((word) => {
    const span = word.length * glyph;
    if (used === 0) used = span;
    else if (used + glyph + span <= width) used += glyph + span;
    else {
      lines += 1;
      used = span;
    }
  });
  return lines;
}

/** A repeatable offset in [-amp, amp] for an id (FNV-1a), so placement reads as made by hand. */
const jitter = (id, amp, salt) => {
  const text = `${id}:${salt}`;
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619) >>> 0;
  return ((h % 2001) / 1000 - 1) * amp;
};

/**
 * Settles loose boxes ({ x, y, w, h }): each is pulled toward where its template
 * put it while overlapping boxes push each other apart (keeping `pad` between
 * them) inside S.W x S.H with S.margin. Boxes in `pinned` never move; the last
 * rounds only separate. Rounds to whole pixels.
 */
function relax(boxes, pinned, S, minY, pad, rounds) {
  const ids = Object.keys(boxes);
  const targets = {};
  ids.forEach((id) => {
    targets[id] = { x: boxes[id].x, y: boxes[id].y };
  });
  for (let round = 0; round < rounds; round += 1) {
    const spring = round < rounds - 50 ? 0.06 : 0;
    ids.forEach((id) => {
      if (pinned.has(id)) return;
      const box = boxes[id];
      box.x += (targets[id].x - box.x) * spring;
      box.y += (targets[id].y - box.y) * spring;
    });
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const a = boxes[ids[i]];
        const b = boxes[ids[j]];
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) + pad;
        const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) + pad;
        const pinA = pinned.has(ids[i]);
        const pinB = pinned.has(ids[j]);
        if (ox <= 0 || oy <= 0 || (pinA && pinB)) continue;
        const shareA = pinA ? 0 : pinB ? 1 : 0.5;
        const shareB = 1 - shareA;
        if (ox < oy) {
          const dir = a.x + a.w / 2 <= b.x + b.w / 2 ? -1 : 1;
          a.x += dir * ox * shareA;
          b.x -= dir * ox * shareB;
        } else {
          const dir = a.y + a.h / 2 <= b.y + b.h / 2 ? -1 : 1;
          a.y += dir * oy * shareA;
          b.y -= dir * oy * shareB;
        }
      }
    }
    ids.forEach((id) => {
      if (pinned.has(id)) return;
      const box = boxes[id];
      box.x = Math.min(Math.max(box.x, S.margin), S.W - S.margin - box.w);
      box.y = Math.min(Math.max(box.y, minY), S.H - S.margin - box.h);
    });
  }
  ids.forEach((id) => {
    boxes[id].x = Math.round(boxes[id].x);
    boxes[id].y = Math.round(boxes[id].y);
    boxes[id].w = Math.round(boxes[id].w);
    boxes[id].h = Math.ceil(boxes[id].h);
  });
}

/** The smallest box around `boxes` (a list). */
function boundsOf(boxes) {
  const x0 = Math.min(...boxes.map((b) => b.x));
  const y0 = Math.min(...boxes.map((b) => b.y));
  const x1 = Math.max(...boxes.map((b) => b.x + b.w));
  const y1 = Math.max(...boxes.map((b) => b.y + b.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

// Average glyph widths in em, measured in Chrome: Courier Prime is monospaced;
// tape is uppercase Barlow Condensed (0.53-0.6em with its tracking), with slack
// so a label never clips when the camera renders it at a fractional scale.
const EM = { typed: 0.6, marker: 0.55, tape: 0.5 };

const SPECS = {
  l: {
    margin: 150,
    polaroid: { w: 380, h: 500 },
    profile: { w: 560, padX: 40, padTop: 34, head: 66, size: 20, line: 30, gap: 14, padBottom: 40 },
    resume: { w: 330, h: 228 },
    link: { w: 300, h: 132 },
    card: { w: 420, padX: 30, padTop: 22, stamp: 38, title: 22, titleLine: 28, titleGap: 10, company: 28, companyLine: 36, companyGap: 4, date: 18, dateLine: 26, linkGap: 14, linkLine: 26, padBottom: 26 },
    logo: { w: 232, h: 252 },
    desc: { w: 500, padX: 36, padTop: 36, size: 19, line: 28, padBottom: 40 },
    tech: { h: 50, size: 20, track: 0.12, pin: 40, logo: 32, gap: 10, padR: 20 },
    contact: { w: 760, h: 600 },
    ring: { rx: 1690, ry: 880 },
    cluster: { gap: 34, descDrop: 26, logoInset: 70 },
    techPull: 0.56,
    techPullShared: 0.8,
    techRowGap: 18,
    techColGap: 22,
  },
  p: {
    margin: 70,
    lane: { w: 470, gap: 40, stagger: 210, blockGap: 70 },
    polaroid: { w: 400, h: 526 },
    profile: { w: 460, padX: 32, padTop: 30, head: 62, size: 20, line: 31, gap: 14, padBottom: 36 },
    resume: { w: 360, h: 240 },
    link: { w: 320, h: 140 },
    card: { w: 460, padX: 28, padTop: 22, stamp: 38, title: 22, titleLine: 29, titleGap: 10, company: 30, companyLine: 38, companyGap: 4, date: 20, dateLine: 28, linkGap: 14, linkLine: 28, padBottom: 26 },
    logo: { w: 260, h: 280 },
    desc: { w: 460, padX: 30, padTop: 32, size: 20, line: 30, padBottom: 34 },
    tech: { h: 52, size: 21, track: 0.12, pin: 40, logo: 34, gap: 10, padR: 20 },
    contact: { w: 460, h: 640 },
    techRowGap: 22,
    techColGap: 16,
  },
};

// Tilt by kind, in degrees: how each kind of paper tends to get pinned. Tape is
// long and pinned through one end, so it hangs nearly level.
const TILT = { subject: -3.2, profile: 1.1, resume: -3.6, link: 2.6, role: 2.2, picture: 4.2, desc: 1.5, tech: 1.5, contact: 1.4 };

export const letterOf = (index) => String.fromCharCode(65 + (index % 26));

// --- Sizes ---------------------------------------------------------------------

const profileHeight = (c) => {
  const width = c.w - 2 * c.padX;
  const lines = PROFILE.BRIEF.reduce((sum, paragraph) => sum + wrapLines(paragraph, width, EM.typed * c.size), 0);
  return Math.ceil(c.padTop + c.head + lines * c.line + c.gap * (PROFILE.BRIEF.length - 1) + c.padBottom);
};

const cardHeight = (c, item) => {
  const width = c.w - 2 * c.padX;
  const title = wrapLines(String(item.position).toUpperCase(), width, EM.typed * c.title);
  const company = wrapLines(item.company, width, EM.marker * c.company * 1.06);
  const dates = item.dateRange ? wrapLines(item.dateRange, width, EM.typed * c.date) : 0;
  return Math.ceil(c.padTop + c.stamp + title * c.titleLine + c.titleGap + company * c.companyLine + c.companyGap + dates * c.dateLine + c.linkGap + c.linkLine + c.padBottom);
};

const descHeight = (c, item) => {
  const lines = wrapLines(item.description, c.w - 2 * c.padX, EM.typed * c.size);
  return Math.ceil(c.padTop + lines * c.line + c.padBottom);
};

// A tape: the pin through its left end, the logo, then the embossed name.
const techWidth = (c, tech) => Math.ceil(c.pin + c.logo + c.gap + c.padR + 6 + String(tech.name).length * (EM.tape + c.track) * c.size);

const tiltOf = (id, kind) => {
  const base = TILT[kind] || 2;
  // Fixed tilts for the subject's pieces, jittered ones for everything else.
  if (kind === 'subject' || kind === 'profile' || kind === 'resume' || kind === 'contact') return base;
  return Math.round(jitter(id, base, 'tilt') * 10) / 10;
};

/** The pin: top centre, 16px in, turned with the paper about its centre. */
function anchorOf(box) {
  const rad = (box.r * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const dx = 0;
  const dy = -box.h / 2 + (box.kind === 'tech' ? box.h / 2 : 16);
  const ox = box.kind === 'tech' ? -box.w / 2 + 22 : dx;
  return { ax: Math.round(cx + ox * cos - dy * sin), ay: Math.round(cy + ox * sin + dy * cos) };
}

// --- Landscape: the ring -----------------------------------------------------

function layoutLandscape(S, parts) {
  const { chain, techs, nav, items } = parts;
  const boxes = {};
  const put = (id, x, y, w, h) => {
    boxes[id] = { x, y, w, h };
  };

  // The subject at the centre: the Polaroid, the profile beside it, and the
  // documents (résumé, links) tucked below them.
  const pol = S.polaroid;
  const profH = profileHeight(S.profile);
  const groupW = pol.w + 46 + S.profile.w;
  const top = -Math.max(pol.h, profH) / 2 - 70;
  put('subject', -groupW / 2, top, pol.w, pol.h);
  put('profile', -groupW / 2 + pol.w + 46, top + 18, S.profile.w, profH);
  put('resume', boxes.profile.x + 150, boxes.profile.y + profH + 34, S.resume.w, S.resume.h);
  nav.forEach((link, index) => {
    put(link.id, boxes.subject.x - 30 + index * 150, boxes.subject.y + pol.h + 30 + index * 64, S.link.w, S.link.h);
  });

  // Exhibits and the contact pad around an ellipse, in kin order, clockwise
  // from the upper left; the contact pad closes the ring.
  const C = S.cluster;
  const slots = chain.length + 1;
  const step = 360 / slots;
  const centreOf = (index) => {
    const angle = ((-90 - step + index * step) * Math.PI) / 180;
    return { x: S.ring.rx * Math.cos(angle), y: S.ring.ry * Math.sin(angle) };
  };
  const clusterCentres = {};
  chain.forEach((item, index) => {
    const centre = centreOf(index);
    const card = { w: S.card.w, h: cardHeight(S.card, item) };
    const desc = { w: S.desc.w, h: descHeight(S.desc, item) };
    const logo = { w: S.logo.w, h: S.logo.h };
    const width = card.w + C.gap + desc.w;
    const height = Math.max(card.h + C.gap + logo.h, C.descDrop + desc.h);
    const ox = centre.x - width / 2;
    const oy = centre.y - height / 2;
    put(`role-${item.id}`, ox + jitter(item.id, 10, 'cx'), oy + jitter(item.id, 8, 'cy'), card.w, card.h);
    put(`desc-${item.id}`, ox + card.w + C.gap + jitter(item.id, 8, 'dx'), oy + C.descDrop + jitter(item.id, 8, 'dy'), desc.w, desc.h);
    put(`pic-${item.id}`, ox + C.logoInset + jitter(item.id, 14, 'lx'), oy + card.h + C.gap + jitter(item.id, 6, 'ly'), logo.w, logo.h);
    clusterCentres[item.id] = centre;
  });
  const contactCentre = centreOf(chain.length);
  put('contact', contactCentre.x - S.contact.w / 2, contactCentre.y - S.contact.h / 2, S.contact.w, S.contact.h);

  // Technologies hang between the subject and the exhibits that used them,
  // nearest the exhibit that brought them to the board (its camera shot takes in
  // its tapes); a shared technology leans toward its other owners too.
  // Technologies with the same owners form a small block, two to a row.
  const groups = new Map();
  techs.forEach((tech) => {
    const key = tech.owners.join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(tech);
  });
  groups.forEach((members) => {
    const owners = members[0].owners.map((id) => clusterCentres[id]);
    const weights = owners.map((_, index) => (index === 0 ? 2 : 1));
    const total = weights.reduce((sum, w) => sum + w, 0);
    const mx = owners.reduce((sum, c, index) => sum + c.x * weights[index], 0) / total;
    const my = owners.reduce((sum, c, index) => sum + c.y * weights[index], 0) / total;
    const pull = owners.length > 1 ? S.techPullShared : S.techPull;
    const tx = mx * pull;
    const ty = my * pull;
    const sized = members.map((tech) => ({ tech, w: techWidth(S.tech, tech), h: S.tech.h }));
    const rows = [];
    for (let i = 0; i < sized.length; i += 2) rows.push(sized.slice(i, i + 2));
    const blockH = rows.length * S.tech.h + (rows.length - 1) * S.techRowGap;
    rows.forEach((row, r) => {
      const rowW = row.reduce((sum, entry) => sum + entry.w, 0) + (row.length - 1) * S.techColGap;
      let x = tx - rowW / 2 + (r % 2 ? 26 : -26);
      row.forEach((entry) => {
        put(entry.tech.id, x, ty - blockH / 2 + r * (S.tech.h + S.techRowGap), entry.w, entry.h);
        x += entry.w + S.techColGap;
      });
    });
  });

  return finish(S, boxes, items, (pinned) => {
    Object.keys(boxes).forEach((id) => {
      const kind = items[id].kind;
      if (kind !== 'tech' && kind !== 'link' && kind !== 'resume') pinned.add(id);
    });
  });
}

// --- Portrait: three staggered lanes ------------------------------------------

function layoutPortrait(S, parts) {
  const { chain, nav, items, introducedBy } = parts;
  const L = S.lane;
  const boxes = {};
  const blocks = [];
  const laneX = (lane) => S.margin + lane * (L.w + L.gap);
  const bottoms = [0, 0, 0];
  let lane = 0;
  let previousY = -Infinity;

  // A block is a few items stacked in one lane; the camera frames one block per shot.
  const place = (name, stack) => {
    const height = stack.reduce((sum, entry) => sum + entry.h + (entry.gap || 0), 0);
    const y = Math.max(bottoms[lane] + (bottoms[lane] ? L.blockGap : S.margin), previousY + L.stagger);
    let cursor = y;
    stack.forEach((entry) => {
      cursor += entry.gap || 0;
      const x = laneX(lane) + (L.w - entry.w) / 2 + (entry.dx || 0) + jitter(entry.id, 10, 'px');
      boxes[entry.id] = { x, y: cursor, w: entry.w, h: entry.h };
      cursor += entry.h;
    });
    blocks.push({ name, ids: stack.map((entry) => entry.id) });
    bottoms[lane] = y + height;
    previousY = y;
    lane = (lane + 1) % 3;
  };

  place('subject', [{ id: 'subject', w: S.polaroid.w, h: S.polaroid.h }]);
  place('profile', [{ id: 'profile', w: S.profile.w, h: profileHeight(S.profile) }]);
  place('documents', [
    { id: 'resume', w: S.resume.w, h: S.resume.h },
    ...nav.map((link, index) => ({ id: link.id, w: S.link.w, h: S.link.h, gap: 34, dx: index % 2 ? 50 : -50 })),
  ]);
  chain.forEach((item) => {
    place(`exhibit-${item.id}`, [
      { id: `role-${item.id}`, w: S.card.w, h: cardHeight(S.card, item) },
      { id: `pic-${item.id}`, w: S.logo.w, h: S.logo.h, gap: 30, dx: 70 },
    ]);
    // The description, then the technologies this role brought to the board,
    // packed into rows no wider than the lane.
    const stack = [{ id: `desc-${item.id}`, w: S.desc.w, h: descHeight(S.desc, item) }];
    const rows = [];
    (introducedBy[item.id] || []).forEach((tech) => {
      const cell = { tech, w: techWidth(S.tech, tech) };
      const row = rows[rows.length - 1];
      if (row && row.w + S.techColGap + cell.w <= L.w) {
        row.cells.push(cell);
        row.w += S.techColGap + cell.w;
      } else {
        rows.push({ cells: [cell], w: cell.w });
      }
    });
    rows.forEach((row, index) => {
      stack.push({ id: `row-${row.cells[0].tech.id}`, w: row.w, h: S.tech.h, gap: index === 0 ? 34 : S.techRowGap, row: row.cells });
    });
    place(`facts-${item.id}`, stack);
    // Split each technology row back into its labels.
    stack.filter((entry) => entry.row).forEach((entry) => {
      const rowBox = boxes[entry.id];
      delete boxes[entry.id];
      let x = rowBox.x;
      entry.row.forEach((cell) => {
        boxes[cell.tech.id] = { x, y: rowBox.y + jitter(cell.tech.id, 4, 'py'), w: cell.w, h: S.tech.h };
        x += cell.w + S.techColGap;
      });
      const block = blocks[blocks.length - 1];
      block.ids = block.ids.filter((id) => id !== entry.id).concat(entry.row.map((cell) => cell.tech.id));
    });
  });
  place('contact', [{ id: 'contact', w: S.contact.w, h: S.contact.h }]);

  const layout = finish(S, boxes, items, (pinned) => {
    Object.keys(boxes).forEach((id) => pinned.add(id));
  });
  layout.blocks = blocks;
  return layout;
}

/** Shifts boxes onto the board (margin at the top left), settles loose ones, tilts them and sizes the board. */
function finish(S, boxes, items, pin) {
  const all = Object.values(boxes);
  const bounds = boundsOf(all);
  Object.values(boxes).forEach((box) => {
    box.x += S.margin - bounds.x;
    box.y += S.margin - bounds.y;
  });
  const W = Math.round(bounds.w + 2 * S.margin);
  const H = Math.round(bounds.h + 2 * S.margin);
  const pinned = new Set();
  pin(pinned);
  relax(boxes, pinned, { W, H, margin: S.margin * 0.6 }, S.margin * 0.6, 30, 300);
  const settled = boundsOf(Object.values(boxes));
  // Relaxing may push a loose item outward; grow the board to keep the margin.
  const growX = Math.max(0, S.margin - settled.x);
  const growY = Math.max(0, S.margin - settled.y);
  Object.values(boxes).forEach((box) => {
    box.x += growX;
    box.y += growY;
  });
  const width = Math.max(W, Math.round(settled.x + growX + settled.w + S.margin));
  const height = Math.max(H, Math.round(settled.y + growY + settled.h + S.margin));
  Object.entries(boxes).forEach(([id, box]) => {
    box.kind = items[id].kind;
    box.r = tiltOf(id, box.kind);
    Object.assign(box, anchorOf(box));
    delete box.kind;
  });
  return { W: width, H: height, boxes };
}

// --- Shots ---------------------------------------------------------------------

/**
 * The camera's shots, in scroll order. Each frames some items (or, when they
 * can't all be read at once, its `core`); `flash` fires a camera flash on
 * arrival (the subject, and the first exhibit of each new company), `focus`
 * names the item whose strings light up, `section` maps the shot to the page's
 * section anchors.
 */
function shotsLandscape(chain, techs, nav, leads, introducedBy) {
  const shots = [{ id: 'overview', label: 'The whole board', items: null, section: 'intro' }];
  shots.push({ id: 'subject', label: 'The subject', items: ['subject', 'profile'], flash: true, focus: 'subject', section: 'intro' });
  shots.push({ id: 'documents', label: 'Documents', items: ['resume', ...nav.map((link) => link.id)], section: 'intro' });
  chain.forEach((item, index) => {
    const core = [`role-${item.id}`, `pic-${item.id}`, `desc-${item.id}`];
    shots.push({
      id: `exhibit-${item.id}`,
      label: `Exhibit ${letterOf(index)}`,
      company: item.company,
      // The exhibit with the tapes it brought to the board; its red strings run
      // on to the tapes an earlier exhibit brought.
      items: [...core, ...(introducedBy[item.id] || []).map((tech) => tech.id)],
      core,
      flash: leads[index],
      focus: `role-${item.id}`,
      section: 'experience',
    });
  });
  if (techs.length) shots.push({ id: 'stack', label: 'The stack', items: techs.map((tech) => tech.id), section: 'experience', wide: true });
  shots.push({ id: 'contact', label: 'Make contact', items: ['contact'], section: 'contact' });
  return shots;
}

function shotsPortrait(chain, blocks, leads) {
  const shots = [{ id: 'overview', label: 'The whole board', items: null, section: 'intro' }];
  blocks.forEach((block) => {
    const exhibitIndex = chain.findIndex((item) => block.name === `exhibit-${item.id}`);
    const factsIndex = chain.findIndex((item) => block.name === `facts-${item.id}`);
    const index = exhibitIndex >= 0 ? exhibitIndex : factsIndex;
    const base = { id: block.name, items: block.ids, section: index >= 0 ? 'experience' : block.name === 'contact' ? 'contact' : 'intro' };
    if (block.name === 'subject') shots.push({ ...base, label: 'The subject', flash: true, focus: 'subject' });
    else if (block.name === 'profile') shots.push({ ...base, label: 'Profile', focus: 'subject' });
    else if (block.name === 'documents') shots.push({ ...base, label: 'Documents' });
    else if (block.name === 'contact') shots.push({ ...base, label: 'Make contact' });
    else if (exhibitIndex >= 0) {
      const item = chain[exhibitIndex];
      shots.push({ ...base, label: `Exhibit ${letterOf(exhibitIndex)}`, company: item.company, flash: leads[exhibitIndex], focus: `role-${item.id}` });
    } else {
      const item = chain[factsIndex];
      shots.push({ ...base, label: `Exhibit ${letterOf(factsIndex)}, notes`, company: item.company, focus: `role-${item.id}` });
    }
  });
  return shots;
}

/** The shots each section spans, in order: [{ section, first, count }]. */
export function sectionRanges(shots) {
  const ranges = [];
  shots.forEach((shot, index) => {
    const last = ranges[ranges.length - 1];
    if (last && last.section === shot.section) last.count += 1;
    else ranges.push({ section: shot.section, first: index, count: 1 });
  });
  return ranges;
}

// --- The board -------------------------------------------------------------------

/**
 * Everything Case Board renders: the role chain (kin adjacent), technologies,
 * links; items with a box per layout ({ x, y, w, h, r, ax, ay }); the strings;
 * and each layout's board size and shots.
 */
export function buildBoard(experiences) {
  const chain = kinChain(experiences || []);
  const nav = NAVIGATION.map((link) => ({ ...link, id: slug(link.name) }));
  const { techs, introducedBy } = collectTechs(chain);

  const items = {};
  const order = [];
  const add = (id, kind, data) => {
    items[id] = { kind, data };
    order.push(id);
  };
  add('subject', 'subject');
  add('profile', 'profile');
  add('resume', 'resume');
  nav.forEach((link) => add(link.id, 'link', link));
  chain.forEach((item, index) => {
    add(`role-${item.id}`, 'role', { ...item, letter: letterOf(index) });
    add(`pic-${item.id}`, 'picture', item);
    add(`desc-${item.id}`, 'desc', item);
    (introducedBy[item.id] || []).forEach((tech) => add(tech.id, 'tech', tech));
  });
  add('contact', 'contact');

  // A new lead: the first exhibit, and any exhibit not kin to the one before it.
  const leads = chain.map((item, index) => index === 0 || !(sameCompany(chain[index - 1], item) || shareCompanyWord(chain[index - 1], item)));

  // Strings: black cotton for the trail the camera follows (subject, each exhibit
  // in turn, then the contact pad) and for an item's own papers; red wool from a
  // role to each technology it used; navy for kin (same company, related tech).
  // One string per pair of pins: where the trail joins two kin exhibits, it's navy.
  const edges = [];
  const byPair = new Map();
  const tie = (from, to, kind) => {
    if (!items[from] || !items[to]) return;
    const pair = from < to ? `${from}|${to}` : `${to}|${from}`;
    const existing = byPair.get(pair);
    if (existing) {
      if (kind === 'kin') existing.kind = 'kin';
      return;
    }
    const edge = { id: `${from}>${to}`, from, to, kind };
    byPair.set(pair, edge);
    edges.push(edge);
  };
  const trail = ['subject', ...chain.map((item) => `role-${item.id}`), 'contact'];
  for (let i = 1; i < trail.length; i += 1) tie(trail[i - 1], trail[i], 'trail');
  tie('profile', 'resume', 'tie');
  nav.forEach((link) => tie('subject', link.id, 'tie'));
  chain.forEach((item) => {
    tie(`role-${item.id}`, `pic-${item.id}`, 'tie');
    tie(`role-${item.id}`, `desc-${item.id}`, 'tie');
    (item.techStack || []).forEach((tech) => tie(`role-${item.id}`, techNodeId(tech.name), 'uses'));
  });
  pairsOf(chain, (a, b) => sameCompany(a, b) || shareCompanyWord(a, b)).forEach(([a, b]) => tie(`role-${a.id}`, `role-${b.id}`, 'kin'));
  pairsOf(techs, (a, b) => techKin(a.name, b.name)).forEach(([a, b]) => tie(a.id, b.id, 'kin'));

  const parts = { chain, techs, nav, items, introducedBy };
  const land = layoutLandscape(SPECS.l, parts);
  const port = layoutPortrait(SPECS.p, parts);
  Object.keys(items).forEach((id) => {
    items[id].l = land.boxes[id];
    items[id].p = port.boxes[id];
  });

  const layouts = {
    l: { W: land.W, H: land.H, shots: shotsLandscape(chain, techs, nav, leads, introducedBy) },
    p: { W: port.W, H: port.H, shots: shotsPortrait(chain, port.blocks, leads) },
  };

  const adjacency = {};
  edges.forEach((edge) => {
    (adjacency[edge.from] = adjacency[edge.from] || []).push(edge.to);
    (adjacency[edge.to] = adjacency[edge.to] || []).push(edge.from);
  });

  return { chain, techs, nav, items, order, edges, adjacency, layouts };
}
