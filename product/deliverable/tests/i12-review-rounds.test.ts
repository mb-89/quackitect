// THE GUARD ON THE GUARD (i12/R30). se.meth-gate-review has required
// verify / validate / redteam / verdict since it was written, and no evidence
// form ever collected them — so across every gate of every iteration, NOT ONE
// was filled. A review nothing asks for is a review that never happens.
//
// These checks exist so that can never silently become true again: they fail
// if the rounds stop being injected, if one is quietly made optional, or if a
// work state starts carrying them (they belong to gates, and putting them
// everywhere would bury the instruction — se.raid-the-guidance-join-buries-the-instruction).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { layout } from "../engine/layout.ts";
import { loadSystematic } from "../engine/machines/load.ts";
import { plantMachines } from "./fixtures.ts";

const ROUNDS = ["verify_round", "validate_round", "redteam_round", "verdict"];

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "se-rounds-"));
  mkdirSync(layout.seDir(root), { recursive: true });
  plantMachines(root);
  return root;
}

const drop = (root: string): void => {
  try {
    rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
  } catch {
    /* temp cleanup is best-effort on Windows */
  }
};

test("EVERY gate carries the standard review rounds, and every one is required", () => {
  const root = fixture();
  try {
    const m = loadSystematic(root);
    assert.ok(m !== null, "the systematic machine compiles");
    const gates = m!.states.filter((s) => s.kind === "gate");
    assert.ok(gates.length >= 5, `expected the systematic gates, found ${gates.length}`);
    for (const g of gates) {
      const names = g.evidence_form.map((f) => f.name);
      for (const round of ROUNDS) {
        assert.ok(names.includes(round), `${g.id} is missing ${round} — a round nothing asks for is a round nobody runs`);
        const field = g.evidence_form.find((f) => f.name === round)!;
        assert.equal(field.required, true, `${g.id}'s ${round} must be REQUIRED, not optional`);
      }
    }
  } finally {
    drop(root);
  }
});

test("the gate's OWN acceptance items come first - the rounds evaluate them, they do not replace them", () => {
  const root = fixture();
  try {
    const m = loadSystematic(root)!;
    for (const g of m.states.filter((s) => s.kind === "gate")) {
      const names = g.evidence_form.map((f) => f.name);
      const firstRound = names.indexOf("verify_round");
      assert.ok(firstRound > 0, `${g.id} has no specific acceptance items before its rounds`);
      assert.deepEqual(names.slice(firstRound), ROUNDS, `${g.id}'s rounds must be the tail, in increasing scrutiny order`);
    }
  } finally {
    drop(root);
  }
});

test("WORK states do NOT carry the rounds - reviewing is what a gate is for", () => {
  const root = fixture();
  try {
    const m = loadSystematic(root)!;
    for (const s of m.states.filter((x) => x.kind === "work")) {
      const names = s.evidence_form.map((f) => f.name);
      for (const round of ROUNDS) {
        assert.ok(!names.includes(round), `${s.id} is a work state and must not carry ${round}`);
      }
    }
  } finally {
    drop(root);
  }
});

test("the red-team round names the kill-criterion and the dissent rule in its own description", () => {
  const root = fixture();
  try {
    const m = loadSystematic(root)!;
    const gate = m.states.find((s) => s.kind === "gate")!;
    const rt = gate.evidence_form.find((f) => f.name === "redteam_round")!;
    // The description IS the prompt the agent reads; if it does not carry the
    // rubric, the round degrades into a paragraph of agreement.
    assert.match(rt.description, /kill-criterion/i, "a significant decision carries a kill-criterion");
    assert.match(rt.description, /dissent/i, "an override is logged WITH its dissent, never as a clean pass");
    assert.match(rt.description, /rubric/i, "cite a rubric, not vibes");
    const v = gate.evidence_form.find((f) => f.name === "validate_round")!;
    assert.match(v.description, /register/i, "validate reads against the requirement register, not just the plan");
  } finally {
    drop(root);
  }
});
