/**
 * Publish the static export in ./out to the `gh-pages` branch of GitHub Pages.
 *
 *   npm run build:static && node scripts/deploy-pages.mjs
 *   (or simply: npm run deploy:pages)
 *
 * The branch is committed on top of the currently published gh-pages head and
 * force-pushed, so only the files that actually changed are uploaded, while the
 * published tree stays exact (files removed from ./out are removed from git).
 *
 * NOTE: this path needs only the `repo` scope. The Actions workflow in
 * `.github/workflows/deploy-pages.yml` needs the `workflow` scope
 * (`gh auth refresh -h github.com -s workflow`).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "out");
const REMOTE = process.env.PAGES_REMOTE ?? "https://github.com/its-Mohsin-Ahmad/INFINITY.git";
const BRANCH = process.env.PAGES_BRANCH ?? "gh-pages";

/** Quote arguments that contain spaces/quotes (Windows cmd splits on spaces). */
function safeArgs(args) {
  if (process.platform !== "win32") return args;
  return args.map((a) => (/[\s"]/g.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a));
}

function git(args, cwd) {
  // On Windows the helper spawns through cmd.exe (shell: true), which splits
  // unquoted arguments on spaces — the commit message must be re-quoted or it
  // arrives at git as a list of bogus pathspecs.
  const result = spawnSync("git", safeArgs(args), {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error(`\n[infinity] git ${args.join(" ")} failed`);
    process.exit(result.status ?? 1);
  }
}

/** Same as git() but returns stdout and never exits the process. */
function gitQuiet(args, cwd) {
  const result = spawnSync("git", safeArgs(args), {
    cwd,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return result.status === 0 ? (result.stdout ?? "") : "";
}

/** Block synchronously — this script is deliberately linear/synchronous. */
function execSleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * True when the given ref resolves to a commit.
 *
 * The ref is checked unpeeled on purpose: the `^{commit}` syntax relies on `^`,
 * which cmd.exe treats as an escape character when this script runs with
 * `shell: true` on Windows, so the argument would arrive mangled and every
 * check would fail. These refs are always branch heads, so no peel is needed.
 */
function hasCommit(ref) {
  return gitQuiet(["rev-parse", "--verify", "--quiet", ref], OUT).trim() !== "";
}

/**
 * Drop stale *.lock files.
 *
 * A fetch or push that was interrupted (flaky connection, killed process) can
 * leave `shallow.lock` / `index.lock` behind, and every later git call then
 * dies with "Unable to create ... File exists" — which looks exactly like a
 * network failure and sends you retrying a push that could never succeed.
 */
function clearStaleLocks() {
  const gitDir = path.join(OUT, ".git");
  if (!existsSync(gitDir)) return;
  for (const rel of ["", "refs", "refs/deploy", "objects/pack"]) {
    const dir = path.join(gitDir, rel);
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir)) {
      if (entry.endsWith(".lock")) rmSync(path.join(dir, entry), { force: true });
    }
  }
}

/**
 * Commit, tolerating "nothing to commit".
 *
 * A rebuild that produces a byte-identical export leaves the tree clean, and
 * that is not a failure: the existing HEAD commit already *is* the tree we want
 * to publish, so the push should simply go ahead.
 */
function gitCommit(message, cwd) {
  const result = spawnSync("git", safeArgs(["commit", "-q", "-m", message]), {
    cwd,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (result.status === 0) return;
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (/nothing to commit/i.test(output)) {
    console.warn("[infinity] export unchanged — reusing the existing gh-pages commit.");
    return;
  }
  console.error(`\n[infinity] git commit failed\n${output}`);
  process.exit(result.status ?? 1);
}

if (!existsSync(path.join(OUT, "index.html"))) {
  console.error("[infinity] ./out is missing — run `npm run build:static` first.");
  process.exit(1);
}

// GitHub Pages must serve the files as-is (no Jekyll processing).
writeFileSync(path.join(OUT, ".nojekyll"), "");

/**
 * The gh-pages history is kept INCREMENTAL on purpose.
 *
 * `out/.git` used to be deleted and re-inited on every run, which produced an
 * orphan commit. Git then had no local base object to delta against and had to
 * re-upload the entire ~400 MB export on every single deploy; on a slow or
 * flaky connection GitHub answers those pushes with `HTTP 408` /
 * `the remote end hung up unexpectedly`.
 *
 * Re-using the object store and committing on top of the currently published
 * gh-pages head means the push only has to carry the objects the server is
 * missing, so deploys finish in seconds instead of timing out. The published
 * *tree* is still exact: `git add -A` also stages deletions, so files dropped
 * from ./out disappear from the new commit.
 */
if (!existsSync(path.join(OUT, ".git"))) {
  git(["init", "-q", "-b", BRANCH], OUT);
}
git(["config", "core.autocrlf", "false"], OUT);
// `git remote` prints names only, so ask for the URL to test whether it is set.
if (gitQuiet(["remote", "get-url", "origin"], OUT).trim() === "") {
  git(["remote", "add", "origin", REMOTE], OUT);
}

// Fetch the published branch so the new commit becomes a child of what is
// already live, giving git a delta base for the push. The ref is fetched into a
// side ref first: git refuses to fetch into the branch that is currently
// checked out.
//
// The published blobs are fetched IN FULL — this is what makes the push small.
// With `--filter=blob:none` the server's blobs are absent locally, so when git
// builds the push pack it has nothing to delta against and re-sends the export
// almost uncompressed (~55 MB), which is what times out with HTTP 408 on a
// slow link. With the old blobs present the same push compresses down to the
// handful of files that actually changed.
//
// `--depth 1` keeps the fetch to a single published snapshot.
const BASE_REF = "refs/deploy/base";
let haveBase = false;
for (let attempt = 1; attempt <= 3; attempt++) {
  clearStaleLocks();
  haveBase =
    gitQuiet(
      ["fetch", "--depth", "1", "origin", `+${BRANCH}:${BASE_REF}`],
      OUT,
    ) !== "" || hasCommit(BASE_REF);
  if (haveBase) break;
  console.warn(`[infinity] fetch attempt ${attempt} failed, retrying…`);
  execSleep(10_000);
}

// Point the branch at the published head while keeping the worktree and index,
// then stage the fresh export on top of it.
if (haveBase) {
  git(["reset", "--soft", BASE_REF], OUT);
}

git(["add", "-A"], OUT);
gitCommit(`Deploy INFINITY static export (${new Date().toISOString()})`, OUT);
git(["push", "--force", "origin", BRANCH], OUT);

console.log(
  `\n[infinity] published ./out to ${REMOTE} (branch ${BRANCH})\n` +
    "[infinity] GitHub builds the site from that branch — usually live within a few minutes.",
);
