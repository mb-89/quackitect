// The log the console shows, read with no editor. A row is a line of JSON, and
// a line that is no JSON stands as it came.
// [[spec/design_output/extension#the-button-prints-the-log]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { newestIn, rowOf, rowsIn } from "../../src/extension/lib/rows.js";

const LINE = JSON.stringify({
  at: "2026-09-10T16:27:50.479Z",
  level: "warn",
  door: "vale",
  said: "5 line(s) break a rule",
  ms: 373,
});

test("the newest file is the last one the names sort to", () => {
  assert.equal(
    newestIn(["2026-09-10T16-27.jsonl", "2026-09-11T09-02.jsonl", "notes.md"]),
    "2026-09-11T09-02.jsonl",
  );
  assert.equal(newestIn([]), "");
  assert.equal(newestIn(undefined), "");
});

test("a row says the time, the level, the door and the line", () => {
  const said = rowOf(LINE);

  assert.match(said, /16:27:50\.479/);
  assert.match(said, /warn/);
  assert.match(said, /vale/);
  assert.match(said, /5 line\(s\) break a rule/);
  assert.match(said, /ms=373/, "what the row does not name stands under it");
});

test("a line that reads as no JSON comes back as it came", () => {
  assert.equal(rowOf("not json"), "not json");
});

test("a file of lines answers one row each, and an empty line none", () => {
  assert.equal(rowsIn(`${LINE}\n\n${LINE}\n`).length, 2);
  assert.deepEqual(rowsIn(""), []);
  assert.deepEqual(rowsIn(undefined), []);
});
