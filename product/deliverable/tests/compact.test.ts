// THE CANVAS COMPACTOR IS MECHANICAL (owner ruling 2026-07-28). No model
// decides a layout, so every step here is pinned: what counts as a cluster,
// what the squeeze removes, where the pull stops, and that the same canvas
// always gives the same coordinates.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { clustersOf, compactCanvas, DEFAULT_GAP, type CanvasDoc } from "../engine/compact.ts";

const box = (id: string, x: number, y: number, w = 100, h = 100) => ({ id, type: "file", x, y, width: w, height: h });

// STEP 1. A group owns what is drawn inside it. Everything else travels with
// what it is drawn to. What is drawn to nothing stands alone.
test("clustering: a group is a cluster, arrows bind the rest, loners stand alone", () => {
  const doc: CanvasDoc = {
    nodes: [
      { id: "g", type: "group", x: 0, y: 0, width: 400, height: 400 },
      box("inside-a", 20, 20),
      box("inside-b", 20, 200),
      box("free-a", 1000, 0),
      box("free-b", 1000, 200),
      box("lonely", 2000, 0),
    ],
    // The arrow LEAVING the group must not drag the group's contents out.
    edges: [
      { fromNode: "free-a", toNode: "free-b" },
      { fromNode: "inside-a", toNode: "free-a" },
    ],
  };
  const got = clustersOf(doc).map((c) => c.members.sort());
  assert.deepEqual(got, [["free-a", "free-b"], ["g", "inside-a", "inside-b"], ["lonely"]]);
});

// STEP 2. The empty band between two boxes collapses to one gap. Order is
// untouched, because each box keeps whatever space really sat before it.
test("squeeze: an empty band collapses to one gap, and nothing reorders", () => {
  const doc: CanvasDoc = {
    nodes: [box("a", 0, 0), box("b", 0, 500), box("c", 0, 700)],
    edges: [{ fromNode: "a", toNode: "b" }, { fromNode: "b", toNode: "c" }],
  };
  const r = compactCanvas(doc);
  const y = (id: string) => r.nodes.find((n) => n.id === id)!.y;
  assert.equal(y("a"), 0, "the first box anchors the sweep");
  assert.equal(y("b"), 100 + DEFAULT_GAP, "400 of empty space came out, one gap stayed");
  assert.equal(y("c"), y("b") + 100 + DEFAULT_GAP, "and the gap after it is the same gap");
  assert.ok(y("a") < y("b") && y("b") < y("c"), "the order they were drawn in survives");
  assert.equal(r.after.height, 460);
  assert.equal(r.before.height, 800);
});

// STEP 3. A cluster travels toward the centre and stops one gap short of the
// next one. It TRANSLATES: the distance between its own members never moves.
test("pull: clusters close on the centre and stop exactly one gap apart", () => {
  const doc: CanvasDoc = {
    nodes: [box("a1", 0, 0), box("a2", 0, 200), box("b1", 1000, 0)],
    edges: [{ fromNode: "a1", toNode: "a2" }],
  };
  const r = compactCanvas(doc);
  const n = (id: string) => r.nodes.find((x) => x.id === id)!;
  assert.equal(n("a2").y - n("a1").y, 180, "inside a cluster, the squeeze applies but the shape holds");
  const aRight = n("a1").x + n("a1").width;
  assert.equal(n("b1").x - aRight, DEFAULT_GAP, "the clusters end one gap apart, never overlapping");
  assert.ok(r.after.width < r.before.width, "the drawing got narrower");
});

// A group is excluded from band detection, or its own box would hide every
// empty band inside it. It re-wraps its members with the padding it was drawn
// with, so the frame the owner drew keeps its proportions.
test("a group re-wraps its members and keeps its drawn padding", () => {
  const doc: CanvasDoc = {
    nodes: [
      { id: "g", type: "group", x: -20, y: -20, width: 640, height: 640 },
      box("m1", 0, 0),
      box("m2", 0, 500),
    ],
    edges: [],
  };
  const r = compactCanvas(doc);
  const g = r.nodes.find((n) => n.id === "g")!;
  const m1 = r.nodes.find((n) => n.id === "m1")!;
  const m2 = r.nodes.find((n) => n.id === "m2")!;
  assert.equal(m2.y - m1.y, 180, "the empty band inside the group came out");
  assert.equal(m1.x - g.x, 20, "the left padding is the one it was drawn with");
  assert.equal(m1.y - g.y, 20, "and so is the top padding");
  assert.equal(g.height, m2.y + m2.height - g.y + 20, "the frame wraps what is actually in it");
});

// SAME CANVAS IN, SAME COORDINATES OUT. This is the whole reason the rule is
// an algorithm and not a judgment call.
test("the compactor is deterministic, and settles after one pass", () => {
  const doc: CanvasDoc = {
    nodes: [box("z", 900, 900), box("a", 0, 0), box("m", 400, 0)],
    edges: [{ fromNode: "a", toNode: "m" }],
  };
  const once = compactCanvas(doc);
  const again = compactCanvas(doc);
  assert.deepEqual(again.nodes, once.nodes, "two runs on the same input agree exactly");
  const settled = compactCanvas({ nodes: once.nodes, edges: doc.edges });
  assert.deepEqual(settled.nodes, once.nodes, "and running it on its own output changes nothing");
});

// The real drawing must survive it: never bigger, and every node still there.
test("main.canvas compacts without growing or losing a node", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = readFileSync(join(here, "..", "machines", "main.canvas"), "utf8");
  const doc = JSON.parse(raw) as CanvasDoc;
  const r = compactCanvas(doc);
  assert.equal(r.nodes.length, (doc.nodes ?? []).length, "no node is dropped");
  assert.ok(r.after.width <= r.before.width, "the drawing never gets wider");
  assert.ok(r.after.height <= r.before.height, "and never gets taller");
});
