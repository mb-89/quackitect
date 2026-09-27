// The Go binaries the install builds, and when each goes stale. A binary keys
// on a hash of its folder, of every tree package it imports and of the root
// module files, as the window's does, so a move in a shared package rebuilds it.
// [[spec/design_output/lsp#the-build-beside-the-index]]

import { BIN } from "../../.claude/skills/level0/lib/tools.js";
import { disk } from "../doors/disk.js";
import { runsHere } from "../../.claude/skills/level0/lib/paths.js";
import { goFoldersOf } from "./cli-go.js";
import { MODULE_FILES, sourceHash } from "./tui-build.js";

export const BUILDS = {
  "se-lsp": "src/lsp",
  "se-index": "src/index",
  "se-front": "src/front/cmd",
};

// The binary's folder, every tree package it imports, and the root module files, which pin every dependency. [[spec/tickets/go-code-shares-one-module]]
export function foldersOf(files, root, folder) {
  return [
    ...goFoldersOf(files, root, folder).map((one) => `${root}/${one}`),
    ...MODULE_FILES.map((one) => `${root}/${one}`),
  ];
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
