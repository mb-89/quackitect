// The branch return at a waiting busbar — realizes tsp-walk-branch-return
// (req-walk-branches-at-waypoint). The wrap detector is the pure half: a
// route that leaves the machine both ends stand in is the loop-the-machine
// line the owner rejected, and the walk prefers the drawn return. The
// walking half shows in the record itself: the fan's next leg arrives
// without an escape.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { type RouteStep, routeWraps } from "../engine/route.ts";

const step = (from: string, to: string): RouteStep => ({
  from,
  to,
  tick: { from, to: to.split("/").pop() ?? to },
  priority: 0.2,
  demands: {},
  // The wrap detector reads only from and to, so the drawing cost is
  // irrelevant here and is fixed rather than measured.
  ms: 0,
});

describe("the wrap detector", { concurrency: true }, () => {
  test("a route from one fan leg to its sibling through the record's end wraps", () => {
    const steps = [
      step("it/i2/build/b2", "it/i2/build/end"),
      step("it/i2/build/end", "it/i2/trace"),
      step("it/i2/shipped", "it/end"),
      step("it/end", "front_desk"),
      step("front_desk", "it/start"),
      step("it/start", "it/i2/build/b1"),
      step("it/i2/build/b1", "it/i2/build/b3"),
    ];
    assert.equal(routeWraps("it/i2/build/b2", "it/i2/build/b3", steps), true);
  });

  test("a forward route inside the shared machine never wraps", () => {
    const steps = [step("it/i2/gate", "it/i2/tests"), step("it/i2/tests", "it/i2/specify")];
    assert.equal(routeWraps("it/i2/gate", "it/i2/specify", steps), false);
  });

  test("a cross-machine route through the desk is not a wrap — there is no shared machine to stay inside", () => {
    const steps = [step("front_desk", "it/start")];
    assert.equal(routeWraps("front_desk", "it/start/x", steps), false);
  });
});
