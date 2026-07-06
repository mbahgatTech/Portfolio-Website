/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // three.js ships untranspiled ESM (e.g. three/examples/jsm) that Next won't
  // process by default; transpilePackages lets the bundler compile it.
  transpilePackages: ['three'],
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
