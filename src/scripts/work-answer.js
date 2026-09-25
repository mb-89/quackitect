// The one reading of git the listing takes. `answerOf` reads the branches
// and their tickets once, and `branch list --queue` orders that reading, so
// the listing and the pull read one truth.
// [[spec/design_output/work#one-reading-answers-git]]

import {
  agentOpens,
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
import { onNoteRoute } from "../../.claude/skills/level0/lib/ticket.js";
import { ASKS, holdsIn, isEphemeral } from "./ephemeral.js";
import { takeable } from "./pull.js";
import { ticketsHere } from "./pull-hand.js";
import { leafOf, leavesOf } from "./pull-route.js";
import { CLOUD_PLACE, FIRST, LAST, outlineIn } from "./pull-outline.js";

// The place of the work in hand, and the state a row there reads. [[spec/design_output/pull#the-queue-is-an-outline]]
const HELD_PLACE = "0";
const HELD = "held";
import { queued, stoodHere } from "./pull-queue.js";
import { staleClaim } from "./work-free.js";
import { readWork, standingAll } from "./work-stands.js";

// [[spec/design_output/work#one-reading-answers-git]]
export function rowOfTicket(
  one,
  places,
  stood = new Map(),
  open = new Set(),
  overrides = {},
) {
  const place = places.get(one.name);
  const said = {
    name: one.name,
    // A ticket is a ticket or a group, and the tab draws which. [[spec/design_output/tree-view#the-columns-read-the-item]]
    kind: isGroup(one.text) ? GROUP : "ticket",
    // A row at zero stands in hand, so its state reads held whatever its front says. [[spec/design_output/pull#the-queue-is-an-outline]]
    state: place === HELD_PLACE ? HELD : fieldOf(one.text, "state") || OPEN,
    step: stepOf(one.text),
    progress: progressOf(one.text),
    group: fieldOf(one.text, GROUP),
    // The flags a row carries, each an ordinary key the filter reads. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
    urgent: urgent(one.text),
    person: personStep(one.text),
    held: Boolean(heldIn(one.text)),
    waits: dependsOn(frontOf(one.text)).some((dep) => open.has(dep)),
    todo: todoOf(frontOf(one.text)) !== "" || Boolean(overrides[one.name]),
    // The whole ask travels, because the details draw it whole and the table draws none of it. [[spec/design_output/tui#the-work-tab]]
    says: askOf(one.text),
  };
  // The time a ticket came in orders the oldest first. [[spec/design_output/pull#the-queue-is-a-score]]
  const came = stood.get(one.path);
  if (came) said.stood = came;
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
  const plan = planHere(it);
  // A sentence todo stands in the queue as a row of its own, placed by its anchor and held by nobody. [[spec/design_output/stop#the-plan]]
  const all = [...ticketsIn(read), ...todoRows(plan)];
  // A row a standing branch holds belongs to the cloud, so it leaves this box's lists and stands at infinity. [[spec/design_output/pull#the-queue-is-an-outline]]
  const onCloud = new Set(
    read.stand
      .filter((held) => !held.merged)
      .flatMap((held) => [held.name, ...ownTickets(held).map((one) => one.name)]),
  );
  // A note waits for its retro, so it takes no place. [[spec/design_output/pull#the-queue-is-an-outline]]
  const open = all.filter(
    (one) =>
      fieldOf(one.text, "state") !== CLOSED &&
      !onCloud.has(one.name) &&
      !onNoteRoute(one.text),
  );
  const at = { clock: it.clock, weights: it.weights, stood };
  // A person's step and a draft wait on a person. The agent's takeable steps count next, and every other open ticket after them. [[spec/design_output/pull#the-queue-is-an-outline]]
  // A ticket a hand holds, or the one the plan names, stands at zero. [[spec/design_output/pull#the-queue-is-an-outline]]
  const inHand = open.filter(
    (one) => Boolean(heldIn(one.text)) || one.name === plan.working,
  );
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
  const out = outlineIn(persons, inHand, [...agents, ...back], all, overridesOf(plan));
  for (const one of all) {
    if (onCloud.has(one.name) && fieldOf(one.text, "state") !== CLOSED)
      out.set(one.name, CLOUD_PLACE);
  }
  return out;
}

// The plan this box holds: the work in hand, and the overrides a place writes, off the plan file. [[spec/design_output/stop#the-plan]]
export function planHere(it) {
  try {
    const said = JSON.parse(it.disk.read(it.join(it.root, ...PLANS.split("/"))));
    return {
      working: String(said?.working ?? ""),
      places: said?.places ?? {},
      todos: [said?.todos ?? []].flat(),
    };
  } catch {
    return { working: "", places: {}, todos: [] };
  }
}

// The plan's todos as the queue reads them: a name, an anchor, and no text, so the score skips them and the anchor places them. [[spec/design_output/stop#the-plan]]
function todoRows(plan) {
  const titles = new Set(plan.todos.map((one) => String(one?.title ?? "")));
  return plan.todos
    .filter((one) => one?.title)
    .map((one, order) => ({
      name: String(one.title),
      path: "",
      text: "",
      front: { todo: anchorOf(one.todo, titles) },
      plan: true,
      order,
    }));
}

// The work tab's override on a todo passes the same check as the todo's own anchor, so no writer places a todo past a ticket. [[spec/design_output/pull#a-todo-forces-a-place]]
function overridesOf(plan) {
  const titles = new Set(plan.todos.map((one) => String(one?.title ?? "")));
  return Object.fromEntries(
    Object.entries(plan.places ?? {}).map(([name, said]) => [
      name,
      titles.has(name) ? anchorOf(said, titles) : said,
    ]),
  );
}

// A todo stands before every ticket: it anchors at the front or on another todo, and any other anchor lands it after the todos. [[spec/design_output/pull#a-todo-forces-a-place]]
function anchorOf(said, titles) {
  const word = String(said ?? "").trim();
  if (word === "true" || word === FIRST || titles.has(word)) return word;
  return LAST;
}

// The plan's todos as rows of the answer, which the tab draws beside the tickets with no link. [[spec/design_output/stop#the-plan]]
function planRows(plan, places) {
  return plan.todos
    .filter((one) => one?.title)
    .map((one) => {
      const place = places.get(String(one.title));
      return {
        name: String(one.title),
        kind: "todo",
        state: OPEN,
        step: "",
        progress: "",
        group: "",
        urgent: false,
        person: false,
        held: false,
        waits: false,
        todo: true,
        says: String(one.details ?? ""),
        ...(place === undefined ? {} : { queue: place }),
      };
    });
}

// The work the plan names stands at zero as a row of its own where no ticket and no todo carries its name, with no file behind it. [[spec/design_output/stop#the-plan]]
function heldRow(plan, names) {
  if (!plan.working || names.includes(plan.working)) return [];
  return [
    {
      name: plan.working,
      kind: "todo",
      state: HELD,
      step: "",
      progress: "",
      group: "",
      urgent: false,
      person: false,
      held: true,
      waits: false,
      todo: false,
      says: "",
      queue: HELD_PLACE,
    },
  ];
}

// Each ephemeral ticket a hold carries stands at zero as a row of its own, with no file behind it, the way the tab draws a plan todo. [[spec/design_input/the-clear-hands-ephemeral-tickets#an-ephemeral-ticket-stands-held]]
function ephemeralRows(it) {
  if (!it.disk || !it.root) return [];
  return holdsIn(it.disk, it.root)
    .filter(({ held }) => isEphemeral(held))
    .map(({ held }) => ({
      name: String(held.ticket),
      kind: "todo",
      state: HELD,
      step: "",
      progress: "",
      group: "",
      urgent: false,
      person: false,
      held: true,
      waits: false,
      todo: false,
      says: (ASKS[held.ticket] ?? []).join(" "),
      queue: HELD_PLACE,
    }));
}

// [[spec/design_output/pull#the-queue-is-an-outline]]
function waitsOnPerson(one) {
  return (
    personStep(one.text) ||
    (fieldOf(one.text, "state") === DRAFT && !agentOpens(one.text))
  );
}

// The queue rides every answer, because a reader of the listing wants each row's place. [[spec/design_output/pull#the-queue-is-a-score]]
export function answerOf(it, queue = true) {
  // The box's private tickets stand in the tab beside trunk's, and a note among them stands there with no place. [[spec/design_output/pull#the-queue-is-an-outline]]
  const read = { ...readWork(it, true), private: privateHere(it) };
  // A desk's own edit stands on the disk before any commit, so trunk's copy reads off the working tree where the file stands there. [[spec/design_output/pull#a-todo-forces-a-place]]
  read.loose = read.loose.map((one) => diskCopy(it, one));
  const standing = standingAll(read.stand);
  const now = it.clock ? it.clock.now().getTime() : 0;
  const stood = queue ? stoodHere(it) : new Map();
  const places = queue ? placesIn(it, read, stood) : new Map();
  // The overrides light the todo letter, so a person reads which rows a place moves. [[spec/design_output/pull#a-todo-forces-a-place]]
  const overrides = planHere(it).places;
  // A branch row stands for its group, so a trunk ticket under that group rides the branch and no other row. [[spec/design_output/work#one-reading-answers-git]]
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
          .map((child) => rowOfTicket(child, places, stood, open, overrides)),
      };
    }),
    // Every other ticket on trunk stands here, a group among them, and the tab nests each one under the group it names. [[spec/design_output/tree-view#the-name-column-nests]]
    loose: [
      ...[...read.loose, ...read.private]
        .filter(
          (one) => !branched.has(one.name) && !branched.has(fieldOf(one.text, GROUP)),
        )
        .map((one) => rowOfTicket(one, places, stood, open, overrides)),
      ...planRows(planHere(it), places),
      ...ephemeralRows(it),
      // A ticket on this disk that origin lacks still carries its name, so the work in hand draws once. [[spec/design_output/stop#the-plan]]
      ...heldRow(planHere(it), [
        ...ticketsIn(read).map((one) => one.name),
        ...diskNames(it),
        ...planHere(it).todos.map((one) => String(one?.title ?? "")),
      ]),
    ],
  };
}

// The working tree's copy of a trunk ticket, where one stands, so a place a person writes moves the row before any commit. [[spec/design_output/pull#a-todo-forces-a-place]]
function diskCopy(it, one) {
  if (!it.disk || !it.join || !one?.path) return one;
  try {
    return {
      ...one,
      text: String(it.disk.read(it.join(it.root, ...String(one.path).split("/")))),
    };
  } catch {
    return one;
  }
}

// The names of every ticket on this disk, committed or not. [[spec/design_output/stop#the-plan]]
function diskNames(it) {
  if (!it.disk || !it.join) return [];
  return ticketsHere(it).map((one) => one.name);
}

// The private notes on this box, read the way the pull reads them, and nothing where the box holds none. [[spec/design_output/pull#the-queue-is-an-outline]]
function privateHere(it) {
  if (!it.disk || !it.join) return [];
  return ticketsHere(it).filter((one) => one.private);
}
