// THE BM25 SIBLING'S RANKING HALF (tsp-coupling-rank). Written test-first at
// i15's author-tests, against el-coupling-disposer, which does not exist
// yet. The disposition half (req-bm25-candidates-need-disposition) is
// verified by inspection instead — see tsp-coupling-disposition.
//
// Every case here is RED on purpose: rankCandidateCouplings throws until
// build-steps lands it.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { rankCandidateCouplings } from "../engine/disposition.ts";

function mintFunction(root: string, id: string, statement: string): void {
  const dir = join(root, "project", "spec", "trace", "function");
  mkdirSync(dir, { recursive: true });
  const lines = ["---", `id: ${id}`, 'type: "[[function]]"', `statement: ${statement}`, "---", ""];
  writeFileSync(join(dir, `${id}.md`), lines.join("\n"), "utf8");
}

function fixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "se-coupling-"));
  mintFunction(root, "fn-fixture-serve-a-step", "serve one step of a governed walk");
  mintFunction(root, "fn-fixture-close-a-record", "close a record and leave trunk clean");
  return root;
}

// req-bm25-returns-ranked-candidates
test("a change description returns candidate nodes ranked by relevance score", () => {
  const root = fixtureRoot();
  const candidates = rankCandidateCouplings(root, "change how a step is served during a governed walk");
  assert.ok(candidates.length > 0, "the description lexically matches fn-fixture-serve-a-step");
  for (let i = 1; i < candidates.length; i++) {
    assert.ok(candidates[i - 1].score >= candidates[i].score, "candidates come back sorted, highest relevance first");
  }
});

// req-bm25-below-threshold-returns-empty
test("a change description matching no candidate above the relevance threshold returns an explicit empty result", () => {
  const root = fixtureRoot();
  const candidates = rankCandidateCouplings(root, "repaint the desk's favicon a different colour");
  assert.deepEqual(candidates, [], "nothing in the fixture corpus plausibly couples to this change");
});
