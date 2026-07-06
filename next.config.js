/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // T-001/R1: three.js ships untranspiled ESM (imports from three/examples/jsm);
  // transpilePackages lets Next 14 bundle it so the r3f/drei hero (T-004) builds cleanly.
  transpilePackages: ['three'],
}

module.exports = nextConfig
