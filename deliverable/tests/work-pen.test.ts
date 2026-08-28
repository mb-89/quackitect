// The holding pen: work DRAWN from a live source rather than minted into a
// store. Two sources feed it, and until now neither appeared as work at all —
// so a person looking at the retro saw no notes standing there, and a person
// looking at the front desk saw no backlog.
//
// see dsp-the-work-store.md#work-drawn-from-a-live-source
import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { appendNote, drainNote } from "../engine/inbox.ts";
import { generateIterations } from "../engine/iterations-draw.ts";
import { seDir } from "../engine/paths.ts";
import { recordAlias } from "../engine/viewmodel.ts";
import { bucketOf } from "../engine/workoffer.ts";
import { NOTES_ARE_DRAWN_AT, penSignal, penWork } from "../engine/workpen.ts";
import { BACKLOG, BACKLOG_IS_DRAWN_AT, readAllWork } from "../engine/workstore.ts";

const REPO = fileURLToPath(new URL("../..", import.meta.url));

// TWO CORRECT NAMES THAT NEVER MET.
//
// A record is PLACED by its folder — i23-judgment-the-ui-sitting-cut-the-html-mir
// — and DRAWN by its number, i23. Every count on a seeded record was therefore
// computed and filed under a key no box carried, so nothing showed.
//
// MEASURED 2026-08-28, and the owner found it rather than a test: 299 items
// were routed onto 34 seeded records and the container showed none of it.
//
// THIS CASE HOLDS THE TWO VOCABULARIES TOGETHER, which is the only shape that
// catches it coming back. Neither half is wrong alone.
describe("a record's count reaches the box that draws it", () => {
  test("the alias turns a placement name into a drawing name, and leaves others alone", () => {
    assert.equal(recordAlias("i23-judgment-the-ui-sitting-cut-the-html-mir"), "i23");
    assert.equal(recordAlias("i7-the-trace-sharpens-finer-grain-than-file"), "i7");
    assert.equal(recordAlias("retro"), "", "a main-machine state is not a record");
    assert.equal(recordAlias(BACKLOG), "", "the backlog is not a record");
    assert.equal(recordAlias("i23"), "", "a name already short needs no alias");
  });

  test("every box the container draws is reachable from some record's folder name", () => {
    // THE GENERATOR ANSWERS {decl: {states}}, and reading `.states` off the
    // outer object gives an empty list that looks like an empty container.
    const made = generateIterations(REPO) as { decl?: { states?: { id: string }[] }; states?: { id: string }[] };
    const boxes = made.decl?.states ?? made.states ?? [];
    const records = boxes.map((s) => s.id).filter((id) => /^i\d+$/.test(id));
    assert.ok(records.length > 10, `the container draws its records — got ${records.length}`);
    // The alias is the ONLY bridge, so every drawn record must be one it can
    // produce. A box named any other way would be unreachable from a placement.
    for (const id of records) {
      assert.equal(recordAlias(`${id}-some-folder-name`), id, `${id} is reachable from a folder name`);
    }
  });
});

const fresh = (): string => mkdtempSync(join(tmpdir(), "se-pen-"));

const NOTE = "the arrival banner prints twice on a cold start";
const STATEMENT = "a duplicated greeting when the box wakes up";
const READY = "ready when somebody can make it happen on demand";

