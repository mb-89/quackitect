// THE DSM AND ITS CLUSTERING. The matrix is only worth drawing if the row
// order makes the groups visible, so that is what these check.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { clusterDsm, flowEdges, flowMatrix, orderByCluster } from "../engine/dsm.ts";

test("an edge exists where one function's output is another's input", () => {
  const edges = flowEdges([
    { id: "fn-a", inputs: [], outputs: ["flow-x"] },
    { id: "fn-b", inputs: ["flow-x"], outputs: ["flow-y"] },
    { id: "fn-c", inputs: ["flow-y"], outputs: [] },
    // NOBODY CONSUMES flow-z. That is a hole in the structure, and the DSM
    // simply carries no edge for it — derive-functions is where it is caught.
    { id: "fn-d", inputs: [], outputs: ["flow-z"] },
  ]);
  assert.deepEqual(edges, { "fn-a": ["fn-b"], "fn-b": ["fn-c"] });
});

test("a function does not depend on itself through its own flow", () => {
  const edges = flowEdges([{ id: "fn-loop", inputs: ["flow-x"], outputs: ["flow-x"] }]);
  assert.deepEqual(edges, {});
});

test("two tight groups with one thin link come out as two clusters", () => {
  // Two triangles, joined by a single edge. The grouping is not a judgment
  // call here — any clustering worth the name separates them.
  const elements = ["a1", "a2", "a3", "b1", "b2", "b3"];
  const edges: Record<string, string[]> = {
    a1: ["a2", "a3"],
    a2: ["a1", "a3"],
    a3: ["a1", "a2", "b1"],
    b1: ["b2", "b3"],
    b2: ["b1", "b3"],
    b3: ["b1", "b2"],
  };
  const dsm = clusterDsm(elements, edges);
  assert.equal(dsm.cluster.a1, dsm.cluster.a2);
  assert.equal(dsm.cluster.a2, dsm.cluster.a3);
  assert.equal(dsm.cluster.b1, dsm.cluster.b2);
  assert.equal(dsm.cluster.b2, dsm.cluster.b3);
  assert.notEqual(dsm.cluster.a1, dsm.cluster.b1);
});

test("the order puts each cluster in one contiguous block", () => {
  const elements = ["a1", "a2", "a3", "b1", "b2", "b3"];
  const edges: Record<string, string[]> = {
    a1: ["a2", "a3"],
    a2: ["a1", "a3"],
    a3: ["a1", "a2", "b1"],
    b1: ["b2", "b3"],
    b2: ["b1", "b3"],
    b3: ["b1", "b2"],
  };
  const dsm = clusterDsm(elements, edges);
  // WITHOUT THIS THE PICTURE IS WORTHLESS. Blocks on the diagonal are the
  // whole reason a person can read structure off a matrix.
  const seen: string[] = [];
  for (const id of dsm.order) {
    const c = dsm.cluster[id];
    if (seen[seen.length - 1] !== c) seen.push(c);
  }
  assert.equal(seen.length, new Set(seen).size, `a cluster was split across the order: ${seen.join(" ")}`);
});

test("the same input gives the same picture, every time", () => {
  const elements = ["a", "b", "c", "d", "e", "f", "g"];
  const edges: Record<string, string[]> = { a: ["b"], b: ["c"], c: ["a"], d: ["e"], e: ["f"], f: ["d"], g: [] };
  const first = clusterDsm(elements, edges);
  for (let i = 0; i < 5; i++) {
    const again = clusterDsm(elements, edges);
    // A MATRIX THAT REORDERS ITSELF between two looks is a matrix nobody can
    // work in. Nothing may be somewhere else than where it was left.
    assert.deepEqual(again.order, first.order);
    assert.deepEqual(again.cluster, first.cluster);
  }
});

test("a placement made by hand is never moved by the search", () => {
  const elements = ["a1", "a2", "a3", "b1", "b2", "b3"];
  const edges: Record<string, string[]> = {
    a1: ["a2", "a3"],
    a2: ["a1", "a3"],
    a3: ["a1", "a2"],
    b1: ["b2", "b3"],
    b2: ["b1", "b3"],
    b3: ["b1", "b2"],
  };
  // a1 is pinned into b's group against every bit of evidence in the matrix.
  const dsm = clusterDsm(elements, edges, { a1: "cluster-people-chose-this" });
  assert.equal(dsm.cluster.a1, "cluster-people-chose-this");
  // A SEARCH THAT OVERRIDES A PERSON'S DECISION is a search nobody trusts.
  // The rest still clusters around the pin.
  assert.equal(dsm.cluster.a2, dsm.cluster.a3);
});

test("an element nothing touches is not forced into somebody else's cluster", () => {
  const elements = ["a1", "a2", "lonely"];
  const edges: Record<string, string[]> = { a1: ["a2"], a2: ["a1"] };
  const dsm = clusterDsm(elements, edges);
  assert.notEqual(dsm.cluster.lonely, dsm.cluster.a1);
});

test("unplaced elements sort last, so they read as unplaced", () => {
  const order = orderByCluster(["x", "y", "z"], { x: "", y: "c1", z: "" });
  assert.equal(order[0], "y");
  assert.deepEqual(order.slice(1), ["x", "z"]);
});

test("a cell names the flows behind it, and every flow aggregates into one mark", () => {
  // TWO FLOWS, ONE PAIR. Lindemann's rule is one relation MEANING per matrix,
  // and both of these say the same thing: a passes something to b. They are
  // two instances of one meaning, so they make ONE mark rather than two
  // matrices.
  const m = flowMatrix([
    { id: "fn-a", inputs: [], outputs: ["flow-x", "flow-y"] },
    { id: "fn-b", inputs: ["flow-x", "flow-y"], outputs: [] },
  ]);
  assert.deepEqual(m.edges, { "fn-a": ["fn-b"] });
  assert.deepEqual(m.via["fn-a|fn-b"], ["flow-x", "flow-y"]);
});

test("a flow with one end makes no mark and names nothing", () => {
  const m = flowMatrix([{ id: "fn-a", inputs: [], outputs: ["flow-orphan"] }]);
  assert.deepEqual(m.edges, {});
  assert.deepEqual(m.via, {});
});
