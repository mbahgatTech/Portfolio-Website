// Optional end-to-end smoke test. Exercises the browser-only behaviors the Node
// fetch smoke can't: the 3D hero canvas mounting, a clean console, the
// reduced-motion path (data-motion="reduce" with no canvas), no horizontal
// overflow across breakpoints, the contact form (labels that clear on input,
// native email validation, and the valid-submit → confirm modal → POST
// /api/message flow), and — when the build has PostHog configured — the
// analytics: cookieless, free of what visitors type, and the conversion events.
//
// Nothing leaves the machine: PostHog API calls, /api/message and /api/geo are
// answered here (PostHog's static scripts still load through the relay).
//
// Playwright is an OPTIONAL, self-installed dependency. To run:
//   npm i -D @playwright/test && npx playwright install chromium
//   npm run start   # in another terminal (after npm run build)
//   npm run smoke:e2e
//
// If Playwright isn't installed this script SKIPS (exit 0) — the primary check is
// `npm run smoke` (scripts/smoke.mjs), which needs no browser.

import { gunzipSync } from 'node:zlib';

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:3000';
const WIDTHS = [375, 768, 1280];

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  try {
    ({ chromium } = await import('@playwright/test'));
  } catch {
    console.log('SKIPPED — Playwright is not installed.');
    console.log('Install it to run this optional check:');
    console.log('  npm i -D @playwright/test && npx playwright install chromium');
    process.exit(0);
  }
}

const failures = [];
const check = (label, ok) => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures.push(label);
};

async function noHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}

// Analytics payloads the browser tried to send, as text, and the events in them.
const analyticsPayloads = [];
const analyticsEvents = [];

/** PostHog posts events as JSON, gzipped JSON, or base64 form data. */
function decodePayload(buffer) {
  if (!buffer?.length) return null;
  if (buffer[0] === 0x1f && buffer[1] === 0x8b) return gunzipSync(buffer).toString('utf8');
  const text = buffer.toString('utf8');
  return text.startsWith('data=') ? Buffer.from(decodeURIComponent(text.slice(5)), 'base64').toString('utf8') : text;
}

function recordAnalytics(request) {
  const text = decodePayload(request.postDataBuffer());
  if (!text) return;
  analyticsPayloads.push(text);
  try {
    const body = JSON.parse(text);
    analyticsEvents.push(...(Array.isArray(body) ? body : body.batch || [body]));
  } catch {
    // Not an event batch.
  }
}

