// Shared by next.config.js (plain Node, so CommonJS) and the browser/server code.

// The browser sends analytics to this same-origin path, which next.config.js
// rewrites to PostHog, so blockers that filter PostHog's domains don't drop them.
const RELAY_PATH = '/relay';

/**
 * The PostHog hosts behind a project's ingestion host (NEXT_PUBLIC_POSTHOG_HOST),
 * e.g. https://us.i.posthog.com: static assets come from us-assets.i.posthog.com
 * and the app lives at us.posthog.com. A self-hosted instance serves all three.
 */
function postHogHosts(ingestionHost) {
  const api = ingestionHost.replace(/\/+$/, '');
  return {
    api,
    assets: api.replace('.i.posthog.com', '-assets.i.posthog.com'),
    ui: api.replace('.i.posthog.com', '.posthog.com'),
  };
}

module.exports = { RELAY_PATH, postHogHosts };
