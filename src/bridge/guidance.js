// The guidance reaching the session as context blocks, and the compaction
// that hands it over again.
// [[spec/design_output/level0#the-standing-layer]]

import { join } from "node:path";
import {
  bindsHere,
  canary,
  canaryIn,
  countsOf,
  envOf,
  forHelper,
  HEARD,
  OWES,
  standingLayer,
  styled,
} from "../../.claude/skills/level0/lib/guidance.js";
import { asks } from "./config.js";
import { deadIndexLine } from "./search.js";

const GUIDANCE = "spec/guidance";
const TOOTH = "stop.enabled";

// [[spec/design_output/level0#the-standing-layer]]
export function guidanceHere(disk, root, env = process.env, tooth = true) {
  const notes = readNotes(disk, join(root, GUIDANCE));
  const wanted = new Set(notes.flatMap((one) => envOf(one.text)));
  const bound = Object.fromEntries([...wanted].map((name) => [name, env[name] ?? ""]));
  const here = notes.filter((one) => bindsHere(one.text, bound));
  const counts = countsOf(here);
  // [[spec/design_output/level0#the-style-carries-a-note]]
  const session = here.filter((one) => !styled(one.text));
  return {
    standing: standingLayer(session),
    helper: standingLayer(here),
    ...counts,
    sentence: canary({ ...counts, stop: tooth }),
  };
}

function readsGuidance(box) {
  return guidanceHere(box.disk, box.method, process.env, asks(box, TOOTH) !== false);
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

// [[spec/design_output/stop#the-mark-survives-a-reload]]
function pastTurnOne() {
  return { reads: 1, firstTurn: false, owes: true };
}

function guidanceOf(box) {
  if (!box.guidance) box.guidance = readsGuidance(box);
  return box.guidance;
}

export function onSessionStart(_e, box) {
  box.guidance = readsGuidance(box);
  box.session = { reads: 0, firstTurn: true };
  return { pass: true };
}

// [[spec/design_output/level0#the-guidance-stays-put]]
export function onPromptContext(_e, box) {
  const held = guidanceOf(box);
  if (!box.session) box.session = pastTurnOne();
  const session = box.session;
  session.reads += 1;
  const blocks = blocksOf(held, box.index.dead());
  box.log.say("info", "context", `${blocks.length} block(s) reach the session`, {
    detail: blocks.map((one) => one.name).join(" "),
    reason: session.reads === 1 ? "first" : "re-read",
  });
  return { after: { blocks } };
}

function blocksOf(held, dead) {
  const blocks = [];
  if (dead) blocks.push({ name: "level0-index", text: deadIndexLine(dead) });
  if (!held.standing) return blocks;
  blocks.push({ name: "level0-rules", text: rulesText(held.standing) });
  blocks.push({ name: "level0-canary", text: canaryText(held.sentence) });
  return blocks;
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

// [[spec/design_output/level0#the-canary]]
function canaryText(sentence) {
  return [
    "End your FIRST answer with this line, on its own, word for word:",
    "",
    `    ${sentence}`,
    "",
    "It says out loud that level zero holds this session, and the numbers",
    "come from what it loaded. Write this line once and never again.",
  ].join("\n");
}

// [[spec/design_output/level0#the-canary-owes-a-debt]]
export function onTurnComplete(e, box) {
  if (!box.session) box.session = pastTurnOne();
  const session = box.session;
  if (e?.reason !== "answer") return { pass: true };
  const sentence = guidanceOf(box).sentence;
  const heard = canaryIn(e.answer, sentence);
  if (session.firstTurn) {
    session.firstTurn = false;
    session.owes = heard.found !== "same";
    box.log.say(session.owes ? "warn" : "info", "level0", HEARD[heard.found], { detail: sentence });
    return { pass: true };
  }
  if (session.owes && heard.found === "same") {
    session.owes = false;
    box.log.say("info", "level0", HEARD.same, { detail: sentence });
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
