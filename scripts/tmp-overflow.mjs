import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const OUT = "out";
const VIEWPORT = 360; // smallest common Android width in CSS px
const pages = [
  "index.html",
  "games/index.html",
  "store/index.html",
  "games/cyberpunk-2077/index.html",
  "deals/index.html",
  "news/index.html",
];

const findings = new Map();

for (const rel of pages) {
  const file = path.join(OUT, rel);
  let html;
  try {
    html = readFileSync(file, "utf8");
  } catch {
    console.log(`skip ${rel}`);
    continue;
  }

  // every class attribute in the document
  for (const m of html.matchAll(/class="([^"]{4,})"/g)) {
    for (const token of m[1].split(/\s+/)) {
      if (!token) continue;
      // fixed widths / min-widths that can exceed a phone viewport
      const fixed = token.match(/^(?:min-)?w-\[(\d+)px\]$/);
      if (fixed && Number(fixed[1]) > VIEWPORT) {
        findings.set(token, (findings.get(token) ?? 0) + 1);
      }
      // long unbreakable words in the markup itself
      if (/^(max-w-\[\d{4,}px\])$/.test(token)) {
        findings.set(token, (findings.get(token) ?? 0) + 1);
      }
    }
  }

  // inline pixel widths
  for (const m of html.matchAll(/style="[^"]*?(?:min-)?width:\s*(\d+)px/g)) {
    if (Number(m[1]) > VIEWPORT) findings.set(`inline width:${m[1]}px`, (findings.get(`inline width:${m[1]}px`) ?? 0) + 1);
  }
}

console.log(`viewport under test: ${VIEWPORT}px`);
if (!findings.size) {
  console.log("no fixed width above the viewport found");
} else {
  for (const [token, count] of [...findings].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(5)}  ${token}`);
  }
}