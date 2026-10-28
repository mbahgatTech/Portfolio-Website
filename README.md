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
- **Observability**: PostHog (cookieless analytics, error tracking, logs) · Better
  Stack (uptime) — see [Observability](#observability)

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
server-side API routes and observability:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `GMAIL` | `pages/api/message.js` | Gmail address that sends contact-form email. |
| `GMAIL_PASSWORD` | `pages/api/message.js` | Gmail app password for that account. |
| `TARGET_EMAIL` | `pages/api/message.js` | Recipient of contact-form submissions. |
| `OAuth` | `pages/api/repos.js` | GitHub token for the repositories endpoint. |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | `utils/analytics.js`, `utils/server/observability.js` | PostHog project token (`phc_…`). Public by design; it ships in the browser bundle. |
| `NEXT_PUBLIC_POSTHOG_HOST` | same, plus `next.config.js` | PostHog ingestion host, e.g. `https://us.i.posthog.com`. |

Observability stays off unless both PostHog variables are set. They're read at
build time, so redeploy after changing them.

Put them in a local, untracked env file (e.g. `.env.local`):

```bash
GMAIL=you@gmail.com
GMAIL_PASSWORD=your-app-password
TARGET_EMAIL=inbox@example.com
OAuth=ghp_your_github_token
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_your_project_token
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
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
`/sitemap.xml` are served. Finally it checks that trailing slashes still redirect
(`/ncr/` → `/ncr`), that `/api/health` and `/api/geo` answer, and that
`/api/message` rejects a `GET` with `405` (so the contact function runs without
sending an email). Override the target with `SMOKE_BASE_URL`.

### Optional end-to-end smoke (Playwright)

`npm run smoke:e2e` additionally checks the hero canvas mounts, the console is
clean, the reduced-motion gate works (`data-motion="reduce"`, no canvas), and there
is no horizontal overflow at 375/768/1280px. When the build has PostHog configured
it also checks the analytics: events are cookieless and carry the environment and
country, nothing is stored in the browser, the conversion events and uncaught
errors are sent, and no contact details (typed into the form or left in the page
URL) reach a payload. It
answers PostHog, `/api/message` and `/api/geo` itself, so a run sends nothing
anywhere. It requires Playwright, which is not a project dependency — install it
on demand:

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

## Observability

Everything runs on free tiers: [PostHog](https://posthog.com) for analytics,
error tracking and logs, and [Better Stack](https://betterstack.com) for uptime.

**Privacy.** Analytics are cookieless (`cookieless_mode: 'always'`): nothing is
stored in the visitor's browser, so there is no consent banner, and PostHog
counts visitors with a daily, privacy-preserving hash, so visits can't be linked
across days. There's no session replay. Form field values are never captured,
the contact events say only that a step happened, never what was typed, and
`name`, `email` and `message` query parameters are masked in recorded URLs.
Cookieless mode drops the IP before PostHog's GeoIP lookup, so the browser asks
`/api/geo` for its country (from Vercel's IP geolocation) and attaches only that.

**What's collected**

| Where | What |
| --- | --- |
| Browser (`utils/analytics.js`, loaded after the page) | Pageviews and page leaves (time on page, scroll depth), clicks (autocapture), dead clicks, heatmaps, web vitals, uncaught errors, plus the events below |
| Render errors (`components/ErrorBoundary.jsx`) | Errors while rendering a page, with the component stack; visitors see a reload prompt |
| API routes (`utils/server/observability.js`) | One structured log per request (method, route, status, duration, error) in PostHog Logs (`service.name = portfolio-api`), and failures in error tracking |
| Better Stack | Uptime monitors for `https://www.mazenbahgat.com` and `/api/health`, with email alerts |

| Event | Fired when | Properties |
| --- | --- | --- |
| `resume_downloaded` | The résumé envelope is clicked | `location` |
| `profile_link_clicked` | A GitHub/LinkedIn link is clicked | `network`, `location` (`board` or `footer`) |
| `case_file_opened` | A case file is opened from the board or a neighbouring file's tab | `case_id`, `company`, `position`, `source` (`board`, `previous_tab`, `next_tab`) |
| `contact_form_started` | First keystroke in the contact form | — |
| `contact_form_submitted` | A valid form opens the confirmation dialog | — |
| `contact_message_cancelled` | The confirmation dialog is dismissed | — |
| `contact_message_sent` / `contact_message_failed` | `/api/message` succeeds or fails | — |

Every event carries `environment` (`production`, `preview` or `local`) and
`release` (the short commit SHA). The PostHog project's test-account filter keeps
only `environment = production`, so local and preview traffic stays out of
insights unless you untick "Filter out internal and test users"; filter logs on
`deployment.environment`.

**How it's wired**

- The browser talks to PostHog through `/relay` on the site's own domain, which
  `next.config.js` rewrites to PostHog, so tracker blockers that block PostHog's
  domains don't drop the data. PostHog's API paths end in `/`, so Next's
  trailing-slash redirect is off and an explicit redirect keeps it for pages.
- The API routes return `{ status, body, error }` to `withObservability`, which
  logs the request, reports `error`, and sends both to PostHog before replying,
  since Vercel can freeze a function once it has responded.
- `/api/health` is unlogged and answers `{"status":"ok"}` for the uptime monitor.

**Set up on Vercel.** Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and
`NEXT_PUBLIC_POSTHOG_HOST` in the project's environment variables (Production,
and Preview if you want preview traffic too), then redeploy. Once the deploy is
live, resume the paused "mazenbahgat.com API health" monitor in Better Stack.

## Deploy

Deploys cleanly to the [Vercel Platform](https://vercel.com/new). Configure the
environment variables above in the project settings.
