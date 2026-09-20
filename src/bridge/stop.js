// The stop hook: the hold from the sidebar at every call, and the tooth at
// the turn's end, which lets a turn end on the stop line alone.
// [[spec/design_output/stop#the-vote]]

import { join } from "node:path";
import { CHECK, NEEDS_HEADING } from "../../.claude/skills/level0/lib/answer.js";
import { inCloud } from "../../.claude/skills/level0/lib/cloud.js";
import {
  controlBlock,
  FINISH,
  HOLD,
  OFF,
  STOP,
} from "../../.claude/skills/level0/lib/controls.js";
import { HOLDS, TICKETS } from "../../.claude/skills/level0/lib/folders.js";
import {
  BINDING,
  GOD,
  QUEUE,
} from "../../.claude/skills/level0/lib/config.js";
import { MS, rowsIn, SESSION } from "../../.claude/skills/level0/lib/log.js";
import { isDraft } from "../../.claude/skills/level0/lib/paths.js";
import { REFACTORS } from "../../.claude/skills/level0/lib/runs.js";
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
import {
  heldGroup,
  openPrivate,
  queueHolds,
} from "../../.claude/skills/level0/lib/ticket.js";
import {
  drains,
  filesOn,
  standsPast,
  takesFile,
} from "../../.claude/skills/level0/lib/warnings.js";
import { spanOf, ticketAt, WORK_BRANCH } from "../engine/group.js";
import { holdsTurn } from "./answer.js";
import { asks, writes } from "./config.js";
import { reacted, wants } from "./grace.js";
import { REPORT_CALL } from "./report.js";

const ENABLED = "stop.enabled";
// The calls the finish hold lets pass before it refuses them the way the stop hold does. [[spec/design_output/stop#the-grace]]
const GRACE_FINISH = "grace.finish";
const MOST = "stop.mostInARow";
// The refactoring hand this door starts. [[spec/tickets/the-spawn-reaches-its-guidance]]
const REFACTOR = {
  on: "refactor.parallel",
  most: "refactor.mostWarnings",
  atOnce: "refactor.mostAtOnce",
  untouched: "refactor.untouchedFor",
  grace: "refactor.grace",
};
export const KIND = "refactor";
export const REFACTOR_ANSWERED = "refactor.answered";
const BREAK = "SE_BREAK_ON_STOP";
const HELPER = "general-purpose";
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
  // The finish hold is a grace: the block rides this many calls, and then the calls meet the stop hold's refusal. [[spec/design_output/stop#the-grace]]
  if (hold === FINISH) box.finishCalls = (box.finishCalls ?? 0) + 1;
  const most = Number(asks(box, GRACE_FINISH) ?? 0);
  const spent = hold === FINISH && most > 0 && box.finishCalls > most;
  if ((hold === STOP || spent) && !ENDS_TURN.has(tool)) {
    box.log.say(
      "debug",
      "hold",
      `the owner holds stop, and ${tool || "the call"} is refused`,
      { tool },
    );
    return { result: { deny: refusedByHold(tool) } };
  }
  box.log.say("debug", "hold", `the owner holds ${hold}, and the block rides`, {
    tool,
  });
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

// The hold ends the turn it lands in, so the turn's end puts it back. A helper's turn end touches neither, the way every door beside this one skips one. [[spec/design_output/stop#the-hold]]
export function dropsHold(e, box) {
  if (e?.agentId) return { pass: true };
  const hold = String(asks(box, HOLD) ?? OFF);
  box.held = "";
  box.finishCalls = 0;
  if (hold !== FINISH && hold !== STOP) return { pass: true };
  // The mark the vote reads, so a hold dropped here still ends the turn it stood in. [[spec/design_output/stop#the-hold-outlives-its-drop]]
  box.stood = hold;
  writes(box, HOLD, OFF);
  box.log.say("debug", "config", `the hold stood at ${hold}, and drops to ${OFF}`);
  return { pass: true };
}

// The hold that stands over this turn: the one the owner holds now, or the one the turn's end dropped. [[spec/design_output/stop#the-hold-outlives-its-drop]]
export function holdHere(box) {
  const hold = String(asks(box, HOLD) ?? OFF);
  if (hold === FINISH || hold === STOP) return hold;
  return String(box.stood ?? OFF);
}

export function sawCall(e, box) {
  if (e?.agentId) return;
  toothOf_(box).sawCall();
  todosOf(box).sawCall(e);
  asksForHand(box);
}

// The list past the number with a file at rest asks the agent for the turn, over the grace. [[spec/design_output/stop#the-grace]]
function asksForHand(box) {
  if (!handWanted(box) || !restingFile(box)) return;
  wants(box, {
    id: KIND,
    why: `${listHere(box).length} warnings stand, and a file rests past the window, so the refactoring hand wants the turn.`,
    react: "end this turn with a stop line, so the hand takes a file",
    calls: asks(box, REFACTOR.grace),
  });
}

