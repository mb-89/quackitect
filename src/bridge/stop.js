// The stop hook: the hold from the sidebar at every call, and the tooth at
// the turn's end, which lets a turn end on the stop line alone.
// [[spec/design_output/stop#the-vote]]

import { join } from "node:path";
import {
  controlBlock,
  FINISH,
  HOLD,
  OFF,
  STOP,
} from "../../.claude/skills/level0/lib/controls.js";
import { isDraft } from "../../.claude/skills/level0/lib/paths.js";
import { heldGroup, openPrivate } from "../../.claude/skills/level0/lib/ticket.js";
import {
  decide,
  detail,
  pool,
  RULES,
  STOP_CALL,
  stopReasons,
  stopSpec,
  todos,
  toothOf,
} from "../../.claude/skills/level0/lib/stop.js";
import { holdsTurn } from "./answer.js";
import { asks, writes } from "./config.js";
import { REPORT_CALL } from "./report.js";

const ENABLED = "stop.enabled";
const MOST = "stop.mostInARow";
const LINE = /^stop:\s*([a-z0-9-]+)\s*$/i;
const PASS = { pass: true };

export const TOOLS = { [STOP_CALL]: claims };

export function rulesHere(disk, method) {
  return pool(readFolder(disk, join(method, RULES), ".yml")).rules;
}

export function SPECS(box) {
  return [stopSpec(rulesOf(box))];
}

export function holdsCall(e, box) {
  if (e?.agentId) return null;
  const hold = String(asks(box, HOLD) ?? OFF);
  if (hold === STOP && e?.tool !== REPORT_CALL) {
    box.log.say(
      "debug",
      "hold",
      `the owner holds stop, and ${e?.tool ?? "the call"} is refused`,
      {
        tool: String(e?.tool ?? ""),
      },
    );
    return {
      result: {
        deny: "The owner holds this session at stop. Make no call: say what stands, and end the turn with the stop line.",
      },
    };
  }
  if (hold !== FINISH || box.held === hold) {
    box.held = hold;
    return null;
  }
  box.held = hold;
  box.log.say("debug", "hold", "the owner holds finish, and the block rides", {
    tool: String(e?.tool ?? ""),
  });
  return { after: { context: [controlBlock({ hold })] } };
}

export function dropsHold(_e, box) {
  const hold = String(asks(box, HOLD) ?? OFF);
  box.held = "";
  if (hold !== FINISH && hold !== STOP) return { pass: true };
  writes(box, HOLD, OFF);
  box.log.say("debug", "config", `the hold stood at ${hold}, and drops to ${OFF}`);
  return { pass: true };
}

export function sawCall(e, box) {
  if (e?.agentId) return;
  toothOf_(box).sawCall();
  todosOf(box).sawCall(e);
}

function claims(e, box) {
  const reason = String(e?.reason ?? "");
  const known = stopReasons(rulesOf(box)).some((one) => one.id === reason);
  if (!known) {
    const ids = stopReasons(rulesOf(box))
      .map((one) => one.id)
      .join(", ");
    box.log.say("warn", "stop", `${reason} names no reason this tree holds`);
    return {
      result: { result: `${reason} names no reason this tree holds. The ids: ${ids}.` },
    };
  }
  box.claim = reason;
  box.log.say("info", "stop", `the agent claims ${reason}`, {
    detail: String(e?.next ?? "").slice(0, 120),
  });
  return {
    result: {
      result: `The claim stands. End the message now with the line stop: ${reason}, alone and last.`,
    },
  };
}

export function onStop(e, box) {
  if (e?.agentId) return PASS;
  const shaped = holdsTurn(e, box);
  if (shaped.result) return shaped;
  const rules = rulesOf(box);
  const text = String(e?.last_assistant_message ?? "");
  const claimed = box.claim ?? lastLineReason(text);
  box.claim = null;
  const hold = String(asks(box, HOLD) ?? OFF);
  const off = asks(box, ENABLED) === false;
  const decision = decide(rules, {
    claimed,
    ran: (name) => ranHere(name, { off, hold, box, claimed }),
  });
  const said = toothOf_(box).atTurnEnd(decision, Number(asks(box, MOST) ?? 0));
  const why = said.ends ? endsWhy(said) : (said.go?.says ?? "");
  box.log.say("info", "stop", `the turn ${said.ends ? "ends" : "holds"}: ${why}`, {
    detail: `claimed=${claimed || "none"} ${detail(said, said.inARow)}`,
  });
  if (said.ends) return PASS;
  return { result: { block: asksForStop(rules, why) } };
}

function endsWhy(said) {
  if (said.runaway) return `the tooth lets go after ${said.inARow} holds in a row`;
  return said.stop?.says ?? "the turn ends";
}

// [[spec/design_output/stop#a-turn-with-no-call]]
function asksForStop(rules, why) {
  return [
    `${why} This turn holds open. Carry on, or end the turn with one last line, alone: stop: <reason>, with one of these reasons:`.trim(),
    ...stopReasons(rules).map((one) => `  ${one.id}: ${one.asks}`),
  ].join("\n");
}

function lastLineReason(text) {
  const lines = String(text ?? "")
    .split("\n")
    .map((one) => one.trim())
    .filter(Boolean);
  const found = LINE.exec(lines.at(-1) ?? "");
  return found ? found[1] : "";
}

function ranHere(name, held) {
  if (name === "stop-hook-off") return held.off;
  if (name === "owner-holds") return held.hold === STOP;
  if (name === "session-is-new") return toothOf_(held.box).isNew();
  if (name === "work-waiting") return todosOf(held.box).standing();
  if (name === "group-in-hand") return groupInHand(held.box);
  if (name === "ticket-in-hand") return holdStands(held.box) || privateStands(held.box);
  if (name === "no-stop-line") return !stopReasons(rulesOf(held.box)).some((one) => one.id === held.claimed);
  return undefined;
}

// [[spec/design_output/pull#the-hand-and-the-hold]]
function groupInHand(box) {
  const branch = branchOf(box);
  if (!branch.startsWith("work/")) return false;
  try {
    return heldGroup(String(box.disk.read(join(box.work, "spec", "tickets", `${branch.slice(5)}.md`))));
  } catch {
    return false;
  }
}

function holdStands(box) {
  try {
    return box.disk.list(join(box.work, ".se", "hold")).some((one) => one.name.endsWith(".json"));
  } catch {
    return false;
  }
}

function privateStands(box) {
  try {
    const folder = join(box.work, ".se", "tickets");
    return box.disk
      .list(folder)
      .filter((one) => one.name.endsWith(".md"))
      .some((one) => openPrivate(String(box.disk.read(join(folder, one.name)))));
  } catch {
    return false;
  }
}

function branchOf(box) {
  try {
    return String(box.proc.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], { cwd: box.work }).stdout ?? "").trim();
  } catch {
    return "";
  }
}

function rulesOf(box) {
  if (!box.stopRules) box.stopRules = rulesHere(box.disk, box.method);
  return box.stopRules;
}

function toothOf_(box) {
  if (!box.tooth) box.tooth = toothOf();
  return box.tooth;
}

function todosOf(box) {
  if (!box.todos) box.todos = todos();
  return box.todos;
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
