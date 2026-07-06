// Optional end-to-end smoke test. Exercises the browser-only behaviors the Node
// fetch smoke can't: the 3D hero canvas mounting, a clean console, the
// reduced-motion path (data-motion="reduce" with no canvas), no horizontal
// overflow across breakpoints, and the contact form (labels that clear on input,
// native email validation, and the valid-submit → confirm modal → POST
// /api/message flow).
//
// Playwright is an OPTIONAL, self-installed dependency. To run:
//   npm i -D @playwright/test && npx playwright install chromium
//   npm run start   # in another terminal (after npm run build)
//   npm run smoke:e2e
//
// If Playwright isn't installed this script SKIPS (exit 0) — the primary check is
// `npm run smoke` (scripts/smoke.mjs), which needs no browser.

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

async function main() {
  // Software WebGL so the canvas mounts in headless environments.
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'],
  });

  try {
    // --- Motion allowed: canvas mounts, console is clean. ---
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
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
    const dctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const dpage = await dctx.newPage();
    const detailErrors = [];
    dpage.on('console', (m) => m.type() === 'error' && detailErrors.push(m.text()));
    dpage.on('pageerror', (e) => detailErrors.push(e.message));
    await dpage.goto(BASE + '/microsoft-2024', { waitUntil: 'networkidle' });
    check('no console errors on /microsoft-2024', detailErrors.length === 0);
    if (detailErrors.length) detailErrors.forEach((e) => console.log(`        ↳ ${e}`));
    await dctx.close();

    // --- Reduced motion: data-motion="reduce", no canvas, content visible. ---
    const rctx = await browser.newContext({
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
    const cctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
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

    // (4) Confirming fires POST /api/message (the server may 4xx/5xx without SMTP
    // creds — we only assert the request is issued, not its result).
    const postReq = await Promise.all([
      cpage.waitForRequest(
        (req) => req.url().includes('/api/message') && req.method() === 'POST',
        { timeout: 5000 }
      ).catch(() => null),
      cpage.getByRole('button', { name: 'Yes, I am sure' }).click(),
    ]).then(([req]) => req);
    check('confirming fires POST /api/message', postReq !== null);
    await cctx.close();
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
