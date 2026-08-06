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

/** The angle of a placement, which is what "straight outward" is a claim
 *  about. Radius is the ring; only the angle is the layout's decision. */
function angleOf(n: { x: number; y: number }): number {
  return Math.atan2(n.y, n.x);
}

describe("outward means outward", { concurrency: true }, () => {
  test("a lone child sits on its parent's own angle, so the edge points away from the centre", () => {
    const l = layoutTrace([prop("vp-a"), child("sty-1", "story", "vp-a"), child("uc-1", "use-case", "sty-1")]);
    const a = l.nodes.find((n) => n.id === "vp-a");
    const b = l.nodes.find((n) => n.id === "sty-1");
    const c = l.nodes.find((n) => n.id === "uc-1");
    assert.ok(a && b && c, "all three are placed");
    // Not "roughly": with nothing to collide with there is no reason to move.
    assert.ok(Math.abs(angleOf(a) - angleOf(b)) < 1e-9, "the story is directly outside its prop");
    assert.ok(Math.abs(angleOf(b) - angleOf(c)) < 1e-9, "the use case is directly outside its story");
  });

  test("siblings move only far enough to clear each other, and stay centred on the parent", () => {
    const kids = ["sty-1", "sty-2", "sty-3"].map((id) => child(id, "story", "vp-a"));
    const l = layoutTrace([prop("vp-a"), ...kids]);
    const parent = l.nodes.find((n) => n.id === "vp-a");
    assert.ok(parent, "the prop is placed");
    const angles = kids.map((k) => angleOf(l.nodes.find((n) => n.id === k.id) as { x: number; y: number })).sort((p, q) => p - q);
    const spread = (angles[2] ?? 0) - (angles[0] ?? 0);
    assert.ok(spread > 0, "three siblings do not sit on top of each other");
    // The row's midpoint is the parent's ray: the fan is symmetric about it.
    const mid = ((angles[0] ?? 0) + (angles[2] ?? 0)) / 2;
    assert.ok(Math.abs(mid - angleOf(parent)) < 1e-6, "the row is centred on the parent, not on the wedge");
  });
});

