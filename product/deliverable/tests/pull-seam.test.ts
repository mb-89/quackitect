// THE PULL — the multi-agent seam, and where illegal stays illegal.
//
// THE SEAM. The owner's words, 2026-08-01: multi-agent is not built now,
// but do not build a system that breaks completely when we add it later. A
// decision form can carry "send three agents, one per lane". One agent
// walks one lane today, so a LIST must be ACCEPTED and the remainder handed
// back — never dropped, and never refused.
//
// THE BOUNDARY. The pull turns a blocked walk into an instruction. It is
// not a way around the contract. An unreachable choice and a form nothing
// asked for are v2 §6's Rejected kind — illegal, never retried, corrected
// call returned. Those still refuse typed, and that line is asserted here
// so the instruction lane cannot quietly swallow it.
//
// NOTHING HERE WALKS, so nothing here boots. Every case is one call that
// either refuses or does not, and the answer is the same wherever the walk
// happens to stand — which is why this theme is worth its own file: it
// costs milliseconds while its siblings cost a boot each. Each case still
// gets its OWN session and its OWN root, because the cases mutate the
// target and run concurrently. See guidance/software.md.
import { strict as assert } from "node:assert";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { Rejection } from "../engine/errors.ts";
import { Session } from "../engine/session.ts";
import { freshRoot } from "./helpers.ts";

const fresh = (): Session => new Session(freshRoot(mkdtempSync(join(tmpdir(), "se-pulls-"))));

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
  test("a LIST of choices takes the first and hands the rest back", async () => {
    const s = fresh();
    const r = (await s.pull({ choice: ["front_desk", "retro", "overhaul"] })) as Record<string, unknown>;
    assert.equal(s.target, "front_desk", "the first is the one this agent walks");
    assert.deepEqual(r.not_walked, ["retro", "overhaul"], "the rest come back rather than vanishing");
    assert.match(String(r.note), /only the first/, "and the answer says so plainly");
  });

  test("a single choice is the same call with one item, and reports no leftovers", async () => {
    const s = fresh();
    const r = (await s.pull({ choice: "front_desk" })) as Record<string, unknown>;
    assert.equal(s.target, "front_desk");
    assert.equal("not_walked" in r, false, "nothing was left over, so nothing is reported");
  });
});

describe("illegal stays illegal — the pull is not a way around the contract", { concurrency: true }, () => {
  test("a choice no edge reaches refuses typed", async () => {
    const r = await refusal(() => fresh().pull({ choice: "a-state-that-does-not-exist" }));
    assert.ok(r.remedy !== undefined, "a refusal carries the corrected call, always");
  });

  test("a form nothing asked for refuses, and the remedy is to pull empty", async () => {
    const r = await refusal(() => fresh().pull({ form: { "What was done": "something" } }));
    assert.match(r.got, /nothing on the way wants one/);
    assert.equal(r.remedy?.tool, "se_pull");
  });

  test("an empty choice is a malformed call, not a silent no-op", async () => {
    await refusal(() => fresh().pull({ choice: [] }));
  });
});
