import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static site (out/) for S3 + CloudFront. No server-only features.
  output: "export",
  // GitHub Pages serves the site under /yatzy-scoreboard/, so the CI build
  // sets BASE_PATH. Locally (dev, tests) it stays at the root.
  basePath: process.env.BASE_PATH,
  reactCompiler: true,
  // The floating dev-tools badge overlaps buttons on a phone viewport
  // and blocks clicks in Playwright, so hide it during E2E runs.
  devIndicators: process.env.PLAYWRIGHT ? false : undefined,
};

export default nextConfig;
