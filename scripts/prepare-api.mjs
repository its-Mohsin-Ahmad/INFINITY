/**
 * Route handlers cannot be prerendered by `output: "export"`, so the static
 * (GitHub Pages) build parks `src/app/api` out of the way and the Node build
 * restores it. The source is never modified — it is only moved.
 *
 *   node scripts/prepare-api.mjs           → restore  (server build / dev)
 *   node scripts/prepare-api.mjs --static  → park    (static export)
 */
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LIVE_API = path.join(ROOT, "src", "app", "api");
const PARK_ROOT = path.join(ROOT, ".api-parked");
const PARKED_API = path.join(PARK_ROOT, "api");

/** Move `src/app/api` → `.api-parked/api`. */
export function parkApi() {
  if (!existsSync(LIVE_API)) return false;
  mkdirSync(PARK_ROOT, { recursive: true });
  renameSync(LIVE_API, PARKED_API);
  console.log("[infinity] parked  src/app/api  ->  .api-parked/api   (static export)");
  return true;
}

/** Move `.api-parked/api` → `src/app/api`. */
export function restoreApi() {
  if (!existsSync(PARKED_API)) return false;
  mkdirSync(path.join(ROOT, "src", "app"), { recursive: true });
  renameSync(PARKED_API, LIVE_API);
  try {
    if (existsSync(PARK_ROOT) && readdirSync(PARK_ROOT).length === 0) {
      rmSync(PARK_ROOT, { recursive: true, force: true });
    }
  } catch {
    /* directory not empty — leave it in place */
  }
  console.log("[infinity] restored src/app/api                          (server build)");
  return true;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]).endsWith("prepare-api.mjs");
if (invokedDirectly) {
  if (process.argv.includes("--static")) {
    parkApi();
  } else {
    restoreApi();
  }
}
