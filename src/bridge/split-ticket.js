// The note a file ceiling parks, once a file. The code door calls it on a
// refusal, and the ticket verb writes the private ticket the retro decides.
// [[spec/design_output/level0#the-refusal-parks-the-work]]

import { join } from "node:path";
import { TICKETS as NOTES } from "../../.claude/skills/level0/lib/folders.js";

const PREFIX = "split";
// The name rule counts a name's words, and the prefix takes the first of them. [[spec/design_output/level0#a-name-meets-the-cap]]
const WORDS = 4;

// A basename stands twice across this tree, so the folder above it joins the name. [[spec/design_output/level0#the-refusal-parks-the-work]]
export function noteFor(where) {
  const said = String(where).split(/[/\\]+/).filter(Boolean);
  const name = (said.pop() ?? "").replace(/\.[^.]+$/, "");
  const parts = [said.at(-1) ?? "", name]
    .join("-")
    .split(/[-_.]+/)
    .filter(Boolean)
    .slice(-WORDS);
  return `${NOTES}/${[PREFIX, ...parts].join("-")}.md`;
}

// [[spec/design_output/level0#the-refusal-parks-the-work]]
export function splitTicket(box, where) {
  if (!box?.proc) return "";
  const at = noteFor(where);
  if (box.disk.exists(join(box.root, at))) return `${at} names this cut already.`;

  const name = at.split("/").pop().replace(/\.md$/, "");
  const ran = box.proc.run(
    [
      box.node ?? "node",
      join(box.root, "src", "scripts", "cli.js"),
      "ticket",
      "note",
      name,
      `${where} stands past the file ceiling, so a cut comes before the next write.`,
    ],
    { cwd: box.root },
  );
  if (ran.exitCode !== 0) {
    return `${at} stands unwritten: ${String(ran.stderr ?? ran.stdout ?? "").trim()}`;
  }
  return `${at} parks this cut. Run ./RUNME.sh split ${where} to make it.`;
}
