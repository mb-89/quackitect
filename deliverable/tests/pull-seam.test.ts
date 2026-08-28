// THE PULL — the choice is a form, and the multi-agent seam stays open.
//
// THE RULE: you never choose unasked. A choice
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
import { describe, test } from "node:test";
import { Session } from "../engine/session.ts";
import { privateHome, readWork } from "../engine/workstore.ts";
import { freshRoot, refusalAsync, sessionAtIdle } from "./helpers.ts";

const root = (): string => freshRoot();

describe("the multi-agent seam stays open", { concurrency: true }, () => {
  test("a LIST of offered doors takes the first and hands the rest back", async () => {
    const s = await sessionAtIdle(root());
    s.setAutonomy(1);
    // Boot lands ON the front desk directly now (idle is gone), so it can no
    // longer be one of the offered doors chosen FROM here. Any other door
    // stands in for the walked entry; the rest of the list is unaffected.
    const r = (await s.pull({ form: { choice: ["iterations", "retro", "overhaul"] } })) as Record<string, unknown>;
    assert.deepEqual(r.not_walked, ["retro", "overhaul"], "the rest come back rather than vanishing");
    assert.match(String(r.note), /only the first/, "and the answer says so plainly");
  });

  // HANDED BACK IN ONE ANSWER IS NOT THE SAME AS WRITTEN DOWN. The sentence
  // above lives on a single pull result, and the call log caps every response
  // except a shell run — so the list was not recoverable even from the log.
  test("each leg nobody took is marked at that leg's own state", async () => {
    const r0 = root();
    const s = await sessionAtIdle(r0);
    s.setAutonomy(1);
    await s.pull({ form: { choice: ["iterations", "retro", "overhaul"] } });

    const marks = readWork(privateHome(r0)).filter((i) => i.statement === "Offered, not taken");
    assert.deepEqual(marks.map((m) => m.place).sort(), ["overhaul", "retro"], "the mark sits where the work is, not where the walk went");
    for (const m of marks) assert.equal(m.status, "open", "nobody has done it, so it stands open");
  });

  // TWO PULLS OFFERING THE SAME LEG ARE ONE ROW. A mark per pull would bury the
  // board under the same fact restated.
  test("offering a leg twice marks it once", async () => {
    const r0 = root();
    const s = await sessionAtIdle(r0);
    s.setAutonomy(1);
    await s.pull({ form: { choice: ["iterations", "retro"] } });
    await s.pull({ form: { choice: ["iterations", "retro"] } }).catch(() => undefined);

    const marks = readWork(privateHome(r0)).filter((i) => i.statement === "Offered, not taken" && i.place === "retro");
    assert.equal(marks.length, 1, "the mint matches on the leg, so the second offer adds nothing");
  });

  test("a single choice is the same form with one door, and reports no leftovers", async () => {
    const s = await sessionAtIdle(root());
    s.setAutonomy(1);
    // front_desk is where the walk already stands (idle is gone), so it is
    // not an offered door here — pick a real one instead.
    const r = (await s.pull({ form: { choice: "retro" } })) as Record<string, unknown>;
    assert.equal("not_walked" in r, false, "nothing was left over, so nothing is reported");
  });
});

describe("illegal stays illegal — the pull is not a way around the contract", { concurrency: true }, () => {
  test("a choice outside the offer refuses typed, naming the doors", async () => {
    // Cheap on purpose: at start (target cleared) the only door is boot,
    // so the offer is tiny and the boundary is the same one idle has.
    const s = new Session(root());
    s.setTarget("");
    const r = await refusalAsync(() => s.pull({ form: { choice: "a-state-that-does-not-exist" } }));
    assert.match(String(r.expected), /offered doors/);
    assert.ok(r.remedy !== undefined, "a refusal carries the corrected call, always");
  });

  test("a choice while a target stands is answered as a choice, with the way to move", async () => {
    // The session aims at the desk by default — the road has not split, so no
    // choice was offered and answering one is illegal.
    //
    // THIS USED TO ANSWER "a filled form, but nothing on the way wants one",
    // which is true and is not about what the reader asked. See
    // choice-refused.test.ts: the i15 walk sent one door three ways and got
    // that sentence three times.
    const s = new Session(root());
    const r = await refusalAsync(() => s.pull({ form: { choice: "front_desk" } }));
    assert.match(r.got, /a choice of/);
    assert.match(`${r.remedy?.tool} ${r.remedy?.note}`, /se_aim|doors from here/);
  });

  test("an evidence form nothing asked for refuses, and the remedy is to pull empty", async () => {
    const s = new Session(root());
    const r = await refusalAsync(() => s.pull({ form: { "What was done": "something" } }));
    assert.match(r.got, /nothing on the way wants one/);
    assert.equal(r.remedy?.tool, "se_pull");
  });

  test("an empty choice is a malformed call, not a silent no-op", async () => {
    const s = new Session(root());
    s.setTarget("");
    await refusalAsync(() => s.pull({ form: { choice: [] } }));
  });
});
