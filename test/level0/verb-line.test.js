// The verb line over a tool list, and a verb's program read as the verb it
// names, so the rules over a verb hold on either road.
// [[spec/design_output/bash#the-description-names-verbs]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { freeOfTicket } from "../../.claude/skills/level0/lib/bash.js";
import { verbLine } from "../../.claude/skills/level0/lib/verb-line.js";

// The index lists each verb as a tool, so the description names the tools and sends the agent there first. [[spec/tickets/agents-call-quack-directly]]
test("the description names the index tools where the index lists them", () => {
  const tools = [
    "index_verb_check",
    "index_branch_done",
    "index_verb_tui",
    "index_verb_doctor",
  ].map((name) => ({ name }));
  const said = verbLine(tools);
  for (const name of ["index_verb_check", "index_branch_<verb>", "index_verb_doctor"]) {
    assert.ok(said.includes(`mcp__level0__${name}`), `the line names ${name}: ${said}`);
  }
  assert.ok(
    !said.includes("index_verb_tui"),
    "a tool holding a terminal stays off the line",
  );
  assert.doesNotMatch(said, /\.\/RUNME\.sh/);
  assert.match(said, /Reach for the tool before the shell\./);
  assert.equal(verbLine([]), verbLine(), "an empty list keeps the verb line");
});

// A verb's program reads as a verb root, so the rules over a verb read it as they read ./RUNME.sh. [[spec/tickets/cli-js-leaves]]
test("a verb program reads as the verb it names", () => {
  assert.equal(freeOfTicket("./RUNME.sh ticket pull"), true);
  assert.equal(freeOfTicket("node src/scripts/verbs/ticket.js pull"), true);
  assert.equal(freeOfTicket("node src/scripts/verbs/ticket.js open"), false);
});
