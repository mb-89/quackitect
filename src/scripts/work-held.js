// What the take reads of the branch this box holds: the hold itself, and
// whether the branch stands past its work. The take stands in work.js.
// [[spec/design_output/work#the-take-writes-the-record]]

import {
  CLOSED,
  fieldOf,
  heldIn,
  ticketAt,
  ticketNamed,
  WORK_BRANCH,
} from "../engine/group.js";
import { handOf, roleOf } from "./pull.js";
import { staleClaim } from "./work-free.js";
import { DONE, HELD, MERGED } from "./work-stands.js";

// [[spec/design_output/work#the-take-writes-the-record]]
export function heldHere(it) {
  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out;
  if (!branch?.startsWith(WORK_BRANCH)) return null;
  const name = ticketNamed(branch);
  const path = it.join(it.root, ticketAt(name));
  if (!it.disk.exists(path)) return null;
  const text = it.disk.read(path);
  const held = heldIn(text);
  if (!held) return null;
  const hand = handOf(it);
  return held.hand === roleOf(hand) ? { branch, name, hand, text } : null;
}

// Why the held branch stands past its work: done, merged or stale. Empty where it stands in work. [[spec/design_output/work#the-take-writes-the-record]]
export function pastHold(it, mine, stand, standing) {
  if (fieldOf(mine.text, "state") === CLOSED) return DONE;
  const one = stand.find((held) => held.branch === mine.branch);
  // A branch gone from the remote carries no work left to hold. [[spec/design_output/work#a-merged-branch-closes]]
  if (!one) return MERGED;
  const standsAt = standing.get(one.branch);
  if (standsAt === DONE || standsAt === MERGED) return standsAt;
  const now = it.clock ? it.clock.now().getTime() : 0;
  return standsAt === HELD && staleClaim(one, now, it).stale ? "stale" : "";
}
