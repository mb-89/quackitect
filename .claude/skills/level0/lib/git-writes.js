// The git commands that write the repository, each with the verb standing for
// it or the road where none stands. The agent reaches git through the engine.
// [[spec/design_output/bash#git-writes-take-verbs]]

import { TICKETS } from "../../../../src/engine/group.js";
import { afterGit, partsOf, row, wordsIn } from "./bash.js";
import { baseName, clean } from "./tokens.js";

export const RULE = "GitWritesThroughAVerb";
export const TICKET_RULE = "TicketMovesByRename";

const LANDS =
  "Land the change through ./RUNME.sh commit, which stages, commits and runs the check.";
const MERGES = "Take a branch in with ./RUNME.sh branch merge <branch>, on main.";
const SYNCS = "Take main into a work branch with ./RUNME.sh branch sync.";

// [[spec/design_output/bash#git-writes-take-verbs]]
export const GIT_WRITES = {
  add: LANDS,
  stage: LANDS,
  rm: LANDS,
  commit: LANDS,
  revert:
    "No verb reverts. Write the change back, and land it through ./RUNME.sh commit.",
  push: "Push with ./RUNME.sh push once the check answers green, or let ./RUNME.sh commit push from a cloud box.",
  merge: MERGES,
  pull: SYNCS,
  mv: "Move a name with ./RUNME.sh rename <from> <to>, which rewrites every reach.",
  stash: `No verb stashes. ${LANDS}`,
  rebase: `No verb rewrites history. ${SYNCS}`,
  reset:
    "No verb moves a branch back. Put a write back with mcp__level0__undo, or ask a person.",
  tag: "No verb tags. A tag is a person's act, so ask a person.",
  "cherry-pick": `No verb takes one commit. ${MERGES}`,
};

// Every git write a command runs, as its subcommand and the words after it. [[spec/design_output/bash#git-writes-take-verbs]]
export function gitWritesIn(command) {
  const out = [];
  for (const one of partsOf(command).segments) {
    const words = wordsIn(one);
    if (baseName(words[0]) !== "git") continue;
    const [sub, ...args] = afterGit(words);
    if (Object.hasOwn(GIT_WRITES, sub ?? "")) out.push({ sub, args });
  }
  return out;
}

// A move under the ticket folder answers the rename verb alone, so one command answers one row. [[spec/design_output/bash#git-writes-take-verbs]]
export function gitWriteRows(command) {
  return gitWritesIn(command).map(({ sub, args }) =>
    sub === "mv" && args.some(movesATicket)
      ? row(command, TICKET_RULE, "git mv", [
          "A ticket moves through ./RUNME.sh rename <from> <to>, which rewrites every",
          "link reaching it. git mv leaves each link pointing at the old name.",
        ])
      : row(command, RULE, `git ${sub}`, [
          `git ${sub} writes the repository, and the agent reaches git through the`,
          `engine alone. ${GIT_WRITES[sub]}`,
        ]),
  );
}

function movesATicket(arg) {
  const said = clean(arg).replace(/^\.\//, "");
  return said === TICKETS || said.startsWith(`${TICKETS}/`);
}
