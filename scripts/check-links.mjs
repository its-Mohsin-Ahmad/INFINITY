/* Post-build link audit: every internal href in the exported `out/` tree must
 * resolve to a real emitted page. Run with `node scripts/check-links.mjs`. */

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
// `||` not `??`: an empty BASE_PATH env var must still fall back to the default.
const BASE = process.env.BASE_PATH || "/INFINITY";

function walk(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...walk(full));
    else if (entry.endsWith(".html")) found.push(full);
  }
  return found;
}

const pages = walk(OUT);
const hrefRe = new RegExp(`href="(${BASE}[^"#?]*)"`, "g");
const broken = new Map();

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  for (const m of html.matchAll(hrefRe)) {
    const url = m[1].slice(BASE.length);
    if (url === "" || url === "/") continue;
    // Build assets are real files, not routes — they are not index.html.
    if (url.startsWith("/_next/")) continue;
    const target = join(OUT, url.replace(/^\//, ""), "index.html");
    if (!existsSync(target)) {
      if (!broken.has(url)) broken.set(url, new Set());
      broken.get(url).add(page);
    }
  }
}

console.log(`[check-links] scanned ${pages.length} pages`);
if (!broken.size) {
  console.log("[check-links] all internal links resolve");
} else {
  console.log(`[check-links] ${broken.size} broken internal link(s):`);
  for (const [url, sources] of [...broken].sort()) {
    console.log(`  ${url}  (from ${[...sources].slice(0, 3).join(", ")})`);
  }
  process.exitCode = 1;
}