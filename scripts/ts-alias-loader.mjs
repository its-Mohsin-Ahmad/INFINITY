/**
 * Minimal ESM resolver so plain Node can run INFINITY's TypeScript modules
 * (no bundler) during verification.
 *
 *   · "@\/x"             -> <root>/src/x        (.ts/.tsx/.js/index.* tried in order)
 *   · "./x" / "../x"     -> resolved relative to the importing module, same
 *                           extension probing so extensionless imports work.
 *
 * Node's built-in type stripping handles the TypeScript syntax itself, so this
 * loader only has to solve specifier resolution.
 */
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(process.cwd());
const CANDIDATE_SUFFIXES = [
  "",
  ".ts",
  ".tsx",
  ".mts",
  ".js",
  ".mjs",
  path.join("index.ts"),
  path.join("index.tsx"),
  path.join("index.js"),
];

function firstExistingFile(basePath) {
  for (const suffix of CANDIDATE_SUFFIXES) {
    const candidate = basePath + suffix;
    try {
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    } catch {
      /* ignore and try the next candidate */
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  let basePath = null;

  if (specifier.startsWith("@/")) {
    basePath = path.join(ROOT, "src", specifier.slice(2));
  } else if (specifier.startsWith("./") || specifier.startsWith("../")) {
    const parentPath = context.parentURL ? fileURLToPath(context.parentURL) : null;
    if (parentPath) basePath = path.resolve(path.dirname(parentPath), specifier);
  }

  if (basePath) {
    const resolved = firstExistingFile(basePath);
    if (resolved) {
      // Note: `format` is intentionally omitted so Node applies its built-in
      // TypeScript type-stripping to .ts files. Forcing "module" here would
      // send the file through the plain-JS translator and fail on `import type`.
      return { url: pathToFileURL(resolved).href, shortCircuit: true };
    }
  }

  return nextResolve(specifier, context);
}
