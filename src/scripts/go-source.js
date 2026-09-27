// The Go binaries the install builds, and when each goes stale. A binary keys
// on a hash of its folder and of every folder its go.mod replaces, as the
// window's does, so a move in a shared package rebuilds it.
// [[spec/design_output/lsp#the-build-beside-the-index]]

import { posix } from "node:path";
import { BIN } from "../../.claude/skills/level0/lib/tools.js";
import { disk } from "../doors/disk.js";
import { runsHere } from "../../.claude/skills/level0/lib/paths.js";
import { sourceHash } from "./tui-build.js";

export const BUILDS = { "se-lsp": "src/lsp", "se-index": "src/index" };

// A replace naming a local folder, which the build reads as source. A replace naming a version reads the module cache, which go.sum pins. [[spec/design_output/lsp#the-build-beside-the-index]]
const REPLACE = /^\s*replace\s+\S+(?:\s+\S+)?\s+=>\s+(\.{1,2}\/\S+)\s*$/gm;

// [[spec/design_output/lsp#the-build-beside-the-index]]
export function foldersOf(files, root, folder) {
  const mod = `${root}/${folder}/go.mod`;
  const text = files.exists(mod) ? String(files.read(mod)) : "";
  const out = [`${root}/${folder}`];
  for (const found of text.matchAll(REPLACE)) {
    out.push(`${root}/${posix.join(folder, found[1])}`);
  }
  return out;
}

function stampOf(root, name) {
  return `${root}/${BIN}/.${name}-source`;
}

function hashOf(files, root, name) {
  return sourceHash(files, foldersOf(files, root, BUILDS[name]));
}

// Whether the stamp beside the binary holds the hash its source reads now. [[spec/design_output/lsp#the-build-beside-the-index]]
export function fresh(files, root, name) {
  const stamp = stampOf(root, name);
  if (!BUILDS[name] || !files.exists(stamp)) return false;
  return String(files.read(stamp)).trim() === hashOf(files, root, name);
}

// [[spec/design_output/lsp#the-build-beside-the-index]]
export function stamps(files, root, name) {
  files.makeDir(`${root}/${BIN}`);
  files.write(stampOf(root, name), `${hashOf(files, root, name)}\n`);
}

// The install asks `fresh <name>` in its here case, and `stamp <name>` after a build. [[spec/design_output/lsp#the-build-beside-the-index]]
if (runsHere(import.meta.url, process.argv)) {
  const [verb, name] = process.argv.slice(2);
  const root = process.cwd().split("\\").join("/");
  if (verb === "stamp") {
    stamps(disk(), root, name);
    process.exit(0);
  }
  process.exit(fresh(disk(), root, name) ? 0 : 1);
}
