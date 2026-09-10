// The path a rule reads. The client hands the door an absolute path, and every
// rule scopes on the path the repo root holds.
// [[spec/design_output/level0#the-path-a-rule-reads]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { matches, relativeTo } from "../../.claude/skills/level0/lib/paths.js";

const ROOT = "C:/Users/mb/Desktop/ai/quackitect-v5";

test("a path under the root reads as the root holds it", () => {
  assert.equal(
    relativeTo(ROOT, "C:/Users/mb/Desktop/ai/quackitect-v5/spec/rationales/a.md"),
    "spec/rationales/a.md",
  );
});

test("a windows separator answers the one vale reads", () => {
  assert.equal(
    relativeTo(ROOT, "C:\\Users\\mb\\Desktop\\ai\\quackitect-v5\\spec\\guidance\\a.md"),
    "spec/guidance/a.md",
  );
});

test("a drive letter in either case names the same root", () => {
  assert.equal(
    relativeTo("c:/users/mb/desktop/ai/quackitect-v5", `${ROOT}/src/scripts/cli.js`),
    "src/scripts/cli.js",
  );
});

test("a path the root misses comes back whole", () => {
  assert.equal(relativeTo(ROOT, "D:/elsewhere/a.md"), "D:/elsewhere/a.md");
  assert.equal(relativeTo("", "spec/guidance/a.md"), "spec/guidance/a.md");
  assert.equal(relativeTo(ROOT, "spec/guidance/a.md"), "spec/guidance/a.md");
});

test("a root carrying a trailing slash reads the same", () => {
  assert.equal(relativeTo(`${ROOT}/`, `${ROOT}/README.md`), "README.md");
});

test("a glob reads one folder deep, and a double star reads past it", () => {
  assert.equal(matches("spec/rationales/*.md", "spec/rationales/a.md"), true);
  assert.equal(matches("spec/rationales/*.md", "spec/rationales/deep/a.md"), false);
  assert.equal(matches("spec/rationales/**", "spec/rationales/deep/a.md"), true);
  assert.equal(matches("spec/rationales/*.md", "spec/guidance/a.md"), false);
  assert.equal(matches("*answer.md", "level0-answer.md"), true);
});
