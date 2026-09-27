/**
 * Publish the static export in ./out to the `gh-pages` branch of GitHub Pages.
 *
 *   npm run build:static && node scripts/deploy-pages.mjs
 *   (or simply: npm run deploy:pages)
 *
 * The branch is rebuilt from an orphan history on every run and force-pushed, so
 * the published site never accumulates previous builds.
 *
 * NOTE: this path needs only the `repo` scope. The Actions workflow in
 * `.github/workflows/deploy-pages.yml` needs the `workflow` scope
 * (`gh auth refresh -h github.com -s workflow`).
 */
import { spawnSync } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "out");
const REMOTE = process.env.PAGES_REMOTE ?? "https://github.com/its-Mohsin-Ahmad/INFINITY.git";
const BRANCH = process.env.PAGES_BRANCH ?? "gh-pages";

function git(args, cwd) {
  const result = spawnSync("git", args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error(`\n[infinity] git ${args.join(" ")} failed`);
    process.exit(result.status ?? 1);
  }
}

if (!existsSync(path.join(OUT, "index.html"))) {
  console.error("[infinity] ./out is missing — run `npm run build:static` first.");
  process.exit(1);
}

// GitHub Pages must serve the files as-is (no Jekyll processing).
writeFileSync(path.join(OUT, ".nojekyll"), "");

rmSync(path.join(OUT, ".git"), { recursive: true, force: true });

git(["init", "-q", "-b", BRANCH], OUT);
git(["config", "core.autocrlf", "false"], OUT);
git(["remote", "add", "origin", REMOTE], OUT);
git(["add", "-A"], OUT);
git(["commit", "-q", "-m", `Deploy INFINITY static export (${new Date().toISOString()})`], OUT);
git(["push", "--force", "origin", BRANCH], OUT);

console.log(
  `\n[infinity] published ./out to ${REMOTE} (branch ${BRANCH})\n` +
    "[infinity] GitHub builds the site from that branch — usually live within a few minutes.",
);
