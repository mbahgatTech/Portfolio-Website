# Mazen Bahgat — Portfolio

A [Next.js](https://nextjs.org/) portfolio with a 3D animated hero, glassmorphic
UI, smooth scrolling, and scroll-driven motion. The visual layer was rebuilt for
2026 while the underlying content, routing, and contact/email flow were preserved.

## Tech Stack

- **Framework**: Next.js 14 (Pages Router) · React 18
- **Styling**: Tailwind CSS 3 (custom design tokens) · `@tailwindcss/typography`
- **3D hero**: three.js · `@react-three/fiber` · `@react-three/drei` (code-split,
  `ssr: false`)
- **Motion**: `framer-motion` (scroll reveals, tilt, scroll-progress bar)
- **Smooth scroll**: `lenis` (`lenis/react`), client-only and reduced-motion gated
- **Fonts**: `next/font` (Sora display font)
- **Email**: `nodemailer` (contact form → Gmail) via an API route
- **Content**: markdown experiences (`gray-matter` + `remark`) and JSON data

All motion respects `prefers-reduced-motion: reduce`: the 3D render loop and Lenis
are not initialized, `framer-motion` reveals fall back to opacity-only, and the
hero root exposes `data-motion="reduce"`. The 3D bundle is code-split and never
server-rendered (no `<canvas>` in the SSR HTML).

## Getting Started


First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server. |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build (after `npm run build`). |
| `npm run lint` | Run ESLint (`next lint`). |
| `npm run smoke` | HTTP smoke test (Node `fetch`, no browser) against a running server. |
| `npm run smoke:e2e` | Optional Playwright end-to-end smoke test (see below). |

## Environment Variables

The pages render without any env vars. The following are required only for the
server-side API routes:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `GMAIL` | `pages/api/message.js` | Gmail address that sends contact-form email. |
| `GMAIL_PASSWORD` | `pages/api/message.js` | Gmail app password for that account. |
| `TARGET_EMAIL` | `pages/api/message.js` | Recipient of contact-form submissions. |
| `OAuth` | `pages/api/repos.js` | GitHub token for the repositories endpoint. |

Put them in a local, untracked env file (e.g. `.env.local`):

```bash
GMAIL=you@gmail.com
GMAIL_PASSWORD=your-app-password
TARGET_EMAIL=inbox@example.com
OAuth=ghp_your_github_token
```

## Verify

Build, serve, and run the smoke test:

```bash
npm run build
npm run lint
npm run start          # in one terminal
npm run smoke          # in another terminal (defaults to http://localhost:3000)
```

`npm run smoke` asserts that `/` serves the five experiences (company names,
"Read More" links, résumé link, social URLs) with no `<canvas>` in the SSR HTML,
that each of the five detail routes returns `200` with its known heading, and that
`/resume.pdf` is served as `application/pdf`. It also checks the SEO basics: every
page has a unique title, a meta description, and a canonical URL; the home page
has `lang="en"`, Open Graph tags, and JSON-LD; and `/robots.txt` and
`/sitemap.xml` are served. Override the target with `SMOKE_BASE_URL`.

### Optional end-to-end smoke (Playwright)

`npm run smoke:e2e` additionally checks the hero canvas mounts, the console is
clean, the reduced-motion gate works (`data-motion="reduce"`, no canvas), and there
is no horizontal overflow at 375/768/1280px. It requires Playwright, which is not a
project dependency — install it on demand:

```bash
npm i -D @playwright/test && npx playwright install chromium
npm run start
npm run smoke:e2e
```

If Playwright is not installed the script skips (exit 0). As a manual fallback,
verify the same behaviors in your browser and its DevTools (Rendering → emulate
`prefers-reduced-motion`).

## SEO

Search-engine and link-preview metadata lives in a few places:

| What | Where |
| --- | --- |
| Title, meta description, canonical URL, Open Graph / Twitter tags, JSON-LD | `components/Seo.jsx`, used by `pages/index.jsx` and `pages/[id].jsx` |
| Site URL, home title, link-preview image | `SEO` in `utils/json/constants.js` |
| Home page description | Reuses the home page intro (`PROFILE.BRIEF` in `utils/json/constants.js`), so editing the intro updates it |
| Experience page descriptions | Generated from the first paragraph of each markdown file; add a `description:` front-matter field to override |
| Page language (`<html lang="en">`) | `pages/_document.jsx` |
| Crawler rules and sitemap | `public/robots.txt`, `public/sitemap.xml` |

When you add an experience, also add its URL to `public/sitemap.xml`.

## Deploy

Deploys cleanly to the [Vercel Platform](https://vercel.com/new). Configure the
environment variables above in the project settings.
