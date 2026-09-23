// The client's search tools, answered off the warm index where it stands,
// and the find tool over the same rows.
// [[spec/design_output/index#the-door-answers-the-tools]]

import { asked, said as saidOf } from "../../.claude/skills/level0/lib/index.js";
import { FIND, findSpec } from "../../.claude/skills/level0/lib/search.js";

const PASS = { pass: true };

export { FIND, findSpec };

// [[spec/design_output/index#the-door-answers-the-tools]]
export function answersFromIndex(e, box) {
  const ask = asked(e);
  if (!ask || /^([A-Za-z]:)?[\\/]/.test(String(e.path ?? ""))) return PASS;
  const answer = box.index.ask(ask.method, ask.params);
  if (!answer) {
    // A question the index refuses alone reads the disk, and the index stands warm. [[spec/design_output/index#a-dead-index-speaks]]
    const fault = box.index.fault?.() ?? "";
    if (fault)
      box.log.say("info", "index", `${ask.method} reads the disk, past a question the index refuses`, {
        tool: String(e.tool),
        detail: fault,
      });
    else warmIndex(box);
    return PASS;
  }
  box.log.say("info", "index", `${ask.method} reads the rows`, {
    tool: String(e.tool),
    detail: String(e.pattern ?? ""),
  });
  return { result: e.tool === "Glob" ? globShape(answer) : grepShape(e, answer) };
}

// [[spec/design_output/index#the-rank-is-bm25]]
export function runsFind(e, box) {
  const words = String(e?.words ?? "").trim();
  if (!words) return { result: { result: `${FIND} takes the words to look for.` } };
  const rows = box.index.find(words);
  if (!rows) {
    warmIndex(box);
    return { result: { result: deadIndexLine(box.index.dead()) } };
  }
  return { result: { result: findSaid(rows) } };
}

// [[spec/design_output/index#a-dead-index-speaks]]
export function warmIndex(box) {
  const said = box.index.warm();
  if (!said.warmed) return;
  if (said.dead)
    box.log.say("warn", "index", "the index is dead", { detail: said.dead });
  else box.log.say("info", "index", "the index is warm");
}

export function deadIndexLine(why) {
  return `The index is dead: ${why}. Run ./RUNME.sh, which builds it, and Grep reads the disk until then.`;
}

function globShape(answer) {
  const filenames = answer?.paths ?? [];
  return {
    durationMs: 0,
    numFiles: filenames.length,
    filenames,
    truncated: Boolean(answer?.cut),
  };
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

function findSaid(rows) {
  if (!Array.isArray(rows) || !rows.length) return "Nothing carries those words.";
  return rows
    .map((one) => `${one.path}:${one.line}: ${String(one.text ?? "").trim()}`)
    .join("\n");
}