// A prompt from outside this plugin opens a turn, and the tooth counts them. A hold is one turn long, so the mark of the turn before drops here. [[spec/design_output/stop#the-tooth-holds-its-state]]
export function sawPrompt(e, box) {
  if (e?.agentId) return;
  box.stood = "";
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
      result: `The claim stands. Write the answer, and end that same message with the line stop: ${reason} on a line of its own, last. The owner reads that one message.`,
    },
  };
}

// The message ending the turn carries the report, so the owner reads what the talk is about where the stop line stands. [[spec/design_output/stop#a-talk-follows-a-report]]
export function reportStands(text) {
  const said = String(text ?? "");
  const at = said.indexOf(NEEDS_HEADING);
  return at >= 0 && /^\|\s*1\s*\|/m.test(said.slice(at));
}

export function onStop(e, box) {
  if (e?.agentId) return PASS;
  const shaped = holdsTurn(e, box);
  if (shaped.result) return shaped;
  const rules = rulesOf(box);
  const text = String(e?.last_assistant_message ?? "");
  const claimed = box.claim ?? lastLineReason(text);
  box.claim = null;
  // The hold that stood over this turn, so the order the two events arrive in decides nothing. [[spec/design_output/stop#the-hold-outlives-its-drop]]
  const hold = holdHere(box);
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
  if (box.env?.[BREAK]) {
    const paused = { why, prompts, claimed, decision: detail(said, said.inARow) };
    // biome-ignore lint/suspicious/noDebugger: level0: NoDebugger - the owner asks the server to pause at every stop under the debugger
    debugger;
    box.log.say("debug", "stop", "the debugger read the stop", paused);
  }
  // The turn's end is the reaction the grace waits for, so the calls pass again. [[spec/design_output/stop#the-grace]]
  reacted(box, KIND);
  // The vote and the hand ride one answer, so the turn's block stands and the cleaning starts beside it. [[spec/tickets/the-spawn-reaches-its-guidance]]
  const hand = refactorHand(box);
  const answer = said.ends ? { ...PASS } : { result: { block: prompts } };
  if (!hand) return answer;
  return {
    ...answer,
    spawn: hand,
    back: { event: REFACTOR_ANSWERED, file: hand.file },
  };
}

// Whether a hand still wants to go: the flag on, the list past the number, and this session's count unspent. The vote reads this, because a rule reading the list alone holds every turn open on a tree carrying warnings. [[spec/tickets/the-spawn-reaches-its-guidance]]
export function handWanted(box) {
  if (asks(box, REFACTOR.on) === false) return false;
  if (!standsPast(listHere(box).length, asks(box, REFACTOR.most))) return false;
  const most = Number(asks(box, REFACTOR.atOnce) ?? 0);
  return !(most > 0 && (box.refactors ?? 0) >= most);
}

// The hand the rule starts: the file it takes, and the count it spends. [[spec/tickets/the-spawn-reaches-its-guidance]]
export function refactorHand(box) {
  if (!handWanted(box)) return null;
  const file = restingFile(box);
  if (!file) return null;
  box.refactors = (box.refactors ?? 0) + 1;
  box.log.say(
    "info",
    "refactor",
    `a hand takes ${file}, of ${listHere(box).length} standing`,
    { file },
  );
  return {
    prompt: drains(file),
    description: `drain the warnings in ${file}`,
    subagentType: HELPER,
    kind: KIND,
    file,
  };
}

// [[spec/tickets/the-spawn-reaches-its-guidance]]
export function onRefactorAnswered(e, box) {
  const said = String(e?.deny ?? "") || (e?.isError ? String(e?.text ?? "") : "");
  box.log.say(
    said ? "warn" : "info",
    "refactor",
    `the hand leaves ${e?.file ?? "a file"}`,
    {
      detail: said || String(e?.text ?? "").slice(0, SAID),
    },
  );
  return { result: { result: "the refactoring hand answered" } };
}

// The git door answers a file's last write, in the seconds the window reads. [[spec/tickets/the-spawn-reaches-its-guidance]]
function wroteIn(box, names) {
  const out = {};
  for (const name of names ?? []) {
    try {
      const said = box.proc.run(["git", "log", "-1", "--format=%ct", "--", name], {
        cwd: box.work,
      });
      out[name] = Number(String(said.stdout ?? "").trim()) || 0;
    } catch {
      out[name] = 0;
    }
  }
  return out;
}

