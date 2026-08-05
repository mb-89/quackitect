// THE RADIAL TRACE GRAPH — the geometry rules the owner set on 2026-08-05,
// each one a case. Concurrent: every case builds its own graph in memory and
// touches no global.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { duplicateIds, layoutTrace, refsIn, shortLabel, TRACE_LEVELS, type TraceNode, traceSvg } from "../engine/trace.ts";

function prop(id: string): TraceNode {
  return { id, type: "value-prop", statement: `${id} statement`, refines: [] };
}
function child(id: string, type: string, parent: string): TraceNode {
  return { id, type, statement: "", refines: [parent] };
}

describe("the radial trace graph", { concurrency: true }, () => {
  test("one value prop hangs straight DOWN from the vision", () => {
    const l = layoutTrace([prop("vp-a")]);
    const a = l.nodes.find((n) => n.id === "vp-a");
    assert.ok(a !== undefined);
    assert.equal(Math.round(a.x), 0, "no sideways offset");
    assert.ok(a.y > 0, "below the centre, not above it");
  });

  test("two value props share the circle — one down, one up", () => {
    const l = layoutTrace([prop("vp-a"), prop("vp-b")]);
    const a = l.nodes.find((n) => n.id === "vp-a")!;
    const b = l.nodes.find((n) => n.id === "vp-b")!;
    assert.ok(a.y > 0 && b.y < 0, "opposite halves");
    assert.equal(Math.round(a.y + b.y), 0, "and symmetric about the centre");
  });

  test("no selection is NOT filtered — every prop is shown", () => {
    const all = [prop("vp-a"), prop("vp-b"), prop("vp-c")];
    assert.equal(layoutTrace(all).nodes.length, 3);
    assert.equal(layoutTrace(all, []).nodes.length, 3, "an empty selection means the same");
    assert.equal(layoutTrace(all, ["vp-a"]).nodes.length, 1, "a selection does filter");
  });

  test("a ring radius is GLOBAL, so the level separators stay true circles", () => {
    const all = [prop("vp-a"), prop("vp-b"), child("s-1", "story", "vp-a"), child("s-2", "story", "vp-b")];
    const l = layoutTrace(all);
    const stories = l.nodes.filter((n) => n.type === "story");
    const radius = (n: { x: number; y: number }) => Math.round(Math.hypot(n.x, n.y));
    assert.equal(radius(stories[0]), radius(stories[1]), "same ring in different wedges, same radius");
    assert.equal(radius(stories[0]), Math.round(l.rings[1]), "and it is the declared ring");
  });

  test("a NARROWER wedge pushes its ring outward, because arc is radius times angle", () => {
    const many = (n: number): TraceNode[] => {
      const out: TraceNode[] = [];
      for (let i = 0; i < n; i++) {
        out.push(prop(`vp-${i}`));
        for (let j = 0; j < 6; j++) out.push(child(`s-${i}-${j}`, "story", `vp-${i}`));
      }
      return out;
    };
    const few = layoutTrace(many(2)).rings[1];
    const lots = layoutTrace(many(8)).rings[1];
    assert.ok(lots > few, `eight wedges must ring wider than two — got ${lots} against ${few}`);
  });

  test("the barycentre sweep puts a child near its parent, so lines do not cross", () => {
    // Two parents, and their children declared in the WRONG order on purpose.
    const all = [
      prop("vp-a"),
      child("s-1", "story", "vp-a"),
      child("s-2", "story", "vp-a"),
      child("u-of-2", "use-case", "s-2"),
      child("u-of-1", "use-case", "s-1"),
    ];
    const l = layoutTrace(all);
    const ang = (id: string) => {
      const n = l.nodes.find((x) => x.id === id)!;
      return Math.atan2(n.y, n.x);
    };
    const parentOrder = ang("s-1") < ang("s-2");
    const childOrder = ang("u-of-1") < ang("u-of-2");
    assert.equal(childOrder, parentOrder, "the children follow their parents' order");
  });

  test("adding a LEVEL is one more ring and nothing else", () => {
    assert.equal(layoutTrace([prop("vp-a")]).rings.length, TRACE_LEVELS.length);
  });

  test("the innermost ring CLEARS the vision, whatever angle a wedge points", () => {
    const five = ["a", "b", "c", "d", "e"].map((s) => prop(`vp-${s}`));
    const l = layoutTrace(five);
    assert.ok(l.rings[0] >= 260 * 1.45, `the first ring must clear a 260-wide card — got ${l.rings[0]}`);
    for (const n of l.nodes) {
      assert.ok(Math.hypot(n.x, n.y) >= 260, `${n.id} sits inside the vision's own width`);
    }
  });

  test("a label is NEVER rotated — a radial graph still reads horizontally", () => {
    const svg = traceSvg(layoutTrace([prop("vp-a"), prop("vp-b")]));
    assert.equal(/rotate\(/.test(svg), false, "no rotate() anywhere in the drawing");
    assert.match(svg, /class="trace-ring"/, "the dashed level separators are drawn");
    assert.match(svg, /trace:vision/, "the vision sits at the centre");
  });

  test("a DUPLICATE id is caught — an address that resolves two ways resolves neither", () => {
    const twice = [prop("vp-a"), prop("vp-a"), prop("vp-b")];
    assert.deepEqual(duplicateIds(twice), [{ id: "vp-a", count: 2 }]);
    assert.deepEqual(duplicateIds([prop("vp-a"), prop("vp-b")]), [], "distinct ids are clean");
  });

  test("a REFERENCE list reads bare ids and wiki links alike", () => {
    assert.deepEqual(refsIn("- vp-the-ledger\n- [[vp-vendoring]]"), ["vp-the-ledger", "vp-vendoring"]);
    assert.deepEqual(refsIn("- none"), [], "an empty claim carries no references");
    assert.deepEqual(refsIn("some prose about vp-things"), [], "prose is not a reference list");
  });

  test("a TYPE filter removes rings rather than greying them", () => {
    const all = [prop("vp-a"), child("s-1", "story", "vp-a"), child("u-1", "use-case", "s-1")];
    assert.equal(layoutTrace(all).rings.length, TRACE_LEVELS.length, "unfiltered, every level has its ring");
    const only = layoutTrace(all, [], { types: ["value-prop", "use-case"] });
    assert.equal(only.rings.length, 2, "two types, two rings");
    assert.equal(
      only.nodes.some((n) => n.type === "story"),
      false,
      "the story is gone, not dimmed",
    );
  });

  test("a TEXT match keeps its whole line of descent, and drops everything else", () => {
    const all = [
      prop("vp-a"),
      child("s-1", "story", "vp-a"),
      child("u-target", "use-case", "s-1"),
      prop("vp-b"),
      child("s-2", "story", "vp-b"),
    ];
    const ids = layoutTrace(all, [], { find: "u-target" })
      .nodes.map((n) => n.id)
      .sort();
    assert.deepEqual(ids, ["s-1", "u-target", "vp-a"], "the match and its ancestors, nothing else");
  });

  test("the text filter reads FRONTMATTER, not only the statement", () => {
    const all: TraceNode[] = [
      { id: "vp-a", type: "value-prop", statement: "nothing in here", refines: [], hay: "priority:must audience:stk-x" },
      { id: "vp-b", type: "value-prop", statement: "nor here", refines: [], hay: "priority:could" },
    ];
    assert.deepEqual(
      layoutTrace(all, [], { find: "must" }).nodes.map((n) => n.id),
      ["vp-a"],
    );
    assert.deepEqual(
      layoutTrace(all, [], { find: "priority:could" }).nodes.map((n) => n.id),
      ["vp-b"],
    );
  });

  test("every node is a uniform CARD, never a dot — the whole thing is the click target", () => {
    const svg = traceSvg(layoutTrace([prop("vp-autonomy-range"), prop("vp-systematic-engineering")]));
    const rects = [...svg.matchAll(/<rect [^>]*width="(\d+)" height="(\d+)"/g)];
    assert.equal(rects.length, 3, "two props and the vision, all cards");
    assert.equal(new Set(rects.map((r) => `${r[1]}x${r[2]}`)).size, 1, "and all one size");
    // The rings are circles by right; what must be gone is the node DOT.
    assert.equal(/<circle(?![^>]*trace-ring)/.test(svg), false, "no node dot survives");
    // IT INVENTS NO STYLE: the card is the machine view's state node, class
    // for class, so the host palette reaches it and cannot be black on black.
    assert.match(svg, /class="state"/, "every card wears the machine's state class");
    assert.equal(/class="state active"/.test(svg), false, "and none is ACTIVE — nothing stands in a trace graph");
    assert.match(svg, /class="label"/, "labels use the machine's label class");
  });

  test("a click reaches the EXISTING details panel, through the page's own mechanism", () => {
    const svg = traceSvg(layoutTrace([prop("vp-a")]));
    assert.match(svg, /class="clickable trace-node" data-detail="trace:vp-a"/, "the node is clickable the standard way");
    assert.match(svg, /data-detail="trace:vision"/, "and so is the vision");
  });

  test("a label longer than the card ellipses, and the owner's longest fits whole", () => {
    assert.equal(shortLabel("vp-autonomy-range"), "autonomy-range", "the named yardstick fits");
    assert.match(shortLabel("vp-systematic-engineering"), /…$/, "a longer one is cut");
    assert.equal(shortLabel("vp-vendoring"), "vendoring");
  });

  test("the vision's edges are drawn even though NO node declares them", () => {
    const all = [prop("vp-a"), prop("vp-b")];
    assert.equal(
      all.every((n) => n.refines.length === 0),
      true,
      "nothing in the data points at the vision",
    );
    const l = layoutTrace(all);
    assert.equal(l.edges.filter((e) => e.from === "vision").length, 2, "one implicit edge per prop");
    const svg = traceSvg(l);
    assert.equal((svg.match(/trace-edge implicit/g) ?? []).length, 2, "and both reach the drawing, marked as implicit");
  });
});
