// The bundle step. React Flow ships as modules and a webview loads a script
// alone, so esbuild writes the drawing into one script and one style sheet.
// Install runs this, and the script lands in the runtime folder, which git and
// every walk of the tree pass over.
// [[spec/design_input/the-editor-draws-the-ticket#the-owner-rules]]

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { inRun } from "../../.claude/skills/level0/lib/folders.js";
import { disk } from "../doors/disk.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const WEBVIEW = join(root, "src", "extension", "webview");
export const ENTRY = join(WEBVIEW, "route", "drawing.js");
export const OUT = join(root, inRun("drawing"), "route.js");
const ESBUILD = join(WEBVIEW, "node_modules", "esbuild", "lib", "main.js");

// The newest source the bundle reads, so a stale bundle asks for the step again. [[spec/design_input/the-editor-draws-the-ticket#the-owner-rules]]
export function newest(folder, files = disk()) {
  let out = 0;
  for (const one of files.list(folder)) {
    const at = join(folder, one.name);
    out = Math.max(out, one.kind === "dir" ? newest(at, files) : files.modified(at));
  }
  return out;
}

// [[spec/design_input/the-editor-draws-the-ticket#the-owner-rules]]
export function bundled(files = disk()) {
  if (!files.exists(OUT)) return false;
  return files.modified(OUT) >= newest(dirname(ENTRY), files);
}

// esbuild lands beside the webview, so the step imports it by its path. [[spec/design_input/the-editor-draws-the-ticket#the-owner-rules]]
export async function bundle() {
  const said = await import(pathToFileURL(ESBUILD).href);
  await (said.build ?? said.default.build)({
    entryPoints: [ENTRY],
    outfile: OUT,
    bundle: true,
    minify: true,
    format: "iife",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "warning",
  });
}

// The install asks `here` first, and runs the step where it answers one. [[spec/design_input/the-editor-draws-the-ticket#the-owner-rules]]
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "here") process.exit(bundled() ? 0 : 1);
  await bundle();
}
