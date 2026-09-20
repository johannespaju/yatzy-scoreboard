import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static site (out/) for S3 + CloudFront. No server-only features.
  output: "export",
  reactCompiler: true,
  // The floating dev-tools badge overlaps buttons on a phone viewport
  // and blocks clicks in Playwright, so hide it during E2E runs.
  devIndicators: process.env.PLAYWRIGHT ? false : undefined,
};

export default nextConfig;