describe("a node under two value props is drawn under both", { concurrency: true }, () => {
  const shared = (): TraceNode[] => [
    prop("vp-a"),
    prop("vp-b"),
    child("sty-a", "story", "vp-a"),
    child("sty-b", "story", "vp-b"),
    { id: "uc-both", type: "use-case", statement: "", refines: ["sty-a", "sty-b"] },
  ];

  test("it is placed once per prop, and the data still holds one node", () => {
    const l = layoutTrace(shared());
    const both = l.nodes.filter((n) => n.id === "uc-both");
    assert.equal(both.length, 2, "one card under each prop");
    assert.deepEqual(both.map((n) => n.root).sort(), ["vp-a", "vp-b"], "one placement per wedge it reaches");
    assert.equal(new Set(both.map((n) => n.key)).size, 2, "the two placements are distinguishable");
  });

  test("no edge crosses from one prop's wedge into another's", () => {
    const l = layoutTrace(shared());
    const at = new Map(l.nodes.map((n) => [n.key, n]));
    for (const e of l.edges) {
      if (e.from === "vision") continue;
      const a = at.get(e.from);
      const b = at.get(e.to);
      assert.ok(a && b, `both ends of ${e.from}->${e.to} are placed`);
      assert.equal(a.root, b.root, "an edge stays inside the wedge it was drawn for");
    }
  });

  test("selecting one prop leaves that prop's copy and drops the other", () => {
    const l = layoutTrace(shared(), ["vp-a"]);
    const both = l.nodes.filter((n) => n.id === "uc-both");
    assert.equal(both.length, 1, "only the selected wedge's copy stands");
    assert.equal(both[0]?.root, "vp-a");
  });
});

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

  test("EVERY SECTION TAKES THE ANGLE ITS OWN LOAD NEEDS, so the ring answers to the whole circle", () => {
    // This replaces the old equal-wedge law ("a narrower wedge pushes its
    // ring outward"). Sections are no longer equal, so a narrow one is narrow
    // BECAUSE it holds less — and the ring is sized by what the whole circle
    // carries rather than by its worst wedge repeated.
    const many = (n: number, per: number): TraceNode[] => {
      const out: TraceNode[] = [];
      for (let i = 0; i < n; i++) {
        out.push(prop(`vp-${i}`));
        for (let j = 0; j < per; j++) out.push(child(`s-${i}-${j}`, "story", `vp-${i}`));
      }
      return out;
    };
    const few = layoutTrace(many(2, 20)).rings[1];
    const lots = layoutTrace(many(8, 20)).rings[1];
    assert.ok(lots > few, `eight sections carry more than two, so they ring wider — got ${lots} against ${few}`);

    // And the share is the load: one section holding twice as much takes
    // about twice the turn.
    const lopsided = [prop("vp-big"), prop("vp-small")];
    for (let j = 0; j < 20; j++) lopsided.push(child(`b-${j}`, "story", "vp-big"));
    for (let j = 0; j < 10; j++) lopsided.push(child(`s-${j}`, "story", "vp-small"));
    const l = layoutTrace(lopsided);
    const spanOf = (root: string): number => {
      const angles = l.nodes.filter((n) => n.root === root && n.type === "story").map((n) => Math.atan2(n.y, n.x));
      return Math.max(...angles) - Math.min(...angles);
    };
    const ratio = spanOf("vp-big") / spanOf("vp-small");
    assert.ok(ratio > 1.5, `the heavier section takes the wider turn — ratio ${ratio.toFixed(2)}`);
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
    // One node per level, so every level is live and every ring is earned.
    const all: TraceNode[] = [prop("vp-a")];
    let parent = "vp-a";
    for (const t of TRACE_LEVELS.slice(1)) {
      all.push(child(`n-${t}`, t, parent));
      parent = `n-${t}`;
    }
    assert.equal(layoutTrace(all).rings.length, TRACE_LEVELS.length);
  });

  // AN EMPTY RING IS NOISE (owner, 2026-08-06). A level nothing has reached
  // draws a circle around nothing and pushes the rest inward.
  test("a level with nothing on it draws NO ring, and gets one the moment it does", () => {
    assert.equal(layoutTrace([prop("vp-a")]).rings.length, 1, "props alone, one ring");
    const withStory = [prop("vp-a"), child("s-1", "story", "vp-a")];
    assert.equal(layoutTrace(withStory).rings.length, 2, "a story earns the second");
    assert.equal(
      layoutTrace(withStory).nodes.some((n) => n.type === "use-case"),
      false,
      "and the empty levels beyond it are simply absent",
    );
  });

  // THE SPAN IS WHAT THE ITEMS NEED (owner, 2026-08-06). Spreading them across
  // the whole wedge flung two stories to opposite sides the moment a filter
  // left one prop standing — the drawing changed shape without the data
  // changing.
  test("a filter RE-SPREADS the children rather than leaving them where they were", () => {
    const all = [prop("vp-a"), prop("vp-b"), child("s-1", "story", "vp-a"), child("s-2", "story", "vp-a")];
    const spread = (sel: string[]): number => {
      const l = layoutTrace(all, sel);
      const a = l.nodes.find((n) => n.id === "s-1");
      const b = l.nodes.find((n) => n.id === "s-2");
      assert.ok(a !== undefined && b !== undefined);
      return Math.abs(Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x));
    };
    const alone = spread(["vp-a"]);
    assert.ok(alone < Math.PI / 2, `one prop selected must keep its stories together — got ${alone} radians apart`);
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
    assert.equal(layoutTrace(all).rings.length, 3, "unfiltered, every level THAT HAS A NODE has its ring");
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
