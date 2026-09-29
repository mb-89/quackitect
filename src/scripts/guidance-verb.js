// The verb answering the guidance a hand holds. Unnamed it answers the held
// step's notes and the always-on ones, named it answers one note, and --step
// answers the notes a process step resolves by its tags.
// [[spec/design_output/pull#the-work-answer]]

import { readYaml } from "../../.claude/skills/level0/lib/schema.js";
import {
  alwaysOn,
  asIn,
  guidanceText,
  handHere,
  holdOf,
  notesSaid,
  PROCESSES,
  readsFor,
} from "./guidance-hand.js";
import { shadowLeaf } from "./guidance-shadow.js";
import { notesOf } from "./quack-topic.js";
import { leafOf } from "./pull-route.js";

const STEP = "--step";

// [[spec/design_output/pull#the-work-answer]]
export function guidance(it, argv = [], env = {}) {
  const asked = stepIn(argv);
  if (asked) return stepNotes(it, asked, env);
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

// A step reads as <process>:<path>, the path its leaf stands at in the route. [[spec/design_input/level-two#guidance]]
function stepNotes(it, step, env) {
  const [name, path = ""] = step.split(":");
  const at = it.join(it.root, ...`${PROCESSES}/${name}.yaml`.split("/"));
  if (!it.disk.exists(at)) {
    console.error(`${name} names no process under ${PROCESSES}.`);
    return 1;
  }
  const front = { steps: readYaml(String(it.disk.read(at))).steps };
  const leaf = leafOf(front, path);
  if (!leaf) {
    console.error(`${name} names no step ${path}, or names one holding steps.`);
    return 1;
  }
  // The notes come off quack guidance where the guidance slice reads new. [[spec/tickets/readers-take-the-go-topics]]
  const notes = notesOf(it, `${name}:${path}`, () => readsFor(it, leaf, env));
  // The verb reads its answer now, and the shadow row lands behind it. [[spec/tickets/the-guidance-topic-lands]]
  shadowLeaf(it, `${name}:${path}`, notes);
  return said(it, notes);
}

function stepIn(argv) {
  const rest = [...(argv ?? [])].map(String);
  const at = rest.indexOf(STEP);
  if (at >= 0) return String(rest[at + 1] ?? "").trim();
  const inline = rest.find((one) => one.startsWith(`${STEP}=`));
  return inline ? inline.slice(STEP.length + 1).trim() : "";
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
