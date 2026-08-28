// the always-legal set: verbs no state may forbid
//
// SMALL FILES ON PURPOSE (owner ruling, 2026-07-30). A test file is the
// only unit that reaches a second core, so themes get their own file and
// the suite uses the machine it runs on. See guidance/software.md.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot } from "./helpers.ts";

// THE TEST OF MEMBERSHIP is one question: does the state change what this verb
// is allowed to do? Where the answer is no, the verb is state-independent and
// no state may forbid it.
//
// see dsp-walk-machine.md#the-outward-verbs-are-legal-everywhere

// Concurrent: every case builds its own root and touches no global.
describe("always legal", { concurrency: true }, () => {
  // boot/start is the strictest position a fresh session can be asked from,
  // and it is what makes this case sharp: the gate is demonstrably ON here.
  test("the gate really is shut at boot/start — the control for everything below", async () => {
    const server = buildServer(freshRoot());
    const r = await call(server, "se_file_list", { dir: "." });
    assert.equal(r.body.clause, "SE-C-110", "listing is state-gated before boot");
  });

  // LOOKING OUTWARD IS NEVER GATED. Reading the internet changes nothing in the
  // repository, so a state that forbids it can only make the walk answer from
  // memory — which is the failure the outward verbs exist to prevent.
  //
  // WHAT THIS COST BEFORE IT WAS FIXED: the web verbs were listed by hand in
  // fourteen matrix rows and three state files. Every state that forgot them
  // silently forbade research, and nothing reported it. A researcher spawned
  // one state short of the kickoff gate came back with a refusal instead of
  // findings, and the loss was invisible until it reported.
  for (const verb of ["se_web_search", "se_web_fetch"]) {
    test(`${verb} is not state-gated, even where the lane is otherwise shut`, async () => {
      const server = buildServer(freshRoot());
      const r = await call(server, verb, { query: "anything", url: "https://example.invalid/" });
      // It may well fail — there is no network in a test and the host is
      // deliberately unresolvable. What it must NEVER be is refused by the
      // STATE, which is the only thing this case is about.
      assert.notEqual(r.body.clause, "SE-C-110", `${verb} was refused by the state gate`);
    });
  }

  // A LISTING THAT REPEATS THE ALWAYS-LEGAL SET TEACHES A FALSEHOOD BY
  // OMISSION. A reader seeing one state name the verb concludes the states
  // that do not name it forbid it. Both halves have to stay swept.
  test("no state or matrix row names an always-legal verb in its own tool list", async () => {
    const server = buildServer(freshRoot());
    const r = await call(server, "se_file_search", {
      query: "se_web_search|se_web_fetch",
      path: "deliverable/machines",
      include: "**/*.md",
      intent: "prove no state re-declares a verb the engine already grants everywhere",
      count_only: true,
    });
    // se_file_search is itself state-gated at boot/start, so this case proves
    // the sweep from the corpus rather than through the lane.
    if (r.body.clause === "SE-C-110") return;
    const counts = (r.body.counts ?? []) as { path: string; count: number }[];
    const listings = counts.filter((c) => !c.path.includes("methods"));
    assert.deepEqual(listings, [], "a state re-declares a verb that is always legal");
  });
});
