import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useLenis } from 'lenis/react';
import { useReduceMotion } from '../ui/motion';
import { buildBoard, sectionRanges } from './layout';
import { useBoardCamera } from './camera';
import { useBoardHighlight } from './highlight';
import { useTextures } from './textures';
import { ContactForm, ConfirmDialog, MessageStatus, useMessageFlow } from './Contact';
import { Pins, Strings } from './Yarn';
import { marker, tape, typed } from './fonts';
import {
  Colophon, Envelope, EvidencePrint, ExhibitCard, FilmStrip, Item, LinkCard, Onionskin, PageStyle, Polaroid,
  ProfileSheet, ShotBar, Tape, cx,
} from './parts';
import styles from './Board.module.css';

const Atmosphere = dynamic(() => import('./Atmosphere'), { ssr: false });

// Sections a link can jump to.
const ANCHORS = ['experience', 'contact'];

// Runs as the page is parsed, before first paint: with motion allowed, the board
// opens straight into camera mode, framed from the viewport size.
const BOOT = `(function(){var h=document.documentElement,s=document.currentScript;h.style.setProperty('--vpw',innerWidth);h.style.setProperty('--vph',innerHeight);try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)s.parentNode.setAttribute('data-mode','camera')}catch(e){}})();`;

// False while hydrating the server's HTML, true from then on (and on client-side mounts).
const subscribeNever = () => () => {};
const useHydrated = () => useSyncExternalStore(subscribeNever, () => true, () => false);

/**
 * The home page as an evidence board. With motion allowed, a camera works
 * through it as the page scrolls (data-mode="camera"); otherwise the same pieces
 * are laid out to read top to bottom (data-mode="flow"). The server renders flow;
 * BOOT switches to camera before first paint, and React agrees once hydrated.
 */
