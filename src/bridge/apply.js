// The batch edit: patch, replace and undo over the tree, one atomic call each,
// with a journal that puts every file back.
// [[spec/design_output/apply#the-write-tools]]

import { dirname, join } from "node:path";
import {
  applied,
  filesIn,
  PATCH,
  patchSpec,
  REPLACE,
  replaceSpec,
} from "../../.claude/skills/level0/lib/apply.js";
import { relativeTo } from "../../.claude/skills/level0/lib/paths.js";
import {
  journalOf,
  nameOf,
  newestOn,
  restores,
  UNDO,
  FOLDER as UNDONE,
  undoSpec,
} from "../../.claude/skills/level0/lib/undo.js";
import { marksOf, marksSeen, onWrite } from "./write.js";

export const SPECS = () => [patchSpec(), replaceSpec(), undoSpec()];
export const TOOLS = {
  [`mcp__level0__${PATCH}`]: patches,
  [`mcp__level0__${REPLACE}`]: replaces,
  [`mcp__level0__${UNDO}`]: undoes,
};

// [[spec/design_output/apply#check-everything-then-write]]
async function patches(e, box) {
  const ops = Array.isArray(e.ops) ? e.ops : [];
  const took = applied(readsFiles(box, filesIn(ops)), ops);
  return lands(e, took, box);
}

// [[spec/design_output/apply#a-pattern-matching-nothing]]
async function replaces(e, box) {
  const swept = sweeps(e, box);
  if (swept.why) return { result: { result: swept.why } };
  const took = applied(swept.held, swept.ops);
  if (took.ok) {
    const hits = Object.values(took.counts).reduce((n, one) => n + one, 0);
    const wanted = e.expect_count;
    if (wanted !== undefined && Number(wanted) !== hits) {
      return {
        result: {
          result: `the pattern matches ${hits} times, and expect_count says ${wanted}`,
        },
      };
    }
  }
  return lands(e, took, box);
}

async function lands(e, took, box) {
  if (!took.ok) return { result: { result: took.why } };
  // A call writing nothing moves no disk, so the marks it meets stand as they stood. [[spec/design_output/level0#a-write-meets-its-mark]]
  const held = new Map(marksOf(box));
  const refused = await checked(took, box, e.agentId);
  if (refused) {
    box.marks = held;
    return { result: { result: refused } };
  }
  if (e.preview === true) {
    box.marks = held;
    return { result: { result: wouldLand(took) } };
  }
  const wrote = writes(took, String(e.on ?? ""), box);
  if (!wrote.landed) box.marks = held;
  return { result: { result: wrote.said } };
}

// The write carries the call's hand, so the hand holding a file patches it. [[spec/design_output/stop#the-hand-holds-its-file]]
async function checked(took, box, agentId) {
  for (const one of took.files) {
    const said = await onWrite(
      { tool: "Write", file_path: one.file, content: one.made, agentId },
      box,
    );
    if (said?.result?.deny)
      return `${one.file} refuses the batch, and nothing is written.\n\n${said.result.deny}`;
    // The door formats code and marks the text it answers, so the disk takes that text and the next edit meets its mark. [[spec/design_output/level0#the-formatter-applies-itself]]
    if (typeof said?.event?.content === "string") one.made = said.event.content;
  }
  return "";
}

// [[spec/design_output/apply#the-journal-holds-both-halves]]
function writes(took, on, box) {
  const at = box.clock.stamp();
  const where = join(box.root, UNDONE, nameOf(at));
  const journal = journalOf(at, on, "level0", took.files);
  try {
    box.disk.makeDir(join(box.root, UNDONE));
    box.disk.write(where, `${JSON.stringify(journal, null, 2)}\n`);
  } catch (bad) {
    return {
      landed: false,
      said: `the undo journal would not write, so nothing did: ${bad?.message ?? bad}`,
    };
  }
  const wrote = [];
  for (const one of took.files) {
    const path = join(box.root, inTheTree(box.root, one.file));
    try {
      // [[spec/design_output/apply#a-create-makes-its-folder]]
      if (one.born) box.disk.makeDir(dirname(path));
      box.disk.write(path, one.made);
      wrote.push(one.file);
    } catch (bad) {
      if (!wrote.length) return unlanded(box, where, journal, one.file, bad);
      return {
        landed: true,
        said: `${one.file} would not write: ${bad?.message ?? bad}\nThe tree stands part written. Run undo to put it back, out of ${where}.`,
      };
    }
  }
  box.log.say("info", "apply", `${wrote.length} file(s) written`, {
    detail: on,
    file: where,
  });
  return {
    landed: true,
    said: [
      `${wrote.length} file(s) written, and ${relativeTo(box.root, where)} holds what they said before.`,
      ...wrote.map((one) => `  ${one} (${took.counts[one]} place(s))`),
      "",
      "Run undo to take this back while nothing else touches these files.",
    ].join("\n"),
  };
}

