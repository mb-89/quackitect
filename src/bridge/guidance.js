// The guidance reaching the session as context blocks, and the compaction
// that hands it over again.
// [[spec/design_output/level0#the-standing-layer]]

import { join } from "node:path";
import {
  bindsHere,
  canary,
  canaryIn,
  canaryText,
  carried,
  countsOf,
  envOf,
  forHelper,
  HEARD,
  kindsOf,
  layersOf,
  OWES,
  standingLayer,
  styled,
} from "../../.claude/skills/level0/lib/guidance.js";
import { inherits } from "../../.claude/skills/level0/lib/layer.js";
import { rowsIn, SESSION } from "../../.claude/skills/level0/lib/log.js";
import { isDraft } from "../../.claude/skills/level0/lib/paths.js";
import { toolLines, WANTED } from "../../.claude/skills/level0/lib/tools.js";
import { heldReadsIn } from "../scripts/guidance-hand.js";
import { readTools, writeSurvey } from "../engine/tools.js";
import { asks } from "./config.js";
import { deadIndexLine } from "./search.js";

const GUIDANCE = "spec/guidance";
const TOOTH = "stop.enabled";
// The kind onSessionCompact writes its line under, which the read-back looks for. [[spec/design_output/level0#the-debt-survives-a-restart]]
const COMPACT = "compact";
// The kind the paid line stands under, which onTurnSaid writes. [[spec/design_output/level0#the-debt-survives-a-restart]]
const DOOR = "level0";
export const TOOLS_BLOCK = "level0-tools";
const TOOLS_HEADING = "# What this box has";

// The notes come off both roots, file by file, the work root's winning. [[spec/design_output/vehicle#the-work-root-inherits]]
export function guidanceHere(
  disk,
  method,
  work = method,
  env = {},
  tooth = true,
  argv = [],
) {
  const reads = inherits(disk, method, work);
  const notes = readNotes(reads, GUIDANCE);
  // A note binding a kind stands beside its topic in a folder below, and its layer reaches down for it. [[spec/tickets/the-spawn-reaches-its-guidance]]
  const kinded = readBelow(reads, GUIDANCE).filter((one) => kindsOf(one.text).length);
  const wanted = new Set([...notes, ...kinded].flatMap((one) => envOf(one.text)));
  const bound = Object.fromEntries([...wanted].map((name) => [name, env[name] ?? ""]));
  const here = notes.filter((one) => bindsHere(one.text, bound));
  // A note the held step hands over rides the step, so the layer hands it no second time. [[spec/design_output/level0#the-standing-layer]]
  const read = heldReadsIn(disk, join, work, env, argv);
  // A note naming a kind stands off the working hand, and the layer of that kind holds it. [[spec/tickets/the-spawn-reaches-its-guidance]]
  const free = here.filter((one) => !kindsOf(one.text).length);
  // [[spec/design_output/level0#the-style-carries-a-note]]
  const session = free.filter((one) => !styled(one.text));
  const counts = countsOf(carried(session, read));
  return {
    standing: standingLayer(session, read),
    helper: standingLayer(free),
    layers: layersOf([...here, ...kinded.filter((one) => bindsHere(one.text, bound))]),
    ...counts,
    sentence: canary({ ...counts, stop: tooth }),
  };
}

function readsGuidance(box) {
  return guidanceHere(
    box.disk,
    box.method,
    box.work,
    box.env ?? {},
    asks(box, TOOTH) !== false,
  );
}

function readNotes(reads, folder) {
  try {
    return reads
      .list(folder)
      .filter(
        (one) => one.kind === "file" && one.name.endsWith(".md") && !isDraft(one.name),
      )
      .map((one) => ({ name: one.name, text: reads.read(`${folder}/${one.name}`) }));
  } catch {
    return [];
  }
}

// Every note in the folders under this one, each named by its path below it. [[spec/tickets/the-spawn-reaches-its-guidance]]
function readBelow(reads, folder) {
  let dirs = [];
  try {
    dirs = reads.list(folder).filter((one) => one.kind === "dir");
  } catch {
    return [];
  }
  return dirs.flatMap((one) => {
    const at = `${folder}/${one.name}`;
    return [...readNotes(reads, at), ...readBelow(reads, at)].map((note) => ({
      ...note,
      name: `${one.name}/${note.name}`,
    }));
  });
}

// The session the box holds for this call, built where a restart dropped it. [[spec/design_output/level0#the-debt-survives-a-restart]]
function sessionHere(box) {
  if (!box.session) box.session = afterARestart(box);
  return box.session;
}

// A restart drops the box and the harness session runs on, so the debt comes back off the log. The log rotates at a session start, so what stands in it belongs to this session. [[spec/design_output/level0#the-debt-survives-a-restart]]
function afterARestart(box) {
  const paid = paidInLog(box);
  return { reads: 1, firstTurn: false, paid, owes: !paid };
}

// The last of the two marks says where the debt stands: the line pays it, and a compaction opens it again. [[spec/design_output/level0#the-debt-survives-a-restart]]
function paidInLog(box) {
  let rows = [];
  try {
    rows = rowsIn(String(box.disk.read(join(box.work, SESSION))));
  } catch {
    return false;
  }
  return pays(rows.filter((one) => pays(one) || opens(one)).at(-1));
}

function pays(row) {
  return row?.kind === DOOR && row?.said === HEARD.same;
}

function opens(row) {
  return row?.kind === COMPACT;
}

