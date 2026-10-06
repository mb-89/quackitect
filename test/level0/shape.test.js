// The pure shapes the bridgehead builds an answer and a row with. [[spec/design_output/level0#the-bridgehead-and-the-server]]

import assert from "node:assert/strict";
import test from "node:test";
import { APPEND, merged } from "../../.claude/skills/level0/hooks/shape.ts";

test("a merge grows a list, puts a text below the one standing, and replaces anything else", () => {
  assert.deepEqual(
    merged(
      { context: ["a"], note: "one", n: 1 },
      { context: ["b"], note: "two", n: 2 },
    ),
    { context: ["a", "b"], note: "one\n\ntwo", n: 2 },
  );
  assert.deepEqual(merged(null, { context: ["b"] }), { context: ["b"] });
});

// The append script runs against a fake require: a disk that appends, and a path that names the folder. [[spec/design_output/log#every-writer-appends]]
function appends(files, made, file, row) {
  const fs = {
    mkdirSync: (dir) => made.push(dir),
    appendFileSync: (at, text) => files.set(at, `${files.get(at) ?? ""}${text}`),
  };
  const path = { dirname: (at) => at.slice(0, at.lastIndexOf("/")) };
  const need = (name) => ({ "node:fs": fs, "node:path": path })[name];
  new Function("require", "process", APPEND)(need, { argv: ["node", file, row] });
}

test("the append adds its row below every row standing, and makes the folder it lands in", () => {
  const files = new Map([["/t/log/s.jsonl", "one\n"]]);
  const made = [];
  appends(files, made, "/t/log/s.jsonl", "two\n");
  assert.equal(files.get("/t/log/s.jsonl"), "one\ntwo\n");
  assert.deepEqual(made, ["/t/log"]);
});
