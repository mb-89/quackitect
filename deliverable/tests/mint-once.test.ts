// A TOKEN IS CREATED ONCE AND NEVER RECREATED. It is reopened, moved or
// settled — never minted again under the same id.
//
// Minting per home broke that. `mint` matches only what stands in the home it
// was handed, so when `landing` changed its answer the new home saw nothing
// standing and minted the whole card again. Measured on i63: nine of the gate's
// ten evidence fields held two files each, same id, different lifetime.
//
// see dsp-the-work-store.md#one-home-for-reading-and-writing
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { type MintDemand, mint, mintBothSources, privateHome, readWork } from "../engine/workstore.ts";
import { GUIDANCE } from "./helpers.ts";

const NOW = "2026-01-01T00:00:00.000Z";
const RECORD = "i63-work-tokens";
const AT = `iterations/${RECORD}/gate-implementation`;

/** A root holding one real iteration folder, because `homeFor` only answers
 *  with a record home that exists on disk. */
function fresh(): { root: string; home: string } {
  const root = mkdtempSync(join(tmpdir(), "se-mint-"));
  const home = join(root, "spec", "iterations", RECORD);
  mkdirSync(home, { recursive: true });
  return { root, home };
}

const CARD: MintDemand[] = [
  { source: "evidence", source_ref: "gate#verdict", step: "", statement: "Fill verdict" },
  { source: "evidence", source_ref: "gate#risks", step: "", statement: "Fill risks acceptable" },
];

describe("a state's work is minted once, into one home", { concurrency: true }, () => {
  test("the same card minted twice mints nothing the second time", () => {
    const { root, home } = fresh();
    const first = mintBothSources(root, AT, CARD, NOW);
    assert.equal(first.minted.length, 2, "the first mint did not create both fields");
    const second = mintBothSources(root, AT, CARD, NOW);
    assert.equal(second.minted.length, 0, "the same card minted again — a token was recreated");
    assert.equal(second.matched.length, 2, "the standing work was not matched");
    assert.equal(readWork(home).length, 2, "the record home holds more files than the card has fields");
  });

  test("work standing in the other home is brought home, not minted again", () => {
    const { root, home } = fresh();
    // SEED THE BUG EXACTLY AS IT HAPPENED. The old code minted per home, so a
    // card walked before `landing` moved its answer left its files in `.se/`.
    const stray = mint(privateHome(root), AT, CARD, NOW);
    assert.equal(stray.minted.length, 2, "the fixture did not seed the stray copies");
    const ids = stray.minted.map((i) => i.id).sort();

    const after = mintBothSources(root, AT, CARD, NOW);
    assert.equal(after.minted.length, 0, "a token standing in the other home was minted again");

    const landed = readWork(home);
    assert.equal(landed.length, 2, "the record home does not hold both fields");
    assert.deepEqual(landed.map((i) => i.id).sort(), ids, "the reclaimed work did not keep its id");
    // THE FIELD MOVES WITH THE FILE, because the removal reads the field.
    for (const i of landed) assert.equal(i.lifetime, "record", "a reclaimed token still claims to be ephemeral");
    assert.equal(readWork(privateHome(root)).length, 0, "the copy left behind was reported, not removed");
  });

  test("a hand-opened token at the same place stays private", () => {
    const { root, home } = fresh();
    const hand: MintDemand[] = [
      { source: "hand", source_ref: "hand/a stray thought", step: "", statement: "a stray thought", lifetime: "state" },
    ];
    mint(privateHome(root), AT, hand, NOW);
    mintBothSources(root, AT, CARD, NOW);
    // THE AGENT TALKING IS NOT A STATE MINTING. Committing one would put in
    // version control the very thing that is meant to be thrown away.
    assert.equal(readWork(privateHome(root)).length, 1, "the hand-opened token did not stay where it was");
    assert.ok(!readWork(home).some((i) => i.source === "hand"), "a hand-opened token was committed to the record");
  });

  test("the place decides the lifetime, and the demand does not", () => {
    const { root, home } = fresh();
    // A READING DEMAND ASKS FOR `state`. Inside a record the ruling says every
    // token a state mints persists, so the place overrules the card.
    const reading: MintDemand[] = [
      { source: "reading", source_ref: GUIDANCE.contract, step: "", statement: "Read the contract", lifetime: "state" },
    ];
    mintBothSources(root, AT, reading, NOW);
    const landed = readWork(home);
    assert.equal(landed.length, 1, "a reading demand did not land in the record");
    assert.equal(landed[0].lifetime, "record", "the demand's own lifetime beat the place's");
  });

  test("outside a record everything is ephemeral", () => {
    const { root } = fresh();
    const asked: MintDemand[] = [{ source: "evidence", source_ref: "desk#a", step: "", statement: "Fill a", lifetime: "record" }];
    mintBothSources(root, "front_desk", asked, NOW);
    const landed = readWork(privateHome(root));
    assert.equal(landed.length, 1, "work at the desk did not land privately");
    assert.equal(landed[0].lifetime, "state", "work outside a record claims to persist");
  });
});