/** A browser context whose analytics, contact sends and outbound links are answered locally. */
async function newContext(browser, options) {
  const ctx = await browser.newContext(options);
  await ctx.route('**/api/geo', (route) => route.fulfill({ json: { country: 'CA' } }));
  await ctx.route('**/api/message', (route) => route.fulfill({ status: 500, body: 'Not sent: smoke test' }));
  await ctx.route(/^https:\/\/(github\.com|www\.linkedin\.com)\//, (route) => route.fulfill({ body: '' }));
  await ctx.route('**/relay/**', (route) => {
    const { pathname } = new URL(route.request().url());
    if (/^\/relay\/(static|array)\//.test(pathname)) return route.continue();
    if (pathname.startsWith('/relay/flags')) return route.fulfill({ json: { featureFlags: {}, featureFlagPayloads: {} } });
    recordAnalytics(route.request());
    return route.fulfill({ json: { status: 1 } });
  });
  return ctx;
}

const eventNamed = (name) => analyticsEvents.find((event) => event.event === name);

async function waitFor(page, condition, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (condition()) return true;
    await page.waitForTimeout(250);
  }
  return false;
}

const waitForEvents = (page, names) => waitFor(page, () => names.every(eventNamed));

/**
 * Cookieless analytics: the pageview carries the deployment and the country,
 * nothing is stored in the browser, the conversion events fire, and contact
 * details (typed into the form, or left in a URL) never reach an analytics payload.
 */
async function checkAnalytics(browser) {
  // PostHog drops events from automated browsers as bots, so present as desktop Chrome.
  const userAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browser.version()} Safari/537.36`;
  const ctx = await newContext(browser, { viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', userAgent });
  await ctx.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false });
    Object.defineProperty(Navigator.prototype, 'userAgentData', { get: () => undefined });
  });
  const page = await ctx.newPage();
  const geoRequest = page.waitForRequest('**/api/geo', { timeout: 5000 }).catch(() => null);
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  if (!(await geoRequest)) {
    console.log('  SKIP  analytics checks: PostHog is not configured in this build');
    await ctx.close();
    return;
  }

  check('analytics captures the pageview', await waitForEvents(page, ['$pageview']));
  const pageview = eventNamed('$pageview')?.properties || {};
  check('pageview is cookieless', pageview.$cookieless_mode === true && pageview.distinct_id === '$posthog_cookieless');
  check('pageview carries the deployment environment', Boolean(pageview.environment));
  check('pageview carries the visitor country', pageview.$geoip_country_code === 'CA');

  // Contact details in a URL (e.g. the form sent before the page hydrated) are masked.
  const stamp = Date.now();
  const inUrl = { name: `urlname${stamp}`, email: `urlmail${stamp}@example.com`, message: `urlmessage${stamp}` };
  await page.goto(`${BASE}/?${new URLSearchParams(inUrl)}`, { waitUntil: 'networkidle' });
  const urlPageview = () => analyticsEvents.find((event) => event.event === '$pageview' && String(event.properties?.$current_url).includes('?'));
  await waitFor(page, urlPageview);
  const maskedUrl = String(urlPageview()?.properties?.$current_url);
  check('contact details in the page URL are masked', ['name', 'email', 'message'].every((key) => new RegExp(`${key}=(<masked>|%3Cmasked%3E)`, 'i').test(maskedUrl)));

  // The conversions: résumé, a profile link, the contact form, and a case file.
  await page.locator('a[href="/resume.pdf"]').first().click();
  const [popup] = await Promise.all([
    ctx.waitForEvent('page'),
    page.locator('a[href="https://github.com/mbahgatTech"]').first().click(),
  ]);
  await popup.close();

  const typed = {
    name: `Smoke Visitor ${stamp}`,
    email: `smoke-${stamp}@example.com`,
    message: `Smoke message ${stamp}`,
  };
  await page.locator('#contact-name').fill(typed.name);
  await page.locator('#contact-email').fill(typed.email);
  await page.locator('#contact-message').fill(typed.message);
  await page.getByRole('button', { name: 'Send Message' }).click();
  await page.getByRole('button', { name: 'Yes, I am sure' }).click();

  await page.locator('a[href="/ncr"]').first().click();
  await page.waitForURL('**/ncr');
  await page.evaluate(() => setTimeout(() => { throw new Error('Smoke test: uncaught error'); }));

  const conversions = [
    'resume_downloaded',
    'profile_link_clicked',
    'contact_form_started',
    'contact_form_submitted',
    'contact_message_failed',
    'case_file_opened',
  ];
  check(`conversion events fire (${conversions.join(', ')})`, await waitForEvents(page, conversions));
  check('case file opens are attributed to their case', eventNamed('case_file_opened')?.properties?.case_id === 'ncr');
  check('uncaught errors reach error tracking', await waitForEvents(page, ['$exception']));

  const stored = await page.evaluate(() => ({
    cookies: document.cookie,
    keys: [...Object.keys(localStorage), ...Object.keys(sessionStorage)],
  }));
  check('nothing is stored in the browser (no cookies, no storage)', stored.cookies === '' && stored.keys.length === 0);
  const leaked = [...Object.values(typed), ...Object.values(inUrl).map((value) => value.split('@')[0])]
    .filter((value) => analyticsPayloads.some((payload) => payload.includes(value)));
  check('no contact details reach analytics', leaked.length === 0);
  check('no session replay is recorded', !eventNamed('$snapshot'));
  await ctx.close();
}

async function main() {
  // Software WebGL so the canvas mounts in headless environments.
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'],
  });

  try {
    // --- Motion allowed: canvas mounts, console is clean. ---
    const ctx = await newContext(browser, { viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
    page.on('pageerror', (e) => consoleErrors.push(e.message));

    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-motion]', { timeout: 10000 });
    check('hero exposes data-motion', (await page.locator('[data-motion]').count()) > 0);
    check(
      'hero canvas mounts when motion allowed',
      await page.locator('canvas').first().isVisible().catch(() => false)
    );
    check('no console errors on /', consoleErrors.length === 0);
    if (consoleErrors.length) consoleErrors.forEach((e) => console.log(`        ↳ ${e}`));

    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(150);
      check(`no horizontal overflow at ${w}px`, await noHorizontalOverflow(page));
    }
    await ctx.close();

    // --- A detail page also loads with a clean console. ---
    const dctx = await newContext(browser, { viewport: { width: 1280, height: 900 } });
    const dpage = await dctx.newPage();
    const detailErrors = [];
    dpage.on('console', (m) => m.type() === 'error' && detailErrors.push(m.text()));
    dpage.on('pageerror', (e) => detailErrors.push(e.message));
    await dpage.goto(BASE + '/microsoft-2024', { waitUntil: 'networkidle' });
    check('no console errors on /microsoft-2024', detailErrors.length === 0);
    if (detailErrors.length) detailErrors.forEach((e) => console.log(`        ↳ ${e}`));
    await dctx.close();

    // --- Reduced motion: data-motion="reduce", no canvas, content visible. ---
    const rctx = await newContext(browser, {
      viewport: { width: 1280, height: 900 },
      reducedMotion: 'reduce',
    });
    const rpage = await rctx.newPage();
    await rpage.goto(BASE + '/', { waitUntil: 'networkidle' });
    await rpage.waitForSelector('[data-motion]', { timeout: 10000 });
    check(
      'reduced-motion hero is data-motion="reduce"',
      (await rpage.locator('[data-motion="reduce"]').count()) > 0
    );
    check('reduced-motion renders no <canvas>', (await rpage.locator('canvas').count()) === 0);
    check(
      'content still visible under reduced motion',
      await rpage.getByText('Microsoft Corporation').first().isVisible().catch(() => false)
    );
    await rctx.close();

    // --- Contact form: labels clear on input; email is validated. ---
    const cctx = await newContext(browser, { viewport: { width: 1280, height: 900 } });
    const cpage = await cctx.newPage();
    await cpage.goto(BASE + '/', { waitUntil: 'networkidle' });

    const nameInput = cpage.locator('#contact-name');
    const emailInput = cpage.locator('#contact-email');
    const messageInput = cpage.locator('#contact-message');
    const nameLabel = cpage.locator('label[for="contact-name"]');
    const confirmPrompt = cpage.getByText('Are you sure you want to send this message?');
    const sendButton = cpage.getByRole('button', { name: 'Send Message' });
    const labelTop = () => nameLabel.evaluate((el) => parseFloat(getComputedStyle(el).top));

    // (1) The label lifts clear of a FILLED field even when unfocused — proving the
    // float is driven by content, not just focus (the reported overlap bug).
    const topEmpty = await labelTop();
    await nameInput.fill('Ada Lovelace');
    await nameInput.blur();
    await cpage.waitForTimeout(300);
    const topFilled = await labelTop();
    check('contact label lifts clear of a filled, unfocused field', topFilled < topEmpty);

    // (2) An invalid email is rejected by native validation and does NOT open the modal.
    await emailInput.fill('not-an-email');
    await messageInput.fill('Hello there — this is a smoke-test message.');
    await sendButton.click();
    await cpage.waitForTimeout(200);
    check(
      'invalid email fails native validation',
      (await emailInput.evaluate((el) => el.checkValidity())) === false
    );
    check(
      'invalid email does NOT open the confirm modal',
      (await confirmPrompt.isVisible().catch(() => false)) === false
    );

    // (3) A valid submission opens the confirm modal.
    await emailInput.fill('ada@example.com');
    await sendButton.click();
    await cpage.waitForTimeout(200);
    check('valid submission opens the confirm modal', await confirmPrompt.isVisible().catch(() => false));

    // (4) Confirming fires POST /api/message (answered locally with a failure — we
    // only assert the request is issued, not its result).
    const postReq = await Promise.all([
      cpage.waitForRequest(
        (req) => req.url().includes('/api/message') && req.method() === 'POST',
        { timeout: 5000 }
      ).catch(() => null),
      cpage.getByRole('button', { name: 'Yes, I am sure' }).click(),
    ]).then(([req]) => req);
    check('confirming fires POST /api/message', postReq !== null);
    await cctx.close();

    // --- Analytics (only when this build has PostHog configured). ---
    await checkAnalytics(browser);
  } finally {
    await browser.close();
  }

  console.log('');
  if (failures.length) {
    console.error(`E2E SMOKE FAILED — ${failures.length} assertion(s) failed.`);
    process.exit(1);
  }
  console.log('E2E SMOKE PASSED — all assertions passed.');
}

main().catch((err) => {
  console.error('E2E SMOKE ERRORED:', err?.message || err);
  console.error(`\nIs the server running at ${BASE}?  npm run build && npm run start`);
  process.exit(1);
});
