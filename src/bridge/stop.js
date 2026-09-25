// The stop hook: the hold from the sidebar at every call, and the tooth at
// the turn's end, which lets a turn end on the stop line alone.
// [[spec/design_output/stop#the-vote]]

import { join } from "node:path";
import { CHECK, NEEDS_HEADING } from "../../.claude/skills/level0/lib/answer.js";
import { inCloud } from "../../.claude/skills/level0/lib/cloud.js";
import { BINDING, GOD, QUEUE } from "../../.claude/skills/level0/lib/config.js";
import {
  controlBlock,
  FINISH,
  HOLD,
  OFF,
  STOP,
} from "../../.claude/skills/level0/lib/controls.js";
import { HOLDS, TICKETS } from "../../.claude/skills/level0/lib/folders.js";
import { SESSION, tallied } from "../../.claude/skills/level0/lib/log.js";
import { isDraft } from "../../.claude/skills/level0/lib/paths.js";
import {
  decide,
  detail,
  namesNext,
  pool,
  RULES,
  STOP_CALL,
  STOP_LINE,
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
import { ticketAt, WORK_BRANCH } from "../engine/group.js";
import { holdsTurn } from "./answer.js";
import { bindingLine } from "./binding.js";
import { asks, writes } from "./config.js";
import { plansHere } from "./plan.js";
import { REPORT_CALL } from "./report.js";

const ENABLED = "stop.enabled";
// The calls the finish hold lets pass before it refuses them the way the stop hold does. [[spec/design_output/stop#the-grace]]
const GRACE_FINISH = "grace.finish";
const MOST = "stop.mostInARow";
const BREAK = "SE_BREAK_ON_STOP";
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
  // The call runs the claim's own check, so a claim the turn's end refuses falls here first, and says why. [[spec/design_output/stop#a-refusal-names-its-check]]
  const rule = stopReasons(rulesOf(box)).find((one) => one.id === reason);
  const falls = READS_TEXT.has(rule.runs)
    ? ""
    : claimFalls({
        box,
        claimed: reason,
        off: asks(box, ENABLED) === false,
        hold: holdHere(box),
        text: "",
      });
  if (falls) {
    box.log.say("warn", "stop", `the claim of ${reason} falls`, { detail: falls });
    return { result: { result: `The claim falls. ${falls}` } };
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
  if (reportStands(text)) box.reported = true;
  const claimed = claimOf(e, box);
  box.claim = null;
  // The hold that stood over this turn, so the order the two events arrive in decides nothing. [[spec/design_output/stop#the-hold-outlives-its-drop]]
  const hold = holdHere(box);
  const off = asks(box, ENABLED) === false;
  warnsUnknown(rules, box);
  const decision = decide(rules, {
    claimed,
    ran: (name) =>
      ranHere(name, { off, hold, box, claimed, text, tasks: e?.background_tasks }),
  });
  const said = toothOf_(box).atTurnEnd(decision, Number(asks(box, MOST) ?? 0));
  // A line naming a reason whose check falls hears which check, and what it sees. [[spec/design_output/stop#a-refusal-names-its-check]]
  const falls =
    said.go?.runs === "no-stop-line"
      ? claimFalls({ off, hold, box, claimed, text })
      : "";
  const why = said.ends ? endsWhy(said) : falls || (said.go?.says ?? "");
  const prompts = said.ends ? "" : asksForStop(rules, why, box);
  // The runaway writes at warn, so a reader of the log finds the turn the cap ended. [[spec/design_output/stop#three-in-a-row]]
  box.log.say(
    said.runaway ? "warn" : "info",
    "stop",
    `the turn ${said.ends ? "ends" : "holds"}: ${why}`,
    {
      detail: `claimed=${claimed || "none"} ${detail(said, said.inARow)}`,
      prompts: prompts.split("\n")[0],
    },
  );
  // The owner reads a stop under the debugger, so the server started with the break flag pauses here with the reason and what prompts after. [[spec/design_output/stop#a-standing-stop-ends-it]]
  if (box.env?.[BREAK]) {
    const paused = { why, prompts, claimed, decision: detail(said, said.inARow) };
    // biome-ignore lint/suspicious/noDebugger: level0: NoDebugger - the owner asks the server to pause at every stop under the debugger
    debugger;
    box.log.say("debug", "stop", "the debugger read the stop", paused);
  }
  return said.ends ? { ...PASS } : { result: { block: prompts } };
}

function endsWhy(said) {
  if (said.runaway) return `the tooth lets go after ${said.inARow} holds in a row`;
  return said.stop?.says ?? "the turn ends";
}

// The last line names the binding, so the hand reads who sets what the hook asks. [[spec/design_output/stop#a-refusal-names-the-binding]]
function asksForStop(rules, why, box) {
  return [
    `${why} This turn holds open. Carry on, or end the turn with one last line, alone: stop: <reason>, with one of these reasons:`.trim(),
    ...stopReasons(rules).map((one) => `  ${one.id}: ${one.asks}`),
    bindingLine(box),
  ].join("\n");
}

// The turn's claim: the stop call's reason, or the last line's. [[spec/design_output/stop#the-claim-rides-the-call]]
export function claimOf(e, box) {
  return box.claim ?? lastLineReason(String(e?.last_assistant_message ?? ""));
}

// A turn ending on a rule under `waits: owner` waits for the owner's answer. [[spec/tickets/the-clear-keeps-questions]]
export function waitsForOwner(e, box) {
  const claimed = claimOf(e, box);
  return (
    Boolean(claimed) &&
    rulesOf(box).some((one) => one.id === claimed && one.waits === "owner")
  );
}

function lastLineReason(text) {
  const lines = String(text ?? "")
    .split("\n")
    .map((one) => one.trim())
    .filter(Boolean);
  const found = STOP_LINE.exec(lines.at(-1) ?? "");
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
  // [[spec/design_output/stop#a-helper-still-runs]]
  "helpers-running": (held) => helpersRun(held.tasks),
  // A claim a fact denies reads as no stop line, so the turn holds and the fact re-prompts. [[spec/design_output/stop#a-talk-follows-a-report]]
  "no-stop-line": (held) => !claimStands(held),
  // A stop that ends a turn to ask somebody needs somebody sitting here. [[spec/guidance/cloud]]
  "a-person-sits-here": (held) => !inCloud(held.box.env ?? {}),
  // [[spec/design_output/stop#a-talk-follows-a-report]]
  // A report an earlier message of this turn carries stands too, so a stop line sent alone repeats nothing. [[spec/design_output/stop#a-talk-follows-a-report]]
  "a-report-stands": (held) => reportStands(held.text) || Boolean(held.box?.reported),
  // What an unbuilt rule runs, so it stands off the vote and writes no line. [[spec/design_output/stop#the-mechanical-checks]]
  never: () => false,
  // A claim of done stands on an empty plan: no todo open, and nothing in hand. [[spec/design_output/stop#the-plan]]
  "the-plan-is-empty": (held) => planEmpty(held.box),
};

// The harness names every task it runs in the background at the turn's end, so a running helper reads off that list. [[spec/design_output/stop#a-helper-still-runs]]
export function helpersRun(tasks) {
  return (Array.isArray(tasks) ? tasks : []).some(
    (one) => one?.type === "subagent" && one?.status === "running",
  );
}

// [[spec/design_output/stop#the-plan]]
export function planEmpty(box) {
  const plan = plansHere(box);
  return plan.todos.length === 0 && !plan.working;
}

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
  return Boolean(held.claimed) && !claimFalls(held);
}

