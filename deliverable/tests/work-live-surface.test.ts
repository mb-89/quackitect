// WHAT A READER SEES AND TOUCHES, and every one of these was reported from the
// screen rather than found by a check.
//
// THE PATTERN IN ALL OF THEM: the thing was built, its unit passed, and
// something one layer out made it invisible or undid it. That is what these
// pin — the layer out, not the unit.
//
// see ux.md#fix-the-whole-wire
import { strict as assert } from "node:assert";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { renderMirror } from "../engine/render.ts";
import { STYLE } from "../engine/renderstyle.ts";
import { Session } from "../engine/session.ts";
import { warmVault } from "../engine/vault.ts";
import { workCard } from "../engine/work-card.ts";
import { WORK_SCRIPT } from "../engine/workclient.ts";
import { bucketOf } from "../engine/workoffer.ts";
import { BACKLOG, BACKLOG_IS_DRAWN_AT, homeFor, type MintDemand, mintBothSources, place, readOne } from "../engine/workstore.ts";
import { freshRoot } from "./helpers.ts";

const NOW = "2026-08-27T10:00:00Z";
const AT = "iterations/i-test/decompose";

function demand(statement: string): MintDemand {
  return { source: "evidence", source_ref: `docs/${statement.replace(/ /g, "-")}.md`, step: "", statement, difficulty: "mechanical" };
}

function root(): string {
  const r = freshRoot();
  mkdirSync(join(r, "spec", "iterations", "i-test"), { recursive: true });
  return r;
}

// THE EMBEDDED CARD HIDES EVERY WIDGET HEADER, because VS Code draws the title
// itself. The work editor's header carries CONTROLS, so that rule hid the acts.
//
// MEASURED: the header rendered correctly and was invisible through two window
// reloads and a rebuild, and nothing in the tests could see it.
describe("the editor's header survives the embedded skin", () => {
  test("the solo rule that hides headers makes an exception for the editor", () => {
    const html = renderMirror(
      { session: new Session(freshRoot()), root: freshRoot(), lastPacket: undefined, mode: "manual" },
      undefined,
      undefined,
      undefined,
      true,
    );

    assert.match(html, /body\.solo \.widget-head \{ display: none; \}/, "the rule that caused it still stands");
    assert.match(html, /body\.solo \.work-widget > \.widget-head \{ display: flex; \}/, "and the editor's own header is excepted from it");
  });
});

// THE BACKLOG IS THE FRONT DESK'S PENDING BUCKET (owner). It is not a position,
// so the drawing had nowhere to put its count and put it nowhere at all.
describe("the backlog is drawn at the front desk", () => {
  test("work nobody placed counts against the desk rather than a state nothing draws", () => {
    const r = root();
    mintBothSources(r, BACKLOG, [demand("added from the controls")], NOW);

    const html = renderMirror({ session: new Session(r), root: r, lastPacket: undefined, mode: "manual" });

    assert.notEqual(BACKLOG, BACKLOG_IS_DRAWN_AT, "the place and the state it draws at are different things");
    assert.match(html, /data-drop="front_desk:pending"/, "the desk carries the bucket the backlog lands in");
  });

  test("a backlogged token is pending, and its place stays the backlog", () => {
    const r = root();
    const minted = mintBothSources(r, BACKLOG, [demand("added from the controls")], NOW).minted[0];

    assert.equal(bucketOf(minted), "pending");
    assert.equal(minted.place, BACKLOG, "where it is drawn never changes where it is");
  });
});

