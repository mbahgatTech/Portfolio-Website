// Smoke test — verifies the production server serves the expected portfolio
// content. Uses Node's built-in fetch (no browser). Run it against `next start`:
// `npm run smoke`.
//
// Overridable base URL: SMOKE_BASE_URL (default http://localhost:3000).

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:3000';

// Production origin used in canonical URLs, robots.txt, and sitemap.xml.
const SITE_URL = 'https://www.mazenbahgat.com';

// Matches a non-trivial meta description (search-result snippet).
const META_DESCRIPTION = /<meta name="description" content="[^"]{50,}"/;

// Each detail route paired with a known heading from its markdown body.
const DETAIL_ROUTES = [
  ['/microsoft-2024', 'Partner Engagement Feature'],
  ['/ncrvyx', 'Collaboration Services Project'],
  ['/microsoft', 'Engineering Excellence'],
  ['/ncr', 'Developing micro-services'],
  ['/scales', 'Data Entry System Project'],
];

// Company names rendered on the home page (Microsoft Corporation appears twice).
const COMPANIES = [
  'Microsoft Corporation',
  'NCR Voyix',
  'NCR Corporation',
  'Scales Nature Park',
];

// One "Read More" link per experience — proves all five cards rendered.
const EXPERIENCE_LINKS = ['/microsoft-2024', '/ncrvyx', '/microsoft', '/ncr', '/scales'];

const SOCIAL_URLS = [
  'https://github.com/mbahgatTech',
  'https://www.linkedin.com/in/mazen-bahgat',
];

// Each experience's position + a distinctive description snippet must render on
// the home page — guards against content loss beyond just the company names.
const POSITIONS = [
  'Software Engineering Intern',
  'Software Developer',
  'Back-end Developer',
  'Full Stack Application Developer',
];

const DESCRIPTION_SNIPPETS = [
  'Developed partner engagement and event-driven features',
  'developing a proxy server that serves encrypted cloud static content',
  'Optimized engineering applications that digitize and automate',
  'containerized banking micro-services written in spring boot',
  'wildlife conservation purposes',
];

const failures = [];
const check = (label, condition) => {
  if (condition) {
    console.log(`  PASS  ${label}`);
  } else {
    failures.push(label);
    console.log(`  FAIL  ${label}`);
  }
};

async function get(path) {
  const res = await fetch(BASE + path, { redirect: 'manual' });
  const body = await res.text();
  return { res, body };
}

async function main() {
  console.log(`Smoke testing ${BASE}\n`);

  // --- Home page: content preserved + SSR-safe (no canvas in server HTML). ---
  console.log('GET /');
  const home = await get('/');
  check('/ returns 200', home.res.status === 200);
  for (const company of COMPANIES) {
    check(`/ contains company "${company}"`, home.body.includes(company));
  }
  for (const position of POSITIONS) {
    check(`/ contains position "${position}"`, home.body.includes(position));
  }
  for (const snippet of DESCRIPTION_SNIPPETS) {
    check(`/ contains description "${snippet.slice(0, 40)}…"`, home.body.includes(snippet));
  }
  for (const link of EXPERIENCE_LINKS) {
    check(`/ links experience "${link}"`, home.body.includes(`href="${link}"`));
  }
  check('/ contains résumé download link', home.body.includes('href="/resume.pdf"'));
  for (const url of SOCIAL_URLS) {
    check(`/ contains social URL ${url}`, home.body.includes(url));
  }
  // The 3D hero is dynamically imported with ssr:false, so the server-rendered
  // HTML must not contain a <canvas> element.
  check('/ server HTML has no <canvas> (SSR-safe 3D)', !home.body.includes('<canvas'));

  // SEO metadata that search engines and link previews read from the server HTML.
  check('/ declares <html lang="en">', home.body.includes('<html lang="en"'));
  check('/ has a meta description', META_DESCRIPTION.test(home.body));
  check('/ has its canonical URL', home.body.includes(`<link rel="canonical" href="${SITE_URL}/"`));
  check('/ has Open Graph tags', home.body.includes('property="og:title"') && home.body.includes('property="og:image"'));
  check('/ has JSON-LD structured data', home.body.includes('application/ld+json'));

  // --- Detail routes: 200 + known heading + their own title/description/canonical. ---
  const titles = [];
  for (const [route, heading] of DETAIL_ROUTES) {
    console.log(`GET ${route}`);
    const { res, body } = await get(route);
    check(`${route} returns 200`, res.status === 200);
    check(`${route} contains heading "${heading}"`, body.includes(heading));
    check(`${route} has a meta description`, META_DESCRIPTION.test(body));
    check(`${route} has its canonical URL`, body.includes(`<link rel="canonical" href="${SITE_URL}${route}"`));
    titles.push(body.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  }
  check('home and detail pages all have unique titles', new Set([home.body.match(/<title>([^<]*)<\/title>/)?.[1], ...titles]).size === titles.length + 1);

  // --- Crawler files. ---
  console.log('GET /robots.txt');
  const robots = await get('/robots.txt');
  check('/robots.txt returns 200', robots.res.status === 200);
  check('/robots.txt points to the sitemap', robots.body.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));

  console.log('GET /sitemap.xml');
  const sitemap = await get('/sitemap.xml');
  check('/sitemap.xml returns 200', sitemap.res.status === 200);
  for (const route of ['/', ...EXPERIENCE_LINKS]) {
    check(`/sitemap.xml lists ${route}`, sitemap.body.includes(`<loc>${SITE_URL}${route}</loc>`));
  }

  // --- Static résumé asset. ---
  console.log('GET /resume.pdf');
  const pdf = await get('/resume.pdf');
  check('/resume.pdf returns 200', pdf.res.status === 200);
  check(
    '/resume.pdf is application/pdf',
    (pdf.res.headers.get('content-type') || '').includes('application/pdf')
  );

  console.log('');
  if (failures.length) {
    console.error(`SMOKE FAILED — ${failures.length} assertion(s) failed:`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log('SMOKE PASSED — all assertions passed.');
}

main().catch((err) => {
  console.error('SMOKE ERRORED — could not reach the server or an unexpected error occurred:');
  console.error(err?.message || err);
  console.error(`\nIs the production server running at ${BASE}? Start it with:  npm run build && npm run start`);
  process.exit(1);
});
