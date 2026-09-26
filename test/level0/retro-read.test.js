// The retro's reader verb, driven through fake doors: every owner prompt,
// fault and command of a chapter, each with its file and line.
// [[spec/tickets/the-retro-finishes-its-asks]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { rowsOf } from "../../src/engine/retro/read.js";
import { FAULT } from "../../src/engine/retro/timeline.js";
import { retro } from "../../src/scripts/retro.js";

const ROOT = "/tree";
const RETRO = "retro-a1b2c3";
const at = (path) => join(ROOT, ".se", ".retro", RETRO, ...path.split("/"));
const WHEN = "2026-09-19T08:10:00.000Z";

const said = (type, content, more = {}) =>
  JSON.stringify({ type, timestamp: WHEN, message: { role: type, content }, ...more });

const FILES = {
  [at("input/transcripts/one/a.jsonl")]: [
    said("user", "fix the land verb"),
    said("assistant", [
      { type: "tool_use", name: "Bash", input: { command: "./RUNME.sh check" } },
    ]),
    said("user", [
      { type: "tool_result", is_error: true, content: "the check answers red" },
    ]),
    said("assistant", [{ type: "text", text: "a reply" }]),
    said("user", [{ type: "text", text: "a prompt past the chapter" }]),
  ].join("\n"),
  [at("input/transcripts/one/a/subagents/b.jsonl")]: said("user", "a helper's prompt"),
  [at("input/log/session.jsonl")]: [
    JSON.stringify({ at: WHEN, level: "info", msg: "a quiet line" }),
    JSON.stringify({ at: WHEN, level: "error", msg: "the door refuses" }),
  ].join("\n"),
  [at("chapters/c1.json")]: JSON.stringify({
    id: "c1",
    lines: {
      "transcripts/one/a.jsonl": [[1, 4]],
      "transcripts/one/a/subagents/b.jsonl": [[1, 1]],
      "log/session.jsonl": [[1, 2]],
    },
  }),
};

function heard(run) {
  const rows = [];
  const log = console.log;
  const error = console.error;
  console.log = (...one) => rows.push(one.join(" "));
  console.error = (...one) => rows.push(one.join(" "));
  try {
    return { code: run(), said: rows.join("\n") };
  } finally {
    console.log = log;
    console.error = error;
  }
}

const doors = () => ({ disk: fakeDisk(FILES), join });

// [[spec/tickets/the-retro-finishes-its-asks]]
test("retro read prints every owner prompt, fault and command of the chapter with its file and line", () => {
  const { code, said: out } = heard(() => retro(ROOT, ["read", RETRO, "c1"], doors()));

  assert.equal(code, 0, out);
  const rows = out.split("\n");
  assert.ok(rows.includes("transcripts/one/a.jsonl:1  prompt  fix the land verb"), out);
  assert.ok(rows.includes("transcripts/one/a.jsonl:2  command  ./RUNME.sh check"), out);
  assert.ok(rows.includes("transcripts/one/a.jsonl:3  fault  the check answers red"), out);
  assert.ok(rows.includes("log/session.jsonl:2  fault  the door refuses"), out);
  assert.doesNotMatch(out, /a helper's prompt/, "a helper's prompt is no owner's");
  assert.doesNotMatch(out, /a prompt past the chapter/);
  assert.doesNotMatch(out, /a quiet line|a reply/);
});

// [[spec/tickets/the-retro-finishes-its-asks]]
test("retro read refuses a chapter the retro holds nowhere", () => {
  const { code, said: out } = heard(() => retro(ROOT, ["read", RETRO, "c9"], doors()));

  assert.equal(code, 2);
  assert.match(out, /c9/);
  assert.match(out, /retro read/);
});

// The reader marks a fault the way the timeline counts it. [[spec/tickets/the-retro-finishes-its-asks]]
test("a row reads a fault as the timeline counts it, and a line reading as no JSON earns none", () => {
  const warn = JSON.stringify({ at: WHEN, level: "warn", msg: "a slow door" });
  assert.equal(FAULT.test(warn), true);
  assert.deepEqual(rowsOf("log/session.jsonl", warn), [{ kind: "fault", text: "a slow door" }]);
  assert.deepEqual(rowsOf("log/session.jsonl", "not json"), []);
  assert.deepEqual(rowsOf("transcripts/one/a.jsonl", said("user", "   ")), []);
});
