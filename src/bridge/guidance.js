// The guidance reaching the session. The rules of every note under the top of
// spec/guidance go to the agent as context blocks, on the first read and again
// after a compaction, with the canary line that says what reached it. The
// first turn's answer carries the canary, and the log says whether it came
// back whole, so a compaction probe reads the log alone.
// [[spec/design_output/level0#the-standing-layer]]

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  bindsHere,
  canary,
  canaryIn,
  countsOf,
  envOf,
  HEARD,
  standingLayer,
} from "../../.claude/skills/level0/lib/guidance.js";
import { deadIndexLine } from "./index.js";

const GUIDANCE = "spec/guidance";

// [[spec/design_output/level0#the-standing-layer]]
export function guidanceHere(root) {
  const notes = readNotes(join(root, GUIDANCE));
  const wanted = new Set(notes.flatMap((one) => envOf(one.text)));
  const env = Object.fromEntries([...wanted].map((name) => [name, process.env[name] ?? ""]));
  const here = notes.filter((one) => bindsHere(one.text, env));
  const counts = countsOf(here);
  return { standing: standingLayer(here), ...counts, sentence: canary({ ...counts, stop: false }) };
}

function readNotes(folder) {
  try {
    return readdirSync(folder, { withFileTypes: true })
      .filter((one) => one.isFile() && one.name.endsWith(".md"))
      .map((one) => ({ name: one.name, text: readFileSync(join(folder, one.name), "utf8") }));
  } catch {
    return [];
  }
}

// A session opens: the guidance reads again, and the canary is owed again.
export function onSessionStart(_e, box) {
  box.guidance = guidanceHere(box.root);
  box.session = { reads: 0, firstTurn: true };
  return { pass: true };
}

// [[spec/design_output/level0#the-guidance-stays-put]]
export function onPromptContext(_e, box) {
  const held = box.guidance ?? guidanceHere(box.root);
  const session = box.session ?? (box.session = { reads: 0, firstTurn: true });
  session.reads += 1;
  const blocks = blocksOf(held, box.dead);
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

// The first turn's answer carries the canary, and the log says whether it came back.
export function onTurnComplete(e, box) {
  const session = box.session;
  if (!session?.firstTurn || e?.reason !== "answer") return { pass: true };
  session.firstTurn = false;
  const heard = canaryIn(e.answer, box.guidance?.sentence ?? "");
  box.log.say(heard.found === "same" ? "info" : "warn", "level0", HEARD[heard.found], {
    detail: box.guidance?.sentence ?? "",
  });
  return { pass: true };
}

// [[spec/design_output/level0#the-layer-after-a-compaction]]
export function onSessionCompact(e, box) {
  box.log.say("info", "compact", "a compaction runs", {
    trigger: String(e?.trigger ?? "unknown"),
    messages: Array.isArray(e?.messages) ? e.messages.length : 0,
  });
  return { pass: true };
}
