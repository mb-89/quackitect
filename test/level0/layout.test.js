// The layout, driven in node: the emitter's graph goes in, and the nodes and
// edges React Flow draws come out, each carrying the marks the page styles.
// [[spec/design_output/drawing#the-layout-reads-the-graph]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";
import {
  classOf,
  HEIGHT,
  labelOf,
  laidOut,
  WIDTH,
} from "../../src/extension/webview/route/layout.js";

const LAYOUT = join(import.meta.dirname, "..", "..", "src", "extension", "webview", "route", "layout.js");

// A placer standing in for dagre: each node one step further down and right, in the graph's order. [[spec/design_output/drawing#the-layout-reads-the-graph]]
const STEP = 100;
const grid = (nodes) => new Map(nodes.map((one, at) => [one.id, { x: at * STEP, y: at * STEP }]));

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
  const flow = laidOut(GRAPH, grid);
  assert.deepEqual(
    flow.nodes.map((one) => [one.id, one.className]),
    [
      ["a", "leaf at person"],
      ["b", "leaf dotted returns"],
      ["c", "phase skipped"],
    ],
  );
  assert.deepEqual(
    flow.nodes.map((one) => one.position),
    [0, 1, 2].map((at) => ({ x: at * STEP - WIDTH / 2, y: at * STEP - HEIGHT / 2 })),
    "each node stands at the centre its placer answers, less half its box",
  );
  assert.equal(flow.nodes[1].data.title, "when cloud");
  assert.equal(flow.nodes[2].data.title, "a desk box");
});

test("an edge wears its kind, a fail edge moves, and an edge to no node draws nothing", () => {
  const flow = laidOut(GRAPH, grid);
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
  assert.equal(classOf({ kind: "leaf", reached: true }), "leaf reached");
  assert.deepEqual(laidOut(undefined, grid), { nodes: [], edges: [] });
});

// A box installs no Node modules, so the layout a node test drives imports none; dagre rides in the placer the bundle carries. [[spec/design_output/drawing#the-layout-reads-the-graph]]
test("the layout imports no package, and the placer hands it every node and the edges that reach one", () => {
  const imports = String(disk().read(LAYOUT)).match(/^import .* from "([^"]+)";$/gm) ?? [];
  assert.deepEqual(imports.filter((one) => !/from "\.\.?\//.test(one)), []);
  let seen;
  laidOut(GRAPH, (nodes, edges) => {
    seen = { nodes: nodes.map((one) => one.id), edges: edges.map((one) => one.to) };
    return grid(nodes);
  });
  assert.deepEqual(seen, { nodes: ["a", "b", "c"], edges: ["b", "a", "a"] });
});
