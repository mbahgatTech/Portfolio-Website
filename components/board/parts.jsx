import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { NAVIGATION, PROFILE, SEO } from '../../utils/json/constants';
import styles from './Board.module.css';

// The pieces pinned to Case Board, and its chrome. Each piece is a real object:
// a Polaroid, a typed sheet, a kraft envelope, index cards, a glossy print, an
// onionskin carbon, label-maker tape and a legal pad.

export const cx = (...names) => names.filter(Boolean).join(' ');
const px = (value) => `${Math.round(value * 10) / 10}px`;
const pad2 = (n) => String(n).padStart(2, '0');

// globals.css paints the page ground and scrollbar for the previous design; the
// board's pages repaint both in the board's own colours.
const PAGE_STYLE =
  'html,body{background:#1d1a17}html{scrollbar-color:#6b5a45 #15100b}' +
  '::-webkit-scrollbar-track{background:#15100b}::-webkit-scrollbar-thumb{background:#6b5a45;border-color:#15100b}';
export const PageStyle = () => <style dangerouslySetInnerHTML={{ __html: PAGE_STYLE }} />;

/** CSS variables placing an item in both layouts; the stylesheet picks one. */
function placeVars(item) {
  const vars = {};
  [['l', item.l], ['p', item.p]].forEach(([key, box]) => {
    if (!box) return;
    vars[`--${key}x`] = px(box.x);
    vars[`--${key}y`] = px(box.y);
    vars[`--${key}w`] = px(box.w);
    vars[`--${key}h`] = px(box.h);
    vars[`--${key}r`] = `${box.r}deg`;
  });
  return vars;
}

/** A piece on the board, placed from its layout boxes. */
export function Item({ board, id, className, children }) {
  const item = board.items[id];
  return (
    <div data-board-item={id} className={cx(styles.item, className)} style={placeVars(item)}>
      {children}
    </div>
  );
}

/** The subject: a Polaroid of the profile photo, cropped by CSS to head and shoulders. */
export function Polaroid() {
  return (
    <figure className={styles.polaroid}>
      <div className={styles.photo}>
        <Image
          src={SEO.IMAGE.PATH}
          alt={SEO.IMAGE.ALT}
          width={SEO.IMAGE.WIDTH}
          height={SEO.IMAGE.HEIGHT}
          priority
          sizes="640px"
          className={styles.photoImage}
        />
        <span className={styles.gloss} aria-hidden="true" />
      </div>
      <figcaption className={styles.caption}>
        <h1 className={styles.name}>{PROFILE.MAZEN_BAHGAT}</h1>
        <p className={styles.jobTitle}>{PROFILE.JOB_TITLE}</p>
      </figcaption>
    </figure>
  );
}

export function ProfileSheet() {
  return (
    <div className={styles.sheet}>
      <h2 className={styles.sheetHead}>Profile</h2>
      {PROFILE.BRIEF.map((sentence) => (
        <p key={sentence}>{sentence}</p>
      ))}
    </div>
  );
}

export function Envelope() {
  return (
    <a href="/resume.pdf" download className={styles.envelope}>
      <span className={styles.flap} aria-hidden="true" />
      <span className={styles.envLabel}>
        <span className={styles.envKicker} aria-hidden="true">PDF</span>
        <span className={styles.envText}>{PROFILE.RESUME_BUTTON}</span>
      </span>
    </a>
  );
}

