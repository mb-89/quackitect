// What stands free, and what a claim's age says. A branch a box claims stands
// held until the box hands it back. A box that runs out of session hands back
// nothing, so the claim goes stale and the branch comes back to the queue.
// [[spec/design_output/work#a-stale-group-is-yours]]

import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import { aged, parentsIn, STALE, spanOf } from "../engine/group.js";
import { DONE, MS, ROUTINE, standingAll, TODO, waitsOf } from "./work.js";
import { readWork, trunkOf } from "./work-stands.js";

// The read carries the tip's own time, so the age costs no process. [[spec/design_output/work#the-listing-reads-git-once]]
export function tipAge(one, now) {
  if (!now || !one?.when) return -1;
  return Math.max(0, Math.floor(now / MS) - Number(one.when));
}

// The span a claim goes stale past. `work.staleAfter` names it, and STALE stands where it says nothing. [[spec/design_output/work#a-stale-group-is-yours]]
export function staleSpan(it) {
  return spanOf(it?.stale || STALE) || spanOf(STALE);
}

// Whether the claim on this branch stands older than the span. The list draws this, and the take reads it. [[spec/design_output/work#a-stale-group-is-yours]]
export function staleClaim(one, now, it) {
  const held = tipAge(one, now);
  return {
    held,
    age: held < 0 ? "" : aged(held),
    stale: held >= 0 && held > staleSpan(it),
  };
}

// A branch stands free where nobody claims it, and where the claim on it goes stale. A parent's children reach workers, and the parent reaches none. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
export function freeIn(stand, standing, it = null, now = 0, trunk = new Map()) {
  const parents = parentsIn([...stand.map((one) => one.ticket), ...trunk.values()]);
  return stand
    .filter(
      (one) => standing.get(one.branch) === TODO || staleHere(it, now, one, standing),
    )
    .filter((one) => !parents.has(one.name))
    .filter((one) => !waitsOf(one, standing, trunk).length);
}

// The branches free off one read of the refs and main, so a parent standing on main alone holds its child. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
export function readFree(it, now = 0) {
  const read = readWork(it, true);
  const standing = standingAll(read.stand);
  const trunk = trunkOf(read.loose);
  const free = freeIn(read.stand, standing, it, now, trunk);
  return { stand: read.stand, standing, trunk, free };
}

// A group at done still standing on origin carries no merge yet: behind trunk it needs a sync, and past the span it stays red. [[spec/design_input/the-cloud-runs-itself#the-hand-over]]
export function stuckIn(it, one, at) {
  const said = it.git.run(
    ["rev-list", "--count", `origin/${one.branch}..origin/${TRUNK}`],
    true,
  );
  if (Number(String(said.out ?? "").trim()) > 0) return "behind";
  return staleClaim(one, at, it).stale ? "stale" : "";
}

// The first stuck hand-over, which the take hands out ahead of a free group. [[spec/design_input/the-cloud-runs-itself#the-hand-over]]
export function stuckFirst(it, stand, standing, at = 0) {
  for (const one of stand.filter((held) => standing.get(held.branch) === DONE)) {
    const why = stuckIn(it, one, at);
    if (why) return { one, why };
  }
  return null;
}

// The take moves onto a stuck branch and writes no record, because the group stands closed. [[spec/design_input/the-cloud-runs-itself#the-hand-over]]
export function handsStuck(it, stuck, onBranch) {
  if (!onBranch(it, stuck.one.branch)) return 1;
  console.log(`You are on ${stuck.one.branch}, whose hand-over stands ${stuck.why}.`);
  console.log(
    "Run ./RUNME.sh branch sync, then ./RUNME.sh check, then push the branch, and its pull request lands.",
  );
  return 0;
}

// [[spec/design_output/work#a-stale-group-is-yours]]
function staleHere(it, now, one, standing) {
  if (!it || !now || standing.get(one.branch) !== "held") return false;
  return staleClaim(one, now, it).stale;
}

// [[spec/design_output/work#the-routine-a-verb-names]]
export function freeNow(tickets, merged = new Set()) {
  const stand = [...tickets].map(([branch, ticket]) => ({
    branch,
    ticket,
    merged: merged.has(branch),
  }));
  return freeIn(stand, standingAll(stand)).map((one) => one.branch);
}

// [[spec/design_output/work#the-routine-a-verb-names]]
export function trigger(it) {
  // The trigger reads the remote, so it refreshes the refs first. [[spec/design_output/work#the-listing-reads-git-once]]
  it.git.fetch();
  const now = it.clock ? it.clock.now().getTime() : 0;
  const free = readFree(it, now).free.map((one) => one.branch);

  console.log(
    `${ROUTINE.name} runs ./RUNME.sh ticket pull on a cloud box, and the engine takes a branch there.`,
  );
  console.log("Fire it with the RemoteTrigger tool, once for every box you want:\n");
  console.log(`    action=run  trigger_id=${ROUTINE.id}\n`);

  if (!free.length) {
    console.log("No branch stands free, so a box fired now takes nothing.");
    return 0;
  }
  console.log("These branches stand free, and a box takes one each:");
  for (const branch of free) console.log(`  ${branch}`);
  return 0;
}
