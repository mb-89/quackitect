// The rename verb: moves a name and rewrites every reach.
// [[spec/design_output/index#a-rename-reaches-a-name]]

import { join } from "node:path";
import { git } from "../../doors/git.js";
import { files, it, outside, root } from "../cli-doors.js";
import { renaming, renamingText } from "../rename.js";
import { verbMain } from "../verb-run.js";

export function renameHere(argv) {
  const [from, to] = argv.filter((one) => !one.startsWith("-"));
  if (!from || !to) {
    console.error(
      "se rename <from> <to>: say the name that moves and the one it takes.",
    );
    return 2;
  }
  // The clock names the journal entry the move writes. [[spec/tickets/journal-the-rename-verb]]
  const here = { disk: files, join, root, git: git(outside, root), clock: it.clock };
  // A module's name stands as no path, so `--text` rewrites it and moves nothing. [[spec/design_output/index#a-rename-reaches-a-name]]
  const said = argv.includes("--text")
    ? renamingText(here, from, to)
    : renaming(here, from, to);
  if (said.why) {
    console.error(said.why);
    return 1;
  }
  console.log(`${from} stands at ${to}.`);
  for (const one of said.wrote) console.log(`  ${one}`);
  // A rule that skips says what it skips, so a hand reads what the run left out. [[spec/design_output/index#a-rename-reaches-a-name]]
  for (const one of said.skipped ?? []) {
    console.log(
      `  the reader reads ${one} as a picture, so the rewrite leaves it alone`,
    );
  }
  console.log("Run ./RUNME.sh links, then ./RUNME.sh check.");
  return 0;
}

export const run = async (words) => renameHere(words);

await verbMain(import.meta.url, run);
