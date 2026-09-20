// The grace door over a fake box: the ask rides the calls it lets pass, a
// spent grace refuses the next call, the calls ending a turn pass, and a
// reaction clears it.
// [[spec/design_output/stop#the-grace]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { holdsGrace, reacted, wants } from "../../src/bridge/grace.js";

function box() {
  const said = [];
  return { said, box: { log: { say: (...row) => said.push(row) } } };
}

const ASK = {
  id: "refactor",
  why: "Twelve warnings stand.",
  react: "end this turn with a stop line",
  calls: 2,
};

// [[spec/design_output/stop#the-grace]]
test("the ask rides the calls it lets pass, and a spent grace refuses the next", () => {
  const it = box();
  assert.equal(wants(it.box, ASK), true);
  assert.equal(
    wants(it.box, { ...ASK, id: "plan" }),
    false,
    "one ask stands at a time",
  );
  const first = holdsGrace({ tool: "Read" }, it.box);
  assert.match(first.after.context[0], /Twelve warnings stand\. 1 more call/);
  const second = holdsGrace({ tool: "Read" }, it.box);
  assert.match(second.after.context[0], /the last call that passes/);
  const third = holdsGrace({ tool: "Read" }, it.box);
  assert.match(
    third.result.deny,
    /The grace is spent, so this call is refused\. End this turn/,
  );
  // The call the ask names passes a spent grace, because a refused answer locks the box. [[spec/design_output/stop#the-grace]]
  const answering = box();
  wants(answering.box, { ...ASK, calls: 0, tool: "mcp__level0__plan" });
  assert.equal(holdsGrace({ tool: "mcp__level0__plan" }, answering.box), null);
  assert.ok(holdsGrace({ tool: "Read" }, answering.box).result.deny);
  assert.equal(
    it.said.filter((row) => row[1] === "grace").length,
    2,
    "the ask and the refusal each write a line",
  );
});

// [[spec/design_output/stop#the-grace]]
test("the calls ending a turn pass a spent grace, a helper passes, and a reaction clears it", () => {
  const it = box();
  wants(it.box, { ...ASK, calls: 0 });
  assert.equal(
    holdsGrace({ tool: "mcp__level0__stop" }, it.box, new Set(["mcp__level0__stop"])),
    null,
  );
  assert.equal(holdsGrace({ tool: "Read", agentId: "a1" }, it.box), null);
  assert.ok(holdsGrace({ tool: "Read" }, it.box).result.deny);
  assert.equal(reacted(it.box, "plan"), false, "another ask's reaction clears nothing");
  assert.equal(reacted(it.box, "refactor"), true);
  assert.equal(holdsGrace({ tool: "Read" }, it.box), null, "the calls pass again");
  assert.equal(reacted(it.box, "refactor"), false, "nothing stands to clear");
});
