/**
 * Two build targets:
 *
 *   • `npm run build`        → Next.js server build (`npm start`), keeps the
 *                              /api route handlers (server-authoritative prices).
 *   • `npm run build:static` → `output: "export"` bundle in ./out for GitHub
 *                              Pages (static hosting, no server runtime).
 *
 * `NEXT_OUTPUT=export` is the switch used by next.config.mjs.
 */
const isStaticExport = process.env.NEXT_OUTPUT === "export";

/** Project site: https://<owner>.github.io/INFINITY/ — override for user sites. */
const basePath = isStaticExport ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "/INFINITY") : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  eslint: { ignoreDuringBuilds: true },

  // ---- static export (GitHub Pages) -------------------------------------
  ...(isStaticExport
    ? {
        output: "export",
        // Pages serves real files, so every route needs a trailing slash.
        trailingSlash: true,
        basePath,
        assetPrefix: basePath || undefined,
        // No image optimisation server on a static host.
        images: { unoptimized: true },
        // Inlined into the client bundle: tells the UI there is no API runtime.
        env: { NEXT_PUBLIC_STATIC: "1" },
      }
    : {
        images: {
          formats: ["image/avif", "image/webp"],
          remotePatterns: [
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: "cdn.infinity.gg" },
          ],
        },
      }),

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // Security headers only apply to the server build — a static host sets its
  // own, and `headers()` is ignored during export.
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "SAMEORIGIN" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "X-DNS-Prefetch-Control", value: "on" },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;

