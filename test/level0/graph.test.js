// The emitter, over a route and a record. A drawing derives from data, so every
// case here hands it YAML and reads the nodes and the edges it answers. One
// case stands per node kind and per edge kind, because a kind nothing asserts
// is a kind nobody draws.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FAIL,
  graphIn,
  graphOf,
  HOLDS,
  LEAF,
  PASS,
  PHASE,
} from "../../src/scripts/graph.js";

const ROUTE = `
steps:
  - name: design
    steps:
      - name: draft
        does: writes the approach
        evidence:
          - name: approach
            form: text
            says: the approach
      - name: review
        does: reads the approach
        on_fail: draft
  - name: reflect
    does: names the class of error
    when: returned
  - name: sign
    does: says yes or no
    by: person
`;

function drawn(text = ROUTE) {
  return graphIn(text);
}

function nodeAt(graph, id) {
  return graph.nodes.find((one) => one.id === id);
}

function edgesOf(graph, kind) {
  return graph.edges.filter((one) => one.kind === kind);
}

test("a phase answers a node of its own", () => {
  assert.equal(nodeAt(drawn(), "design").kind, PHASE);
});

test("a leaf answers a node under its phase", () => {
  const one = nodeAt(drawn(), "design/draft");
  assert.equal(one.kind, LEAF);
  assert.equal(one.parent, "design");
  assert.equal(one.does, "writes the approach");
});

test("a when draws the node dotted, and says which condition", () => {
  const one = nodeAt(drawn(), "reflect");
  assert.equal(one.dotted, true);
  assert.equal(one.when, "returned");
});

test("a person step stands marked", () => {
  assert.equal(nodeAt(drawn(), "sign").person, true);
  assert.equal(nodeAt(drawn(), "reflect").person, undefined);
});

test("the nodes stand declared before the edges", () => {
  const graph = drawn();
  const ids = new Set(graph.nodes.map((one) => one.id));
  for (const edge of graph.edges) {
    assert.ok(ids.has(edge.from), `${edge.from} draws no node`);
    assert.ok(ids.has(edge.to), `${edge.to} draws no node`);
  }
});

test("a phase holds its steps, and the edge says so", () => {
  const held = edgesOf(drawn(), HOLDS);
  assert.deepEqual(
    held.map((one) => `${one.from}->${one.to}`),
    ["design->design/draft", "design->design/review"],
  );
});

test("a pass edge stands between neighbours", () => {
  const pass = edgesOf(drawn(), PASS).map((one) => `${one.from}->${one.to}`);
  assert.ok(pass.includes("design->reflect"));
  assert.ok(pass.includes("design/draft->design/review"));
  assert.ok(!pass.includes("design/review->reflect"));
});

test("a fail edge runs back to the step on_fail names", () => {
  const fail = edgesOf(drawn(), FAIL);
  assert.equal(fail.length, 1);
  assert.equal(fail[0].from, "design/review");
  assert.equal(fail[0].to, "design/draft");
});

test("every edge carries a label", () => {
  for (const edge of drawn().edges)
    assert.ok(edge.label, `${edge.from} carries no label`);
});

test("no node and no edge carries a coordinate", () => {
  const said = JSON.stringify(drawn());
  for (const key of ["x", "y", "row", "column", "colour", "color"]) {
    assert.ok(!said.includes(`"${key}"`), `the graph carries ${key}`);
  }
});

test("a ticket draws its pointer, its skips and its returns", () => {
  const graph = graphOf({
    step: "design/review",
    steps: [
      {
        name: "design",
        steps: [{ name: "draft" }, { name: "review" }],
      },
      { name: "reflect", when: "returned" },
    ],
    record: [
      { step: "design/draft", returns: 2 },
      { step: "reflect", skipped: true, why: "the ticket reaches it by no on_fail" },
    ],
  });
  assert.equal(nodeAt(graph, "design/review").at, true);
  assert.equal(nodeAt(graph, "design/draft").at, undefined);
  assert.equal(nodeAt(graph, "design/draft").returns, 2);
  assert.equal(nodeAt(graph, "reflect").skipped, true);
  assert.equal(nodeAt(graph, "reflect").why, "the ticket reaches it by no on_fail");
});

test("a ticket reads through its frontmatter, and a process through its file", () => {
  const said = graphIn(`---\nkind: [[ticket]]\n${ROUTE.trim()}\n---\n\n# Ask\n`);
  assert.equal(said.nodes.length, drawn().nodes.length);
});

test("a route nobody hands it answers an empty graph", () => {
  assert.deepEqual(graphOf(null), { nodes: [], edges: [] });
});
