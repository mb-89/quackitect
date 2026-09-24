// The layout, driven in node: the emitter's graph goes in, and the nodes and
// edges React Flow draws come out, each carrying the marks the page styles.
// [[spec/design_output/drawing#the-layout-reads-the-graph]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { classOf, labelOf, laidOut } from "../../src/extension/webview/route/layout.js";

const GRAPH = {
  nodes: [
    { id: "a", name: "a", kind: "leaf", at: true, person: true },
    { id: "b", name: "b", kind: "leaf", dotted: true, when: "cloud", returns: 3 },
    { id: "c", name: "c", kind: "phase", skipped: true, why: "a desk box" },
  ],
  edges: [
    { from: "a", to: "b", kind: "pass" },
    { from: "b", to: "a", kind: "fail" },
    { from: "c", to: "a", kind: "holds" },
    { from: "a", to: "gone", kind: "pass" },
  ],
};

test("every node draws once, placed apart, with its marks as classes", () => {
  const flow = laidOut(GRAPH);
  assert.deepEqual(
    flow.nodes.map((one) => [one.id, one.className]),
    [
      ["a", "leaf at person"],
      ["b", "leaf dotted returns"],
      ["c", "phase skipped"],
    ],
  );
  const places = new Set(
    flow.nodes.map((one) => `${one.position.x},${one.position.y}`),
  );
  assert.equal(places.size, flow.nodes.length, "no two nodes share a place");
  assert.equal(flow.nodes[1].data.title, "when cloud");
  assert.equal(flow.nodes[2].data.title, "a desk box");
});

test("an edge wears its kind, a fail edge moves, and an edge to no node draws nothing", () => {
  const flow = laidOut(GRAPH);
  assert.deepEqual(
    flow.edges.map((one) => [one.source, one.target, one.className, one.animated]),
    [
      ["a", "b", "pass", false],
      ["b", "a", "fail", true],
      ["c", "a", "holds", false],
    ],
  );
  assert.equal(new Set(flow.edges.map((one) => one.id)).size, flow.edges.length);
});

test("the label carries the returns, and an empty graph draws nothing", () => {
  assert.equal(labelOf({ id: "x", name: "draft", returns: 2 }), "draft ↺2");
  assert.equal(labelOf({ id: "x" }), "x");
  assert.equal(classOf({}), "leaf");
  assert.deepEqual(laidOut(undefined), { nodes: [], edges: [] });
});
