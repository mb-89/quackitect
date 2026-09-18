// The retro verbs a group's route names. notes reads the private folder and
// passes when no note stands open there, which is the drain a cloud box runs
// before it leaves. The retro's own route lands on a later branch.
// [[spec/design_output/pull#a-need-is-a-verb]]

import { fieldOf, NOTE_END, ticketNamed } from "./group.js";
import { collect } from "./retro-collect.js";

const CHAPTER = "chapter";
import { newRetro } from "./retro-new.js";
import { score } from "./retro-score.js";
import { NOTES } from "./ticket.js";

export function retro(root, argv, doors) {
  const it = { root, method: root, work: root, ...doors };
  const what = argv[0];
  if (what === "notes") return notes(it);
  // [[spec/design_input/the-agent-pulls-tickets]]
  if (what === "collect") return collect(it, argv[1]);
  // [[spec/design_input/the-agent-pulls-tickets]]
  if (what === "new") return newRetro(it, argv);
  // [[spec/design_input/the-agent-pulls-tickets]]
  if (what === "score") return score(it);
  console.log("Usage: ./RUNME.sh retro <verb>\n");
  console.log(
    "  notes            the private notes still open on this box, and 0 when none stands",
  );
  console.log(
    "  collect <ticket> copies this box into the retro's folder, and writes its manifest",
  );
  console.log(
    "  new              mints a retro off its route, opens it, and hands out its first leaf",
  );
  console.log(
    "  score            the improvements earlier retros mint, and how many stay open",
  );
  return what ? 2 : 0;
}

// The mint writes the route a note carries, and that field tells a chapter from a parked note. [[spec/tickets/the-retro-cuts-its-window]]
function isChapter(text) {
  return fieldOf(text, "process").split("/").pop().replace(/\]\]$/, "") === CHAPTER;
}

// [[spec/design_output/pull#a-need-is-a-verb]]
function notes(it) {
  const at = it.join(it.root, ...NOTES.split("/"));
  const open = it.disk.exists(at)
    ? it.disk
        .list(at)
        .filter((one) => one.kind === "file" && one.name.endsWith(NOTE_END))
        .map((one) => ({
          name: ticketNamed(one.name),
          text: it.disk.read(it.join(at, one.name)),
        }))
        .filter((one) => fieldOf(one.text, "state") !== "closed")
        // A chapter closes at the readers step, so the drain decides none of them. [[spec/tickets/the-retro-cuts-its-window]]
        .filter((one) => !isChapter(one.text))
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
