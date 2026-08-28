// see dsp-the-work-store.md#behavior-and-constraints
//
// COMPLETING A STATE MUST NOT DESTROY WORK NOBODY FINISHED. The leaving guard
// refuses such a completion, and emergency lifts that guard on purpose. This
// file is about what happens once the completion is allowed anyway.
//
// THE SEAM IS WHO CAN BRING THE TOKEN BACK. A machine-minted token is minted
// again on the next entry, so dropping an unfinished one loses nothing. A token
// a HAND opened returns from nowhere.
import { strict as assert } from "node:assert";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { BACKLOG, completeState, type MintDemand, mint, place, readOne, settle } from "../engine/workstore.ts";

const NOW = "2026-08-27T10:00:00Z";
const HERE = "iterations/i63/fix-findings";
const THERE = "iterations/i63/verification";

function home(): string {
  return mkdtempSync(join(tmpdir(), "carry-"));
}

/** What a hand opens: se_work {act: "open"} mints exactly this shape. */
function byHand(name: string): MintDemand {
  return { source: "hand", source_ref: `hand/${name}`, step: "", statement: name, lifetime: "state" };
}

/** What the state mints for itself on entry. */
function byMachine(name: string): MintDemand {
  return { source: "step", source_ref: `meth.md#${name}`, step: name, statement: name, lifetime: "state" };
}

function open(h: string, d: MintDemand, at = HERE): string {
  return mint(h, at, [d], NOW).minted[0].id;
}

describe("completing a state carries unfinished work rather than erasing it", { concurrency: true }, () => {
  test("an unfinished hand token survives the completion and moves to the backlog", () => {
    const h = home();
    const id = open(h, byHand("Work lines go pink"));

    const out = completeState(h, HERE);

    const still = readOne(h, id);
    assert.notEqual(still, null, "the token was not deleted");
    assert.equal(still?.place, BACKLOG, "it sits where work with no home sits");
    assert.equal(still?.status, "open", "it was not quietly closed either");
    assert.deepEqual(
      out.carried.map((i) => i.statement),
      ["Work lines go pink"],
      "the caller is told what moved, so it can be announced",
    );
    assert.deepEqual(out.removed, [], "nothing was removed");
  });

  test("a settled hand token is removed, because that is what ephemeral means", () => {
    const h = home();
    const id = open(h, byHand("Backlog is one place"));
    settle(h, id, "done", { now: NOW, reason: "finished" });

    const out = completeState(h, HERE);

    assert.equal(readOne(h, id), null, "the file is gone");
    assert.equal(out.removed.length, 1);
    assert.deepEqual(out.carried, [], "a finished token has nothing to carry");
  });

  test("an unfinished machine-minted token is removed, because entry mints it again", () => {
    const h = home();
    const id = open(h, byMachine("decompose-structure"));

    const out = completeState(h, HERE);

    assert.equal(readOne(h, id), null, "nothing is lost — the state re-mints it");
    assert.equal(out.removed.length, 1);
    assert.deepEqual(out.carried, []);
  });

  test("unfinished hand work placed at another state is left where it stands", () => {
    const h = home();
    const id = open(h, byHand("Hop costs one second"));
    place(h, id, THERE);

    const out = completeState(h, HERE);

    const still = readOne(h, id);
    assert.equal(still?.place, THERE, "this completion has no say over another position's work");
    assert.equal(still?.status, "open");
    assert.deepEqual(out.carried, [], "it did not move");
    assert.deepEqual(out.removed, [], "and it was certainly not deleted");
  });

  test("record-lifetime work is untouched whatever its status", () => {
    const h = home();
    const id = open(h, { source: "hand", source_ref: "hand/keep", step: "", statement: "keep", lifetime: "record" });

    const out = completeState(h, HERE);

    assert.equal(readOne(h, id)?.place, HERE, "it outlives the state by declaration");
    assert.equal(out.kept.length, 1);
    assert.deepEqual(out.removed, []);
    assert.deepEqual(out.carried, []);
  });

  test("the seven-token case: several open hand tokens all come back", () => {
    const h = home();
    const names = [
      "Work lines go pink",
      "Hop costs one second",
      "Gate findings become tokens",
      "Battery findings become tokens",
      "Register issues become tokens",
      "Unwalked legs become tokens",
      "Tokens replace the graph",
    ];
    const ids = names.map((n) => open(h, byHand(n)));

    const out = completeState(h, HERE);

    assert.equal(out.carried.length, 7, "not one of them is lost");
    for (const id of ids) assert.equal(readOne(h, id)?.place, BACKLOG);
  });
});
