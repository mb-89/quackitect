// The verb behind `./RUNME.sh split <file>`: it cuts the ranges a caller names
// into targets, writes them through the undo journal, and leaves the rest.
// [[spec/design_output/level0#the-size-ceiling]]

import {
  journalOf,
  nameOf,
  FOLDER as UNDONE,
} from "../../.claude/skills/level0/lib/undo.js";
import { cutsIn, splitText } from "./split-cut.js";

export const BY = "split";

// The flags stand in the design output, and this line is the terminal's own copy. [[spec/design_output/level0#a-verb-cuts-the-file]]
const USAGE = [
  "Usage: ./RUNME.sh split <file> --to <path> --lines <from>-<to> [...] [--dry]",
];

// The flags taking a value, so the value reads as no source. [[spec/design_output/level0#a-verb-cuts-the-file]]
const VALUED = ["--to", "--lines"];

export function splitVerb(it, argv) {
  // The caller hands the flags alone, the way the verbs table hands `rest`. [[spec/design_output/level0#a-verb-cuts-the-file]]
  const said = argv ?? [];
  if (said.includes("--help")) {
    for (const row of USAGE) console.log(row);
    return 0;
  }
  const from = sourceOf(said);
  if (!from) {
    console.error("A split names the file it cuts first, and this call names none.");
    for (const row of USAGE) console.log(row);
    return 2;
  }

  const at = it.join(it.root, from);
  if (!it.disk.exists(at)) {
    console.error(`${from} stands nowhere, so there is nothing to cut.`);
    return 2;
  }

  const read = cutsIn(said);
  if (read.why) {
    console.error(read.why);
    return 2;
  }
  if (read.cuts.some((one) => one.path === from)) {
    console.error(
      `${from} is the source and a target, so the cut writes over what it reads.`,
    );
    return 2;
  }
  // A second cut into one target writes over the first, and both ranges leave the source. [[spec/design_output/level0#a-verb-cuts-the-file]]
  const twice = repeated(read.cuts.map((one) => one.path));
  if (twice) {
    console.error(
      `${twice} takes two cuts, and the second writes over the first. Name one --to a target.`,
    );
    return 2;
  }

  const cut = splitText(it.disk.read(at), read.cuts);
  if (cut.why) {
    console.error(cut.why);
    return 1;
  }

  for (const one of cut.targets) {
    console.log(`${one.path} takes ${one.text.split("\n").length - 1} line(s).`);
  }
  console.log(`${from} keeps ${cut.rest.split("\n").length - 1} line(s).`);
  if (said.includes("--dry")) return 0;

  return wrote(it, from, at, cut);
}

// One entry holds every target and the rest, so one undo puts the whole cut back. [[spec/design_output/apply#the-journal-holds-both-halves]]
function wrote(it, from, at, cut) {
  const files = [
    ...cut.targets.map((one) => ({
      file: one.path,
      was: standing(it, one.path),
      made: one.text,
      born: !it.disk.exists(it.join(it.root, one.path)),
    })),
    { file: from, was: it.disk.read(at), made: cut.rest, born: false },
  ];

  const stamp = it.clock.stamp();
  // The entry names this run, so an undo takes this cut and no other. [[spec/design_output/apply#the-journal-holds-both-halves]]
  const on = `${BY}:${stamp}`;
  const where = it.join(it.root, UNDONE, nameOf(stamp));
  try {
    it.disk.makeDir(it.join(it.root, UNDONE));
    it.disk.write(
      where,
      `${JSON.stringify(journalOf(stamp, on, BY, files), null, 2)}\n`,
    );
  } catch (bad) {
    console.error(
      `The journal would not write, so nothing did: ${bad?.message ?? bad}`,
    );
    return 1;
  }

  // A target names a folder nothing holds yet, and a throw here answers a stack. [[spec/design_output/apply#the-journal-holds-both-halves]]
  for (const one of files) {
    const path = it.join(it.root, one.file);
    try {
      it.disk.makeDir(folderOf(path));
      it.disk.write(path, one.made);
    } catch (bad) {
      console.error(`${one.file} would not write, and ${where} holds the way back.`);
      console.error(String(bad?.message ?? bad));
      return 1;
    }
  }
  console.log(`The cut stands, and mcp__level0__undo takes it back under ${on}.`);
  return 0;
}

// The first token standing outside a flag and outside a flag's value. [[spec/design_output/level0#a-verb-cuts-the-file]]
export function sourceOf(argv) {
  const said = argv ?? [];
  for (let at = 0; at < said.length; at++) {
    if (VALUED.includes(said[at])) {
      at++;
      continue;
    }
    if (!said[at].startsWith("--")) return said[at];
  }
  return "";
}

function repeated(paths) {
  const seen = new Set();
  for (const one of paths) {
    const key = String(one).replaceAll("\\", "/").replace(/^\.\//, "");
    if (seen.has(key)) return one;
    seen.add(key);
  }
  return "";
}

function folderOf(path) {
  const cut = String(path).replace(/[/\\][^/\\]*$/, "");
  return cut === String(path) ? "." : cut;
}

function standing(it, path) {
  const where = it.join(it.root, path);
  return it.disk.exists(where) ? it.disk.read(where) : "";
}
