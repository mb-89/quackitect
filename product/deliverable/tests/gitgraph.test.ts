// The decision graph renders as a gitGraph because a fork RETURNS, and a
// tree cannot draw a return. These cases guard that specifically: the merge
// is the thing worth testing, not the commits.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { decisionsAsGitGraph, decisionsAsMarkdown } from "../engine/gitgraph.ts";
import type { DecisionNode } from "../engine/decisions.ts";

const node = (over: Partial<DecisionNode> & { id: string; at: string }): DecisionNode => ({
  visit: "v1",
  parent: null,
  brief: "a point",
  status: "open",
  ...over,
});

test("a detour that comes home draws a branch AND a merge", () => {
  const g = decisionsAsGitGraph([
    node({ id: "d1", at: "2026-07-31T10:00:00Z", brief: "the plan" }),
    node({ id: "d2", at: "2026-07-31T10:01:00Z", parent: "d1", origin: "fork", brief: "a blocking detour", status: "done", closed_at: "2026-07-31T10:02:00Z" }),
    node({ id: "d3", at: "2026-07-31T10:03:00Z", brief: "back on the trunk" }),
  ]);

  assert.match(g, /branch d2/, "the detour leaves the trunk");
  assert.match(g, /merge d2/, "and comes back — this is what a tree cannot say");
  assert.ok(g.indexOf("branch d2") < g.indexOf("merge d2"), "it must leave before it returns");
  assert.ok(g.indexOf("merge d2") < g.lastIndexOf("d3"), "and return before the trunk carries on");
});

test("a detour that never came home is left hanging, not merged", () => {
  const marks = { obsolete: "✗", reverted: "↩", deferred: "→" };
  for (const [status, mark] of Object.entries(marks)) {
    const g = decisionsAsGitGraph([
      node({ id: "d1", at: "2026-07-31T10:00:00Z" }),
      node({ id: "d2", at: "2026-07-31T10:01:00Z", parent: "d1", status: status as "obsolete", closed_at: "2026-07-31T10:02:00Z" }),
    ]);
    assert.match(g, /branch d2/, `${status} still branches`);
    assert.doesNotMatch(g, /merge d2/, `${status} did NOT land, so nothing may claim it did`);
    assert.ok(g.includes(`tag: "${mark}"`), `${status} is marked, and not as a tick`);
  }
});

test("the graph reads top to bottom, with the text beside the dot", () => {
  const g = decisionsAsGitGraph([node({ id: "d1", at: "2026-07-31T10:00:00Z" })]);
  assert.match(g, /gitGraph TB:/, "a checklist runs down the page, not across it");
  assert.match(g, /rotateCommitLabel': false/, "and the label stays horizontal");
});

test("a done point carries a tick, an open one carries nothing", () => {
  const g = decisionsAsGitGraph([
    node({ id: "d1", at: "2026-07-31T10:00:00Z", status: "done", closed_at: "2026-07-31T10:01:00Z" }),
    node({ id: "d2", at: "2026-07-31T10:02:00Z" }),
  ]);
  const lines = g.split("\n");
  assert.ok(lines.find((l) => l.includes("d1"))?.includes('tag: "✓"'), "done is ticked");
  assert.equal(lines.find((l) => l.includes("d2"))?.includes("tag:"), false, "open is found by the absence of a mark");
});

test("a long brief is cut at a word, so the column stays narrow", () => {
  const g = decisionsAsGitGraph([
    node({ id: "d1", at: "2026-07-31T10:00:00Z", brief: "a brief long enough that it would push the checklist column far wider than anyone wants to read across" }),
  ]);
  const line = g.split("\n").find((l) => l.includes("d1")) ?? "";
  assert.match(line, /…"/, "it says it was cut");
  assert.ok(line.length < 80, "and the line stays short: " + line.length);
});

test("a detour inside a detour branches off the detour, not the trunk", () => {
  const g = decisionsAsGitGraph([
    node({ id: "d1", at: "2026-07-31T10:00:00Z" }),
    node({ id: "d2", at: "2026-07-31T10:01:00Z", parent: "d1" }),
    node({ id: "d3", at: "2026-07-31T10:02:00Z", parent: "d2" }),
  ]);
  // d3 must be cut while d2 is the current branch, never from main.
  const lines = g.split("\n").map((l) => l.trim());
  const cut = lines.indexOf("branch d3");
  assert.ok(cut > 0, "d3 branches");
  const before = lines.slice(0, cut).reverse().find((l) => l.startsWith("checkout ") || l.startsWith("branch "));
  assert.equal(before, "branch d2", "d3 is cut from d2, so the nesting survives");
});

test("a quote in a brief cannot break the diagram", () => {
  const g = decisionsAsGitGraph([node({ id: "d1", at: "2026-07-31T10:00:00Z", brief: 'the "obvious" fix' })]);
  const body = g.split("\n").slice(1).join("\n");
  assert.doesNotMatch(body.replace(/id: "|"$/gm, ""), /"/, "no bare quote survives inside the label");
  assert.match(g, /obvious/, "and the words are still there");
});

test("an empty graph renders rather than throwing", () => {
  assert.match(decisionsAsGitGraph([]), /gitGraph/);
});

test("the markdown page fences the graph so the preview renders it", () => {
  const md = decisionsAsMarkdown([node({ id: "d1", at: "2026-07-31T10:00:00Z" })], "e26 — decisions");
  assert.match(md, /^# e26 — decisions/);
  assert.match(md, /```mermaid\n%%\{init/, "the fence is what VS Code renders natively");
  assert.match(md, /gitGraph TB:/, "and the checklist runs down the page");
  assert.match(md, /1 points, 1 still open\./);
});
