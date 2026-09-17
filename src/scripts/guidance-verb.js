// The verb answering the guidance a hand holds. Unnamed it answers the held
// step's notes and the always-on ones, and named it answers one note.
// [[spec/design_output/pull#the-work-answer]]

import { alwaysOn, holdOf, notesSaid } from "./guidance-hand.js";
import { handOf } from "./hand.js";

// [[spec/design_output/pull#the-work-answer]]
export function guidance(it, name = "", env = {}) {
  const held = holdOf(it, handOf(it));
  if (name) return said(it, [bare(name)]);
  if (!held) {
    console.error("Nothing stands in your hand, so no step names a note.");
    console.error("Run ./RUNME.sh branch pull to take a leaf, or name a note.");
    return 1;
  }
  const step = (held.reads ?? []).map((one) => one.name);
  const rest = alwaysOn(it, env).filter((one) => !step.includes(one));
  return said(it, [...step, ...rest]);
}

function said(it, paths) {
  const rows = notesSaid(it, paths);
  if (!rows.length) {
    console.log("No note here carries an Actionables chapter.");
    return 0;
  }
  console.log(rows.join("\n").trim());
  return 0;
}

function bare(name) {
  return String(name)
    .trim()
    .replace(/^\[\[|\]\]$/g, "")
    .replace(/\.md$/, "");
}
