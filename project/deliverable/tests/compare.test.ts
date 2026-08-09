// THE BINARY-COMPARISON WALK. The first case is the owner's own: four items,
// three questions, because every answer extended the chain.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { type Judgment, walk } from "../engine/compare.ts";

/** Answer the walk until it stops asking, using an oracle. Returns the order
 *  and how many questions it actually cost. */
function run(items: string[], truth: string[], kind: "order" | "equivalence" = "order"): { order: string[]; asked: number } {
  const js: Judgment[] = [];
  // The guard is a runaway backstop, not a bound on the method. A fully wrong
  // hint over 100 items costs about 620, so it sits well above that.
  for (let guard = 0; guard < 5000; guard++) {
    const r = walk(items, js, kind);
    if (r.ask === null) return { order: r.order ?? [], asked: js.length };
    const ia = truth.indexOf(r.ask.a);
    const ib = truth.indexOf(r.ask.b);
    js.push({ a: r.ask.a, b: r.ask.b, verdict: ia < ib ? ">" : "<" });
  }
  throw new Error("the walk never stopped asking");
}

test("four items in hint order cost three questions, and every answer extends the chain", () => {
  const items = ["one", "two", "three", "four"];
  const r = run(items, items);
  assert.deepEqual(r.order, items);
  // THE OWNER'S EXAMPLE, pinned. n-1 is the best case and the hint order is
  // what reaches it: every probe against the current bottom is confirmed.
  assert.equal(r.asked, 3);
});

test("a wrong hint costs a search for that item alone, never a re-rank", () => {
  // The hint says a,b,c,d. The truth puts d second, so exactly one probe
  // misses and only d pays for a binary search.
  const items = ["a", "b", "c", "d"];
  const r = run(items, ["a", "d", "b", "c"]);
  assert.deepEqual(r.order, ["a", "d", "b", "c"]);
  assert.ok(r.asked > 3, "a miss costs more than the best case");
  assert.ok(r.asked <= 6, `and far less than all 6 pairs — got ${r.asked}`);
});

test("transitivity settles pairs nobody is asked about", () => {
  const items = ["p", "q", "r"];
  const js: Judgment[] = [
    { a: "p", b: "q", verdict: ">" },
    { a: "q", b: "r", verdict: ">" },
  ];
  const r = walk(items, js);
  // p against r was never put to anybody, and the order is still settled.
  assert.equal(r.ask, null);
  assert.deepEqual(r.order, ["p", "q", "r"]);
});

test("two answers pointing AT one item settle nothing between them", () => {
  // 1 beats 2, then 3 beats 2. Both point at 2 rather than through it, so
  // 1 against 3 is still unknown — the counter-example to n-1 as a promise.
  const items = ["one", "two", "three"];
  const js: Judgment[] = [
    { a: "one", b: "two", verdict: ">" },
    { a: "three", b: "two", verdict: ">" },
  ];
  const r = walk(items, js);
  assert.ok(r.ask !== null, "the walk still owes a question");
  const pair = [r.ask?.a, r.ask?.b].sort();
  assert.deepEqual(pair, ["one", "three"]);
});

test("equal items collapse to one axis, and the group keeps a stable name", () => {
  const items = ["a", "b", "c"];
  const js: Judgment[] = [
    { a: "a", b: "b", verdict: "=" },
    { a: "a", b: "c", verdict: ">" },
  ];
  const r = walk(items, js);
  // a and b are one node, so c needs no separate answer against b.
  assert.equal(r.ask, null);
  assert.deepEqual(r.order, ["a", "c"]);
});

test("a cycle among ASKED pairs is named, and inference cannot hide one", () => {
  const items = ["x", "y", "z"];
  const js: Judgment[] = [
    { a: "x", b: "y", verdict: ">" },
    { a: "y", b: "z", verdict: ">" },
    { a: "z", b: "x", verdict: ">" },
  ];
  const r = walk(items, js);
  assert.equal(r.cycles.length, 1);
  assert.deepEqual(r.cycles[0], ["x", "y", "z"]);
});

