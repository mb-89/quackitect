// The verb behind `./RUNME.sh split <file>`: it cuts the ranges a caller names
// into targets, writes them through the undo journal, and leaves the rest.
// [[spec/design_output/level0#the-size-ceiling]]

import { join } from "node:path";
import {
  FOLDER as UNDONE,
  journalOf,
  nameOf,
} from "../../.claude/skills/level0/lib/undo.js";
import { cutsIn, splitText } from "./split-cut.js";

export const BY = "split";

const USAGE = [
  "Usage: ./RUNME.sh split <file> --to <path> --lines <from>-<to> [...]\n",
  "  --to <path>        one target the cut writes",
  "  --lines <from>-<to> the lines that target takes, named after each --to",
  "  --dry              the cuts it would write, and no write",
];

export function splitVerb(it, argv) {
  const said = (argv ?? []).slice(1);
  const from = said.find((one) => !one.startsWith("--")) ?? "";
  if (!from || said.includes("--help")) {
    for (const row of USAGE) console.log(row);
    return from ? 0 : 2;
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
  const where = it.join(it.root, UNDONE, nameOf(stamp));
  it.disk.makeDir(it.join(it.root, UNDONE));
  it.disk.write(where, `${JSON.stringify(journalOf(stamp, BY, BY, files), null, 2)}\n`);

  for (const one of files) it.disk.write(it.join(it.root, one.file), one.made);
  console.log(`The cut stands, and mcp__level0__undo takes it back under ${BY}.`);
  return 0;
}

function standing(it, path) {
  const where = it.join(it.root, path);
  return it.disk.exists(where) ? it.disk.read(where) : "";
}

export { join };
