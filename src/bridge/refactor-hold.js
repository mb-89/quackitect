// The refactoring hand's hold: one file, from the spawn to the hand's answer,
// and the write door lets the hand holding it alone through.
// [[spec/design_output/stop#the-hand-holds-its-file]]

import { join } from "node:path";
import { MS } from "../../.claude/skills/level0/lib/log.js";
import { REFACTOR_HOLD } from "../../.claude/skills/level0/lib/runs.js";
import { spanOf } from "../engine/group.js";
import { asks } from "./config.js";

const HOLD_FOR = "refactor.holdFor";

const holdAt = (box) => join(box.work, ...REFACTOR_HOLD.split("/"));
const nowOf = (box) => Math.floor(box.clock.now().getTime() / MS);

// [[spec/design_output/stop#the-hand-holds-its-file]]
export function holdsFile(box, file) {
  if (!spanOf(asks(box, HOLD_FOR))) return;
  writesHold(box, { file, hand: "", since: nowOf(box) });
}

// [[spec/design_output/stop#the-hand-holds-its-file]]
export function releasesHold(box) {
  try {
    if (box.disk.exists(holdAt(box))) box.disk.remove(holdAt(box));
  } catch {
    // [[spec/design_output/stop#the-hand-holds-its-file]]
  }
}

// A hold past its span reads as none, so a hand lost with its bridgehead holds no file for good. [[spec/design_output/stop#the-hand-holds-its-file]]
export function holdHere(box) {
  let held = null;
  try {
    held = JSON.parse(String(box.disk.read(holdAt(box))));
  } catch {
    return null;
  }
  const span = spanOf(asks(box, HOLD_FOR));
  if (!span || !held?.file) return null;
  if (nowOf(box) - Number(held.since ?? 0) > span) return null;
  return { file: String(held.file), hand: String(held.hand ?? ""), since: held.since };
}

// The first helper to write the held file owns it, and every other hand meets the refusal, the session's own too. [[spec/design_output/stop#the-hand-holds-its-file]]
export function holdDoor(e, where, box) {
  const held = holdHere(box);
  if (!held || held.file !== where) return "";
  const hand = String(e?.agentId ?? "");
  if (hand && (!held.hand || held.hand === hand)) {
    if (!held.hand) writesHold(box, { ...held, hand });
    return "";
  }
  box.log.say("warn", "refactor", `refused a write to the held ${where}`, {
    file: where,
    tool: String(e?.tool ?? ""),
  });
  return [
    `${where} stands held by the refactoring hand until it hands back.`,
    "",
    "Work on another file, and come back to this one after the hand answers.",
  ].join("\n");
}

function writesHold(box, held) {
  try {
    box.disk.write(holdAt(box), `${JSON.stringify(held)}\n`);
  } catch {
    // [[spec/design_output/stop#the-hand-holds-its-file]]
  }
}
