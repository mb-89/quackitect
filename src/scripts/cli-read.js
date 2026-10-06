// What the command line reads: the version and the walk over a folder. The
// lint, the index, links, notes and find verbs run in Go.
// [[spec/tickets/the-check-lint-runs-in-go]]

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
