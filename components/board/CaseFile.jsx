import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import experienceList from '../../utils/json/experience.json';
import { kinChain, letterOf } from './layout';
import { useTextures } from './textures';
import { marker, tape, typed } from './fonts';
import { Colophon, PageStyle, Tape, cx, stampOf } from './parts';
import styles from './Board.module.css';

// The case files run in the kin order the board uses, so each is filed under the
// same exhibit letter as its card on the board, and the next file is the next
// exhibit.
const CHAIN = kinChain(experienceList);
const LETTERS = Object.fromEntries(CHAIN.map((item, index) => [item.report, letterOf(index)]));

function FileTab({ item, direction }) {
  return (
    <Link href={item.report} className={styles.fileTab} data-direction={direction}>
      <span className={styles.fileTabKicker}>
        {direction === 'previous' ? 'Previous file' : 'Next file'}
        {LETTERS[item.report] && <> &middot; Exhibit {LETTERS[item.report]}</>}
      </span>
      <span className={styles.fileTabTitle}>{item.position}</span>
      <span className={styles.fileTabCompany}>{item.company}</span>
    </Link>
  );
}

/**
 * A case study as a case file: a manila folder on the wall, the exhibit's index
 * card clipped inside with its print and tapes, the report typed on the sheets
 * beside it, and the neighbouring files' tabs underneath. `data` is the markdown
 * case study; its stack and neighbours come from experience.json.
 */
export default function CaseFile({ data }) {
  const rootRef = useRef(null);
  useTextures(rootRef);
  const index = CHAIN.findIndex((item) => item.report === `/${data.id}`);
  const stack = (index >= 0 && CHAIN[index].techStack) || [];
  const previous = CHAIN[index - 1];
  const next = index >= 0 ? CHAIN[index + 1] : undefined;
  const letter = LETTERS[`/${data.id}`];
  const stamp = stampOf(data.dateRange);
  const rootClass = cx(styles.root, styles.caseRoot, typed.variable, marker.variable, tape.variable);

  return (
    <div ref={rootRef} className={rootClass}>
      <PageStyle />
      <a href="#main" className={styles.skipLink}>Skip to the report</a>

      <main id="main" className={styles.caseMain}>
        <Link href="/#experience" className={styles.backLink}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          Back to the board
        </Link>

        <article className={styles.folder} aria-labelledby="board-case-title">
          <p className={styles.folderTab}>
            Case file{letter && <> &middot; Exhibit {letter}</>}
          </p>
          <div className={styles.folderInner}>
            <aside className={styles.caseSide}>
              <div className={styles.caseCard}>
                <span className={styles.clip} aria-hidden="true" />
                {letter && <p className={styles.stamp}>Exhibit {letter}</p>}
                <h1 id="board-case-title" className={styles.caseTitle}>
                  <span className={styles.position}>{data.role}</span>
                  <span className="sr-only"> at </span>
                  <span className={styles.company}>{data.company}</span>
                </h1>
                {data.dateRange && <p className={styles.dates}>{data.dateRange}</p>}
                {index >= 0 && <p className={styles.caseCount}>File {index + 1} of {CHAIN.length}</p>}
              </div>
              {data.image && (
                <figure className={cx(styles.print, styles.casePrint)}>
                  <div className={styles.printWindow}>
                    <Image src={data.image} alt={`${data.company} logo`} width={160} height={160} className={styles.printLogo} />
                    {stamp && <span className={styles.dateStamp} aria-hidden="true">{stamp}</span>}
                  </div>
                  {letter && <figcaption className={styles.printMark} aria-hidden="true">{letter}</figcaption>}
                </figure>
              )}
              {stack.length > 0 && (
                <ul className={styles.caseTapes} aria-label="Stack">
                  {stack.map((tech) => (
                    <li key={tech.name}>
                      <Tape tech={tech} />
                    </li>
                  ))}
                </ul>
              )}
            </aside>
            <div className={styles.report}>
              <h2 className="sr-only">Report</h2>
              <div className={styles.reportBody} dangerouslySetInnerHTML={{ __html: data.htmlContent }} />
            </div>
          </div>
        </article>

        {(previous || next) && (
          <nav className={styles.fileTabs} aria-label="Other case files">
            {previous && <FileTab item={previous} direction="previous" />}
            {next && <FileTab item={next} direction="next" />}
          </nav>
        )}
      </main>
      <Colophon />
    </div>
  );
}
