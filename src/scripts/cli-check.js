// What the verbs past the check read: the grid, the viewer, the work root
// and the doors. The check, the projections and the config verbs run in Go.
// [[spec/design_output/level0#the-check-reads-the-server]]

import { join, sep } from "node:path";
import { boxOf } from "../../.claude/skills/level0/lib/private.js";
import { treeOf } from "../../.claude/skills/level0/lib/tree.js";

import {
  CONTRACT,
  DOORS,
  files,
  go,
  it,
  outside,
  root,
} from "./cli-doors.js";
import { namesIn, show } from "./cli-read.js";
import { viewerOf } from "./tui-build.js";

export function treeHere() {
  return treeOf({
    disk: files,
    git: it.git,
    root,
    words: it.words,
    node: process.version.replace(/^v/, ""),
    box: boxOf(process.env, it.git),
  });
}

// The server runs as its own node process, so the debugger attaches to it and a restart loses the session nothing. [[spec/design_output/level0#the-bridgehead-and-the-server]]

export function tuiDoors() {
  return {
    root,
    join,
    disk: files,
    proc: outside,
    viewer: viewerHere,
    names: namesIn,
    show,
    // The log verb reads a span against now, and a door answers the clock. [[spec/guidance/code/testing]]
    clock: it.clock,
    // The log verb reads its slice's mode, and runs quack under the method root. [[spec/tickets/readers-take-the-go-topics]]
    slices: it.slices,
    method: it.method,
  };
}

// The split verb writes files and a journal entry, and the clock names that entry. [[spec/design_output/level0#the-size-ceiling]]
export function splitDoors() {
  return { root, join, disk: files, clock: it.clock };
}

export function viewerHere() {
  return viewerOf({
    disk: files,
    proc: outside,
    root: root.split(sep).join("/"),
    go,
    windows: process.platform === "win32",
  });
}

// A target lands in the work root, and a source reads off both. [[spec/design_output/vehicle#the-work-root-inherits]]
export function under(path) {
  return join(it.work, String(path).split("/").join(sep));
}

// [[spec/design_output/schema#mint-writes-a-valid-note]]
// [[spec/design_output/schema#the-fields-a-caller-names]]

// [[spec/guidance/code/testing]]

export function doorsHold() {
  const named = (at, end) =>
    files
      .list(at)
      .filter((one) => one.kind === "file" && one.name.endsWith(end))
      .map((one) => one.name.slice(0, -end.length));

  const doors = named(DOORS, ".js");
  const held = named(CONTRACT, ".test.js");
  const missing = doors.filter((name) => !held.includes(name));

  for (const name of missing) {
    console.error(`src/doors/${name}.js has no test/contract/${name}.test.js.`);
  }
  if (missing.length) {
    console.error("A door with no contract test lets its fake drift. Write one.");
    return 1;
  }
  console.log(`${doors.length} doors, and a contract test holds each one.`);
  return 0;
}
