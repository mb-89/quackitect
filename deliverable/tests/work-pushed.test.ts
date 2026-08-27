// THE PILLS ARE PUSHED. A token minted, taken or settled moves a number the
// page watches, and the drawing redraws under the reader.
//
// THE WIRE HAS FOUR LEGS and this file walks the two the engine owns: the
// store's signal, and the payload carrying it. The client leg is asserted
// against the served script; the DOM leg is work-pill-drawn.test.ts.
//
// see dsp-mirror-render.md#the-pills-are-pushed
import { strict as assert } from "node:assert";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { LIVE } from "../engine/renderclient-live.ts";
import { type MintDemand, mint, settle, take, workSignal } from "../engine/workstore.ts";

const NOW = "2026-08-26T10:00:00Z";

function demand(statement: string): MintDemand {
  return { source: "evidence", source_ref: "docs/a.md", step: "", statement, difficulty: "mechanical" };
}

function home(): string {
  return mkdtempSync(join(tmpdir(), "se-work-pushed-"));
}

describe("the work store publishes a signal that moves", () => {
  test("an empty record signals zero, and a record with no home signals zero too", () => {
    assert.equal(workSignal(home()), 0);
    assert.equal(workSignal(undefined), 0);
  });

  test("minting moves it", () => {
    const at = home();
    const before = workSignal(at);

    mint(at, "iterations/i1/build", [demand("wire it")], NOW);

    assert.notEqual(workSignal(at), before);
  });

  // THE FOLDER'S OWN MODIFICATION TIME WOULD MISS BOTH OF THESE. Neither adds
  // nor removes a file; each rewrites one in place.
  test("taking moves it, because a take rewrites the item rather than adding one", () => {
    const at = home();
    const id = mint(at, "iterations/i1/build", [demand("wire it")], NOW).minted[0].id;
    const before = workSignal(at);

    take(at, id, "the walker", "picking it up");

    assert.notEqual(workSignal(at), before);
  });

  test("settling moves it", () => {
    const at = home();
    const id = mint(at, "iterations/i1/build", [demand("wire it")], NOW).minted[0].id;
    take(at, id, "the walker", "picking it up");
    const before = workSignal(at);

    settle(at, id, "done", { reason: "it is wired", now: NOW });

    assert.notEqual(workSignal(at), before);
  });
});

describe("the page acts on the signal", () => {
  test("a changed signal redraws the machine", () => {
    assert.ok(LIVE.includes("a.work !== lastWork"), "the client compares it");
    // TWO SURFACES REPAINT, and each owns its own. The drawing morphs; the work
    // editor is morph-ignored and redraws through its own client, because one
    // repaint carrying the editor's server-side defaults would shut it under
    // the reader.
    assert.ok(LIVE.includes("lastWork = a.work;"), "the change is adopted before anything redraws");
    assert.ok(LIVE.includes("window.seRedrawWork()"), "the editor redraws itself");
    assert.match(LIVE, /window\.seRedrawWork\(\);\s*\n\s*refresh\(\);/, "and the drawing follows in the same pass");
  });

  test("the first answer adopts the value rather than redrawing for it", () => {
    // A page load would otherwise redraw itself once for work that was already
    // drawn on the page it was served.
    assert.ok(LIVE.includes("if (lastWork === null) lastWork = a.work;"));
  });
});
