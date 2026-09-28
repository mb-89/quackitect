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
  withEveryTakeClosed,
} from "../engine/group.js";
import { handOf, roleOf } from "./pull.js";
import { staleClaim } from "./work-free.js";
import { DONE, HELD, MERGED, TODO } from "./work-stands.js";

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

// A stale hold from another box closes before the take writes its own, so the record names the hand-over. [[spec/tickets/stale-hold-frees-the-branch]]
export function handedOver(text, role, tip, front) {
  const left = heldIn(text);
  const from = left && left.hand !== role ? left.hand : "";
  return { from, base: from ? withEveryTakeClosed(text, tip, front) : text };
}

// A release closes every open take. Where another box held it, the commit names the hand-over. [[spec/design_output/work#a-stale-group-is-yours]]
export function letGo(it, branch, name, here) {
  const at = ticketAt(name);
  const path = it.join(it.root, at);
  const held = heldIn(it.disk.read(path));
  if (!held) {
    console.log(`${branch} holds nobody already, so it is free for anybody.`);
    return 0;
  }

  const tip = it.git.run(["rev-parse", "HEAD"], true).out;
  const role = roleOf(handOf(it));
  const { from, base } = handedOver(it.disk.read(path), role, tip, it.front);
  const closed = from ? base : withEveryTakeClosed(base, tip, it.front);
  it.disk.write(path, closed);
  it.git.run(["add", at], true);
  const says = from ? `${role} frees it from ${from}` : `${held.hand} lets it go`;
  it.git.run(["commit", "-m", `${branch}: ${says}`], true);
  if (!it.git.run(["push", "origin", branch]).ok) return 1;
  if (here !== branch) it.git.run(["switch", here], true);

  console.log(`${branch} stands at ${TODO} again, and is free for anybody.`);
  return 0;
}
