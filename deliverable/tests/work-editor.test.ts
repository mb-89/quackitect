// THE LANE DOOR AND THE STORE BEHIND IT.
//
// The editor's own markup is tested in bucket-editor.test.ts, and it is the
// database's markup rather than ours. What lives here is what the surface talks
// TO: the three acts, where work is read from, and the way in.
//
// see dsp-the-work-store.md#three-acts-and-no-more
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { itFind, pinIteration } from "../engine/iterations.ts";
import { Session } from "../engine/session.ts";
import { WORK_SCRIPT } from "../engine/workclient.ts";
import { type MintDemand, mint, readAllWork, restate } from "../engine/workstore.ts";
import { checkDocs, freshRoot, gitInit } from "./helpers.ts";

const NOW = "2026-08-26T10:00:00Z";

/** The bar's own spec. A control has to be DECLARED there rather than drawn in
 *  code, or a host that renders its own bar never sees it. */
function controls(): string {
  return readFileSync(new URL("../machines/panels/controls.md", import.meta.url), "utf8");
}

/** The renderer's own source, for the two buttons it draws side by side. */
function render(): string {
  return readFileSync(new URL("../engine/render.ts", import.meta.url), "utf8");
}

function demand(statement: string): MintDemand {
  return { source: "evidence", source_ref: "docs/a.md", step: "", statement, difficulty: "mechanical" };
}

describe("the way into the editor", () => {
  // THE BUTTON SITS BESIDE ESCAPE, on the machine's own surface — not in the
  // controls bar. A reader looking at a drawing is looking at the drawing.
  test("the button beside escape opens the editor", () => {
    assert.ok(WORK_SCRIPT.includes('closest("#work-btn")'), "the work client answers the button");
    assert.match(render(), /id="work-btn"/, "and the machine draws it");
    assert.match(render(), /\$\{escapeBtn\}\$\{workBtn\}/, "right beside escape");
  });

  test("the bar carries no work control, because the button is not there", () => {
    assert.doesNotMatch(controls(), /#work/, "an extra control nobody asked for is an extra thing to explain");
  });

  // A PILL OPENS THE EDITOR AND NOTHING ELSE. Both handlers sit on the document,
  // so stopping the bubble from a bubble listener stops nothing — registration
  // order decides, and it is not ours to decide.
  //
  // Measured before the fix: pressing a bucket opened the details panel on the
  // bucket's own detail string and showed an empty object.
  test("a press on a bucket reaches the editor rather than the details panel", () => {
    assert.match(WORK_SCRIPT, /closest\("\.work-pill-hit"\)/, "it answers a bucket");
    assert.match(WORK_SCRIPT, /ev\.stopPropagation\(\);[\s\S]{0,200}openEditor\(/, "and stops the press going further");
    assert.match(WORK_SCRIPT, /\},\s*true,\s*\)/, "in the capture phase, ahead of every bubble listener");
  });

  // THE EDITOR AND THE MACHINE SHARE ONE DOCUMENT. A row is dragged FROM the
  // editor ONTO a state, and no drop crosses two documents — so opening it may
  // never be a navigation.
  test("opening it is never a navigation, because the drag could not cross one", () => {
    assert.ok(!WORK_SCRIPT.includes("navigateTo"), "nothing in the work client navigates");
    assert.ok(!/location\.href\s*=/.test(WORK_SCRIPT), "and nothing sets a location");
  });
});