// THE COUNT IS HOW MANY THERE ARE AND HOW MANY ARE DONE (owner ruling
// 2026-08-08). It replaced an ESTIMATE of questions still to ask, which could
// rise without bound: ninety criteria once reported about five thousand
// outstanding, more than the entire cross product, and it read as the sort
// having failed.
//
// The test that stood here asserted the estimate was allowed to rise. It
// encoded the defect as a property, which is why nothing ever caught it.
test("the count is done out of total, and neither can run away", () => {
  const items = ["a", "b", "c", "d", "e", "f"];
  const first = walk(items, []);
  assert.equal(first.total, items.length, "the total is what there is to place");
  assert.equal(first.done, 1, "the first item is placed for free; nothing else is");
  assert.ok(first.ask !== null);

  // Whatever the answers say, done never passes total and never goes above
  // the item count. An estimate had no such ceiling.
  for (const js of [[{ a: "a", b: "b", verdict: ">" as const }], [{ a: "a", b: "b", verdict: "<" as const }]]) {
    const r = walk(items, js);
    assert.ok(r.done <= r.total, `done ${r.done} of ${r.total}`);
    assert.ok(r.total <= items.length, `total ${r.total} cannot exceed the items`);
  }
});

// EQUAL ITEMS COLLAPSE, so the total falls as the answers merge them. It is
// the one thing that moves it, and it moves DOWN.
test("an equality shrinks the total rather than the done count", () => {
  const items = ["a", "b", "c"];
  const apart = walk(items, []);
  const merged = walk(items, [{ a: "a", b: "b", verdict: "=" }]);
  assert.equal(apart.total, 3);
  assert.equal(merged.total, 2, "a and b are one thing now, so there are two to order");
});

// A FINISHED WALK READS AS FINISHED. done equals total, and there is no ask.
test("a settled order is done out of done", () => {
  const r = walk(
    ["a", "b", "c"],
    [
      { a: "a", b: "b", verdict: ">" },
      { a: "b", b: "c", verdict: ">" },
    ],
  );
  assert.equal(r.ask, null, "transitivity settles a against c without asking");
  assert.equal(r.done, 3);
  assert.equal(r.total, 3);
});

test("the walk is a pure function of items and judgments, so it resumes", () => {
  const items = ["a", "b", "c", "d", "e"];
  const truth = ["c", "a", "e", "b", "d"];
  const straight = run(items, truth);

  // Stop halfway, throw the walk away, rebuild it from the recorded answers
  // alone. NOTHING STORES A POSITION, so the second half cannot know it is a
  // second half — and the order has to come out identical.
  const half: Judgment[] = [];
  for (let i = 0; i < 3; i++) {
    const r = walk(items, half);
    if (r.ask === null) break;
    const ia = truth.indexOf(r.ask.a);
    const ib = truth.indexOf(r.ask.b);
    half.push({ a: r.ask.a, b: r.ask.b, verdict: ia < ib ? ">" : "<" });
  }
  for (let guard = 0; guard < 500; guard++) {
    const r = walk(items, half);
    if (r.ask === null) {
      assert.deepEqual(r.order, straight.order);
      assert.deepEqual(r.order, truth);
      return;
    }
    const ia = truth.indexOf(r.ask.a);
    const ib = truth.indexOf(r.ask.b);
    half.push({ a: r.ask.a, b: r.ask.b, verdict: ia < ib ? ">" : "<" });
  }
  throw new Error("the resumed walk never stopped asking");
});

test("an equivalence walk asks only unsettled pairs, and negatives do not propagate", () => {
  const items = ["a", "b", "c"];
  // a and b are the same thing. c is not the same as a.
  const js: Judgment[] = [
    { a: "a", b: "b", verdict: "=" },
    { a: "a", b: "c", verdict: ">" },
  ];
  const r = walk(items, js, "equivalence");
  // b against c is still owed: "c is not a" says nothing about b, even
  // though a and b are one group. Only POSITIVES propagate.
  assert.ok(r.ask !== null, "the walk still owes b against c");
  assert.deepEqual([r.ask?.a, r.ask?.b].sort(), ["b", "c"]);
});

test("a hundred items in hint order cost ninety-nine questions", () => {
  const items = Array.from({ length: 100 }, (_, i) => `i${String(i).padStart(3, "0")}`);
  const r = run(items, items);
  // THE POINT OF THE HINT, in one number. All pairs would be 4,950.
  assert.equal(r.asked, 99);
  assert.deepEqual(r.order, items);
});

test("a hundred items in reverse order still land far under all-pairs", () => {
  const items = Array.from({ length: 100 }, (_, i) => `i${String(i).padStart(3, "0")}`);
  const r = run(items, [...items].reverse());
  assert.deepEqual(r.order, [...items].reverse());
  // Every probe misses, which is the worst the hint can do. Even then the
  // binary search keeps it near n log n rather than n squared.
  assert.ok(r.asked < 900, `a fully wrong hint still costs far under 4,950 — got ${r.asked}`);
});
