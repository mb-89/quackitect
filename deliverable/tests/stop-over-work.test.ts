// A STOP IS REFUSED WHILE THE STATE HOLDS OPEN WORK (owner).
//
// THE DIALS SAY HOW FAR THE WALK MAY GO. Not one of them says the work in hand
// is done, so a notch that sanctions a stop still sanctions it over a state
// full of open tokens — and the engine will then refuse to leave that state
// anyway. The turn ends having achieved nothing and the person is called back
// for no reason.
//
// A FORCE STILL RELEASES IT. Naming a sanctioned stop is a claim on the record,
// and this is not a fifth sanctioned stop. It is the ordinary case refusing
// louder.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { decide } from "../engine/bin/se-hook-stop.ts";
import { type MintDemand, mint, privateHome, settle } from "../engine/workstore.ts";

const NOW = "2026-08-27T10:00:00Z";
const AT = "iterations/i-test/fix-findings";

function demand(statement: string, personOnly = false): MintDemand {
  return { source: "hand", source_ref: `hand/${statement}`, step: "", statement, person_only: personOnly };
}

/** A crafted root holding a call log and whatever work the case wants. */
function craftRoot(records: object[]): string {
  const root = mkdtempSync(join(tmpdir(), "se-stop-work-"));
  mkdirSync(join(root, ".se"), { recursive: true });
  writeFileSync(join(root, ".se", "calls.jsonl"), `${records.map((r) => JSON.stringify(r)).join("\n")}\n`, "utf8");
  return root;
}

function verdictAt(root: string, payload: object): { block: boolean; reason: string } {
  const held = process.env.SE_HOOK_ROOT;
  process.env.SE_HOOK_ROOT = root;
  try {
    const v = decide(JSON.stringify(payload));
    return { block: v.block, reason: v.reason ?? "" };
  } finally {
    if (held === undefined) delete process.env.SE_HOOK_ROOT;
    else process.env.SE_HOOK_ROOT = held;
  }
}

const pullRecord = (response: object): object => ({
  ref: "call-000000000001",
  ts: "2026-08-09T16:00:00.000Z",
  tool: "se_pull",
  args: {},
  ok: true,
  outcome: "result",
  response,
});

/** An aim, which MOVES THE WALK AND WRITES NO PULL. */
const aimRecord = (target: string): object => ({
  ref: "call-000000000002",
  ts: "2026-08-09T16:01:00.000Z",
  tool: "se_aim",
  args: { to: target },
  ok: true,
  outcome: "result",
  response: `{"target":"${target}","found":true,"steps":[`,
});

// THE POSITION ON THE NEWEST PULL GOES STALE THE MOMENT AN AIM RUNS.
//
// MEASURED on a live session: the walk stood at fix-findings with six pieces of
// work open, the newest pull still said boot/end, and the stop passed the work
// check while looking at a state the walk had left.
//
// THE TARGET IS THE ONLY FRESH NEWS the hook has about where the walk is, so
// work standing there counts as work left.
describe("an aim moves the walk, and the work check follows it", { concurrency: true }, () => {
  test("work at the aimed target blocks the stop, though the pull names elsewhere", () => {
    const root = craftRoot([pullRecord({ pull: "do", where: ["boot/end"], target: "", stop_at: "blockers only" }), aimRecord(AT)]);
    mint(privateHome(root), AT, [demand("the work standing where the walk is headed")], NOW);

    const v = verdictAt(root, {});

    assert.equal(v.block, true, "the stop is refused");
    assert.match(v.reason, /work stand open/, "and it says why");
    assert.match(v.reason, /the work standing where the walk is headed/, "naming the first piece");
  });

  test("an aim with no work anywhere still lets the ordinary rules decide", () => {
    const root = craftRoot([pullRecord({ pull: "do", where: ["boot/end"], target: "", stop_at: "blockers only" }), aimRecord(AT)]);

    const v = verdictAt(root, {});

    assert.match(v.reason, /mid-work|target is set/, "it blocks for a reason other than open work");
  });

  // A SETTLED PIECE IS NOT WORK. The check must not read the target as a place
  // where everything ever minted still stands.
  test("work settled at the target does not block", () => {
    const root = craftRoot([pullRecord({ pull: "wait", where: ["front_desk"], target: "", stop_at: "agent judgement" }), aimRecord(AT)]);
    const minted = mint(privateHome(root), AT, [demand("already finished")], NOW).minted[0];
    settle(privateHome(root), minted.id, "done", { now: NOW, reason: "finished" });

    const v = verdictAt(root, {});

    assert.doesNotMatch(v.reason ?? "", /work stand open/, "a settled piece holds nothing");
  });
});

