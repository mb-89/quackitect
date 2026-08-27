// see dsp-the-work-store.md#behavior-and-constraints
//
// A DECISION TABLE, because the outcome turns on two conditions crossed: the
// terminal status reached, and whether the work sat inside a record.
//
// Every refusal below is asserted against the PROSE a reader sees. Never
// against the serialised object, whose key names match by accident, and never
// against a token this test supplied, which the refusal only echoes back.
import { strict as assert } from "node:assert";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { completeState, type MintDemand, mint, readOne, readWork, settle } from "../engine/workstore.ts";

const NOW = "2026-08-26T10:00:00Z";
const HERE = "iterations/i63/decompose";

function home(): string {
  return mkdtempSync(join(tmpdir(), "settles-"));
}

function demand(name: string, extra: Partial<MintDemand> = {}): MintDemand {
  return { source: "step", source_ref: `meth.md#${name}`, step: name, statement: name, ...extra };
}

function one(h: string, extra: Partial<MintDemand> = {}): string {
  return mint(h, HERE, [demand("elements", extra)], NOW).minted[0].id;
}

describe("work settles or says why not", { concurrency: true }, () => {
  test("person-only stands on the item's face, before anything is attempted", () => {
    const h = home();
    const item = readOne(h, one(h, { person_only: true }));
    assert.equal(item?.person_only, true, "a hand reads the limit rather than discovering it at a refusal");
  });

  test("an agent settling a person-only item is refused, and the refusal names the rule", () => {
    const h = home();
    const id = one(h, { person_only: true });
    assert.throws(() => settle(h, id, "done", { now: NOW, by: "agent" }), /a person to settle this one/);
    assert.equal(readOne(h, id)?.status, "open", "a refused settle leaves the item exactly as it was");
  });

  test("a person may settle a person-only item", () => {
    const h = home();
    const id = one(h, { person_only: true });
    assert.equal(settle(h, id, "done", { reason: "a person looked at it", now: NOW, by: "person" }).status, "done");
  });

  // see dsp-the-work-store.md#both-ends-of-a-piece-of-work-say-something
  //
  // FINISHING USED TO NEED NO REASON, and finishing is the moment a person most
  // wants a sentence. Every close owes one now, like a commit message.
  test("a close at done is refused until a reason stands", () => {
    const h = home();
    const id = one(h);
    assert.throws(() => settle(h, id, "done", { now: NOW }), /a reason on every close/);
    assert.equal(readOne(h, id)?.status, "open", "nothing was written");

    const settled = settle(h, id, "done", { reason: "the editor draws four buckets", now: NOW });
    assert.equal(settled.status, "done");
    assert.equal(settled.reason, "the editor draws four buckets");
    assert.equal(settled.closed, NOW);
  });

  test("a close at any other terminal status is refused until a reason stands", () => {
    const h = home();
    const id = one(h);
    assert.throws(() => settle(h, id, "dropped", { now: NOW }), /a reason on every close/);
    assert.equal(readOne(h, id)?.status, "open", "nothing was written");

    const settled = settle(h, id, "dropped", { now: NOW, reason: "the method stopped asking for it" });
    assert.equal(settled.status, "dropped");
    assert.equal(readOne(h, id)?.reason, "the method stopped asking for it", "the reason is on the item, not in a log");
  });

  test("a blank reason is no reason", () => {
    const h = home();
    assert.throws(() => settle(h, one(h), "dropped", { now: NOW, reason: "   " }), /a reason on every close/);
  });

  test("settling twice changes nothing and the first outcome stands", () => {
    const h = home();
    const id = one(h);
    settle(h, id, "done", { reason: "it landed", now: NOW });
    const again = settle(h, id, "dropped", { now: "2026-09-01T00:00:00Z", reason: "a later report" });
    assert.equal(again.status, "done");
    assert.equal(again.closed, NOW);
    assert.equal(again.reason, "it landed", "a repeated report changes nothing, which is what lets the registry be told twice");
  });

  test("every item says which of the two lifetimes it has", () => {
    const h = home();
    mint(h, HERE, [demand("a"), demand("b", { lifetime: "state" })], NOW);
    for (const i of readWork(h)) {
      assert.ok(i.lifetime === "record" || i.lifetime === "state", "the fate is declared, never inferred from where it sits");
    }
  });

  test("work inside a record outlives its state, and work outside it goes", () => {
    const h = home();
    const kept = mint(h, HERE, [demand("kept")], NOW).minted[0].id;
    const going = mint(h, HERE, [demand("going", { lifetime: "state" })], NOW).minted[0].id;

    const done = completeState(h, HERE);
    assert.equal(done.kept.length, 1);
    assert.equal(done.removed.length, 1);

    assert.notEqual(readOne(h, kept), null, "read back after the state completes, and it is there");
    assert.equal(readOne(h, going), null, "read back after the state completes, and it is gone");
  });
});