export default function CaseBoard({ experiences }) {
  const board = useMemo(() => buildBoard(experiences), [experiences]);
  const hydrated = useHydrated();
  const reduceMotion = useReduceMotion();
  const camera = hydrated && !reduceMotion;
  const flow = useMessageFlow();

  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const rigRef = useRef(null);
  const stateRef = useRef({});
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;
  useTextures(rootRef);

  const [shot, setShot] = useState({ index: 0, key: 'l' });
  const highlight = useBoardHighlight(rootRef, board);
  const onShot = useCallback((index, current, key) => {
    setShot((prior) => (prior.index === index && prior.key === key ? prior : { index, key }));
    if (highlight.current) highlight.current.rest(current && current.focus);
  }, [highlight]);
  const controls = useBoardCamera({ enabled: camera, board, rootRef, trackRef, viewportRef, rigRef, stateRef, lenisRef, onShot });
  const pick = useCallback((index) => {
    if (controls.current) controls.current.goTo(index);
  }, [controls]);

  // Keyboard focus moves the camera to the piece it lands on. A click doesn't
  // (the piece is already in view), except into the contact form, to write.
  useEffect(() => {
    const root = rootRef.current;
    if (!camera || !root) return undefined;
    let pointerAt = -Infinity;
    const onPointerDown = () => {
      pointerAt = performance.now();
    };
    const onFocusIn = (event) => {
      const target = event.target;
      if (!target.closest('[data-board-item]')) return;
      const writing = target.matches('input, textarea, select');
      if (!writing && performance.now() - pointerAt < 700) return;
      if (controls.current) controls.current.reveal(target);
    };
    root.addEventListener('pointerdown', onPointerDown, true);
    root.addEventListener('focusin', onFocusIn);
    return () => {
      root.removeEventListener('pointerdown', onPointerDown, true);
      root.removeEventListener('focusin', onFocusIn);
    };
  }, [camera, controls]);

  const layoutVars = {
    '--W-l': board.layouts.l.W,
    '--H-l': board.layouts.l.H,
    '--W-p': board.layouts.p.W,
    '--H-p': board.layouts.p.H,
    '--shots-l': board.layouts.l.shots.length,
    '--shots-p': board.layouts.p.shots.length,
  };
  const ranges = {
    l: sectionRanges(board.layouts.l.shots),
    p: sectionRanges(board.layouts.p.shots),
  };
  const anchorVars = (name) => {
    const l = ranges.l.find((range) => range.section === name);
    const p = ranges.p.find((range) => range.section === name);
    return { '--l0': l.first, '--ln': l.count, '--p0': p.first, '--pn': p.count };
  };
  // In camera mode the scroll track's anchors carry the #experience and #contact
  // targets (the page's reading position is the camera's); otherwise the sections do.
  const anchorId = (name) => (camera ? undefined : name);

  const shotsInUse = board.layouts[shot.key].shots;
  const rootClass = cx(styles.root, typed.variable, marker.variable, tape.variable);

  return (
    // BOOT may already have switched data-mode to camera before React hydrates.
    <div ref={rootRef} data-mode={camera ? 'camera' : 'flow'} className={rootClass} style={layoutVars} suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <PageStyle />
      <a href="#main" className={styles.skipLink}>Skip to the evidence</a>

      <main id="main" className={styles.main}>
        <div ref={trackRef} className={styles.track}>
          {camera && (
            <div className={styles.anchors} aria-hidden="true">
              {ANCHORS.map((name) => (
                <span key={name} id={name} className={styles.anchor} style={anchorVars(name)} />
              ))}
            </div>
          )}
          <div ref={viewportRef} className={styles.viewport}>
            <div ref={rigRef} className={styles.rig}>
              <div className={styles.board} aria-hidden="true" />
              <Strings board={board} layoutKey="l" />
              <Strings board={board} layoutKey="p" />

              <section data-motion={reduceMotion ? 'reduce' : 'animate'} className={styles.intro} aria-label="The subject">
                <Item board={board} id="subject" className={styles.subjectItem}><Polaroid /></Item>
                <Item board={board} id="profile" className={styles.profileItem}><ProfileSheet /></Item>
                <Item board={board} id="resume" className={styles.resumeItem}><Envelope /></Item>
                {board.nav.map((link) => (
                  <Item key={link.id} board={board} id={link.id} className={styles.linkItem}><LinkCard link={link} /></Item>
                ))}
              </section>

              <section id={anchorId('experience')} className={styles.experience} aria-labelledby="board-exhibits-title">
                <h2 id="board-exhibits-title" className={styles.exhibitsTitle}>Exhibits</h2>
                {board.chain.map((role) => {
                  const item = board.items[`role-${role.id}`].data;
                  return (
                    <article key={role.id} className={styles.exhibit} aria-labelledby={`board-role-${role.id}`}>
                      <Item board={board} id={`role-${role.id}`} className={styles.roleItem}><ExhibitCard item={item} /></Item>
                      <Item board={board} id={`pic-${role.id}`} className={styles.printItem}><EvidencePrint item={item} eager={camera} /></Item>
                      <Item board={board} id={`desc-${role.id}`} className={styles.descItem}><Onionskin item={item} /></Item>
                      <p className="sr-only">Stack: {(role.techStack || []).map((tech) => tech.name).join(', ')}.</p>
                      {board.techs.filter((tech) => tech.owners[0] === role.id).map((tech) => (
                        <Item key={tech.id} board={board} id={tech.id} className={styles.techItem}><Tape tech={tech} eager={camera} /></Item>
                      ))}
                    </article>
                  );
                })}
              </section>

              <section id={anchorId('contact')} className={styles.contactSection} aria-labelledby="board-contact-title">
                <Item board={board} id="contact" className={styles.padItem}>
                  <div className={styles.pad}>
                    <span className={styles.padBinding} aria-hidden="true" />
                    <div className={styles.padSheet}>
                      <h2 id="board-contact-title" className={styles.padTitle}>Leave a message</h2>
                      <ContactForm flow={flow} />
                    </div>
                  </div>
                </Item>
              </section>

              <Pins board={board} layoutKey="l" />
              <Pins board={board} layoutKey="p" />
            </div>
            <span className={styles.vignette} aria-hidden="true" />
            {camera && <Atmosphere stateRef={stateRef} />}
            <p className={styles.cue} aria-hidden="true">
              <span>Scroll to investigate</span>
              <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
            </p>
          </div>
        </div>
      </main>

      {camera && (
        <>
          <FilmStrip shots={board.layouts.l.shots} active={shot.key === 'l' ? shot.index : 0} onPick={pick} />
          <ShotBar shots={shotsInUse} active={shot.index} onPick={pick} />
        </>
      )}
      <Colophon />
      <ConfirmDialog flow={flow} />
      <MessageStatus flow={flow} />
    </div>
  );
}