export function LinkCard({ link }) {
  const where = link.href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  return (
    <a href={link.href} target="_blank" rel="noreferrer" className={styles.linkCard}>
      <span className={styles.linkName}>{link.name}</span>
      <span className={styles.linkWhere}>{where}</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function ExhibitCard({ item }) {
  return (
    <div className={styles.exhibitCard}>
      <p className={styles.stamp}>Exhibit {item.letter}</p>
      <h3 id={`board-role-${item.id}`} className={styles.position}>{item.position}</h3>
      <p className={styles.company}>{item.company}</p>
      {item.dateRange && <p className={styles.dates}>{item.dateRange}</p>}
      <Link href={item.report} className={styles.fileLink}>
        Open the case file<span className="sr-only"> for {item.position} at {item.company}</span>
        <span aria-hidden="true"> &rarr;</span>
      </Link>
    </div>
  );
}

/** "May 2024 - July 2024" -> "MAY '24": the date a camera would print on the photo. */
export const stampOf = (dateRange) => {
  const match = String(dateRange || '').match(/([A-Za-z]{3})[A-Za-z]*\.?\s+(\d{2})(\d{2})/);
  return match ? `${match[1].toUpperCase()} '${match[3]}` : null;
};

export function EvidencePrint({ item, eager = false }) {
  const stamp = stampOf(item.dateRange);
  return (
    <figure className={styles.print}>
      <div className={styles.printWindow}>
        <Image src={item.image} alt={item.alt} width={160} height={160} loading={eager ? 'eager' : undefined} className={styles.printLogo} />
        {stamp && <span className={styles.dateStamp} aria-hidden="true">{stamp}</span>}
      </div>
      <figcaption className={styles.printMark} aria-hidden="true">{item.letter}</figcaption>
    </figure>
  );
}

// Figures in a note (75%) get circled in red marker, the way an investigator would.
const FIGURE = /(\d+(?:\.\d+)?%)/;

export function Onionskin({ item }) {
  const parts = String(item.description).split(FIGURE);
  return (
    <div className={styles.onion}>
      <p>{parts.map((part, index) => (index % 2 ? <mark key={index} className={styles.circled}>{part}</mark> : part))}</p>
    </div>
  );
}

export function Tape({ tech, eager = false }) {
  return (
    <a href={tech.link} target="_blank" rel="noreferrer" className={styles.tape}>
      <span className={styles.tapeLogo}>
        <Image src={tech.source} alt="" width={26} height={26} loading={eager ? 'eager' : undefined} />
      </span>
      <span className={styles.tapeText}>{tech.name}</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** Two-digit frame number, as printed on the edge of film. */
const frameNumber = (index) => pad2(index + 1);

/**
 * The shot list as a strip of film, for wide screens: every frame the camera
 * takes. On a short screen the strip scrolls itself (the wheel scrolls it, not
 * the page) and keeps the camera's frame in view.
 */
export function FilmStrip({ shots, active, onPick }) {
  const stripRef = useRef(null);
  useEffect(() => {
    const strip = stripRef.current;
    const frame = strip && strip.querySelectorAll('li')[active];
    if (!frame || strip.scrollHeight <= strip.clientHeight) return;
    const above = frame.offsetTop - 12;
    const below = frame.offsetTop + frame.offsetHeight + 12 - strip.clientHeight;
    if (strip.scrollTop > above) strip.scrollTo({ top: above, behavior: 'smooth' });
    else if (strip.scrollTop < below) strip.scrollTo({ top: below, behavior: 'smooth' });
  }, [active]);

  return (
    <nav ref={stripRef} className={styles.film} aria-label="Shots" data-lenis-prevent>
      <p className={styles.filmEdge} aria-hidden="true">CASE&nbsp;FILM&nbsp;&middot;&nbsp;{pad2(shots.length)}&nbsp;EXP</p>
      <ol className={styles.frames}>
        {shots.map((shot, index) => (
          <li key={shot.id}>
            <button type="button" className={styles.frame} aria-current={index === active ? 'step' : undefined} onClick={() => onPick(index)}>
              <span className={styles.frameNumber} aria-hidden="true">{frameNumber(index)}</span>
              <span className={styles.frameText}>
                <span className={styles.frameLabel}>{shot.label}</span>
                {shot.company && <span className={styles.frameDetail}>{shot.company}</span>}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** The shot list folded into one bar, for narrower screens: back, where the camera is, on. */
export function ShotBar({ shots, active, onPick }) {
  const current = shots[Math.min(active, shots.length - 1)] || shots[0];
  const detail = current.company || (active === 0 ? 'Scroll to investigate' : null);
  return (
    <nav className={styles.bar} aria-label="Shots">
      <button type="button" className={styles.barStep} onClick={() => onPick(active - 1)} disabled={active <= 0}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        <span className="sr-only">Previous shot</span>
      </button>
      <p className={styles.barReadout} role="status" aria-live="polite" aria-atomic="true">
        <span className={styles.barCount} aria-hidden="true">{frameNumber(active)}/{pad2(shots.length)}</span>
        <span className="sr-only">Shot {active + 1} of {shots.length}: </span>
        <span className={styles.barLabel}>{current.label}</span>
        {detail && <span className={styles.barDetail}>{detail}</span>}
      </p>
      <button type="button" className={styles.barStep} onClick={() => onPick(active + 1)} disabled={active >= shots.length - 1}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        <span className="sr-only">Next shot</span>
      </button>
    </nav>
  );
}

export function Colophon() {
  return (
    <footer className={styles.colophon}>
      <p>
        <strong>{PROFILE.MAZEN_BAHGAT}</strong>
        {NAVIGATION.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
            {link.name}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ))}
      </p>
    </footer>
  );
}
