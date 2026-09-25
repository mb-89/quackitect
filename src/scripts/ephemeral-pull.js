// The pull's side of an ephemeral ticket: the hand-out writes the hold, and the
// hand-back runs the ticket's check and deletes the hold or hands the next.
// [[spec/design_input/the-clear-hands-ephemeral-tickets]]

import { HANDOVER } from "../../.claude/skills/level0/lib/folders.js";
import { ASKS, CLEAR, handoverFault, heldAs, WRITE } from "./ephemeral.js";
import { writeHold } from "./guidance-hand.js";
import { handed, offer } from "./pull-hand.js";
import { REFUSED, say, WORK } from "./pull-route.js";
import { onward } from "./pull-writes.js";

// [[spec/design_input/the-clear-hands-ephemeral-tickets#an-ephemeral-ticket-stands-held]]
export function handsEphemeral(it, hand, name, rows = []) {
  writeHold(it, hand, heldAs(name, hand, it.clock ? it.clock.stamp() : ""));
  say(WORK, [...rows, `${name} stands in your hand.`, ...(ASKS[name] ?? [])]);
  return 0;
}

// A bare pull shows the ask, and a pass runs the ticket's check. [[spec/design_input/the-clear-hands-ephemeral-tickets#the-clear-runs-as-three-tickets]]
export function ephemeralPull(it, who, verdict) {
  const held = who.held;
  if (!verdict.said) {
    say(WORK, [`${held.ticket} stands in your hand.`, ...(ASKS[held.ticket] ?? [])]);
    return 0;
  }
  if (verdict.said !== "pass") {
    say(REFUSED, [`${held.ticket} is an ephemeral ticket, and takes --pass alone.`]);
    return 1;
  }
  if (held.ticket === WRITE) {
    const fault = handoverFault(it.disk, it.root);
    if (fault) {
      say(REFUSED, [fault, "", `Fix it, and ${WRITE} stays in hand.`]);
      return 1;
    }
    return handsEphemeral(it, who.hand, CLEAR, [`${WRITE} closes, and ${HANDOVER} stands.`]);
  }
  // Level zero closes the clear at the clear itself, so no hand-back reaches it. [[spec/design_input/the-clear-hands-ephemeral-tickets#the-clear-runs-as-three-tickets]]
  if (held.ticket === CLEAR) {
    say(REFUSED, ASKS[CLEAR]);
    return 1;
  }
  return onward(it, who, [`${held.ticket} closes.`]);
}

// The ticket the hand gives back hands its next leaf to this hand where one admits it, and the handover ticket goes out otherwise. [[spec/design_input/the-clear-hands-ephemeral-tickets#a-ticket-is-the-unit-of-work]]
export function dueHandOut(it, who, all) {
  const last = who.held?.ephemeral
    ? null
    : all.find((one) => one.name === who.held?.ticket);
  const said = last ? offer(it, who, last, all) : {};
  if (said.leaf) return handed(it, who, last, said.leaf);
  return handsEphemeral(it, who.hand, WRITE, [
    "The context passed context.handoverAt, so the clear's tickets come first.",
  ]);
}
