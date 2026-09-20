// The one reading of git the listing takes. `answerOf` reads the branches
// and their tickets once, and `branch list --queue` orders that reading, so
// the listing and the pull read one truth.
// [[spec/design_output/work#one-reading-answers-git]]

import {
  askOf,
  CLOSED,
  dependsOn,
  DRAFT,
  fieldOf,
  frontOf,
  GROUP,
  heldIn,
  isGroup,
  OPEN,
  stepOf,
  todoOf,
  urgent,
} from "../engine/group.js";
import { PLANS } from "../../.claude/skills/level0/lib/runs.js";
import { takeable } from "./pull.js";
import { ticketsHere } from "./pull-hand.js";
import { leafOf, leavesOf } from "./pull-route.js";
import { outlineIn } from "./pull-outline.js";
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
    todo: todoOf(frontOf(one.text)) !== "",
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

// Every ticket the answer names, each once. A standing branch speaks for its own group and its tickets, trunk for the rest, and a merged branch for nothing, because trunk holds what it brings in. [[spec/design_output/work#one-reading-answers-git]]
export function ticketsIn(read) {
  const out = new Map();
  const standing = read.stand.filter((held) => !held.merged);
  for (const one of [
    ...standing.flatMap((held) => ownTickets(held)),
    ...read.loose,
    ...(read.private ?? []),
  ]) {
    if (!out.has(one.name)) out.set(one.name, { ...one, front: frontOf(one.text) });
  }
  return [...out.values()];
}

// The tickets a branch owns: its group's and the ones naming that group. Any other ticket on it is a stale copy of trunk's. [[spec/design_output/pull#the-queue-is-an-outline]]
function ownTickets(held) {
  return held.tickets.filter(
    (one) => one.name === held.name || fieldOf(one.text, GROUP) === held.name,
  );
}

// The order the pull hands out, as an outline place a name. A person's open steps order first and count down, and the agent's takeable ones count up. [[spec/design_output/pull#the-queue-is-an-outline]]
export function placesIn(it, read, stood) {
  const all = ticketsIn(read);
  const open = all.filter((one) => fieldOf(one.text, "state") !== CLOSED);
  const at = { clock: it.clock, weights: it.weights, stood };
  // A person's step and a draft wait on a person. The agent's takeable steps count next, and every other open ticket after them. [[spec/design_output/pull#the-queue-is-an-outline]]
  // A ticket a hand holds, or the one the plan names, stands at zero. [[spec/design_output/pull#the-queue-is-an-outline]]
  const working = workingHere(it);
  const inHand = open.filter((one) => Boolean(heldIn(one.text)) || one.name === working);
  const free = open.filter((one) => !inHand.includes(one));
  const persons = queued(free.filter(waitsOnPerson), all, at);
  const agents = queued(
    free.filter((one) => !waitsOnPerson(one) && takeable(it, one, all)),
    all,
    at,
  );
  const back = queued(
    free.filter((one) => !waitsOnPerson(one) && !takeable(it, one, all)),
    all,
    at,
  );
  return outlineIn(persons, inHand, [...agents, ...back], all);
}

// The ticket or todo the plan names as the work in hand, off the box's plan file. [[spec/design_output/stop#the-plan]]
function workingHere(it) {
  try {
    return String(JSON.parse(it.disk.read(it.join(it.root, ...PLANS.split("/")))).working ?? "");
  } catch {
    return "";
  }
}

// [[spec/design_output/pull#the-queue-is-an-outline]]
function waitsOnPerson(one) {
  return personStep(one.text) || fieldOf(one.text, "state") === DRAFT;
}

// The queue rides every answer, because a reader of the listing wants each row's place. [[spec/design_output/pull#the-queue-is-a-score]]
export function answerOf(it, queue = true) {
  // The box's private notes stand in the queue beside trunk's tickets, because the pull hands them out too. [[spec/design_output/pull#the-queue-is-an-outline]]
  const read = { ...readWork(it, true), private: privateHere(it) };
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
    loose: [...read.loose, ...read.private]
      .filter((one) => !branched.has(one.name) && !branched.has(fieldOf(one.text, GROUP)))
      .map((one) => rowOfTicket(one, places, stood, open)),
  };
}

// The private notes on this box, read the way the pull reads them, and nothing where the box holds none. [[spec/design_output/pull#the-queue-is-an-outline]]
function privateHere(it) {
  if (!it.disk || !it.join) return [];
  return ticketsHere(it).filter((one) => one.private);
}
