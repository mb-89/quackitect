// The verb answering the guidance a hand holds. Unnamed it answers the held
// step's notes and the always-on ones, and named it answers one note. It reads
// the hand --as names, the same hand the pull takes.
// [[spec/design_output/pull#the-work-answer]]

import {
  alwaysOn,
  asIn,
  guidanceText,
  handHere,
  holdOf,
  notesSaid,
} from "./guidance-hand.js";

// [[spec/design_output/pull#the-work-answer]]
export function guidance(it, argv = [], env = {}) {
  const name = nameIn(argv);
  if (name) return oneNote(it, name);
  const held = holdOf(it, handHere(it, argv));
  if (!held) {
    console.error("Nothing stands in your hand, so no step names a note.");
    console.error("Run ./RUNME.sh ticket pull to take a leaf, or name a note.");
    return 1;
  }
  const step = (held.reads ?? []).map((one) => one.name);
  const rest = alwaysOn(it, env).filter((one) => !step.includes(one));
  return said(it, [...step, ...rest]);
}

// A name reaching no note refuses, so a typo reads as a typo. [[spec/design_output/pull#the-work-answer]]
function oneNote(it, name) {
  if (!guidanceText(it, name).trim()) {
    console.error(`${name} names no note, so nothing stands to read.`);
    console.error("Run ./RUNME.sh standing to read every note binding this session.");
    return 1;
  }
  return said(it, [name]);
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

function nameIn(argv) {
  const rest = [...(argv ?? [])].map(String);
  const as = asIn(rest);
  for (let i = 0; i < rest.length; i++) {
    const one = rest[i];
    if (one === "--as") {
      i++;
      continue;
    }
    if (one.startsWith("--")) continue;
    if (one === as) continue;
    return bare(one);
  }
  return "";
}

function bare(name) {
  return String(name)
    .trim()
    .replace(/^\[\[|\]\]$/g, "")
    .replace(/\.md$/, "");
}
