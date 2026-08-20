// THE PAINT SAYS WHICH KIND OF GREEN IT IS — req-the-panel-s-paint-says-which-kind-of-green-it-is.
//
// WHAT THIS FILE IS FOR. Three rules decide what a green on the panel MEANS,
// and all three were enforced by scattered cases in three other files. Nobody
// could say which of them were actually covered.
//
// THE THREE, in the owner's own words of 2026-08-11 and the code that carries
// them:
//   - green means SUBMITTED — a claim was stamped by whoever filled it.
//   - green plus the thumb means BLESSED — somebody ruled on it.
//   - a LAW-PROVEN green is neither: no form was signed, a law passed.
//
// TWO ARE MET AND ONE IS NOT. The first two paint differently today. The third
// paints identically to the first, so a check that ran and a claim somebody
// stamped are the same colour — which is the one distinction a reader most
// needs and the one the panel does not draw.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import * as render from "../engine/render.ts";

/** The paint decision, as a pure function of what is known about a state.
 *  Named here because the demand is that ONE place decides it — three rules
 *  spread over three files is what this row exists to end. */
type Paint = { cls: string; marks: string[] };
type PaintFn = (sid: string, active: Set<string>, done: Set<string>, meta: Record<string, render.StateMeta>) => Paint;

function paintFn(): PaintFn {
  const fn = (render as unknown as { statePaint?: PaintFn }).statePaint;
  assert.equal(typeof fn, "function", "render.ts exports statePaint — one place decides what a green means");
  return fn as PaintFn;
}

const none = new Set<string>();
const meta = (m: Partial<render.StateMeta>): Record<string, render.StateMeta> => ({
  s: { has_exit: false, exit_met: false, has_entry: false, entry_met: false, ...m },
});

test("green means submitted: a done state is painted done, and carries no thumb", () => {
  const paint = paintFn();
  const p = paint("s", none, new Set(["s"]), meta({}));
  assert.match(p.cls, /\bdone\b/, "a stamped claim is green");
  assert.deepEqual(p.marks, [], "and nothing more is claimed for it");
});

test("the thumb is blessed: a blessed state is green AND marked", () => {
  const paint = paintFn();
  const p = paint("s", none, new Set(["s"]), meta({ blessed: true }));
  assert.match(p.cls, /\bdone\b/, "a blessed gate is still green");
  assert.deepEqual(p.marks, ["bless"], "the thumb rides the green rather than replacing it");
});

test("a law-proven green is told apart from a claim somebody stamped", () => {
  const paint = paintFn();
  const stamped = paint("s", none, new Set(["s"]), meta({}));
  const proven = paint("s", none, new Set(["s"]), meta({ law_proven: true } as Partial<render.StateMeta>));
  assert.notDeepEqual(
    [proven.cls, proven.marks],
    [stamped.cls, stamped.marks],
    "a check that RAN must not look identical to a claim somebody signed",
  );
});

test("none of the three is painted the same as an unproven state", () => {
  const paint = paintFn();
  const open = paint("s", none, none, meta({}));
  const greens = [meta({}), meta({ blessed: true }), meta({ law_proven: true } as Partial<render.StateMeta>)].map((m) =>
    JSON.stringify(paint("s", none, new Set(["s"]), m)),
  );
  assert.equal(new Set(greens).size, 3, "the three greens differ from each other");
  assert.ok(!greens.includes(JSON.stringify(open)), "and none of them is what an unproven claim looks like");
});

test("standing on moved ground beats every green, because the colour is no longer earned", () => {
  const paint = paintFn();
  const p = paint("s", none, new Set(["s"]), meta({ suspect: true, blessed: true }));
  assert.match(p.cls, /\bsuspect\b/, "suspect wins: the drawing says so before anybody trusts the colour");
});