// A DROP ON A STATE SAID WHERE AND NOT WHICH BUCKET (owner), so everything
// landed in the derived one and the drop looked like it chose for you.
describe("every state carries three drop zones", () => {
  test("the drawing emits one zone per bucket, on every state", () => {
    const r = root();

    const html = renderMirror({ session: new Session(r), root: r, lastPacket: undefined, mode: "manual" });

    for (const kind of ["in", "pending", "out"]) {
      assert.match(html, new RegExp(`class="work-drop-zone ${kind}"`), `the ${kind} bucket is a target`);
    }
    assert.ok(!/work-drop-zone done/.test(html), "done is reached by finishing, so it is never a target");
  });

  test("the zones are invisible until a row is in the air", () => {
    assert.match(STYLE, /\.work-drop-zone \{[^}]*opacity: 0/, "nothing shows while nothing is being dragged");
    assert.match(STYLE, /body\.work-dragging \.work-drop-zone \{[^}]*opacity: 1/, "and they appear for the drag");
    assert.ok(WORK_SCRIPT.includes('classList.add("work-dragging")'), "the client raises them on dragstart");
    assert.ok(WORK_SCRIPT.includes('classList.remove("work-dragging")'), "and drops them again when it lands");
  });

  test("the client reads the zone and sends the bucket with the move", () => {
    assert.ok(WORK_SCRIPT.includes('closest("[data-drop]")'), "a zone is what it looks for first");
    assert.match(WORK_SCRIPT, /to: t\.to, slot: t\.slot/, "and the bucket rides the move");
  });

  // A SAID SLOT HAS TO SURVIVE THE DROP. Deriving it again on the next read
  // would put the work straight back where the reader moved it from.
  test("a drop into a bucket sticks, and the state's body clears it again", () => {
    const r = root();
    const minted = mintBothSources(r, AT, [demand("wire the pill")], NOW).minted[0];
    const home = homeFor(r, AT, "record");
    assert.equal(bucketOf(minted), "out", "evidence work is produced, so it derives to out");

    place(home, minted.id, AT, "in");
    const said = readOne(home, minted.id);
    assert.ok(said !== null && said !== undefined);
    assert.equal(bucketOf(said), "in", "the drop's word wins over the derivation");

    place(home, minted.id, AT, "");
    const derived = readOne(home, minted.id);
    assert.ok(derived !== null && derived !== undefined);
    assert.equal(bucketOf(derived), "out", "dropping on the body leaves the bucket to derive again");
  });

  test("nothing can be dropped into done, because done is reached by finishing", () => {
    const r = root();
    const minted = mintBothSources(r, AT, [demand("wire the pill")], NOW).minted[0];
    const home = homeFor(r, AT, "record");

    place(home, minted.id, AT, "done");

    assert.equal(readOne(home, minted.id)?.slot, "", "an unknown bucket is no bucket at all");
  });
});

// A WORK MOVE REPAINTED THE WHOLE PAGE, and the fresh markup carried this
// renderer's defaults — folded, one column. The reader read that as having to
// close the machine and open it again to see their own act.
describe("a work move repaints both surfaces and closes neither", () => {
  test("the dock is left alone by the page-wide morph", async () => {
    const r = root();
    mintBothSources(r, AT, [demand("wire the pill")], NOW);
    await warmVault(r);

    const html = workCard(r, "");

    assert.match(html, /id="work-dock" data-morph-ignore data-keep-style/, "the morph never touches it, and its width is the reader's");
  });

  test("the editor redraws itself, and the drawing follows in the same breath", () => {
    assert.ok(WORK_SCRIPT.includes("window.seRedrawWork = redraw"), "the editor offers its own repaint");
    assert.match(WORK_SCRIPT, /if \(typeof refresh === "function"\) refresh\(\)/, "and an act repaints the drawing at once");
  });

  test("the live client repaints both when the work signal moves", () => {
    const html = renderMirror({ session: new Session(freshRoot()), root: freshRoot(), lastPacket: undefined, mode: "manual" });

    assert.ok(html.includes("window.seRedrawWork()"), "the editor is told, rather than being morphed shut");
    assert.match(html, /a\.work !== lastWork/, "on the work signal, which is what a move changes");
  });
});

// ONE COLUMN UNTIL SOMEBODY ASKS FOR TWO (owner). A second column exists to
// drag a row into; a reader who is only reading wants the width.
describe("the second column ships shut and one button opens it", () => {
  test("the right pane and its seam are hidden as served", async () => {
    const r = root();
    mintBothSources(r, AT, [demand("wire the pill")], NOW);
    await warmVault(r);

    const html = workCard(r, "");

    assert.match(html, /data-side="right" hidden/, "the second column is shut");
    assert.match(html, /data-seam="panes"[^>]*hidden/, "and so is the seam that splits nothing");
    assert.ok(!/data-side="left" hidden/.test(html), "the first column is not");
  });

  test("one button toggles it, and says which way it stands", async () => {
    const r = root();
    await warmVault(r);

    const html = workCard(r, "");

    assert.match(html, /class="ghost work-second" aria-pressed="false"/, "shut, and it says so");
    assert.ok(WORK_SCRIPT.includes("function showSecond(open)"), "one function decides");
    assert.match(WORK_SCRIPT, /showSecond\(second\.getAttribute\("aria-pressed"\) !== "true"\)/, "and the press flips it");
  });
});
