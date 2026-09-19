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
import { CHECK } from "../../.claude/skills/level0/lib/answer.js";
import { inCloud } from "../../.claude/skills/level0/lib/cloud.js";
import { HOLDS, TICKETS } from "../../.claude/skills/level0/lib/folders.js";
import { rowsOf, SESSION } from "../../.claude/skills/level0/lib/log.js";
import { isDraft } from "../../.claude/skills/level0/lib/paths.js";
import { stampOf, STAMP } from "../../.claude/skills/level0/lib/runs.js";
import { drains, standsPast, takesFile } from "../../.claude/skills/level0/lib/warnings.js";
import { spanOf, ticketAt, WORK_BRANCH } from "../scripts/group.js";
import { heldGroup, openPrivate, queueHolds } from "../../.claude/skills/level0/lib/ticket.js";
import {
  decide,
  detail,
  namesNext,
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
// [[spec/design_output/config#the-engine-controls]]
export const BINDING = "engine.binding";
export const GOD = "god";
// The refactoring hand this door starts. [[spec/tickets/the-spawn-reaches-its-guidance]]
const REFACTOR = {
  on: "refactor.parallel",
  most: "refactor.mostWarnings",
  atOnce: "refactor.mostAtOnce",
  untouched: "refactor.untouchedFor",
};
export const KIND = "refactor";
export const REFACTOR_ANSWERED = "refactor.answered";
const BREAK = "SE_BREAK_ON_STOP";
const HELPER = "general-purpose";
const MS = 1000;
const SAID = 200;
const LINE = /^stop:\s*([a-z0-9-]+)\s*$/i;
const PASS = { pass: true };

export const TOOLS = { [STOP_CALL]: claims };

export function rulesHere(disk, method) {
  return pool(readFolder(disk, join(method, RULES), ".yml")).rules;
}

export function SPECS(box) {
  return [stopSpec(rulesOf(box))];
}

// The three calls a turn ends with, which the hold at stop lets through. [[spec/design_output/stop#the-hold]]
export const ENDS_TURN = new Set([REPORT_CALL, STOP_CALL, `mcp__level0__${CHECK}`]);

export function holdsCall(e, box) {
  if (e?.agentId) return null;
  const hold = String(asks(box, HOLD) ?? OFF);
  if (hold !== FINISH && hold !== STOP) {
    box.held = "";
    return null;
  }
  box.held = hold;
  const tool = String(e?.tool ?? "");
  if (hold === STOP && !ENDS_TURN.has(tool)) {
    box.log.say("debug", "hold", `the owner holds stop, and ${tool || "the call"} is refused`, { tool });
    return { result: { deny: refusedByHold(tool) } };
  }
  box.log.say("debug", "hold", `the owner holds ${hold}, and the block rides`, { tool });
  return { after: { context: [controlBlock({ hold })] } };
}

// [[spec/design_output/stop#the-hold]]
export function refusedByHold(tool) {
  return [
    `The owner holds this session at stop, so ${tool || "this call"} is refused.`,
    "Put the work down where it stands. Make no other call.",
    `Say what stands and what is left, hand the last word in through ${REPORT_CALL},`,
    "and end the turn with the stop line.",
  ].join(" ");
}

// The hold ends the turn it lands in, so the turn's end puts it back. [[spec/design_output/stop#the-hold]]
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

// A prompt from outside this plugin opens a turn, and the tooth counts them. [[spec/design_output/stop#the-tooth-holds-its-state]]
export function sawPrompt(e, box) {
  if (e?.agentId) return;
  toothOf_(box).sawPrompt(Boolean(e?.mine));
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
    detail: String(e?.next ?? ""),
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
    ran: (name) => ranHere(name, { off, hold, box, claimed, text }),
  });
  const said = toothOf_(box).atTurnEnd(decision, Number(asks(box, MOST) ?? 0));
  const why = said.ends ? endsWhy(said) : (said.go?.says ?? "");
  const prompts = said.ends ? "" : asksForStop(rules, why);
  box.log.say("info", "stop", `the turn ${said.ends ? "ends" : "holds"}: ${why}`, {
    detail: `claimed=${claimed || "none"} ${detail(said, said.inARow)}`,
    prompts: prompts.split("\n")[0],
  });
  // The owner reads a stop under the debugger, so the server started with the break flag pauses here with the reason and what prompts after. [[spec/design_output/stop#a-standing-stop-ends-it]]
  if (process.env[BREAK]) {
    const paused = { why, prompts, claimed, decision: detail(said, said.inARow) };
    // biome-ignore lint/suspicious/noDebugger: level0: NoDebugger - the owner asks the server to pause at every stop under the debugger
    debugger;
    box.log.say("debug", "stop", "the debugger read the stop", paused);
  }
  // The vote and the hand ride one answer, so the turn's block stands and the cleaning starts beside it. [[spec/tickets/the-spawn-reaches-its-guidance]]
  const hand = refactorHand(box);
  const answer = said.ends ? { ...PASS } : { result: { block: prompts } };
  if (!hand) return answer;
  return { ...answer, spawn: hand, back: { event: REFACTOR_ANSWERED, file: hand.file } };
}

// Whether a hand still wants to go: the flag on, the list past the number, and this session's count unspent. The vote reads this, because a rule reading the list alone holds every turn open on a tree carrying warnings. [[spec/tickets/the-spawn-reaches-its-guidance]]
export function handWanted(box) {
  if (asks(box, REFACTOR.on) === false) return false;
  if (!standsPast(stampHere(box).warnings, asks(box, REFACTOR.most))) return false;
  const most = Number(asks(box, REFACTOR.atOnce) ?? 0);
  return !(most > 0 && (box.refactors ?? 0) >= most);
}

