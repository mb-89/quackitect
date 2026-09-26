// The branch listing: one row a group, its tickets under it, the loose
// tickets after, and the narrow reads a flag asks for. The verbs that
// move a branch stand in work.js beside this file.
// [[spec/design_output/work#a-row-per-group]]

import {
  CLOSED,
  fieldOf,
  GROUP,
  isGroup,
  OPEN,
  stepOf,
  URGENT,
  urgent,
} from "../engine/group.js";
import { CLOUD_PLACE, compareOutline } from "./pull-outline.js";
import { staleClaim } from "./work-free.js";
import { answerOf } from "./work-answer.js";
import {
  COL,
  DONE,
  HELD,
  MERGED,
  readWork,
  standingAll,
  waitsOf,
} from "./work-stands.js";

// [[spec/design_output/work#a-row-per-group]]
export function list(it, _name, argv) {
  const said = argv ?? [];
  // The read stands off the network, and a flag asks for the refresh. [[spec/design_output/work#the-listing-reads-git-once]]
  if (said.includes("--fetch")) it.git.fetch();
  // [[spec/design_output/pull#the-queue-is-a-score]]
  if (said.includes("--queue")) return queueOnly(it);
  // The one answer as JSON, which the work tab reads for the places and the branches. [[spec/design_output/work#one-reading-answers-git]]
  if (said.includes("--json")) {
    console.log(JSON.stringify(answerOf(it, true)));
    return 0;
  }
  const read = readWork(it, true);
  const stand = read.stand;
  const standing = standingAll(stand);
  if (said.includes("--done")) return doneOnly(stand, standing);
  const now = it.clock ? it.clock.now().getTime() : 0;
  // The listing shows what waits on somebody, and a flag asks for the rest. [[spec/design_output/work#a-row-per-group]]
  const all = said.includes("--all");
  const rows = stand
    .filter((one) => all || standing.get(one.branch) !== MERGED)
    .flatMap((one) => [rowOf(one, standing, now, it), ...childRows(one, all)]);
  const loose = looseRows(read.loose, all);

  if (!rows.length && !loose.length) {
    console.log(all ? "No group and no loose ticket stands." : "Nothing stands open.");
    return 0;
  }

  // [[spec/design_output/work#a-stale-group-is-yours]]
  const stale = rows.filter((row) => row.stale);
  if (stale.length) {
    console.log("Yours");
    for (const row of stale) {
      console.log(`  ${row.said}`);
      console.log(
        `    ${row.name} held ${row.age}. Release it, take it over, or close it.`,
      );
    }
    console.log("");
  }
  for (const row of [...rows, ...loose]) console.log(row.said);
  return 0;
}

// [[spec/design_output/work#a-row-per-group]]
function rowOf(one, standing, now, it) {
  const text = one.ticket;
  const status = standing.get(one.branch) || "no status";
  const waits = waitsOf(one, standing);
  const why = waits.length ? `waits for ${waits.join(", ")}` : markOf(text);
  // [[spec/design_output/work#a-stale-group-is-yours]]
  const { age, stale } =
    status === HELD ? staleClaim(one, now, it) : { age: "", stale: false };

  return {
    name: one.name,
    age,
    stale,
    said: `${one.branch.padEnd(COL.branch)} ${status.padEnd(COL.status)} ${why.padEnd(COL.why)} ${age}`,
  };
}

// [[spec/design_output/work#a-ticket-under-its-group]]
function childRows(one, all = false) {
  if (!one.ticket) return [];
  return one.tickets
    .filter((child) => fieldOf(child.text, GROUP) === one.name)
    .filter((child) => all || stateOf(child.text) !== CLOSED)
    .map((child) => ({
      stale: false,
      said: `  ${child.name.padEnd(COL.child)} ticket ${stateOf(child.text).padEnd(COL.status)} ${whyOf(child.text)}`,
    }));
}

// [[spec/design_output/work#a-ticket-under-its-group]]
function stateOf(text) {
  return fieldOf(text, "state") || OPEN;
}

// The order the pull hands out, off the one answer a board reads too. [[spec/design_output/work#one-reading-answers-git]]
function queueOnly(it) {
  const said = answerOf(it, true);
  const held = new Map();
  for (const one of [
    ...said.branches,
    ...said.branches.flatMap((row) => row.tickets),
    ...said.loose,
  ]) {
    // The listing is this box's order, so a row the cloud holds stays off it. [[spec/design_output/pull#the-queue-is-an-outline]]
    if (one.queue !== undefined && one.queue !== CLOUD_PLACE && !held.has(one.name)) {
      held.set(one.name, one);
    }
  }
  const rows = [...held.values()].sort((a, b) => compareOutline(a.queue, b.queue));
  if (!rows.length) {
    console.log("No ticket stands in the queue.");
    return 0;
  }
  for (const one of rows) {
    const place = String(one.queue).padStart(COL.place);
    console.log(`${place}  ${one.name.padEnd(COL.branch)} ${one.step}`);
  }
  return 0;
}

// The why column carries the mark where nothing waits. [[spec/design_output/work#a-row-per-group]]
function markOf(text) {
  return urgent(text) ? URGENT : "";
}

// [[spec/design_output/work#a-ticket-under-its-group]]
export function whyOf(text) {
  return stepOf(text) || markOf(text);
}

// [[spec/design_output/work#a-row-per-group]]
function looseRows(loose, all = false) {
  return loose
    .filter((one) => !fieldOf(one.text, GROUP) && !isGroup(one.text))
    .filter((one) => all || stateOf(one.text) !== CLOSED)
    .map((one) => ({
      stale: false,
      said: `${one.name.padEnd(COL.branch)} ticket ${(fieldOf(one.text, "state") || OPEN).padEnd(COL.status)} ${markOf(one.text)}`,
    }));
}

// [[spec/design_output/work#a-merged-branch-goes]]

function doneOnly(stand, standing) {
  const ready = stand.filter((one) => standing.get(one.branch) === DONE);
  if (!ready.length) {
    console.log(`No branch stands at ${DONE}.`);
    return 0;
  }
  for (const one of ready) {
    console.log(`${one.branch.padEnd(COL.branch)} ./RUNME.sh branch read ${one.name}`);
  }
  return 0;
}
