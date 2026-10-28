import { RELAY_PATH, postHogHosts } from './posthogHosts';

// Analytics stay off unless both are set (see README → Observability).
const TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const ENABLED = Boolean(TOKEN && HOST);
const GEO_TIMEOUT_MS = 1500;
const MAX_PENDING = 50;

let started = false;
let posthog = null;
// Events and errors from before PostHog has loaded, sent once it has.
const pending = [];

const countryName = (code) => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code);
  } catch {
    return undefined;
  }
};

/**
 * The visitor's country as PostHog GeoIP properties. Cookieless tracking drops
 * the IP before PostHog's own GeoIP lookup, so the country comes from Vercel's
 * edge instead (pages/api/geo.js). Resolves to {} when it isn't available.
 */
async function lookupCountry() {
  try {
    const response = await fetch('/api/geo', { signal: AbortSignal.timeout(GEO_TIMEOUT_MS) });
    const { country } = response.ok ? await response.json() : {};
    if (!country) return {};
    const name = countryName(country);
    return { $geoip_country_code: country, ...(name && { $geoip_country_name: name }) };
  } catch {
    return {};
  }
}

/**
 * Starts PostHog in the browser: pageviews, clicks, web vitals, heatmaps and
 * uncaught errors, counted without cookies or browser storage (so no consent
 * banner) and without session replay. The SDK loads after the page does, off
 * the critical path. Safe to call more than once.
 */
export async function initAnalytics() {
  if (started || !ENABLED) return;
  started = true;

  let client;
  let geo;
  try {
    [{ default: client }, geo] = await Promise.all([import('posthog-js'), lookupCountry()]);
  } catch {
    return;
  }
  const context = { environment: process.env.APP_ENV, release: process.env.APP_RELEASE, ...geo };

  client.init(TOKEN, {
    api_host: RELAY_PATH,
    ui_host: postHogHosts(HOST).ui,
    defaults: '2026-08-30',
    // Nothing is stored on the device: PostHog counts visitors with a daily,
    // privacy-preserving hash, so there is no visitor ID to link visits.
    cookieless_mode: 'always',
    person_profiles: 'never',
    // Never send contact details that end up in a URL's query string.
    mask_personal_data_properties: true,
    custom_personal_data_properties: ['name', 'email', 'message'],
    disable_session_recording: true,
    disable_surveys: true,
    capture_exceptions: true,
    capture_performance: { web_vitals: true, network_timing: false },
    capture_heatmaps: true,
    capture_dead_clicks: true,
    before_send: (event) => {
      if (event) Object.assign(event.properties, context);
      return event;
    },
  });
  posthog = client;
  pending.splice(0).forEach(([method, args]) => client[method](...args));
}

function call(method, args) {
  if (posthog) posthog[method](...args);
  else if (ENABLED && pending.length < MAX_PENDING) pending.push([method, args]);
}

/** Records a named event (see README → Observability for the list). */
export const track = (event, properties) => call('capture', [event, properties]);

/** Sends a caught error to PostHog error tracking. */
export const reportError = (error, properties) => call('captureException', [error, properties]);
