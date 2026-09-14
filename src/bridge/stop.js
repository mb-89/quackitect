// The stop hook, step one: the tool stands, and it does nothing. The agent
// calls it last with a reason the tree's stop rules name, the log says so,
// and the answer tells the agent to end the turn. No vote, no hold, no
// prompt after the turn. Each later step adds one rule, with the log around it.
// [[spec/design_output/stop#the-stop-is-one-call]]

import { join } from "node:path";
import { isDraft } from "../../.claude/skills/level0/lib/paths.js";
import {
  pool,
  RULES,
  STOP_CALL,
  stopAnswer,
  stopSpec,
} from "../../.claude/skills/level0/lib/stop.js";

export const TOOLS = { [STOP_CALL]: stops };

export function rulesHere(disk, method) {
  return pool(readFolder(disk, join(method, RULES), ".yml")).rules;
}

export function SPECS(box) {
  box.stopRules = box.stopRules ?? rulesHere(box.disk, box.method);
  return [stopSpec(box.stopRules)];
}

// The empty stop: a known reason stands, and an unknown one names the ids.
function stops(e, box) {
  const rules = box.stopRules ?? (box.stopRules = rulesHere(box.disk, box.method));
  const reason = String(e?.reason ?? "");
  const said = stopAnswer(rules, reason, { ends: true, stop: { says: "" } });
  box.log.say(
    said.known ? "info" : "warn",
    "stop",
    said.known ? "the stop stands" : `${reason} names no reason this tree holds`,
    {
      detail: String(e?.next ?? "").slice(0, 120),
    },
  );
  return { result: { result: said.result } };
}

function readFolder(disk, folder, end) {
  try {
    return disk
      .list(folder)
      .filter(
        (one) => one.kind === "file" && one.name.endsWith(end) && !isDraft(one.name),
      )
      .map((one) => ({ name: one.name, text: disk.read(join(folder, one.name)) }));
  } catch {
    return [];
  }
}
