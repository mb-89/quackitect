// see software.md#the-test — COUNT THE ASKS, NOT THE MILLISECONDS.
//
// A warm ask for the trace corpus costs 22 ms, because it stats every file in
// the corpus to decide whether to rebuild. Sixty-four of those is 1,461 ms,
// measured on this tree, against 22 ms for the identical loop inside a
// read-only pass.
//
// THE PRICE WAS ALREADY FIXED AND THE SHAPE WAS NOT. The corpus is memoised
// against a stat stamp, which is why this never showed up in a profile: cheap
// waste stops looking expensive.
//
// THIS IS A RATCHET, AND IT COUNTS SWEEPS RATHER THAN TIME. A warm pull sweeps
// the corpus zero times today. A timing assertion would be flaky and would pass
// again the moment somebody made each sweep slightly cheaper without removing a
// single ask.
//
// WHAT IT DOES NOT PROVE. The fixture binds a patch column, which is five
// states. It cannot show whether the sweep count grows with the state count,
// and that question is open — raid-debt covers it.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { corpusSweeps } from "../engine/trace.ts";
import { checkDocs, freshRoot, gitInit } from "./helpers.ts";

test("a warm pull does not sweep the trace corpus at all", async () => {
  const root = freshRoot();
  gitInit(root, true);
  const session = new Session(root);
  await session.advance();
  await session.advance();
  checkDocs(session);
  await session.advance();
  await session.advance();
  await session.advance();
  session.setAutonomy(1);
  const id = String(session.iterationSeed("prove the hop asks once", "a hop pays for one corpus, not one per state").seeded);
  const sid = id.match(/^(i\d+)-/)?.[1] as string;
  await session.advance("iterations");
  await session.advance(sid);

  // WARM FIRST. A cold pull legitimately sweeps: nothing has been read yet.
  // What is under test is the SECOND one, where nothing on disk has moved.
  await session.pull();
  const before = corpusSweeps();
  await session.pull();

  assert.equal(
    corpusSweeps() - before,
    0,
    "a warm pull re-swept the corpus — something on the pull path asks outside a pass, which is the shape that turns a hop into a second",
  );
});
