// The guidance reaching the session as context blocks, and the compaction
// that hands it over again.
// [[spec/design_output/level0#the-standing-layer]]

import { join } from "node:path";
import {
  bindsHere,
  canary,
  carried,
  canaryIn,
  canaryText,
  countsOf,
  envOf,
  forHelper,
  HEARD,
  OWES,
  standingLayer,
  styled,
} from "../../.claude/skills/level0/lib/guidance.js";
import { toolLines, WANTED } from "../../.claude/skills/level0/lib/tools.js";
import { readTools, writeSurvey } from "../scripts/tools.js";
import { heldReadsIn } from "../scripts/guidance-hand.js";
import { asks } from "./config.js";
import { deadIndexLine } from "./search.js";

const GUIDANCE = "spec/guidance";
const TOOTH = "stop.enabled";
export const TOOLS_BLOCK = "level0-tools";
const TOOLS_HEADING = "# What this box has";

// [[spec/design_output/level0#the-standing-layer]]
export function guidanceHere(disk, root, env = process.env, tooth = true, work = root) {
  const notes = readNotes(disk, join(root, GUIDANCE));
  const wanted = new Set(notes.flatMap((one) => envOf(one.text)));
  const bound = Object.fromEntries([...wanted].map((name) => [name, env[name] ?? ""]));
  const here = notes.filter((one) => bindsHere(one.text, bound));
  // A note the held step hands over rides the step, so the layer hands it no second time. [[spec/design_output/level0#the-standing-layer]]
  const read = heldReadsIn(disk, join, work, env);
  // [[spec/design_output/level0#the-style-carries-a-note]]
  const session = here.filter((one) => !styled(one.text));
  const counts = countsOf(carried(session, read));
  return {
    standing: standingLayer(session, read),
    helper: standingLayer(here),
    ...counts,
    sentence: canary({ ...counts, stop: tooth }),
  };
}

function readsGuidance(box) {
  const tooth = asks(box, TOOTH) !== false;
  return guidanceHere(box.disk, box.method, process.env, tooth, box.work || box.method);
}

function readNotes(disk, folder) {
  try {
    return disk
      .list(folder)
      .filter((one) => one.kind === "file" && one.name.endsWith(".md"))
      .map((one) => ({ name: one.name, text: disk.read(join(folder, one.name)) }));
  } catch {
    return [];
  }
}

// [[spec/design_output/level0#the-canary-owes-a-debt]]
function pastTurnOne() {
  return { reads: 1, firstTurn: false, owes: true };
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
  if (!box.session) box.session = pastTurnOne();
  const session = box.session;
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
function surveyHere(box) {
  const found = readTools(box.disk, box.work);
  if (Object.keys(found).length) return found;
  return writeSurvey({ disk: box.disk, proc: box.proc }, box.work, box.env ?? process.env);
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
  if (!box.session) box.session = pastTurnOne();
  const session = box.session;
  if (session.paid) return true;
  const sentence = guidanceOf(box).sentence;
  if (canaryIn(answer, sentence).found !== "same") return false;
  session.paid = true;
  session.owes = false;
  box.log.say("info", "level0", HEARD.same, { detail: sentence });
  return true;
}

// [[spec/design_output/level0#the-canary-owes-a-debt]]
export function onTurnComplete(e, box) {
  if (!box.session) box.session = pastTurnOne();
  const session = box.session;
  if (e?.reason !== "answer") return { pass: true };
  if (paid(box, e.answer)) {
    session.firstTurn = false;
    return { pass: true };
  }
  if (session.firstTurn) {
    const sentence = guidanceOf(box).sentence;
    session.firstTurn = false;
    session.owes = true;
    box.log.say("warn", "level0", HEARD[canaryIn(e.answer, sentence).found], { detail: sentence });
  }
  return { pass: true };
}

export function owesCanary(e, box) {
  if (!box.session) box.session = pastTurnOne();
  const session = box.session;
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
  if (box.session) box.session.owes = true;
  box.log.say("info", "compact", "a compaction runs, and the guidance reads again", {
    trigger: String(e?.trigger ?? "unknown"),
    messages: Array.isArray(e?.messages) ? e.messages.length : 0,
    detail: box.guidance.sentence,
  });
  return { pass: true };
}

// [[spec/design_output/level0#the-helper-takes-the-guidance]]
export function onAgentSpawn(e, box) {
  const standing = box.guidance?.helper ?? box.guidance?.standing ?? "";
  if (!standing) return { pass: true };
  box.log.say("info", "agent", `handed the guidance to ${e?.subagentType ?? "a helper"}`, {
    detail: String(e?.description ?? ""),
  });
  return { event: { ...e, prompt: forHelper(standing, e?.prompt) } };
}
