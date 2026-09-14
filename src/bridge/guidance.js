// The guidance reaching the session. The rules of every note under the top of
// spec/guidance go to the agent as context blocks, on the first read and again
// after a compaction, with the canary line that says what reached it. The
// first turn's answer carries the canary, and the log says whether it came
// back whole, so a compaction probe reads the log alone.
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
} from "../../.claude/skills/level0/lib/guidance.js";
import { deadIndexLine } from "./search.js";

const GUIDANCE = "spec/guidance";

// [[spec/design_output/level0#the-standing-layer]]
export function guidanceHere(disk, root, env = process.env) {
  const notes = readNotes(disk, join(root, GUIDANCE));
  const wanted = new Set(notes.flatMap((one) => envOf(one.text)));
  const bound = Object.fromEntries([...wanted].map((name) => [name, env[name] ?? ""]));
  const here = notes.filter((one) => bindsHere(one.text, bound));
  const counts = countsOf(here);
  return { standing: standingLayer(here), ...counts, sentence: canary({ ...counts, stop: false }) };
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

// A session opens: the guidance reads again, and the canary is owed again.
export function onSessionStart(_e, box) {
  box.guidance = guidanceHere(box.disk, box.method);
  box.session = { reads: 0, firstTurn: true };
  return { pass: true };
}

// [[spec/design_output/level0#the-guidance-stays-put]]
export function onPromptContext(_e, box) {
  const held = box.guidance ?? (box.guidance = guidanceHere(box.disk, box.method));
  const session = box.session ?? (box.session = { reads: 0, firstTurn: true });
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

// The first turn's answer carries the canary, and the log says whether it came
// back. An answer without it leaves a debt, and any later answer carrying the
// line pays it.
// [[spec/design_output/level0#the-canary-owes-a-debt]]
export function onTurnComplete(e, box) {
  const session = box.session ?? (box.session = { reads: 0, firstTurn: true });
  if (e?.reason !== "answer") return { pass: true };
  const heard = canaryIn(e.answer, box.guidance?.sentence ?? "");
  if (session.firstTurn) {
    session.firstTurn = false;
    session.owes = heard.found !== "same";
    box.log.say(session.owes ? "warn" : "info", "level0", HEARD[heard.found], {
      detail: box.guidance?.sentence ?? "",
    });
    return { pass: true };
  }
  if (session.owes && heard.found === "same") {
    session.owes = false;
    box.log.say("info", "level0", HEARD.same, { detail: box.guidance?.sentence ?? "" });
  }
  return { pass: true };
}

// While the canary is owed, every tool call carries the ask for it, and none is refused.
export function owesCanary(e, box) {
  const session = box.session;
  if (!session?.owes || e?.agentId) return null;
  box.log.say("warn", "gate", `warned ${e?.tool ?? "a call"} before the canary`, {
    tool: String(e?.tool ?? ""),
    detail: box.guidance?.sentence ?? "",
  });
  return { after: { context: [OWES.warns(box.guidance?.sentence ?? "")] } };
}

// A compaction: the client reads the context again after it, and the guidance
// reads off the disk again first, so the re-read carries the notes as they
// stand. The canary is owed again, so the next answer says the rules reached it.
// [[spec/design_output/level0#the-layer-after-a-compaction]]
export function onSessionCompact(e, box) {
  box.guidance = guidanceHere(box.disk, box.method);
  if (box.session) box.session.owes = true;
  box.log.say("info", "compact", "a compaction runs, and the guidance reads again", {
    trigger: String(e?.trigger ?? "unknown"),
    messages: Array.isArray(e?.messages) ? e.messages.length : 0,
    detail: box.guidance.sentence,
  });
  return { pass: true };
}

// A helper takes the guidance in its prompt, because the client hands it no context blocks.
// [[spec/design_output/level0#the-helper-takes-the-guidance]]
export function onAgentSpawn(e, box) {
  const standing = box.guidance?.standing ?? "";
  if (!standing) return { pass: true };
  box.log.say("info", "agent", `handed the guidance to ${e?.subagentType ?? "a helper"}`, {
    detail: String(e?.description ?? "").slice(0, 120),
  });
  return { event: { ...e, prompt: forHelper(standing, e?.prompt) } };
}