// The file the hand takes: the oldest at rest outside the window, off the list. [[spec/tickets/the-spawn-reaches-its-guidance]]
function restingFile(box) {
  const files = filesOn(listHere(box));
  const now = Math.floor(box.clock.now().getTime() / MS);
  return takesFile(files, wroteIn(box, files), now, spanOf(asks(box, REFACTOR.untouched)));
}

// The list the lint leaves, one entry a warning, which the hand drains. [[spec/design_output/stop#the-grace]]
function listHere(box) {
  try {
    const said = JSON.parse(String(box.disk.read(join(box.work, REFACTORS))));
    return Array.isArray(said) ? said : [];
  } catch {
    return [];
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

// The checks reading the engine's own work. The warnings stay off this list, because a warning lands under every binding and the hand drains it. [[spec/design_output/config#the-engine-controls]]
export const ENGINE_CHECKS = ["ticket-in-hand", "group-in-hand", "work-waiting"];

// [[spec/design_output/config#the-engine-controls]]
export function standsDown(name, binding) {
  return String(binding) === GOD && ENGINE_CHECKS.includes(name);
}

// Every check this door answers, one a key. [[spec/design_output/stop#the-mechanical-checks]]
const CHECKS = {
  "stop-hook-off": (held) => held.off,
  "owner-holds": (held) => held.hold === STOP,
  "owner-finishes": (held) => held.hold === FINISH,
  // An answer naming a next step takes no free stop, so the turn holds open where the agent says what it does next. [[spec/design_output/stop#the-chat-is-new]]
  "chat-is-new": (held) => chatIsNew(held.box) && !namesNext(held.text),
  "work-waiting": (held) => todosOf(held.box).standing(),
  "group-in-hand": (held) => groupInHand(held.box),
  "ticket-in-hand": (held) => holdStands(held.box) || privateStands(held.box),
  "queue-waits": (held) => queueWaits(held.box),
  // A claim a fact denies reads as no stop line, so the turn holds and the fact re-prompts. [[spec/design_output/stop#a-talk-follows-a-report]]
  "no-stop-line": (held) => !claimStands(held),
  // A stop that ends a turn to ask somebody needs somebody sitting here. [[spec/guidance/cloud]]
  "a-person-sits-here": (held) => !inCloud(held.box.env ?? {}),
  // [[spec/tickets/the-spawn-reaches-its-guidance]]
  "warnings-standing": (held) => handWanted(held.box),
  // [[spec/design_output/stop#a-talk-follows-a-report]]
  "a-report-stands": (held) => reportStands(held.text),
};

// [[spec/design_output/stop#the-mechanical-checks]]
export function knowsCheck(name) {
  return Object.hasOwn(CHECKS, String(name));
}

function ranHere(name, held) {
  // A table answers the keys every object carries, so the read asks it first. [[spec/design_output/stop#the-mechanical-checks]]
  if (!knowsCheck(name)) return undefined;
  if (standsDown(name, asks(held.box, BINDING))) return false;
  return CHECKS[name](held);
}

// A claim stands where its reason is one this tree holds, and the check its rule names answers true. [[spec/design_output/stop#a-talk-follows-a-report]]
function claimStands(held) {
  const rule = stopReasons(rulesOf(held.box)).find((one) => one.id === held.claimed);
  if (!rule) return false;
  if (!rule.runs) return true;
  return Boolean(ranHere(rule.runs, held));
}

// [[spec/design_output/pull#the-hand-and-the-hold]]
function groupInHand(box) {
  const branch = branchOf(box);
  if (!branch.startsWith(WORK_BRANCH)) return false;
  try {
    return heldGroup(
      String(box.disk.read(join(box.work, ticketAt(branch.slice(WORK_BRANCH.length))))),
    );
  } catch {
    return false;
  }
}

function holdStands(box) {
  try {
    return box.disk
      .list(join(box.work, HOLDS))
      .some((one) => one.name.endsWith(".json"));
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
  if (inCloud(box.env ?? {})) return false;
  return promptsIn(box) <= 1;
}

function promptsIn(box) {
  try {
    return rowsIn(String(box.disk.read(join(box.work, SESSION)))).filter(
      (one) => one.kind === "prompt",
    ).length;
  } catch {
    return 0;
  }
}

// A desk bound to the queue on trunk has work while a free ticket stands, so a stop on completion waits. [[spec/design_output/stop#the-mechanical-checks]]
function queueWaits(box) {
  if (inCloud(box.env ?? {})) return false;
  if (asks(box, BINDING) !== QUEUE) return false;
  if (branchOf(box) !== "main") return false;
  const texts = readFolder(box.disk, join(box.work, "spec", "tickets"), ".md").map(
    (one) => one.text,
  );
  return queueHolds(texts);
}

function branchOf(box) {
  try {
    return String(
      box.proc.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], { cwd: box.work })
        .stdout ?? "",
    ).trim();
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
