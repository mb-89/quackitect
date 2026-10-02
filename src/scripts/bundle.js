// The bundle step. React Flow ships as modules and a webview loads a script
// alone, so esbuild writes the drawing into one script and one style sheet.
// The pair ships in git under the extension, so a fresh clone draws with no
// build, and a banner names the hash of the sources it was built from.
// [[spec/design_output/drawing#the-drawing-ships-prebuilt]]

import { createHash } from "node:crypto";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { disk } from "../doors/disk.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const WEBVIEW = join(root, "src", "extension", "webview");
export const ENTRY = join(WEBVIEW, "route", "drawing.js");
// The folder editor-inset.js reads the drawing off. [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
export const OUT = join(root, "src", "extension", "drawing", "route.mjs");
const ESBUILD = join(WEBVIEW, "node_modules", "esbuild", "lib", "main.js");
const LOCK = join(WEBVIEW, "package-lock.json");
const BANNER = "// sources ";

// Every file the bundle reads: the sources under the entry's folder, and the lock naming the modules. [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
function sourcesOf(folder, files) {
  const out = [];
  for (const one of files.list(folder)) {
    const at = join(folder, one.name);
    if (one.kind === "dir") out.push(...sourcesOf(at, files));
    else out.push(at);
  }
  return out;
}

// The hash of the sources, each under its path from the root in forward slashes, so every box reads one stamp. [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
export function stampOf(files = disk()) {
  const hash = createHash("sha256");
  const named = [...sourcesOf(dirname(ENTRY), files), LOCK]
    .map((at) => ({ at, path: relative(root, at).split("\\").join("/") }))
    .sort((a, b) => (a.path < b.path ? -1 : 1));
  for (const one of named) {
    hash.update(`${one.path}\n`);
    hash.update(String(files.read(one.at)));
    hash.update("\n");
  }
  return hash.digest("hex");
}

// Whether the shipped banner names the stamp the sources give now. [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
export function fresh(files = disk()) {
  if (!files.exists(OUT)) return false;
  return String(files.read(OUT)).split("\n")[0] === `${BANNER}${stampOf(files)}`;
}

// esbuild lands beside the webview, so the step imports it by its path. A case names its own entry and out, and the drawing's stand as the defaults. [[spec/tickets/the-battery-runs-on-fixtures]]
export async function bundle({ entry = ENTRY, out = OUT, files = disk() } = {}) {
  const said = await import(pathToFileURL(ESBUILD).href);
  await (said.build ?? said.default.build)({
    entryPoints: [entry],
    outfile: out,
    bundle: true,
    minify: true,
    format: "iife",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    banner: { js: `${BANNER}${stampOf(files)}` },
    logLevel: "warning",
  });
}

// A maintainer runs this after a change under the webview, and `here` answers whether the shipped drawing stands fresh. [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "here") process.exit(fresh() ? 0 : 1);
  await bundle();
}