function guidanceOf(box) {
  if (!box.guidance) box.guidance = readsGuidance(box);
  return box.guidance;
}

export function onSessionStart(_e, box) {
  box.guidance = readsGuidance(box);
  box.tools = surveyHere(box);
  box.session = { reads: 0, firstTurn: true };
  return { pass: true };
}

// [[spec/design_output/level0#the-guidance-stays-put]]
export function onPromptContext(_e, box) {
  const held = guidanceOf(box);
  const session = sessionHere(box);
  session.reads += 1;
  const blocks = blocksOf(held, box.index.dead(), toolsText(box));
  box.log.say("info", "context", `${blocks.length} block(s) reach the session`, {
    detail: blocks.map((one) => one.name).join(" "),
    reason: session.reads === 1 ? "first" : "re-read",
  });
  return { after: { blocks } };
}

function blocksOf(held, dead, tools) {
  const blocks = [];
  if (dead) blocks.push({ name: "level0-index", text: deadIndexLine(dead) });
  if (tools) blocks.push({ name: TOOLS_BLOCK, text: tools });
  if (!held.standing) return blocks;
  blocks.push({ name: "level0-rules", text: rulesText(held.standing) });
  blocks.push({ name: "level0-canary", text: canaryText(held.sentence) });
  return blocks;
}

// [[spec/design_output/tools#the-session-reads-the-survey]]
export function surveyHere(box) {
  const found = readTools(box.disk, box.work);
  if (Object.keys(found).length) return found;
  return writeSurvey(
    { disk: box.disk, proc: box.proc },
    box.work,
    box.env ?? {},
  );
}

function toolsText(box) {
  const lines = toolLines(box.tools ?? {}, WANTED, box.specs ?? []);
  return lines.length ? [TOOLS_HEADING, "", ...lines].join("\n") : "";
}

function rulesText(standing) {
  return [
    "# How this tree is worked",
    "",
    "These rules reach you before anything else. Vale holds the mechanical",
    "ones at the write door, so a write breaking one comes back with the",
    "reason and the line.",
    "",
    standing,
  ].join("\n");
}

// A step of a turn carries its text, so the debt clears where the line lands and a turn holding open asks once. [[spec/design_output/level0#the-line-lands-once]]
export function onTurnSaid(e, box) {
  if (e?.agentId) return { pass: true };
  paid(box, e?.text);
  return { pass: true };
}

// The line pays once a session, so no later answer opens the debt again. [[spec/design_output/level0#the-line-lands-once]]
function paid(box, answer) {
  const session = sessionHere(box);
  if (session.paid) return true;
  const sentence = guidanceOf(box).sentence;
  if (canaryIn(answer, sentence).found !== "same") return false;
  session.paid = true;
  session.owes = false;
  box.log.say("info", DOOR, HEARD.same, { detail: sentence });
  return true;
}

// [[spec/design_output/level0#the-canary-owes-a-debt]]
export function onTurnComplete(e, box) {
  const session = sessionHere(box);
  if (e?.reason !== "answer") return { pass: true };
  if (paid(box, e.answer)) {
    session.firstTurn = false;
    return { pass: true };
  }
  if (session.firstTurn) {
    const sentence = guidanceOf(box).sentence;
    session.firstTurn = false;
    session.owes = true;
    box.log.say("warn", DOOR, HEARD[canaryIn(e.answer, sentence).found], {
      detail: sentence,
    });
  }
  return { pass: true };
}

export function owesCanary(e, box) {
  const session = sessionHere(box);
  if (!session.owes || e?.agentId) return null;
  const sentence = guidanceOf(box).sentence;
  box.log.say("debug", "gate", `asked ${e?.tool ?? "a call"} for the canary`, {
    tool: String(e?.tool ?? ""),
    detail: sentence,
  });
  return { after: { context: [OWES.warns(sentence)] } };
}

// [[spec/design_output/level0#the-layer-after-a-compaction]]
export function onSessionCompact(e, box) {
  box.guidance = readsGuidance(box);
  const session = sessionHere(box);
  session.owes = true;
  // The debt opens again, so the line that paid it pays no second time. [[spec/design_output/level0#the-debt-survives-a-restart]]
  session.paid = false;
  box.log.say("info", "compact", "a compaction runs, and the guidance reads again", {
    trigger: String(e?.trigger ?? "unknown"),
    messages: Array.isArray(e?.messages) ? e.messages.length : 0,
    detail: box.guidance.sentence,
  });
  return { pass: true };
}

// [[spec/design_output/level0#the-helper-takes-the-guidance]]
export function onAgentSpawn(e, box) {
  const kind = String(e?.kind ?? "");
  const standing = layerHere(box.guidance, kind);
  if (!standing) return { pass: true };
  box.log.say(
    "info",
    "agent",
    `handed the ${kind || "helper"} layer to ${e?.subagentType ?? "a helper"}`,
    {
      detail: String(e?.description ?? ""),
    },
  );
  return { event: { ...e, prompt: forHelper(standing, e?.prompt) } };
}

// The spawn names its kind, and the layer of that kind reaches that hand. A spawn naming none takes the helper layer. [[spec/tickets/the-spawn-reaches-its-guidance]]
export function layerHere(guidance, kind) {
  const held = guidance?.layers?.[String(kind ?? "")];
  if (held) return held;
  return guidance?.helper ?? guidance?.standing ?? "";
}
