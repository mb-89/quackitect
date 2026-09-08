// A name holds five words, and this counts them.

import assert from "node:assert/strict";
import { test } from "node:test";
import { overLong, wordsIn, WORDS } from "../../.claude/skills/level0/lib/names.js";

test("a name counts its words, and an extension counts none", () => {
  assert.equal(wordsIn("the-tooth-and-the-log"), 5);
  assert.equal(wordsIn("level0.md"), 1);
  assert.equal(wordsIn("an_agent_reads_what_comes_back.md"), 6);
  assert.equal(wordsIn(""), 0);
});

test("a path answers the segment that runs long, and nothing where none does", () => {
  assert.equal(overLong("spec/design_output/level0.md"), "");
  assert.equal(overLong("work/the-tooth-and-the-log"), "");
  assert.equal(
    overLong("spec/funnel/an-agent-reads-what-comes-back.md"),
    "an-agent-reads-what-comes-back.md",
  );
  assert.equal(overLong("a-name-that-runs-past-the-cap/x.js"), "a-name-that-runs-past-the-cap");
});

test("the cap is the one the rules name", () => {
  assert.equal(WORDS, 5);
  assert.equal(overLong("one-two-three-four-five-six", 6), "");
});