const stopRecord = (because: string): object => ({
  ref: "call-000000000002",
  ts: "2026-08-09T16:01:00.000Z",
  tool: "se_stop",
  args: { because },
  ok: true,
  outcome: "result",
  response: {},
});

/** A walk that WOULD be allowed to stop: the notch sanctions it outright. */
function sanctionedRoot(): string {
  return craftRoot([pullRecord({ pull: "do", where: [AT], stop_at: "state end" })]);
}

describe("the stop tooth reads the work store", { concurrency: false }, () => {
  test("a notch that would sanction the stop does not sanction it over open work", () => {
    const root = sanctionedRoot();
    assert.equal(verdictAt(root, {}).block, false, "the notch alone lets it through");

    mint(privateHome(root), AT, [demand("Tokens speak in log")], NOW);

    const said = verdictAt(root, {});
    assert.equal(said.block, true, "one open token outranks the notch");
    assert.match(said.reason, /1 piece\(s\) of work stand open at iterations\/i-test\/fix-findings/);
    assert.match(said.reason, /Tokens speak in log/, "and it names the work, not only the count");
    assert.match(said.reason, /THERE IS STILL WORK HERE/, "the instruction is to carry on");
  });

  test("settling the work lets the stop through again", () => {
    const root = sanctionedRoot();
    const made = mint(privateHome(root), AT, [demand("Tokens speak in log")], NOW).minted[0];
    assert.equal(verdictAt(root, {}).block, true);

    settle(privateHome(root), made.id, "done", { reason: "it landed", now: NOW });

    assert.equal(verdictAt(root, {}).block, false, "nothing stands here any more");
  });

  // WAITING ON A PERSON IS WHAT THAT ITEM MEANS. No agent may settle one, so
  // blocking on it would refuse a turn the agent has no way to release.
  test("a person's own item does not hold the turn shut", () => {
    const root = sanctionedRoot();
    mint(privateHome(root), AT, [demand("The owner blesses this", true)], NOW);

    assert.equal(verdictAt(root, {}).block, false, "the stop stands, because the wait is the point");
  });

  // A CLAIMED STOP IS A DECISION ON THE RECORD, and it releases this the same
  // way it releases every other refusal.
  test("a forced stop goes through over open work", () => {
    const root = craftRoot([
      pullRecord({ pull: "do", where: [AT], stop_at: "blockers only" }),
      stopRecord("a decision only the owner can make"),
    ]);
    mint(privateHome(root), AT, [demand("Tokens speak in log")], NOW);

    assert.equal(verdictAt(root, { stop_hook_active: true }).block, false, "the force is spent on this stop");
  });

  // WORK ELSEWHERE IS NOT WORK HERE. The hold is about the state the walk
  // stands in; a token parked at another position is somebody else's problem.
  test("work at another position does not block", () => {
    const root = sanctionedRoot();
    mint(privateHome(root), "iterations/i-test/verification", [demand("Something else entirely")], NOW);

    assert.equal(verdictAt(root, {}).block, false);
  });

  // A HOOK MUST NEVER BREAK THE TURN, and it must never block on its own
  // failure to look either.
  test("a root with no work store at all refuses nothing", () => {
    const root = sanctionedRoot();

    assert.equal(verdictAt(root, {}).block, false, "no store, no hold");
  });
});
