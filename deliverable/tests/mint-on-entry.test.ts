// see dsp-the-work-store.md#the-identity-lives-in-the-card-not-in-the-text
//
// The state graph is three states of one piece of work at entry — absent,
// standing open, standing finished — and every transition gets a case. The
// events that cause NO transition get one too, because those probe the error
// handling.
import { strict as assert } from "node:assert";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { demandsForState } from "../engine/workmint.ts";
import { demandsFromCard, type MintDemand, mint, readWork, settle } from "../engine/workstore.ts";

const NOW = "2026-08-26T10:00:00Z";
const AT = "iterations/i63/decompose";

// THE STAMP IS NOT A CHANGE TO WHAT THE CARD SAYS. Minting writes identity
// marks into the card it derives work from, and the reading credit keys to
// content — so without carrying the credit forward, every position that mints
// asks its reader to read the same card again, for an edit no person made.
//
// THE CASE READS THE SOURCE because the carry lives on the walk's own mint
// path, which needs a bound record and a standing position to exercise. What it
// pins is that the carry is THERE, and that it is CONDITIONAL: a card nobody
// had read stays owed, which is the whole point of the gate.
test("minting carries a standing reading credit onto the card it stamped", () => {
  const src = readFileSync(fileURLToPath(new URL("../engine/session.ts", import.meta.url)), "utf8");
  const body = /private mintWhatThisPositionOwes\(\): void \{([\s\S]*?)\n {2}\}/.exec(src)?.[1] ?? "";
  assert.notEqual(body, "", "the mint crossing still stands on the walk");
  assert.ok(body.includes("this.reads.credit("), `the mint re-credits the card it stamped: ${body}`);
  assert.ok(body.includes("this.reads.readBuffer.get("), "and only where a credit already stood, so an unread card is still owed");
});

function home(): string {
  return mkdtempSync(join(tmpdir(), "mint-"));
}

function card(dir: string, name: string, text: string): string {
  const p = join(dir, name);
  writeFileSync(p, text, "utf8");
  return p;
}

// A DOCUMENT THAT DOES NOT EXIST, on purpose. A test naming a real guidance
// path pins a layout no rule guarantees, and testlint.test.ts refuses it.
const READING: MintDemand = {
  source: "reading",
  source_ref: "docs/the-document-this-state-demands.md",
  step: "",
  statement: "Read the document",
};
const EVIDENCE: MintDemand = { source: "evidence", source_ref: "built", step: "", statement: "Fill built" };

