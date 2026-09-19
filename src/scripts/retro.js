// The retro verbs a group's route names. notes reads the private folder and
// passes when no note stands open there, which is the drain a cloud box runs
// before it leaves. The retro's own route lands on a later branch.
// [[spec/design_output/pull#a-need-is-a-verb]]

import { chapters } from "../engine/retro/chapters.js";
import { classes } from "../engine/retro/classes.js";
import { effect } from "../engine/retro/effect.js";
import { matrix } from "../engine/retro/matrix.js";
import { timeline } from "../engine/retro/timeline.js";
import { fieldOf, NOTE_END, ticketNamed } from "./group.js";
import { collect } from "./retro-collect.js";
import { newRetro } from "./retro-new.js";
import { score } from "./retro-score.js";
import { NOTES } from "./ticket.js";

export function retro(root, argv, doors) {
  const it = { root, method: root, work: root, ...doors };
  const what = argv[0];
  if (what === "notes") return notes(it);
  // [[spec/design_input/the-agent-pulls-tickets]]
  if (what === "collect") return collect(it, argv[1], argv.includes("--again"));
  // [[spec/guidance/retro/chapter]]
  if (what === "timeline") return timeline(it, argv[1]);
  if (what === "chapters") return chapters(it, argv[1]);
  // [[spec/guidance/retro/read]]
  if (what === "matrix") return matrix(it, argv[1]);
  // [[spec/guidance/retro/effect]]
  if (what === "effect") return effect(it, argv[1]);
  // [[spec/guidance/retro/classify]]
  if (what === "classes") return classes(it, argv[1]);
  // [[spec/design_input/the-agent-pulls-tickets]]
  if (what === "new") return newRetro(it, argv);
  // [[spec/design_input/the-agent-pulls-tickets]]
  if (what === "score") return score(it);
  console.log("Usage: ./RUNME.sh retro <verb>\n");
  console.log(
    "  notes            the private notes still open on this box, and 0 when none stands",
  );
  console.log(
    "  collect <ticket> copies this box into the retro's folder, and writes its manifest; --again merges what arrived since",
  );
  console.log(
    "  new              mints a retro off its route, opens it, and hands out its first leaf",
  );
  console.log(
    "  timeline <retro> the hours holding work, per source, with the idle stretches between",
  );
  console.log("  chapters <retro> checks the cuts, and hands every chapter its lines");
  console.log(
    "  matrix <retro>   draws the report: the class fixes first, then the matrix",
  );
  console.log(
    "  effect <retro>   counts the last retro's class patterns over this input",
  );
  console.log(
    "  classes <retro>  counts each class's rate, and refuses a finding with no disposition",
  );
  console.log(
    "  score            the improvements earlier retros mint, and how many stay open",
  );
  return what ? 2 : 0;
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
