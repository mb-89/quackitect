// What the command line reads: the version and the walk over a folder. Every
// other reading runs in Go.
// [[spec/design_output/tree#the-tree-handed-in]]

import { join } from "node:path";
import { showOf, walkOver } from "../bridge/findings.js";
import { files, root } from "./cli-doors.js";

export function version() {
  try {
    return JSON.parse(files.read(join(root, "package.json"))).version ?? "0";
  } catch {
    return "0";
  }
}

// [[spec/design_output/tree#the-tree-handed-in]]
export function namesIn(at, end) {
  return files
    .list(at)
    .filter((one) => one.kind === "file" && one.name.endsWith(end))
    .map((one) => one.name);
}

export function walk(where, wanted) {
  return walkOver({ disk: files, join, root }, where, wanted);
}

export function show(file) {
  return showOf({ root }, file);
}
