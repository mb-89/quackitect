// What stands free, and what a claim's age says. A branch a box claims stands
// held until the box hands it back. A box that runs out of session hands back
// nothing, so the claim goes stale and the branch comes back to the queue.
// [[spec/design_output/work#a-stale-group-is-yours]]

import { aged, STALE, spanOf } from "./group.js";
import { MS, noteOf, ROUTINE, standingAll, standOf, TODO, waitingOn } from "./work.js";

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

// A branch stands free where nobody claims it, and where the claim on it goes stale. [[spec/design_output/work#a-stale-group-is-yours]]
export function freeIn(stand, standing, it = null, now = 0) {
  return stand
    .filter(
      (one) => standing.get(one.branch) === TODO || staleHere(it, now, one, standing),
    )
    .filter((one) => !waitingOn(noteOf(one), standing).length);
}

// [[spec/design_output/work#a-stale-group-is-yours]]
function staleHere(it, now, one, standing) {
  if (!it || !now || standing.get(one.branch) !== "held") return false;
  return staleClaim(one, now, it).stale;
}

// [[spec/design_output/work#the-routine-a-verb-names]]
export function freeNow(briefs, merged = new Set()) {
  const stand = [...briefs].map(([branch, brief]) => ({
    branch,
    brief,
    ticket: "",
    merged: merged.has(branch),
  }));
  return freeIn(stand, standingAll(stand)).map((one) => one.branch);
}

// [[spec/design_output/work#the-routine-a-verb-names]]
export function trigger(it) {
  // The trigger reads the remote, so it refreshes the refs first. [[spec/design_output/work#the-listing-reads-git-once]]
  it.git.fetch();
  const stand = standOf(it);
  const now = it.clock ? it.clock.now().getTime() : 0;
  const free = freeIn(stand, standingAll(stand), it, now).map((one) => one.branch);

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
