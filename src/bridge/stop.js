// The stop hook: the hold and the tooth. The hold is what the owner sets from
// the sidebar. finish rides one context line, and stop refuses the next call
// and ends the turn. The tooth votes at the turn's end over the rules under
// spec/config/stop: a turn ends on a last line reading `stop: <reason>` with a
// reason the rules hold, on the hold at stop, on a fresh session, or with the
// tooth switched off. Any other turn holds, and the reason re-prompts.
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

// The hold at a call: stop refuses it, finish rides one context line once.
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

// The hold is one turn long: the turn's end drops it to off, by value.
export function dropsHold(_e, box) {
  const hold = String(asks(box, HOLD) ?? OFF);
  box.held = "";
  if (hold !== FINISH && hold !== STOP) return { pass: true };
  writes(box, HOLD, OFF);
  box.log.say("debug", "config", `the hold stood at ${hold}, and drops to ${OFF}`);
  return { pass: true };
}

// Every call feeds the tooth its count and the todo list its state.
export function sawCall(e, box) {
  if (e?.agentId) return;
  toothOf_(box).sawCall();
  todosOf(box).sawCall(e);
}

// The stop tool: the claim rides the call, and the line ends the turn.
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

// The turn's end: a shaped demand unmet holds first, then the tooth votes.
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

// The mechanical checks the rules name, by the name each rule holds them under.
function ranHere(name, held) {
  if (name === "stop-hook-off") return held.off;
  if (name === "owner-holds") return held.hold === STOP;
  if (name === "session-is-new") return toothOf_(held.box).isNew();
  if (name === "work-waiting") return todosOf(held.box).standing();
  if (name === "no-stop-line") return !stopReasons(rulesOf(held.box)).some((one) => one.id === held.claimed);
  return undefined;
}

function rulesOf(box) {
  return box.stopRules ?? (box.stopRules = rulesHere(box.disk, box.method));
}

function toothOf_(box) {
  return box.tooth ?? (box.tooth = toothOf());
}

function todosOf(box) {
  return box.todos ?? (box.todos = todos());
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