describe("the pen draws work from its two live sources", { concurrency: true }, () => {
  test("a pending note stands as work at the state that drains it", () => {
    const root = fresh();
    const { captured } = appendNote(seDir(root), NOTE);
    const drawn = penWork(root);
    assert.equal(drawn.length, 1, "one pending note did not draw one piece of work");
    assert.equal(drawn[0].id, captured, "the drawn work is not addressed by the note's own ref");
    assert.equal(drawn[0].place, NOTES_ARE_DRAWN_AT, "the note did not land at the state that drains it");
    assert.equal(drawn[0].source, "pen", "the drawn work does not declare the source that exists for it");
    // A PENDING NOTE IS THE RETRO'S OUTPUT (owner). Draining the inbox is what
    // a retro PRODUCES, and the retro cannot be left until it is done — so the
    // note belongs in the bucket that blocks.
    //
    // IT DREW AS PENDING BEFORE, and pending never takes a green away. That
    // made the count a display with no consequence: 86 notes could stand at the
    // retro and the retro read finished.
    assert.equal(bucketOf(drawn[0]), "out");
  });

  // THE BUCKET AND THE HOLD ARE TWO HALVES OF ONE RULING. Drawing the note as
  // output greys the retro; holding on it is what stops the walk leaving. The
  // hold reads the work HOMES, and a drawn note has none — so the pen has to be
  // read beside them or the count is a display with no consequence.
  test("the leaving hold reads the pen, so a note is not left behind", () => {
    const src = readFileSync(fileURLToPath(new URL("../engine/session.ts", import.meta.url)), "utf8");
    const held = src.slice(src.indexOf("private leavingHeld("));

    assert.match(held, /penWork\(root\)/, "the hold asks the pen, not only the stores");
    assert.match(held, /i\.slot !== "pending"/, "a pool token draws pending, and pending has never held anything");
    // THE LIFT IS NOW A PARAMETER, because one caller refuses it. A gate asks
    // the same hold with the lift switched off, so emergency cannot wave a
    // record's open work through the thumb.
    assert.match(held, /const lifted = lift && this\._emergency;/, "emergency lifts it, unless the caller says otherwise");
    assert.match(held, /lifted \? \[\]/, "and the pen follows the same switch as the stores");
  });

  test("draining the note takes the work with it, and mints one that is pending at the desk", () => {
    const root = fresh();
    const { captured } = appendNote(seDir(root), NOTE);
    drainNote(seDir(root), captured, "backlog", READY, true, STATEMENT, root);
    const drawn = penWork(root);
    assert.ok(!drawn.some((i) => i.id === captured), "a drained note still draws work — the source is live, so the work goes with it");
    const pooled = drawn.filter((i) => i.id.startsWith("wt-"));
    assert.equal(pooled.length, 1, "the minted pool token did not draw one piece of work");
    // THE PLACE STAYS THE BACKLOG and the drawing is what puts it at the desk.
    // Filing it under the desk directly would say somebody had placed it there.
    assert.equal(pooled[0].place, BACKLOG, "a pool token nobody placed does not sit in the backlog");
    assert.notEqual(BACKLOG, BACKLOG_IS_DRAWN_AT, "the place and the state it draws at are different things");
    assert.equal(bucketOf(pooled[0]), "pending", "the backlog is the desk's pending bucket and nothing else");
    assert.match(pooled[0].statement, /duplicated greeting/, "the drawn work does not carry the authored statement");
  });

  // A TOKEN LEAVES THE BACKLOG BY SAYING WHERE IT BELONGS, in its own file.
  //
  // The backlog is a PENDING bucket, so work is moved out of it to whatever
  // owns it — an iteration, the overhaul, a state. Nothing new is needed for
  // that: the token is a file, anybody who may edit a file may move it, and
  // the default when it says nothing is the backlog it was minted into.
  test("a place written into a token's own file moves it out of the backlog", () => {
    const root = fresh();
    const { captured } = appendNote(seDir(root), NOTE);
    drainNote(seDir(root), captured, "backlog", READY, true, STATEMENT, root);

    const id = penWork(root).filter((i) => i.id.startsWith("wt-"))[0].id;
    const file = join(root, "spec", "trace", "work-token", `${id}.md`);
    const before = readFileSync(file, "utf8");
    assert.ok(!before.includes("\nplace:"), "a minted token already names a place, so the default cannot be observed");

    writeFileSync(file, before.replace(/^ready_when:/m, "place: iterations/i23\nready_when:"));

    const moved = penWork(root).filter((i) => i.id === id);
    assert.equal(moved.length, 1, "the moved token stopped being drawn at all");
    assert.equal(moved[0].place, "iterations/i23", "a place in the file did not move the token");
    assert.notEqual(moved[0].place, BACKLOG, "the token is still standing in the backlog it was moved out of");
  });

  test("the whole-project read carries the drawn work and names no home for it", () => {
    const root = fresh();
    const { captured } = appendNote(seDir(root), NOTE);
    const all = readAllWork(root);
    assert.ok(
      all.items.some((i) => i.id === captured),
      "the reader every surface uses cannot see the pen",
    );
    // NO HOME IS THE POINT. A drawn item has no file, so an act that names one
    // refuses instead of writing a status nothing would ever read back.
    assert.equal(all.homeById.get(captured), undefined);
  });
});

describe("the pen moves the number the drawing watches", { concurrency: true }, () => {
  test("capturing a note moves the signal", () => {
    const root = fresh();
    const before = penSignal(root);
    appendNote(seDir(root), NOTE);
    // THE PILLS ARE PUSHED, NOT POLLED. A count that moved on disk while the
    // number stood still left the drawing showing yesterday's figure until an
    // unrelated write nudged it.
    assert.notEqual(penSignal(root), before, "a captured note left the signal where it was");
  });

  test("minting a pool token moves it again", () => {
    const root = fresh();
    const { captured } = appendNote(seDir(root), NOTE);
    const before = penSignal(root);
    drainNote(seDir(root), captured, "backlog", READY, true, STATEMENT, root);
    assert.notEqual(penSignal(root), before, "a minted pool token left the signal where it was");
  });

  test("a tree with neither source answers zero rather than throwing", () => {
    assert.equal(penSignal(fresh()), 0);
  });
});
