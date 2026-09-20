// The ticket a file ceiling mints, once a file. The code door calls it on a
// refusal, and the mint verb writes the note.
// [[spec/design_output/level0#the-size-ceiling]]

import { join } from "node:path";
import { TICKETS } from "../../.claude/skills/level0/lib/folders.js";

const PROCESS = "trivial";
const PREFIX = "split-";

// [[spec/design_output/level0#the-size-ceiling]]
export function ticketFor(where) {
  const name = String(where).split("/").pop().replace(/\.[^.]+$/, "");
  return `${TICKETS}/${PREFIX}${name}.md`;
}

// [[spec/design_output/level0#the-size-ceiling]]
export function splitTicket(box, where) {
  if (!box?.proc) return "";
  const at = ticketFor(where);
  if (box.disk.exists(join(box.root, at))) return `${at} names this cut already.`;

  const ran = box.proc.run(
    [
      box.node ?? "node",
      join(box.root, "src", "scripts", "cli.js"),
      "mint",
      "ticket",
      at,
      `--process=${PROCESS}`,
      `--gain=${where} comes under the ceiling, so every write to it passes the door.`,
      `--breaks=Every write to ${where} meets a refusal, and a hand squeezes lines to pass.`,
      `--done_when=./RUNME.sh lint ${where} names no FileCeiling`,
    ],
    { cwd: box.root },
  );
  // A mint the box refuses leaves the refusal to stand on its own. [[spec/design_output/level0#the-size-ceiling]]
  if (ran.exitCode !== 0) return "";
  return `${at} stands open for this cut. Run ./RUNME.sh split ${where} to make it.`;
}
