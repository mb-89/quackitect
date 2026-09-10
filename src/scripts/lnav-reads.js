#!/usr/bin/env node
// Teaches lnav to read this tree: the row format, the theme, and the choice.
// The installer runs this through node, because the Windows build answers 0
// after failing under a shell parent, so the answer is read back here.
// [[spec/design_output/log#the-viewer-learns-this-tree]]

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { disk } from "../doors/disk.js";
import { proc } from "../doors/proc.js";
import { readTools, whereIs } from "./tools.js";

const THEME = "quackitect";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const config = join(root, "spec", "config", "lnav");

function lnavHere() {
  const here = whereIs(files, root, "lnav", readTools(files, root));
  if (files.exists(here)) return here;
  try {
    return outside.run(["lnav", "-V"]).exitCode === 0 ? "lnav" : "";
  } catch {
    return "";
  }
}

const viewer = lnavHere();
if (!viewer) {
  console.error("lnav stands nowhere, so it learns nothing. Run ./RUNME.sh first.");
  process.exit(1);
}

for (const name of ["quackitect.json", "theme.json"]) {
  outside.run([viewer, "-i", join(config, name)], { cwd: root });
}
outside.run([viewer, "-n", "-c", `:config /ui/theme ${THEME}`], { cwd: root });

const reads = outside.run([viewer, "-n", "-c", ":config /ui/theme"], { cwd: root });
if (!reads.stdout.includes(THEME)) {
  console.error(`lnav answers ${reads.stdout.trim() || "nothing"}, and not ${THEME}.`);
  console.error("It reads its own folder, so the format and the theme stay missing.");
  process.exit(1);
}

console.log(`lnav reads this tree: the ${THEME} format, and the ${THEME} theme.`);
