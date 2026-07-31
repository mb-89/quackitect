// The decision graph renders as a gitGraph. The trunk is the checklist; the
// updates on a point branch off it and do NOT come back, because they are
// the story of that point rather than a detour that returned.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { MARK, decisionsAsGitGraph, decisionsAsMarkdown } from "../engine/gitgraph.ts";
import type { DecisionNode } from "../engine/decisions.ts";

const node = (over: Partial<DecisionNode> & { id: string; at: string }): DecisionNode => ({
  visit: "v1",
  parent: null,
  brief: "a point",
  status: "open",
  ...over,
});

/** THE REGRESSION THAT SHIPPED. `mainBranchName: 'the plan'` rendered a pill
 *  correctly and made every `checkout the plan` a parse error at the second
 *  word. The diagram vanished and the tests still passed, because they only
 *  asserted the string was present. This asserts the SHAPE instead. */
test("every branch name is one token, so checkout can never split it", () => {
  const g = decisionsAsGitGraph(
    [
      node({ id: "d1", at: "2026-07-31T10:00:00Z" }),
      node({ id: "d2", at: "2026-07-31T10:01:00Z", parent: "d1", brief: "worked on it" }),
    ],
    "a trunk name with spaces",
  );
  for (const line of g.split("\n")) {
    const m = /^\s*(branch|checkout)\s+(.*)$/.exec(line);
    if (m === null) continue;
    assert.doesNotMatch(m[2]!, /\s/, `"${line.trim()}" names a branch mermaid cannot parse`);
  }
  assert.match(g, /mainBranchName': 'a-trunk-name-with-spaces'/, "and the pill still reads");
});

test("a point's updates branch off it and never merge back", () => {
  const g = decisionsAsGitGraph([
    node({ id: "d1", at: "2026-07-31T10:00:00Z", brief: "the point", status: "done", closed_at: "2026-07-31T10:09:00Z" }),
    node({ id: "d1.1", at: "2026-07-31T10:01:00Z", parent: "d1", brief: "first move", status: "done" }),
    node({ id: "d1.2", at: "2026-07-31T10:02:00Z", parent: "d1", brief: "what settled it", status: "done" }),
  ]);
  assert.match(g, /branch d1/, "the work leaves the trunk");
  assert.doesNotMatch(g, /merge /, "and never claims to have come home");
  assert.match(g, /checkout the-plan/, "the trunk is resumed for the next point");
});

test("the last update wears the point's mark, and so does the trunk bubble", () => {
  const g = decisionsAsGitGraph([
    node({ id: "d1", at: "2026-07-31T10:00:00Z", brief: "the point", status: "done", closed_at: "2026-07-31T10:09:00Z" }),
    node({ id: "d1.1", at: "2026-07-31T10:01:00Z", parent: "d1", brief: "first move" }),
    node({ id: "d1.2", at: "2026-07-31T10:02:00Z", parent: "d1", brief: "what settled it" }),
  ]);
  assert.ok(g.includes(`commit id: "${MARK.done} the point"`), "the checklist line is ticked");
  assert.ok(g.includes(`commit id: "${MARK.done} what settled it"`), "the last update is ticked too");
  assert.ok(g.includes(`commit id: "${MARK.open} first move"`), "and the ones before it are not");
});

test("a point that did not land is marked, not ticked", () => {
  for (const [status, mark] of Object.entries({ obsolete: "✗", reverted: "↩", deferred: "→" })) {
    const g = decisionsAsGitGraph([
      node({ id: "d1", at: "2026-07-31T10:00:00Z", brief: "dropped", status: status as "obsolete", closed_at: "2026-07-31T10:01:00Z" }),
    ]);
    assert.ok(g.includes(`commit id: "${mark} dropped"`), `${status} carries its own mark`);
    assert.ok(!g.includes(MARK.done!), `${status} is never a tick`);
  }
});

test("nesting below the first level rides the same branch, not a staircase", () => {
  const g = decisionsAsGitGraph([
    node({ id: "d1", at: "2026-07-31T10:00:00Z", brief: "the point" }),
    node({ id: "d1.1", at: "2026-07-31T10:01:00Z", parent: "d1", brief: "under the point" }),
    node({ id: "d1.1.1", at: "2026-07-31T10:02:00Z", parent: "d1.1", brief: "under that" }),
  ]);
  assert.equal((g.match(/branch /g) ?? []).length, 1, "one branch per point, however deep the nesting goes");
  assert.match(g, /under that/, "and the deeper work still shows");
});

test("a quote in a brief cannot break the diagram", () => {
  const g = decisionsAsGitGraph([node({ id: "d1", at: "2026-07-31T10:00:00Z", brief: 'the "obvious" fix' })]);
  const commit = g.split("\n").find((l) => l.includes("obvious")) ?? "";
  assert.equal((commit.match(/"/g) ?? []).length, 2, "exactly the two quotes that delimit the label");
});

test("a long brief is cut at a word, so the column stays narrow", () => {
  const g = decisionsAsGitGraph([
    node({ id: "d1", at: "2026-07-31T10:00:00Z", brief: "a brief long enough that it would push the checklist column far wider than anyone wants to read across" }),
  ]);
  const line = g.split("\n").find((l) => l.includes("a brief long enough")) ?? "";
  assert.match(line, /…"/, "it says it was cut");
  assert.ok(line.length < 80, "and the line stays short: " + line.length);
});

test("an empty graph renders rather than throwing", () => {
  assert.match(decisionsAsGitGraph([]), /gitGraph TB:/);
});

test("the markdown page fences the graph so the preview renders it", () => {
  const md = decisionsAsMarkdown([node({ id: "d1", at: "2026-07-31T10:00:00Z" })], "e26 — decisions");
  assert.match(md, /^# e26 — decisions/);
  assert.match(md, /```mermaid\n%%\{init/, "the fence is what VS Code renders natively");
  assert.match(md, /1 points, 1 still open\./);
});
