// The retro verbs a group's route names. notes reads the private folder and
// passes when no note stands open there, which is the drain a cloud box runs
// before it leaves. The retro's own route lands on a later branch.
// [[spec/design_output/pull#a-need-is-a-verb]]

import { fieldOf } from "./group.js";
import { NOTES } from "./ticket.js";

export function retro(root, argv, doors) {
  const it = { root, ...doors };
  const what = argv[0];
  if (what !== "notes") {
    console.log("Usage: ./RUNME.sh retro <verb>\n");
    console.log(
      "  notes         the private notes still open on this box, and 0 when none stands",
    );
    return what ? 2 : 0;
  }
  return notes(it);
}

// [[spec/design_output/pull#a-need-is-a-verb]]
function notes(it) {
  const at = it.join(it.root, ...NOTES.split("/"));
  const open = it.disk.exists(at)
    ? it.disk
        .list(at)
        .filter((one) => one.kind === "file" && one.name.endsWith(".md"))
        .map((one) => ({
          name: one.name.slice(0, -3),
          text: it.disk.read(it.join(at, one.name)),
        }))
        .filter((one) => fieldOf(one.text, "state") !== "closed")
    : [];
  if (!open.length) {
    console.log(`${NOTES} holds no open note, so the box leaves nothing behind.`);
    return 0;
  }
  console.log(
    `${open.length} note(s) stand open under ${NOTES}. Decide each one, then run this again:`,
  );
  for (const one of open) console.log(`  ${one.name}`);
  return 1;
}
