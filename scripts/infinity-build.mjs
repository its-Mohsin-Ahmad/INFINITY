/**
 * INFINITY build entry point.
 *
 *   node scripts/infinity-build.mjs            → server build (`next start`)
 *   node scripts/infinity-build.mjs --static   → static export for GitHub Pages
 *
 * `output: "export"` cannot prerender route handlers, so the static build parks
 * `src/app/api` (see `prepare-api.mjs`) and re-inlines `NEXT_PUBLIC_STATIC=1`
 * so the browser knows to use its local pricing fallback.
 */
import { spawnSync } from "node:child_process";
import { parkApi, restoreApi } from "./prepare-api.mjs";

const staticExport = process.argv.includes("--static");

if (staticExport) {
  process.env.NEXT_OUTPUT = "export";
  process.env.NEXT_PUBLIC_STATIC = "1";
  if (!process.env.NEXT_PUBLIC_BASE_PATH) {
    process.env.NEXT_PUBLIC_BASE_PATH = "/INFINITY";
  }
  parkApi();
} else {
  restoreApi();
}

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["next", "build"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

// A server build must never leave the API routes parked, even after a failure.
if (!staticExport) restoreApi();

if (staticExport && result.status === 0) {
  console.log(
    "\n[infinity] static export ready in ./out — publish that folder to GitHub Pages.\n" +
      "[infinity] note: `npm run build:static` leaves src/app/api parked; run\n" +
      "          `node scripts/prepare-api.mjs` (or `npm run build` / `npm run dev`) to restore it.",
  );
}

process.exit(result.status ?? 1);
