// The one reading of git the listing takes. `answerOf` reads the branches
// and their tickets once, and `branch list --queue` orders that reading, so
// the listing and the pull read one truth.
// [[spec/design_output/work#one-reading-answers-git]]

import {
  askOf,
  dependsOn,
  fieldOf,
  frontOf,
  GROUP,
  heldIn,
  isGroup,
  OPEN,
  stepOf,
  urgent,
} from "../engine/group.js";
import { takeable } from "./pull.js";
import { leafOf, leavesOf } from "./pull-route.js";
import { queued, stoodHere } from "./pull-queue.js";
import { staleClaim } from "./work-free.js";
import { readWork, standingAll } from "./work-stands.js";

// [[spec/design_output/work#one-reading-answers-git]]
export function rowOfTicket(one, places, stood = new Map(), open = new Set()) {
  const said = {
    name: one.name,
    // A ticket is a ticket or a group, and the tab draws which. [[spec/design_output/tree-view#the-columns-read-the-item]]
    kind: isGroup(one.text) ? GROUP : "ticket",
    state: fieldOf(one.text, "state") || OPEN,
    step: stepOf(one.text),
    progress: progressOf(one.text),
    group: fieldOf(one.text, GROUP),
    // The flags a row carries, each an ordinary key the filter reads. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
    urgent: urgent(one.text),
    person: personStep(one.text),
    held: Boolean(heldIn(one.text)),
    waits: dependsOn(frontOf(one.text)).some((dep) => open.has(dep)),
    todo: fieldOf(one.text, "todo") === "true",
    // The whole ask travels, because the details draw it whole and the table draws none of it. [[spec/design_output/tui#the-work-tab]]
    says: askOf(one.text),
  };
  // The time a ticket came in orders the oldest first. [[spec/design_output/pull#the-queue-is-a-score]]
  const came = stood.get(one.path);
  if (came) said.stood = came;
  const place = places.get(one.name);
  return place === undefined ? said : { ...said, queue: place };
}

// The leaf a ticket stands on, of the leaves its route holds. [[spec/design_output/work#one-reading-answers-git]]
export function progressOf(text) {
  const front = frontOf(text);
  const leaves = leavesOf(front);
  if (!leaves.length) return "";
  const at = leaves.findIndex((one) => one.path === stepOf(text));
  return `${at < 0 ? leaves.length : at + 1}/${leaves.length}`;
}

// A step a person owns leaves the agent's queue and stands first in the person's. [[spec/design_output/pull#the-queue-is-a-score]]
export function personStep(text) {
  const leaf = leafOf(frontOf(text), stepOf(text));
  return String(leaf?.by ?? "") === "person";
}

// The last column takes what it fits, so the answer carries this much of a line. [[spec/design_output/work#one-reading-answers-git]]
const SAYS_CUT = 160;

// The ask's first line, which the last column carries. [[spec/design_output/work#one-reading-answers-git]]
export function firstLine(said) {
  const row = String(said ?? "")
    .split("\n")
    .map((one) => one.trim())
    .find(Boolean);
  return (row ?? "").slice(0, SAYS_CUT);
}

// Every ticket the answer names, each once, with a branch's copy first. [[spec/design_output/work#one-reading-answers-git]]
export function ticketsIn(read) {
  const out = new Map();
  for (const one of [...read.stand.flatMap((held) => held.tickets), ...read.loose]) {
    if (!out.has(one.name)) out.set(one.name, { ...one, front: frontOf(one.text) });
  }
  return [...out.values()];
}

// The order the pull hands out, as a place a name. [[spec/design_output/pull#the-queue-is-a-score]]
export function placesIn(it, read, stood) {
  const all = ticketsIn(read);
  const open = all.filter(
    (one) => fieldOf(one.text, "state") === OPEN && takeable(it, one, all),
  );
  const at = { clock: it.clock, weights: it.weights, stood };
  return new Map(queued(open, all, at).map((one, place) => [one.name, place + 1]));
}

// The queue rides every answer, because a reader of the listing wants each row's place. [[spec/design_output/pull#the-queue-is-a-score]]
export function answerOf(it, queue = true) {
  const read = readWork(it, true);
  const standing = standingAll(read.stand);
  const now = it.clock ? it.clock.now().getTime() : 0;
  const stood = queue ? stoodHere(it) : new Map();
  const places = queue ? placesIn(it, read, stood) : new Map();
  // A branch row stands for its group, so a trunk ticket under that group rides the branch and no other row. [[spec/design_output/work#one-verb-answers-git]]
  const branched = new Set(read.stand.map((one) => one.name));
  // A ticket waiting on one still open carries the flag saying so. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
  const open = new Set(
    ticketsIn(read)
      .filter((one) => fieldOf(one.text, "state") === OPEN)
      .map((one) => one.name),
  );

  return {
    branches: read.stand.map((one) => {
      const { age, stale } = staleClaim(one, now, it);
      const place = places.get(one.name);
      return {
        branch: one.branch,
        name: one.name,
        tip: one.tip,
        when: one.when,
        merged: one.merged,
        status: standing.get(one.branch) ?? "",
        kind: GROUP,
        step: one.ticket ? stepOf(one.ticket) : "",
        progress: one.ticket ? progressOf(one.ticket) : "",
        person: Boolean(one.ticket) && personStep(one.ticket),
        urgent: Boolean(one.ticket) && urgent(one.ticket),
        held: Boolean(one.ticket) && Boolean(heldIn(one.ticket)),
        says: askOf(one.ticket),
        age,
        stale,
        ...(place === undefined ? {} : { queue: place }),
        tickets: one.tickets
          .filter((child) => fieldOf(child.text, GROUP) === one.name)
          .map((child) => rowOfTicket(child, places, stood, open)),
      };
    }),
    // Every other ticket on trunk stands here, a group among them, and the tab nests each one under the group it names. [[spec/design_output/tree-view#the-name-column-nests]]
    loose: read.loose
      .filter((one) => !branched.has(one.name) && !branched.has(fieldOf(one.text, GROUP)))
      .map((one) => rowOfTicket(one, places, stood, open)),
  };
}