// The hand the rule starts: the file it takes, and the count it spends. [[spec/tickets/the-spawn-reaches-its-guidance]]
export function refactorHand(box) {
  if (!handWanted(box)) return null;
  const stamp = stampHere(box);
  const now = Math.floor(box.clock.now().getTime() / MS);
  const file = takesFile(stamp.files, wroteIn(box, stamp.files), now, spanOf(asks(box, REFACTOR.untouched)));
  if (!file) return null;
  box.refactors = (box.refactors ?? 0) + 1;
  box.log.say("info", "refactor", `a hand takes ${file}, of ${stamp.warnings} standing`, { file });
  return { prompt: drains(file), description: `drain the warnings in ${file}`, subagentType: HELPER, kind: KIND, file };
}

// [[spec/tickets/the-spawn-reaches-its-guidance]]
export function onRefactorAnswered(e, box) {
  const said = String(e?.deny ?? "") || (e?.isError ? String(e?.text ?? "") : "");
  box.log.say(said ? "warn" : "info", "refactor", `the hand leaves ${e?.file ?? "a file"}`, {
    detail: said || String(e?.text ?? "").slice(0, SAID),
  });
  return { result: { result: "the refactoring hand answered" } };
}

// The git door answers a file's last write, in the seconds the window reads. [[spec/tickets/the-spawn-reaches-its-guidance]]
function wroteIn(box, names) {
  const out = {};
  for (const name of names ?? []) {
    try {
      const said = box.proc.run(["git", "log", "-1", "--format=%ct", "--", name], { cwd: box.work });
      out[name] = Number(String(said.stdout ?? "").trim()) || 0;
    } catch {
      out[name] = 0;
    }
  }
  return out;
}

// [[spec/tickets/the-spawn-reaches-its-guidance]]
function stampHere(box) {
  try {
    return stampOf(String(box.disk.read(join(box.work, STAMP))));
  } catch {
    return stampOf("");
  }
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

// The checks reading the engine's own work. [[spec/design_output/config#the-engine-controls]]
export const ENGINE_CHECKS = [
  "ticket-in-hand",
  "group-in-hand",
  "work-waiting",
  "warnings-standing",
];

// [[spec/design_output/config#the-engine-controls]]
export function standsDown(name, binding) {
  return String(binding) === GOD && ENGINE_CHECKS.includes(name);
}

function ranHere(name, held) {
  if (standsDown(name, asks(held.box, BINDING))) return false;
  if (name === "stop-hook-off") return held.off;
  if (name === "owner-holds") return held.hold === STOP;
  if (name === "owner-finishes") return held.hold === FINISH;
  // An answer naming a next step takes no free stop, so the turn holds open where the agent says what it does next. [[spec/design_output/stop#the-chat-is-new]]
  if (name === "chat-is-new") return chatIsNew(held.box) && !namesNext(held.text);
  if (name === "work-waiting") return todosOf(held.box).standing();
  if (name === "group-in-hand") return groupInHand(held.box);
  if (name === "ticket-in-hand") return holdStands(held.box) || privateStands(held.box);
  if (name === "queue-waits") return queueWaits(held.box);
  if (name === "no-stop-line") return !stopReasons(rulesOf(held.box)).some((one) => one.id === held.claimed);
  // A stop that ends a turn to ask somebody needs somebody sitting here. [[spec/guidance/cloud]]
  if (name === "a-person-sits-here") return !inCloud(held.box.env ?? process.env);
  // [[spec/tickets/the-spawn-reaches-its-guidance]]
  if (name === "warnings-standing") return handWanted(held.box);
  return undefined;
}

// [[spec/design_output/pull#the-hand-and-the-hold]]
function groupInHand(box) {
  const branch = branchOf(box);
  if (!branch.startsWith(WORK_BRANCH)) return false;
  try {
    return heldGroup(String(box.disk.read(join(box.work, ticketAt(branch.slice(WORK_BRANCH.length))))));
  } catch {
    return false;
  }
}

function holdStands(box) {
  try {
    return box.disk.list(join(box.work, HOLDS)).some((one) => one.name.endsWith(".json"));
  } catch {
    return false;
  }
}

function privateStands(box) {
  try {
    const folder = join(box.work, TICKETS);
    return box.disk
      .list(folder)
      .filter((one) => one.name.endsWith(".md"))
      .some((one) => openPrivate(String(box.disk.read(join(folder, one.name)))));
  } catch {
    return false;
  }
}

// THE CHAT IS NEW WHILE NOBODY HAS SAID WHAT TO DO IN IT. The session log holds one prompt row a turn and rotates at a session start, so the count survives a restart of the server and starts again with the next chat, and a cloud box carrying nobody to ask reads false. [[spec/design_output/stop#the-chat-is-new]]
function chatIsNew(box) {
  if (inCloud(box.env ?? process.env)) return false;
  return promptsIn(box) <= 1;
}

function promptsIn(box) {
  try {
    return rowsOf(String(box.disk.read(join(box.work, SESSION)))).filter(
      (one) => one.kind === "prompt",
    ).length;
  } catch {
    return 0;
  }
}

// A desk bound to the queue on trunk has work while a free ticket stands, so a stop on completion waits. [[spec/design_output/stop#the-mechanical-checks]]
function queueWaits(box) {
  if (inCloud(box.env ?? process.env)) return false;
  if (asks(box, "engine.binding") !== "queue") return false;
  if (branchOf(box) !== "main") return false;
  const texts = readFolder(box.disk, join(box.work, "spec", "tickets"), ".md").map((one) => one.text);
  return queueHolds(texts);
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
