// THE BUCKET CONTROLS, AND THE LAYOUT AROUND THEM.
//
// EVERY ONE OF THESE WAS REPORTED FROM THE SCREEN. The pattern is always the
// same: the thing was built, its unit passed, and a layer further out made it
// dead or invisible.
//
// THE DIALOG IS THE SHARPEST CASE. A VS Code webview refuses a browser prompt
// outright, so a control that asked for one did nothing at all when pressed —
// no bucket, no error, nothing to read. Nothing in the unit could see that.
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
import { freshBucket, homeFor, type MintDemand, mintBothSources, rebucket } from "../engine/workstore.ts";
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

describe("the bucket controls work without a dialog", () => {
  test("nothing on this surface asks for a browser prompt", () => {
    assert.ok(!WORK_SCRIPT.includes("window.prompt"), "a webview has none, so a control that needs one is dead on press");
    assert.ok(!WORK_SCRIPT.includes("window.confirm"), "and none for a confirm either");
  });

  // FILING COMES FIRST AND NAMING COMES SECOND (owner). The press makes a
  // bucket at once, and the reader names it when they can see what landed.
  test("filing sends no name at all, and the engine picks one", () => {
    assert.match(WORK_SCRIPT, /send\("\/work\/bucket", \{ paths: [\s\S]*?bucket: "" \}\)/, "the client files without naming");
  });

  test("a fresh name is one nobody has used, and it counts up", () => {
    const r = root();
    const three = mintBothSources(r, AT, [demand("one"), demand("two"), demand("three")], NOW).minted;
    const home = homeFor(r, AT, "record");

    assert.equal(freshBucket(r), "unnamed", "the first one is plain");
    rebucket(home, three[0].id, "unnamed");
    assert.equal(freshBucket(r), "unnamed 2", "the next steps past it");
    rebucket(home, three[1].id, "unnamed 2");
    assert.equal(freshBucket(r), "unnamed 3");
  });

  test("the new name is typed in the header, and Enter commits it", async () => {
    const r = root();
    await warmVault(r);

    const html = workCard(r, "");

    assert.match(html, /class="work-rename-field"[^>]*hidden/, "the field waits out of the way");
    assert.ok(WORK_SCRIPT.includes('closest(".work-rename-field")'), "the client listens on it");
    assert.match(WORK_SCRIPT, /ev\.key !== "Enter"/, "and Enter is what commits");
    assert.match(WORK_SCRIPT, /ev\.key === "Escape"/, "with Escape to back out");
  });

  test("the button says what it renames", async () => {
    const r = root();
    await warmVault(r);

    assert.match(workCard(r, ""), /rename bucket<\/button>/, "a place is never renamed, so the button names the bucket");
  });
});

// THE PLACE IS ALREADY THE GROUPING wherever no bucket stands, so a column
// would reprint the group heading on every row under it.
describe("the editor shows what is not already on the row", () => {
  test("neither view carries a place column", async () => {
    const r = root();
    mintBothSources(r, AT, [demand("wire the pill")], NOW);
    await warmVault(r);

    const html = workCard(r, "");

    assert.ok(!html.includes('data-col="place"'), "the place is the group heading, not a column");
    assert.match(html, /data-col="statement"/, "the statement stays");
    assert.match(html, /data-col="status"/, "and so does the status");
  });

  // THE EXPAND BUTTON OPENED NOTHING USEFUL from inside the editor (owner).
  test("the editor carries no expand button", async () => {
    const r = root();
    await warmVault(r);

    assert.ok(!workCard(r, '<button class="expand">X</button>').includes("expand"), "a control that does nothing is not a control");
  });
});

// A SEAM SPLITS TWO THINGS AND LIES ACROSS THE DIRECTION IT SPLITS (owner).
// Drawn as the editor's last child it rendered UNDER the editor, which
// separates the editor from nothing at all.
describe("the seam sits between the editor and the drawing", () => {
  test("the seam is a sibling of both, written in the page", () => {
    const html = renderMirror({ session: new Session(freshRoot()), root: freshRoot(), lastPacket: undefined, mode: "manual" }, "machine");

    assert.match(
      html,
      /<\/aside><div class="work-seam" data-seam="dock"[^>]*><\/div><div class="machine-lane">/,
      "editor, then seam, then drawing",
    );
  });

  test("the editor is not inside the seam and the seam is not inside the editor", async () => {
    const r = root();
    await warmVault(r);

    assert.ok(!workCard(r, "").includes('data-seam="dock"'), "the card draws only the seam it owns");
  });

  test("the page lays them side by side, so the seam between them is upright", () => {
    const html = renderMirror({ session: new Session(freshRoot()), root: freshRoot(), lastPacket: undefined, mode: "manual" }, "machine");

    assert.match(html, /main\{padding:10px;display:flex;flex-direction:row/, "the editor sits left of the drawing");
    assert.match(STYLE, /\.work-seam \{[^}]*cursor: col-resize/, "and every seam here drags left and right");
  });

  test("a shut editor takes its seam with it", () => {
    assert.match(STYLE, /#work-dock\[hidden\] \+ \.work-seam \{ display: none; \}/, "a seam with nothing above it splits nothing");
  });

  // THE SEAM WENT DEAD BY READING THE WRONG AXIS. It followed the pointer's Y
  // and set a height while the layout was a row, so it moved nothing at all.
  test("the client drags every seam along the axis it splits", () => {
    assert.match(WORK_SCRIPT, /at: ev\.clientX, from: sized\.getBoundingClientRect\(\)\.width/, "left and right, for a side-by-side split");
    assert.match(WORK_SCRIPT, /sizing\.el\.style\.width = px/, "and it sizes a width");
  });
});