// ONE HOME FOR READING AND FOR WRITING.
//
// The two WRITERS fell back to `.se/` when no record was bound. The seven
// READERS did not, so the engine wrote work the card could not see: the served
// editor said "no record is open" while eleven pieces of work sat on disk.
// see dsp-the-work-store.md#one-home-for-reading-and-writing
describe("reading and writing agree on where work lives", () => {
  test("with nothing bound the home is the local folder, which is where the mint writes", () => {
    const root = freshRoot();
    gitInit(root, true);

    const home = new Session(root).workHome();

    assert.equal(home, join(root, ".se"), "work at the front desk is local and unpublished");
  });

  test("work minted with nothing bound is read back, not reported as absent", () => {
    const root = freshRoot();
    gitInit(root, true);
    const session = new Session(root);
    mint(session.workHome(), "front_desk", [demand("fix the wire")], NOW);

    const all = readAllWork(root);

    assert.equal(all.items.length, 1, "the piece of work the mint wrote");
    assert.equal(all.items[0].statement, "fix the wire");
  });

  test("every record's work is read, not only the one a walk happens to stand in", async () => {
    const root = freshRoot();
    gitInit(root, true);
    const session = new Session(root);
    for (let i = 0; i < 2; i++) await session.advance();
    checkDocs(session);
    for (let i = 0; i < 3; i++) await session.advance();
    session.setAutonomy(1);
    const it = String(session.iterationSeed("see it all", "two homes, one list").seeded);
    pinIteration(root, itFind(root, it), "major");
    session.iterationOpen(it);
    mint(session.workHome(), `iterations/${it}/write-requirements`, [demand("in the record")], NOW);
    mint(join(root, ".se"), "front_desk", [demand("in the private home")], NOW);

    const said = readAllWork(root).items.map((i) => i.statement);

    assert.ok(said.includes("in the record"), "the record's own work");
    assert.ok(said.includes("in the private home"), "and the work that belongs to no record");
  });
});

// THE PAYLOAD LEG, which had nothing but a substring match on the client.
// see ux.md#fix-the-whole-wire
describe("the lane door carries all three acts", () => {
  /** A session with an iteration open, and one piece of work in it. */
  async function bound(): Promise<{ session: Session; id: string }> {
    const root = freshRoot();
    gitInit(root, true);
    const session = new Session(root);
    for (let i = 0; i < 2; i++) await session.advance();
    checkDocs(session);
    for (let i = 0; i < 3; i++) await session.advance();
    session.setAutonomy(1);
    const it = String(session.iterationSeed("prove the door", "three acts reach one writer").seeded);
    pinIteration(root, itFind(root, it), "major");
    session.iterationOpen(it);
    const report = mint(String(session.workHome()), `iterations/${it}/write-requirements`, [demand("wire the door")], NOW);
    return { session, id: report.minted[0].id };
  }

  test("restate renames it, and needs no comment about starting or finishing", async () => {
    const { session, id } = await bound();

    const answer = session.workAct("restate", id, "wire the door, and its three acts");

    assert.equal(answer.statement, "wire the door, and its three acts");
  });

  test("take and settle still demand one", async () => {
    const { session, id } = await bound();

    assert.throws(() => session.workAct("take", id, "   "), /comment/);
    assert.throws(() => session.workAct("settle", id, ""), /reason|comment/);
  });

  test("a fourth act is refused, and the refusal names all three", async () => {
    const { session, id } = await bound();

    assert.throws(
      () => session.workAct("delete", id, "whatever"),
      (e: unknown) => /take, settle or restate/.test(String((e as { expected?: string }).expected ?? "")),
    );
  });
});

describe("restating what a piece of work is", () => {
  test("the statement is rewritten and the rest is left alone", () => {
    const root = freshRoot();
    const at = join(root, ".se");
    const id = mint(at, "iterations/i1/build", [demand("wire the pill")], NOW).minted[0].id;

    const item = restate(at, id, "wire the pill, and its click");

    assert.equal(item.statement, "wire the pill, and its click");
    assert.equal(item.place, "iterations/i1/build", "renaming does not move it");
    assert.equal(item.status, "open", "and does not close it");
  });

  test("an empty statement is refused, because unnamed work cannot be judged later", () => {
    const root = freshRoot();
    const at = join(root, ".se");
    const id = mint(at, "iterations/i1/build", [demand("wire the pill")], NOW).minted[0].id;

    assert.throws(() => restate(at, id, "   "), /statement/);
  });
});
