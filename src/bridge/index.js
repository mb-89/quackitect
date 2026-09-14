// The index behind the search tools. A Grep or a Glob the index can answer
// comes from the rows, in the tool's own shape, and any other reads the disk.
// The find tool ranks lines by the words. A dead index blocks nothing: it says
// why, once, and the disk answers until it warms again.
// [[spec/design_output/index#the-door-answers-the-tools]]

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { asked, BIN, readsAnswer, said as saidOf } from "../../.claude/skills/level0/lib/index.js";

export const FIND = "find";
const PASS = { pass: true };
const REWARM = 60000;

export function findSpec() {
  return {
    name: FIND,
    description:
      "Finds the lines in this tree carrying the words, ranked by the index. Ask it before a Grep over the tree, because it reads the rows and not the disk.",
    inputSchema: {
      type: "object",
      properties: { words: { type: "string", description: "The words to look for." } },
      required: ["words"],
    },
  };
}

// [[spec/design_output/index#the-door-answers-the-tools]]
export function answersFromIndex(e, box) {
  const ask = asked(e);
  if (!ask || /^([A-Za-z]:)?[\\/]/.test(String(e.path ?? ""))) return PASS;
  const answer = askIndex(box, ask);
  if (!answer) return PASS;
  box.log.say("info", "index", `${ask.method} reads the rows`, {
    tool: String(e.tool),
    detail: String(e.pattern ?? "").slice(0, 120),
  });
  return { result: e.tool === "Glob" ? globShape(answer) : grepShape(e, answer) };
}

// [[spec/design_output/index#the-rank-is-bm25]]
export function runsFind(e, box) {
  const words = String(e?.words ?? "").trim();
  if (!words) return { result: { result: `${FIND} takes the words to look for.` } };
  const at = indexAt(box);
  if (!at) return { result: { result: deadIndexLine(box.dead) } };
  const ran = spawnSync(at, [FIND, words], { cwd: box.root, encoding: "utf8", timeout: 20000 });
  if (ran.status !== 0) {
    box.dead = `${BIN} find answers ${ran.status}`;
    return { result: { result: deadIndexLine(box.dead) } };
  }
  return { result: { result: findSaid(ran.stdout) } };
}

// The index warms at session start, and again after a failed question, once a minute at most.
// [[spec/design_output/index#a-dead-index-speaks]]
export function warmIndex(box) {
  if (box.now() - (box.warmedAt ?? 0) < REWARM) return;
  box.warmedAt = box.now();
  const at = indexAt(box);
  if (!at) {
    box.dead = `no ${BIN} stands on this box`;
    box.log.say("warn", "index", "the index is dead", { detail: box.dead });
    return;
  }
  const ran = spawnSync(at, ["standing"], { cwd: box.root, encoding: "utf8", timeout: 60000 });
  if (ran.status === 0) {
    box.dead = "";
    box.log.say("info", "index", "the index is warm");
    return;
  }
  box.dead = `${BIN} standing answers ${ran.status}`;
  box.log.say("warn", "index", "the index is dead", { detail: box.dead });
}

export function deadIndexLine(why) {
  return `The index is dead: ${why}. Run ./RUNME.sh, which builds it, and Grep reads the disk until then.`;
}

function indexAt(box) {
  for (const at of [join(box.root, BIN), `${join(box.root, BIN)}.exe`]) {
    if (existsSync(at)) return at;
  }
  return "";
}

function askIndex(box, ask) {
  const at = indexAt(box);
  if (!at) return null;
  const ran = spawnSync(at, ["call", ask.method, JSON.stringify(ask.params)], {
    cwd: box.root,
    encoding: "utf8",
    timeout: 20000,
  });
  if (ran.status !== 0) {
    box.dead = `${BIN} call answers ${ran.status}`;
    warmIndex(box);
    return null;
  }
  return readsAnswer(ran.stdout);
}

// The client wants a hook's answer in the tool's own shape, and the text the
// index library writes fills the content of it.
function globShape(answer) {
  const filenames = answer?.paths ?? [];
  return { durationMs: 0, numFiles: filenames.length, filenames, truncated: Boolean(answer?.cut) };
}

function grepShape(e, answer) {
  const files = answer?.files ?? [];
  const mode = String(e?.output_mode ?? "files_with_matches");
  const filenames = files.map((one) => one.path);
  const shape = { mode, numFiles: filenames.length, filenames };
  if (mode === "content") {
    shape.content = saidOf(e, answer);
    shape.numLines = files.reduce((sum, one) => sum + (one.lines?.length ?? 0), 0);
  }
  if (mode === "count") {
    shape.content = saidOf(e, answer);
    shape.numMatches = files.reduce((sum, one) => sum + Number(one.count ?? 0), 0);
  }
  return shape;
}

// The index answers rows as JSON, and the agent reads them as path, line and text.
function findSaid(stdout) {
  const rows = readsAnswer(stdout);
  if (!Array.isArray(rows) || !rows.length) return "Nothing carries those words.";
  return rows.map((one) => `${one.path}:${one.line}: ${String(one.text ?? "").trim()}`).join("\n");
}
