const { RELAY_PATH, postHogHosts } = require('./utils/posthogHosts');

const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // three.js ships untranspiled ESM (e.g. three/examples/jsm) that Next won't
  // process by default; transpilePackages lets the bundler compile it.
  transpilePackages: ['three'],
  // Tag analytics, errors and logs with the deployment they came from, so
  // production traffic can be told apart from local and preview builds.
  env: {
    APP_ENV: process.env.VERCEL_ENV || 'local',
    APP_RELEASE: (process.env.VERCEL_GIT_COMMIT_SHA || 'local').slice(0, 7),
  },
  // PostHog's API paths end in a slash (/e/, /flags/), so the relay below must
  // not be redirected to slashless URLs...
  skipTrailingSlashRedirect: true,
  async redirects() {
    // ...while every other path still drops its trailing slash, as Next.js does
    // by default (e.g. /ncr/ -> /ncr).
    return [
      {
        source: `/:path((?!${RELAY_PATH.slice(1)}/).+)/`,
        destination: '/:path',
        permanent: true,
      },
    ];
  },
  // Same-origin proxy for PostHog (see utils/posthogHosts.js). Its static and
  // config files come from the assets host, everything else from the API host.
  async rewrites() {
    if (!POSTHOG_HOST) return [];
    const { api, assets } = postHogHosts(POSTHOG_HOST);
    return [
      { source: `${RELAY_PATH}/static/:path*`, destination: `${assets}/static/:path*` },
      { source: `${RELAY_PATH}/array/:path*`, destination: `${assets}/array/:path*` },
      { source: `${RELAY_PATH}/:path*`, destination: `${api}/:path*` },
    ];
  },
  // Import .svg files as React components (see components/icons) via SVGR, so the
  // icons keep currentColor and accept a className.
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
}

module.exports = nextConfig
