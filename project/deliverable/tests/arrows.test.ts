// ONE ARROW, BOTH WAYS (owner ruling 2026-07-28). Drawing a forward edge and
// a return edge as two separate arrows is what Obsidian makes tedious, so a
// DOUBLE-HEADED arrow means exactly that pair.
//
// Nothing new decides which half is which: the return is left undeclared and
// the existing depth rule names it, because forward is whichever end lies
// deeper from start. These tests pin that the notation changed and the
// MEANING did not.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { compileMachine } from "../engine/machines/compile.ts";
import { mainMachinePath } from "../engine/session.ts";
import { freshRoot } from "./helpers.ts";

function edgesOf(root: string): Map<string, { to: string; role: string }[]> {
  const m = compileMachine(root, mainMachinePath(root));
  return new Map(m.states.map((s) => [s.id, (s.edges ?? []).map((e) => ({ to: e.to, role: e.role }))]));
}

// Every door off idle is drawn as ONE arrow now. Out is normal, back is the
// alternative — the same shape the two-arrow drawing used to compile to.
const DOORS = ["front_desk", "ideation", "expeditions", "expedition_archive", "iterations", "iteration_archive", "retro"];

test("a double-headed arrow compiles to a forward edge and an alternative return", () => {
  const e = edgesOf(freshRoot());
  for (const door of DOORS) {
    const out = (e.get("idle") ?? []).find((x) => x.to === door);
    assert.ok(out !== undefined, `idle still reaches ${door}`);
    assert.equal(out.role, "normal", `going to ${door} is the forward half`);

    const back = (e.get(door) ?? []).find((x) => x.to === "idle");
    assert.ok(back !== undefined, `${door} still comes home`);
    assert.equal(back.role, "alternative", `coming back from ${door} is the return half`);
  }
});

test("a one-way arrow stays one-way", () => {
  const e = edgesOf(freshRoot());
  // start, boot and end are drawn with a single arrowhead and must not gain
  // a return just because the pair notation exists.
  assert.deepEqual(
    (e.get("end") ?? []).map((x) => x.to),
    [],
    "end goes nowhere",
  );
  const idleOut = (e.get("idle") ?? []).map((x) => x.to);
  assert.ok(idleOut.includes("end"), "idle still reaches end");
  assert.ok(!(e.get("boot") ?? []).some((x) => x.to === "start"), "boot never returns to start");
});
