import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static site (out/) for S3 + CloudFront. No server-only features.
  output: "export",
  reactCompiler: true,
};

export default nextConfig;
