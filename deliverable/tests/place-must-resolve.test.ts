// A PLACE NOTHING ANSWERS TO IS REFUSED, NEVER STORED.
//
// WHAT WENT WRONG. `at` was written onto the token verbatim and compared to
// nothing. Passing a position by its record's FOLDER name rather than its id
// was accepted, the id came back, and the result echoed the long name as
// though it had landed. The token then sat where no state looks.
//
// MEASURED 2026-08-27: five tokens went missing that way in one afternoon,
// including one the owner had just dictated. The state's pull listed four
// while five more stood unseen in the store.
//
// THE PLACEMENT SUCCEEDING IS WHAT MADE IT DANGEROUS. Nothing refused, so
// nothing said anything was wrong until somebody counted.
//
// see dsp-the-work-store.md#the-door-is-one-verb-with-three-acts
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { itFind, pinIteration } from "../engine/iterations.ts";
import { Session } from "../engine/session.ts";
import { readAllWork } from "../engine/workstore.ts";
import { checkDocs, freshRoot, gitInit } from "./helpers.ts";

/** A session standing inside a record, which is the only place the guard can
 *  prove anything: it compares against the walk's own spelling. */
async function inARecord(): Promise<{ session: Session; root: string; here: string }> {
  const root = freshRoot();
  gitInit(root, true);
  const session = new Session(root);
  for (let i = 0; i < 2; i++) await session.advance();
  checkDocs(session);
  for (let i = 0; i < 3; i++) await session.advance();
  session.setAutonomy(1);
  const id = String(session.iterationSeed("prove the place", "a place nothing answers to is refused").seeded);
  pinIteration(root, itFind(root, id), "major");
  session.iterationOpen(id);
  // OPENING A RECORD AIMS THE WALK; IT DOES NOT MOVE IT. The session still
  // stands at the front desk, whose name carries no record segment, so the
  // guard has nothing to compare and correctly does nothing.
  //
  // AND A BLIND ADVANCE CANNOT MOVE IT EITHER. The desk has eight doors and
  // refuses an unnamed advance by name (SE-C-110). Two earlier versions of this
  // helper failed on exactly that — the setup being wrong, never the guard.
  await session.advance("iterations");
  // THE DOOR IS NAMED BY THE SHORT ID, not by the seeded folder name. The
  // selector offers `i1`; the seed answers `i1-prove-the-place`. Passing the
  // long one is refused by name (SE-C-110) — which is the same confusion this
  // whole file is about, arriving in its own setup.
  await session.advance(id.split("-")[0]);
  // INSIDE THE RECORD THE ROUTE IS MOSTLY SINGLE-DOORED, so unnamed advances
  // carry it until a position with a record segment stands. It stops at the
  // first branch rather than guessing one.
  for (let i = 0; i < 8 && !String(session.active()[0] ?? "").includes("/"); i++) {
    try {
      await session.advance();
    } catch {
      break;
    }
  }
  return { session, root, here: String(session.active()[0] ?? "") };
}

describe("a place the walk does not answer to is refused", { concurrency: false }, () => {
  test("a position spelled with the record's folder name is refused, and nothing is written", async () => {
    const { session, root, here } = await inARecord();
    assert.ok(here.includes("/"), "the walk stands somewhere addressable");

    const before = readAllWork(root).items.length;
    // THE LEAF IS RIGHT AND THE RECORD SEGMENT IS NOT. That is the exact shape
    // that went wrong: a name a reader would write and no state answers to.
    const leaf = here.slice(here.lastIndexOf("/") + 1);
    const wrong = `iterations/a-record-nobody-is-walking/${leaf}`;

    assert.throws(
      () => session.workOpen("prove the guard / it must refuse", wrong),
      /no state here is named/,
      "the refusal says the place is not one",
    );
    assert.equal(readAllWork(root).items.length, before, "and nothing was written");
  });

  test("the refusal hands back the corrected call rather than a diagnosis", async () => {
    const { session, here } = await inARecord();
    const leaf = here.slice(here.lastIndexOf("/") + 1);
    const prefix = here.slice(0, here.lastIndexOf("/") + 1);
    try {
      session.workOpen("prove the guard / it must refuse", `iterations/wrong-name/${leaf}`);
      assert.fail("it should have refused");
    } catch (e) {
      const r = e as { remedy?: { args?: Record<string, unknown> } };
      assert.equal(r.remedy?.args?.at, `${prefix}${leaf}`, "the remedy is the same call with the record spelled right");
    }
  });

  test("the walk's own spelling lands, which is what the guard exists to protect", async () => {
    const { session, root, here } = await inARecord();
    const before = readAllWork(root).items.length;
    const out = session.workOpen("the right spelling / it lands", here);
    assert.equal(out.place, here);
    assert.notEqual(out.opened, "", "an id came back");
    assert.equal(readAllWork(root).items.length, before + 1, "and one more piece of work stands");
  });

  test("no place named at all still lands where the walk stands", async () => {
    const { session, here } = await inARecord();
    assert.equal(session.workOpen("no place named / it lands here", undefined).place, here);
  });

  // A GUARD THAT REFUSES WHAT IT CANNOT CHECK BLOCKS WORK FOR NO REASON, so
  // these two are deliberately let through.
  test("a bare state name and the backlog are both left alone", async () => {
    const { session } = await inARecord();
    assert.equal(session.workOpen("a bare name / no record segment to check", "retro").place, "retro");
    assert.equal(session.workOpen("the backlog / always legal", "backlog").place, "backlog");
  });
});
