// The dispatcher's plan: what stands ready, stuck, loose and waiting on a
// person, read off origin/main and the work branches. The dry run prints it
// and writes nothing. The writes land with the bundles, in a later child.
// [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]

import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import { CLOSED, fieldOf, GROUP, isGroup } from "../engine/group.js";
import { waitsOnPerson } from "./work-answer.js";
import { freeIn, staleClaim } from "./work-free.js";
import { DONE, HELD, readWork, standingAll, TODO, waitsOf } from "./work-stands.js";

// The parts of the plan, in the order the dry run prints them. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
const PARTS = [
  ["ready", "ready groups, one worker each"],
  ["stuck", "stuck hand-overs, one worker each"],
  ["held", "groups a fresh hold keeps"],
  ["waiting", "groups waiting on another"],
  ["bundles", "loose agent tickets, one fix group per parent"],
  ["questions", "tickets waiting on a person"],
];

// [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
export function planOf(it, now = 0) {
  const at = now || (it.clock ? it.clock.now().getTime() : 0);
  const read = readWork(it, true);
  const stand = read.stand.filter((one) => one.ticket);
  const standing = standingAll(stand);
  const free = freeIn(stand, standing, it, at);
  const freed = new Set(free.map((one) => one.branch));
  const of = (one) => standing.get(one.branch);

  return {
    ready: free.map((one) => ({ group: one.name, branch: one.branch })),
    held: stand
      .filter((one) => of(one) === HELD && !freed.has(one.branch))
      .map((one) => ({
        group: one.name,
        branch: one.branch,
        age: staleClaim(one, at, it).age,
      })),
    waiting: stand
      .filter((one) => of(one) === TODO && waitsOf(one, standing).length)
      .map((one) => ({ group: one.name, waits: waitsOf(one, standing) })),
    stuck: stand
      .filter((one) => of(one) === DONE)
      .map((one) => ({ group: one.name, why: stuckWhy(it, one, at) }))
      .filter((one) => one.why),
    bundles: bundlesOf(read.loose),
    questions: questionsOf(read, standing),
  };
}

// A group at done still standing on origin carries no merge yet: behind trunk it needs a sync, and past the span it stays red. [[spec/design_input/the-cloud-runs-itself#the-hand-over]]
function stuckWhy(it, one, at) {
  const said = it.git.run(
    ["rev-list", "--count", `origin/${one.branch}..origin/${TRUNK}`],
    true,
  );
  if (Number(String(said.out ?? "").trim()) > 0) return "behind";
  return staleClaim(one, at, it).stale ? "stale" : "";
}

// An open ticket on trunk standing in no group. [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]
function looseOpen(one) {
  return (
    fieldOf(one.text, "state") !== CLOSED &&
    !fieldOf(one.text, GROUP) &&
    !isGroup(one.text)
  );
}

// Every loose agent ticket goes to one fix group, and the top stands as the one parent until groups hold groups. [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]
function bundlesOf(loose) {
  const tickets = loose
    .filter((one) => looseOpen(one) && !waitsOnPerson(one))
    .map((one) => one.name)
    .sort();
  return tickets.length ? [{ parent: "", tickets }] : [];
}

// A ticket waiting on a person, on trunk or on a branch still open, with the group it holds open. Every branch carries the whole ticket folder, so a branch answers for its own children alone. [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]
function questionsOf(read, standing) {
  const seen = new Map();
  for (const one of read.loose) seen.set(one.name, one);
  for (const held of read.stand) {
    const status = standing.get(held.branch);
    if (status !== TODO && status !== HELD) continue;
    for (const one of held.tickets)
      if (fieldOf(one.text, GROUP) === held.name) seen.set(one.name, one);
  }
  return [...seen.values()]
    .filter(
      (one) =>
        fieldOf(one.text, "state") !== CLOSED &&
        !isGroup(one.text) &&
        waitsOnPerson(one),
    )
    .map((one) => ({ ticket: one.name, group: fieldOf(one.text, GROUP) || "" }))
    .sort((a, b) => a.ticket.localeCompare(b.ticket));
}

// [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
export function dispatch(root, argv, doors) {
  const it = { root, method: root, work: root, ...doors };
  const said = argv ?? [];
  if (!said.includes("--dry")) {
    console.error("./RUNME.sh dispatch runs under --dry alone, and writes nothing.");
    console.error(
      "The writes land with spec/tickets/dispatch-writes-the-bundles. Run ./RUNME.sh dispatch --dry.",
    );
    return 2;
  }
  // The plan reads the remote, so it refreshes the refs first. [[spec/design_output/work#the-listing-reads-git-once]]
  it.git.fetch?.();
  const plan = planOf(it);
  if (said.includes("--json")) {
    console.log(JSON.stringify(plan));
    return 0;
  }
  for (const line of printed(plan)) console.log(line);
  return 0;
}

// [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
function printed(plan) {
  const out = [];
  for (const [key, head] of PARTS) {
    out.push(`${head}:`);
    const rows = plan[key].map((one) => `  ${rowOf(key, one)}`);
    out.push(...(rows.length ? rows : ["  none"]));
  }
  return out;
}

function rowOf(key, one) {
  if (key === "ready") return one.branch;
  if (key === "stuck") return `work/${one.group}, ${one.why}`;
  if (key === "held") return `${one.branch}, held ${one.age}`;
  if (key === "waiting") return `work/${one.group} waits for ${one.waits.join(", ")}`;
  if (key === "bundles") return `${one.parent || "the top"}: ${one.tickets.join(", ")}`;
  return `${one.ticket}${one.group ? `, holding ${one.group} open` : ""}`;
}