describe("a state mints and re-mints its work", { concurrency: true }, () => {
  test("entering derives from all three sources", () => {
    const h = home();
    const path = card(h, "meth.md", ["---", "id: meth-x", "---", "", "## Elements #work", "a", "## Allocation #work", "b"].join("\n"));
    const report = mint(h, AT, [READING, ...demandsFromCard(path), EVIDENCE], NOW);
    assert.equal(report.minted.length, 4);
    assert.deepEqual([...new Set(report.minted.map((i) => i.source))].sort(), ["evidence", "reading", "step"]);
  });

  test("a source that is empty contributes nothing, rather than a placeholder", () => {
    const h = home();
    const path = card(h, "meth.md", ["---", "id: meth-x", "---", "", "## Only prose", "nothing is marked"].join("\n"));
    const report = mint(h, AT, [READING, ...demandsFromCard(path)], NOW);
    assert.equal(report.minted.length, 1);
    assert.equal(report.minted[0].source, "reading");
  });

  test("entering twice mints no duplicate", () => {
    const h = home();
    const path = card(h, "meth.md", ["---", "id: meth-x", "---", "", "## Elements #work", "a"].join("\n"));
    const first = mint(h, AT, demandsFromCard(path), NOW);
    assert.equal(first.minted.length, 1);
    const second = mint(h, AT, demandsFromCard(path), NOW);
    assert.equal(second.minted.length, 0);
    assert.equal(second.matched.length, 1);
    assert.equal(readWork(h).length, 1);
    assert.equal(readdirSync(join(h, "work")).length, 1);
  });

  // THE CASE THE WHOLE IDENTITY MECHANISM EXISTS FOR.
  test("a reworded card orphans nothing and mints nothing", () => {
    const h = home();
    const path = card(h, "meth.md", ["---", "id: meth-x", "---", "", "## Elements #work", "a"].join("\n"));
    const first = mint(h, AT, demandsFromCard(path), NOW);
    const id = first.minted[0].id;

    writeFileSync(path, readFileSync(path, "utf8").replace("## Elements", "## Naming the elements"), "utf8");

    const second = mint(h, AT, demandsFromCard(path), NOW);
    assert.equal(second.minted.length, 0, "a rewording must not mint a duplicate");
    assert.equal(second.orphaned.length, 0, "a rewording must not orphan the standing item");
    assert.equal(second.matched.length, 1);
    assert.equal(second.matched[0].id, id, "the same item, matched through the rewording");
    assert.equal(second.matched[0].statement, "Naming the elements", "and its wording followed the card");
    assert.match(second.matched[0].source_ref, /#naming-the-elements$/, "and so did the pointer back into the card");
  });

  test("an item whose step is gone from the card is reported, not deleted", () => {
    const h = home();
    const path = card(h, "meth.md", ["---", "id: meth-x", "---", "", "## Elements #work", "a", "## Allocation #work", "b"].join("\n"));
    mint(h, AT, demandsFromCard(path), NOW);

    const cut = readFileSync(path, "utf8").split("\n");
    writeFileSync(path, cut.slice(0, cut.indexOf(cut.find((l) => l.startsWith("## Allocation")) as string)).join("\n"), "utf8");

    const second = mint(h, AT, demandsFromCard(path), NOW);
    assert.equal(second.orphaned.length, 1);
    assert.match(second.orphaned[0].statement, /Allocation/);
    assert.equal(readWork(h).length, 2, "reported, and still on disk");
  });

  test("finished work is not re-minted on a second entry", () => {
    const h = home();
    const path = card(h, "meth.md", ["---", "id: meth-x", "---", "", "## Elements #work", "a"].join("\n"));
    const first = mint(h, AT, demandsFromCard(path), NOW);
    settle(h, first.minted[0].id, "done", { reason: "it landed", now: NOW });

    const second = mint(h, AT, demandsFromCard(path), NOW);
    assert.equal(second.minted.length, 0);
    assert.equal(second.matched.length, 0);
    assert.equal(second.settled.length, 1);
    assert.equal(second.orphaned.length, 0, "settled work is not owed again and is not an orphan either");
  });

  // A step that would have seeded a submachine is ONE item with no children of
  // its own. At this level that is what "no nested lifecycle" looks like.
  test("a step that would seed a submachine takes work instead", () => {
    const h = home();
    const report = mint(
      h,
      AT,
      [{ source: "step", source_ref: "meth.md#run-a-review", step: "run-a-review", statement: "Run a review" }],
      NOW,
    );
    assert.equal(report.minted.length, 1);
    assert.deepEqual(report.minted[0].parts, []);
    assert.equal(report.minted[0].place, AT, "it lands on the position, not in a machine of its own");
  });

  test("a card that will not parse refuses before anything is written", () => {
    const h = home();
    const path = card(h, "meth.md", ["---", "id: meth-x", "id: meth-x", "---", "", "## Elements #work", "a"].join("\n"));
    assert.throws(() => demandsFromCard(path), /frontmatter that parses as YAML/);
    assert.equal(readWork(h).length, 0, "no partial set was left behind");
  });

  test("minting with no standing position refuses rather than minting into nothing", () => {
    const h = home();
    assert.throws(() => mint(h, "", [READING], NOW), /an open record/);
    assert.equal(readWork(h).length, 0);
  });

  // THE CROSSING ITSELF. see dsp-the-work-store.md#the-crossing-to-the-walk-and-how-it-was-nearly-shipped-unbuilt
  test("a state owes items from all three sources its declaration names", () => {
    const h = home();
    card(h, "meth-x.md", ["---", "id: meth-x", "---", "", "## Do it #work", "a"].join("\n"));
    const demands = demandsForState(h, {
      entry: { read: ["docs/a-document.md", "meth-x.md"] },
      evidence_form: [{ name: "current_situation", required: true }],
      complexity: { judgement: "mechanical" },
    });
    assert.deepEqual(
      [...new Set(demands.map((d) => d.source))].sort(),
      ["evidence", "reading", "step"],
      "the reading, the marked steps, and the evidence",
    );
    for (const d of demands) assert.equal(d.difficulty, "mechanical", "the state's own strength rides every item it owes");
  });

  test("a source that is empty contributes nothing", () => {
    assert.deepEqual(demandsForState(home(), { entry: {}, evidence_form: [] }), []);
  });

  test("an optional evidence field is not owed", () => {
    const demands = demandsForState(home(), {
      evidence_form: [
        { name: "built", required: true },
        { name: "anything_else", required: false },
      ],
    });
    assert.deepEqual(
      demands.map((d) => d.source_ref),
      ["built"],
    );
  });

  test("only the method card among the reading is read for marks", () => {
    const h = home();
    card(h, "meth-x.md", ["---", "id: meth-x", "---", "", "## Do it #work", "a"].join("\n"));
    card(h, "plain.md", ["## Also marked #work", "a"].join("\n"));
    const demands = demandsForState(h, { entry: { read: ["plain.md", "meth-x.md"] } });
    assert.equal(demands.filter((d) => d.source === "step").length, 1, "a document that is not a method card carries no steps");
  });

  test("a state with no reading and no evidence owes nothing at all", () => {
    assert.deepEqual(demandsForState(home(), {}), []);
  });

  // A STATE REACHES ITS METHOD CARD BY TAG FAR MORE OFTEN THAN BY `entry.read`.
  //
  // MEASURED: 305 marked parts stood across 73 method cards and produced ZERO
  // step work, because minting read marks only from `entry.read` and 13 of 21
  // shared states name no card there at all. Boot, the front desk and the
  // overhaul are all in that thirteen, which is why a person watching a boot
  // saw nothing appear.
  test("a card the state reaches by tag mints its marked steps too", () => {
    const h = home();
    card(
      h,
      "meth-boot.md",
      ["---", "id: meth-boot", "---", "", "## Startup order #work", "a", "", "## Measure the cap #work", "b"].join("\n"),
    );
    const demands = demandsForState(h, { entry: {} }, undefined, ["meth-boot.md"]);
    assert.equal(demands.filter((d) => d.source === "step").length, 2, "both marked parts become work");
    assert.equal(
      demands.filter((d) => d.source === "reading").length,
      0,
      "a card the state never demanded READING of owes no reading token",
    );
  });

  test("a card named twice is read once", () => {
    const h = home();
    card(h, "meth-both.md", ["---", "id: meth-both", "---", "", "## One step #work", "a"].join("\n"));
    const demands = demandsForState(h, { entry: { read: ["meth-both.md"] } }, undefined, ["meth-both.md"]);
    assert.equal(demands.filter((d) => d.source === "step").length, 1, "the two paths to one card do not double its work");
    assert.equal(demands.filter((d) => d.source === "reading").length, 1, "and it is still owed as reading, once");
  });

  test("two hands minting one position produce the same item, not two", () => {
    const a = home();
    const b = home();
    const text = ["---", "id: meth-x", "---", "", "## Elements #work/elements", "a"].join("\n");
    const idA = mint(a, AT, demandsFromCard(card(a, "meth.md", text)), NOW).minted[0].id;
    const idB = mint(b, AT, demandsFromCard(card(b, "meth.md", text)), NOW).minted[0].id;
    assert.equal(idA, idB, "the id is derived from the position and the step, so two clones agree");
  });
});

// see dsp-the-work-store.md#a-build-step-is-persistent-and-its-reading-is-not
describe("a build step outlives its reading", { concurrency: true }, () => {
  test("every reading token is ephemeral and everything else is not", () => {
    const demands = demandsForState(home(), {
      id: "the-work-store",
      entry: { read: ["spec/trace/design-spec/dsp-the-work-store.md"] },
      evidence_form: [{ name: "built", required: true }],
      legal_tools: ["se_file_write"],
    });
    const reading = demands.filter((d) => d.source === "reading");
    assert.ok(reading.length > 0, "a writing state owes reading");
    for (const d of reading) {
      assert.equal(d.lifetime, "state", `${d.source_ref} goes when the state completes`);
    }
    for (const d of demands.filter((x) => x.source !== "reading")) {
      assert.notEqual(d.lifetime, "state", `${d.source_ref} is the step's own work and outlives it`);
    }
  });
});

// see dsp-mirror-render.md#the-signature-is-the-settle
//
// THE CROSSING IS THE POINT, and it lives on the walk rather than in the store.
// The store's own rule is pinned in work-reads.test.ts; this asserts that the
// submit actually calls it, which is the leg that was missing.
//
// WHAT IT ASSERTED BEFORE was that signing settled EVERY open item at the state.
// That was the rule upside down: it made a skipped step into a done step by the
// act of claiming the state, which is precisely what an open item is supposed to
// prevent. Filling a field closes THAT field's evidence, and nothing else.
test("submitting a state form closes the evidence it filled, and only that", () => {
  const src = readFileSync(fileURLToPath(new URL("../engine/session.ts", import.meta.url)), "utf8");
  assert.match(src, /this\.settleEvidenceAt\(name\);[\s\S]{0,200}this\.holdOrSign\(/, "the close and the gate are one act, in that order");

  const body = /private settleEvidenceAt\(stateId: string\): void \{([\s\S]*?)\n {2}\}/.exec(src)?.[1] ?? "";
  assert.notEqual(body, "", "the settle stands on the session");
  assert.match(body, /i\.source !== "evidence"/, "only evidence closes here; a step is a hand's to settle");
  assert.match(body, /field is filled/, "and every close carries its reason");
});