// Why a claim falls, or nothing where it stands or where no claim stands, so every refusal names its check. [[spec/design_output/stop#a-refusal-names-its-check]]
export function claimFalls(held) {
  if (!held.claimed) return "";
  const rule = stopReasons(rulesOf(held.box)).find((one) => one.id === held.claimed);
  if (!rule)
    return `The line claims ${held.claimed}, which names no reason this tree holds.`;
  if (!rule.runs || ranHere(rule.runs, held)) return "";
  const why = FALLS[rule.runs]?.(held.box);
  return `The line claims ${rule.id}, and its check ${rule.runs} answers false${why ? `: ${why}` : "."}`;
}

// What a check sees where it answers false. [[spec/design_output/stop#a-refusal-names-its-check]]
const FALLS = {
  "the-plan-is-empty": (box) => {
    const plan = plansHere(box);
    const held = [
      ...new Set([...plan.todos.map((one) => one.title), plan.working].filter(Boolean)),
    ];
    return `the plan still holds ${held.map((one) => `"${one}"`).join(", ")}. Name each under done in mcp__level0__plan, then claim again.`;
  },
  // [[spec/design_output/stop#a-helper-still-runs]]
  "helpers-running": () =>
    "the harness names no helper running at this turn's end, so its answer wakes nothing.",
};

// The checks reading the answer's text, which the stop call runs before any answer stands. [[spec/design_output/stop#a-refusal-names-its-check]]
const READS_TEXT = new Set(["a-report-stands", "no-stop-line"]);

// A rule naming a check this door holds nowhere says so in the log, once a turn, so the hand that wrote it reads its own mistake. The vote skips a claimed rule the agent claims nowhere, so the door reads every rule itself. [[spec/design_output/stop#the-mechanical-checks]]
function warnsUnknown(rules, box) {
  for (const one of rules) {
    if (!one.runs || knowsCheck(one.runs)) continue;
    box.log.say(
      "warn",
      "stop",
      `${one.id} runs ${one.runs}, which this door holds nowhere, so the rule fires nothing`,
      { rule: one.id, detail: String(one.runs) },
    );
  }
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

// The count reads the rows past the offset the box last reached. [[spec/design_output/log#a-reader-reads-new-rows]]
function promptsIn(box) {
  box.tallies = box.tallies ?? {};
  box.tallies.prompts = tallied(
    box.disk,
    join(box.work, SESSION),
    box.tallies.prompts,
    (count, one) => (one?.kind === "prompt" ? count + 1 : count),
    () => 0,
  );
  return box.tallies.prompts.value;
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
