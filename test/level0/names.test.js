// A name holds the words the caller allows, and this counts them.
// [[spec/design_output/config#a-caller-hands-it-in]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { overLong, wordsIn } from "../../.claude/skills/level0/lib/names.js";

test("a name counts its words, and an extension counts none", () => {
  assert.equal(wordsIn("the-tooth-and-the-log"), 5);
  assert.equal(wordsIn("level0.md"), 1);
  assert.equal(wordsIn("an_agent_reads_what_comes_back.md"), 6);
  assert.equal(wordsIn(""), 0);
});

test("a path answers the segment that runs long, and nothing where none does", () => {
  assert.equal(overLong("spec/design_output/level0.md", 5), "");
  assert.equal(overLong("work/the-tooth-and-the-log", 5), "");
  assert.equal(
    overLong("spec/funnel/an-agent-reads-what-comes-back.md", 5),
    "an-agent-reads-what-comes-back.md",
  );
  assert.equal(
    overLong("a-name-that-runs-past-the-cap/x.js", 5),
    "a-name-that-runs-past-the-cap",
  );
});

test("the cap is the one the caller hands in", () => {
  assert.equal(overLong("one-two-three-four-five-six", 6), "");
  assert.equal(overLong("one-two-three-four-five-six", 5), "one-two-three-four-five-six");
  assert.equal(overLong("one-two-three-four-five-six"), "", "no cap refuses nothing");
});
