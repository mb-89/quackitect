// The index client, driven with no door standing.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import test from "node:test";
import { asked, readsAnswer, said } from "../../.claude/skills/level0/lib/index.js";

test("a search becomes a question the door answers", () => {
  const ask = asked({
    tool: "Grep",
    pattern: "standingLayer",
    glob: "*.js",
    "-i": true,
    "-C": 2,
  });
  assert.equal(ask.method, "grep");
  assert.equal(ask.params.pattern, "standingLayer");
  assert.equal(ask.params.insensitive, true);
  assert.equal(ask.params.before, 2);
  assert.equal(ask.params.after, 2);
});

test("a shape the rows hold no answer for goes back to the tool", () => {
  assert.equal(asked({ tool: "Grep", pattern: "one", multiline: true }), null);
  assert.equal(asked({ tool: "Grep", pattern: "one", type: "js" }), null);
  assert.equal(asked({ tool: "Grep", pattern: "" }), null);
  assert.equal(asked({ tool: "Read", file_path: "one.js" }), null);
});

test("a file question carries its pattern", () => {
  const ask = asked({ tool: "Glob", pattern: "src/**/*.js" });
  assert.equal(ask.method, "glob");
  assert.equal(ask.params.pattern, "src/**/*.js");
});

const ANSWER = {
  files: [
    {
      path: "src/one.js",
      count: 1,
      lines: [
        { line: 3, text: "const said = 1;", match: true },
        { line: 4, text: "const other = 2;", match: false },
      ],
    },
  ],
  total: 1,
};

test("the answer reads as the tool prints it", () => {
  const content = said({ tool: "Grep", output_mode: "content" }, ANSWER);
  assert.equal(content.split("\n")[0], "src/one.js:3:const said = 1;");
  assert.equal(content.split("\n")[1], "src/one.js-4-const other = 2;");

  const counted = said({ tool: "Grep", output_mode: "count" }, ANSWER);
  assert.equal(counted, "src/one.js:1");

  const named = said({ tool: "Grep" }, ANSWER);
  assert.match(named, /^src\/one\.js\nFound 1 file\(s\)$/);
});

test("an empty answer says so", () => {
  assert.equal(said({ tool: "Grep" }, { files: [] }), "No matches found");
  assert.equal(said({ tool: "Glob" }, { paths: [] }), "No files found");
});

test("the limit shows in the answer", () => {
  const cut = said({ tool: "Glob" }, { paths: ["one.js"], cut: true });
  assert.match(cut, /stops at the limit/);
});

test("the door saying something other than JSON answers nothing", () => {
  assert.equal(readsAnswer("the index door does not answer"), null);
  assert.deepEqual(readsAnswer('{"paths":[]}'), { paths: [] });
});
