// THE PULL — the choice is a form, and the multi-agent seam stays open.
//
// THE RULE (owner ruling 2026-08-02): you never choose unasked. A choice
// is a FORM the machine hands over where the road splits, answered on the
// next pull as form: {choice: "<to>"} — and only a door from the offer is
// legal. The free-aimed choice died with this rule; long-range aiming is
// the person's (the mirror's target).
//
// THE SEAM. The owner's words, 2026-08-01: multi-agent is not built now,
// but do not build a system that breaks completely when we add it later.
// A choice form can carry "send three agents, one per lane". One agent
// walks one lane today, so a LIST must be ACCEPTED and the remainder
// handed back — never dropped, and never refused.
//
// THE BOUNDARY. The pull turns a blocked walk into an instruction. It is
// not a way around the contract: a choice outside the offer and a form
// nothing asked for are v2 §6's Rejected kind — illegal, never retried,
// corrected call returned.
import { strict as assert } from "node:assert";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { Rejection } from "../engine/errors.ts";
import { Session } from "../engine/session.ts";
import { freshRoot, sessionAtIdle } from "./helpers.ts";

const root = (): string => freshRoot();

async function refusal(fn: () => Promise<unknown>): Promise<Rejection> {
  try {
    await fn();
  } catch (e) {
    if (e instanceof Rejection) return e;
    throw e;
  }
  throw new Error("expected a refusal, got a value");
}

describe("the multi-agent seam stays open", { concurrency: true }, () => {
  test("a LIST of offered doors takes the first and hands the rest back", async () => {
    const s = await sessionAtIdle(root());
    s.setAutonomy(1);
    const r = (await s.pull({ form: { choice: ["front_desk", "retro", "overhaul"] } })) as Record<string, unknown>;
    assert.deepEqual(r.not_walked, ["retro", "overhaul"], "the rest come back rather than vanishing");
    assert.match(String(r.note), /only the first/, "and the answer says so plainly");
  });

  test("a single choice is the same form with one door, and reports no leftovers", async () => {
    const s = await sessionAtIdle(root());
    s.setAutonomy(1);
    const r = (await s.pull({ form: { choice: "front_desk" } })) as Record<string, unknown>;
    assert.equal("not_walked" in r, false, "nothing was left over, so nothing is reported");
  });
});

describe("illegal stays illegal — the pull is not a way around the contract", { concurrency: true }, () => {
  test("a choice outside the offer refuses typed, naming the doors", async () => {
    // Cheap on purpose: at start (target cleared) the only door is boot,
    // so the offer is tiny and the boundary is the same one idle has.
    const s = new Session(root());
    s.setTarget("");
    const r = await refusal(() => s.pull({ form: { choice: "a-state-that-does-not-exist" } }));
    assert.match(String(r.expected), /offered doors/);
    assert.ok(r.remedy !== undefined, "a refusal carries the corrected call, always");
  });

  test("a choice while a target stands is a form nothing asked for", async () => {
    // The session aims at the desk by default — the road has not split,
    // so no choice was offered, and answering one is illegal.
    const s = new Session(root());
    const r = await refusal(() => s.pull({ form: { choice: "front_desk" } }));
    assert.match(r.got, /nothing on the way wants one/);
    assert.equal(r.remedy?.tool, "se_pull");
  });

  test("an evidence form nothing asked for refuses, and the remedy is to pull empty", async () => {
    const s = new Session(root());
    const r = await refusal(() => s.pull({ form: { "What was done": "something" } }));
    assert.match(r.got, /nothing on the way wants one/);
    assert.equal(r.remedy?.tool, "se_pull");
  });

  test("an empty choice is a malformed call, not a silent no-op", async () => {
    const s = new Session(root());
    s.setTarget("");
    await refusal(() => s.pull({ form: { choice: [] } }));
  });
});