// The journal stays with a word that nothing landed, so an undo takes back no older apply. [[spec/design_output/apply#a-first-fault-writes-nothing]]
function unlanded(box, where, journal, file, bad) {
  try {
    box.disk.write(where, `${JSON.stringify({ ...journal, landed: false }, null, 2)}\n`);
  } catch {
    // [[spec/design_output/apply#a-first-fault-writes-nothing]]
  }
  box.log.say("warn", "apply", `nothing written: ${file} would not write`, {
    file: where,
  });
  return {
    landed: false,
    said: `nothing written: ${file} would not write: ${bad?.message ?? bad}`,
  };
}

function wouldLand(took) {
  const rows = took.files
    .map(
      (one) =>
        `  ${one.file} (${took.counts[one.file]} place(s))${one.born ? ", new" : ""}`,
    )
    .sort();
  return [
    `${took.files.length} file(s) would change, and nothing is written.`,
    ...rows,
  ].join("\n");
}

// [[spec/design_output/apply#drift-refuses-the-restore]]
async function undoes(e, box) {
  const on = String(e.on ?? "");
  const folder = join(box.root, UNDONE);
  const names = list(box.disk, folder).filter((one) => one.endsWith(".json"));
  if (!names.length)
    return said(box, false, "nothing to undo: no apply journal stands here", on);
  const entries = {};
  for (const name of names) {
    try {
      entries[name] = JSON.parse(String(box.disk.read(join(folder, name))));
    } catch {}
  }
  const newest = newestOn(names, entries, on);
  if (!newest) {
    return said(
      box,
      false,
      `nothing of ${on || "this session"} to undo: an undo takes back what its own name wrote`,
      on,
    );
  }
  // [[spec/design_output/apply#a-first-fault-writes-nothing]]
  if (newest.entry.landed === false) {
    box.disk.remove(join(folder, newest.name));
    return said(box, false, "nothing waits to undo: the newest apply wrote nothing", on);
  }
  const held = readsFiles(
    box,
    newest.entry.files.map((one) => one.file),
  );
  const put = restores(newest.entry, held);
  if (!put.ok) return said(box, false, put.why, on);

  const done = [];
  for (const one of put.writes) {
    box.disk.write(join(box.root, inTheTree(box.root, one.file)), one.text);
    // The undo hands the agent what it put back. [[spec/design_output/level0#a-write-meets-its-mark]]
    marksSeen(box, inTheTree(box.root, one.file), one.text);
    done.push(`  put back ${one.file}`);
  }
  for (const path of put.removes) {
    box.disk.remove(join(box.root, inTheTree(box.root, path)));
    done.push(`  removed ${path}, which the apply made`);
  }
  box.disk.remove(join(folder, newest.name));
  return said(box, true, [`${done.length} file(s) come back.`, ...done].join("\n"), on);
}

function said(box, ok, result, on) {
  box.log.say(ok ? "info" : "warn", "undo", result.split("\n")[0], { detail: on });
  return { result: { result } };
}

function sweeps(e, box) {
  const pattern = String(e.pattern ?? "");
  const glob = String(e.glob ?? "");
  const flags = `${String(e.flags ?? "").replace(/[^ims]/g, "")}g`;
  let shape;
  try {
    shape = new RegExp(pattern, flags);
  } catch (bad) {
    return { why: `the pattern compiles to nothing: ${bad?.message ?? bad}` };
  }
  const answer = box.index.ask("grep", { pattern, glob, limit: 0 });
  if (!answer) {
    const fault = box.index.fault?.() ?? "";
    return {
      why: fault
        ? `the index reads the pattern as no search, so the sweep has no list: ${fault}`
        : "the index is dead, so the sweep has no list. Run ./RUNME.sh, then try again",
    };
  }
  const paths = (answer.files ?? []).map((one) => one.path);
  if (!paths.length) return { why: "the pattern matches nothing under that glob" };
  const held = readsFiles(box, paths);
  const ops = [];
  for (const path of paths) {
    shape.lastIndex = 0;
    if (!shape.test(held[path]?.text ?? "")) continue;
    ops.push({
      file: path,
      op: "regex",
      pattern,
      replacement: String(e.replacement ?? ""),
      flags: String(e.flags ?? ""),
    });
  }
  if (!ops.length) return { why: "the pattern matches nothing under that glob" };
  return { held, ops };
}

// [[spec/design_output/apply#bytes-in-bytes-out]]
// [[spec/design_output/level0#a-write-meets-its-mark]]
function readsFiles(box, paths) {
  const held = {};
  for (const path of paths) {
    const at = inTheTree(box.root, path);
    if (!at) {
      held[path] = { exists: false, outside: true };
      continue;
    }
    try {
      const text = String(box.disk.read(join(box.root, at)));
      held[path] = { exists: true, text };
      marksSeen(box, at, text);
    } catch {
      held[path] = { exists: false };
    }
  }
  return held;
}

function inTheTree(root, path) {
  const rel = relativeTo(root, String(path ?? ""))
    .split("\\")
    .join("/");
  if (!rel || rel.startsWith("/") || rel.startsWith("../") || /^[A-Za-z]:/.test(rel))
    return "";
  return rel;
}

function list(disk, folder) {
  try {
    return disk.list(folder).map((one) => one.name);
  } catch {
    return [];
  }
}
