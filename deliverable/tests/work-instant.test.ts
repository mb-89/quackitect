// NOTHING A PERSON DOES NEEDS A RELOAD (owner, made a standing rule).
//
// THE WIRE HAS FOUR LINKS and a break in any one of them looks identical from
// outside: the act appears not to have happened. Each of these pins one link.
//
// THE LINK THAT BROKE TWICE was the second. The work store wrote the file and
// told nobody, so the editor re-rendered from an index that had not heard, and
// the reader saw the state before their own act until they reloaded.
//
// see ux.md#nothing-a-person-does-needs-a-reload
import { strict as assert } from "node:assert";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { renderMirror } from "../engine/render.ts";
import { STYLE } from "../engine/renderstyle.ts";
import { Session } from "../engine/session.ts";
import { warmRows, warmVault } from "../engine/vault.ts";
import { workCard } from "../engine/work-card.ts";
import { WORK_SCRIPT } from "../engine/workclient.ts";
import {
  BACKLOG,
  boundToItsState,
  groupIsPlace,
  homeFor,
  type MintDemand,
  mintBothSources,
  place,
  readOne,
  rebucket,
} from "../engine/workstore.ts";
import { freshRoot } from "./helpers.ts";

const NOW = "2026-08-27T10:00:00Z";
const AT = "iterations/i-test/decompose";

function demand(statement: string): MintDemand {
  return { source: "evidence", source_ref: `docs/${statement.replace(/ /g, "-")}.md`, step: "", statement, difficulty: "mechanical" };
}

/** THE ENGINE'S OWN SOURCE. A rule about where a call must live is checked by
 *  reading the file that must carry it. */
function engineSource(name: string): string {
  return readFileSync(fileURLToPath(new URL(`../engine/${name}`, import.meta.url)), "utf8");
}

function root(): string {
  const r = freshRoot();
  mkdirSync(join(r, "spec", "iterations", "i-test"), { recursive: true });
  return r;
}

/** What the warm index says a token's bucket is, right now. */
function indexedBucket(r: string, id: string): string | undefined {
  const row = (warmRows(r) ?? []).find((x) => String((x as { id?: unknown }).id ?? "") === id);
  return row === undefined ? undefined : String((row as { bucket?: unknown }).bucket ?? "");
}

describe("a work write reaches the index without anybody reloading", () => {
  test("filing into a bucket is visible in the index at once", async () => {
    const r = root();
    const minted = mintBothSources(r, AT, [demand("wire the pill")], NOW).minted[0];
    const home = homeFor(r, AT, "record");
    await warmVault(r);
    assert.equal(indexedBucket(r, minted.id), "", "nothing is filed yet");

    rebucket(home, minted.id, "this afternoon");

    assert.equal(indexedBucket(r, minted.id), "this afternoon", "the index heard it — no reload, no watcher wait");
  });

  // THE FIX IS AT THE ONE WRITER so no future caller can forget it.
  test("the store tells the index itself, rather than leaving it to callers", () => {
    const src = engineSource("workstore.ts");

    assert.match(src, /function writeItem[\s\S]{0,600}noteFileChanged\(where\)/, "every write announces itself");
    assert.match(src, /noteFileChanged\(gone, true\)/, "and so does every delete");
  });

  test("the editor and the drawing both repaint on the same signal", () => {
    const html = renderMirror({ session: new Session(freshRoot()), root: freshRoot(), lastPacket: undefined, mode: "manual" });

    assert.ok(html.includes("window.seRedrawWork()"), "the editor is told");
    assert.match(html, /window\.seRedrawWork\(\);\s*\n\s*refresh\(\);/, "and the drawing follows in the same pass");
  });

  test("an act repaints without waiting for a poll", () => {
    assert.match(WORK_SCRIPT, /if \(typeof refresh === "function"\) refresh\(\)/, "the drawing is repainted by the act itself");
    assert.match(WORK_SCRIPT, /restoreLayout\(here\)/, "and the reader's layout survives the repaint");
  });

  // A TOKEN NOBODY HAD SEEN BEFORE IS THE CASE THAT BROKE. Re-reading a row the
  // index already holds is one thing; ADDING one it has never seen is another,
  // and a reader minting work sees only the second.
  test("a token minted after the index was built is in it at once", async () => {
    const r = root();
    await warmVault(r);
    const before = (warmRows(r) ?? []).length;

    const minted = mintBothSources(r, AT, [demand("appear at once")], NOW).minted[0];

    assert.equal((warmRows(r) ?? []).length, before + 1, "the index grew by one without a rebuild");
    assert.equal(indexedBucket(r, minted.id), "", "and the new row is readable, not a placeholder");
  });

  // THE THIRD LINK OF THE WIRE. The write lands and the index hears it, and
  // every open page was still waiting for its next poll to find out — which is
  // the reload the rule forbids, arriving on a timer instead of a keypress.
  //
  // IT IS WIRED AT THE ONE SUBSCRIPTION, never in each route. Six work routes
  // each had to remember to wake the surfaces, and not one of them did.
  test("a write wakes every held page, and no route has to remember", () => {
    const src = engineSource("mirror.ts");

    assert.match(
      src,
      /subscribeModelMutations\(o\.root, \(batch\) => \{[\s\S]{0,400}o\.session\.notifyChange\(\);/,
      "the model's own mutation signal wakes the surfaces",
    );
  });
});

// THE EDITOR IS LEFT, THE DRAWING IS RIGHT, and the seam between them is
// UPRIGHT (owner). It runs top to bottom and drags left and right.
describe("the seam between the editor and the drawing is upright", () => {
  test("the page lays them side by side", () => {
    const html = renderMirror({ session: new Session(freshRoot()), root: freshRoot(), lastPacket: undefined, mode: "manual" }, "machine");

    assert.match(html, /main\{padding:10px;display:flex;flex-direction:row/, "the editor is beside the drawing, not above it");
    assert.match(
      html,
      /<\/aside><div class="work-seam" data-seam="dock"[^>]*><\/div><div class="machine-lane">/,
      "editor, then seam, then drawing",
    );
  });

  test("every seam drags left and right, because everything it splits is side by side", () => {
    assert.match(STYLE, /\.work-seam \{[^}]*cursor: col-resize/, "upright, and dragged across");
    assert.ok(!/\.work-seam[^{]*\{[^}]*row-resize/.test(STYLE), "no seam of the editor's drags up and down");
    assert.match(STYLE, /#work-dock \{[^}]*width: 46vw/, "the editor takes a width, because the split is left to right");
    // THE DRAG READS THE AXIS IT SPLITS. Reading the other one moved nothing,
    // and the seam looked like a bar that could not be dragged at all.
    assert.match(WORK_SCRIPT, /at: ev\.clientX, from: sized\.getBoundingClientRect\(\)\.width/, "the drag follows the pointer across");
    assert.match(WORK_SCRIPT, /sizing\.el\.style\.width = px/, "and it sizes a width");
    assert.ok(!WORK_SCRIPT.includes("style.height = px"), "nothing here sizes a height");
  });
});

// A DROP INSIDE THE EDITOR LANDS IN A GROUP (owner) — onto its heading, or onto
// a row already in it. It works in one column and across two.
describe("a row is dragged between groups inside the editor", () => {
  test("the client reads the group it landed in, in either column", () => {
    assert.ok(WORK_SCRIPT.includes('closest(".tbl-group")'), "a heading is a target");
    assert.ok(WORK_SCRIPT.includes("groupHeadOf(row)"), "and so is any row in that group");
    assert.match(
      WORK_SCRIPT,
      /send\("\/work\/regroup", \{ paths: \[path\], group: t\.to, slot: t\.slot \}\)/,
      "the drop names the group and which of its buckets",
    );
    assert.ok(!WORK_SCRIPT.includes('pane.getAttribute("data-side")'), "which column it was never decides anything");
  });

  test("the empty group is not a destination", () => {
    assert.match(WORK_SCRIPT, /value === EMPTY_GROUP/, "filing into nothing is not filing");
  });

  // THE NAME ALONE DOES NOT SAY WHICH, so the store is asked.
  test("the store tells a place from a bucket", () => {
    const r = root();
    const minted = mintBothSources(r, AT, [demand("wire the pill")], NOW).minted[0];
    const home = homeFor(r, AT, "record");

    assert.equal(groupIsPlace(r, AT), true, "a name work stands at is a place");
    assert.equal(groupIsPlace(r, "backlog"), true, "and so is the backlog");
    assert.equal(groupIsPlace(r, "this afternoon"), false, "a name nobody stands at is a bucket");

    rebucket(home, minted.id, "this afternoon");
    assert.equal(groupIsPlace(r, "this afternoon"), false, "filing work under it does not make it a place");
  });

  test("landing on a place moves the work, and landing on a bucket only files it", () => {
    const src = engineSource("mirror.ts");

    assert.match(src, /"\/work\/regroup":/, "the route exists");
    assert.match(
      src,
      /if \(at !== undefined\) byHand\(home, id, at, slot\);\s*\n\s*else rebucket\(home, id, group\);/,
      "two acts, one drop",
    );
  });
});

// WORK A STATE MINTED BELONGS TO THAT STATE (owner). It exists because the
// state's card demands it, and re-entering the state mints it again — so a move
// elsewhere duplicates rather than moves.
describe("a state's own work stays at that state", () => {
  test("work a state minted is bound to it, and work a hand added is not", () => {
    const r = root();
    const derived = mintBothSources(r, AT, [demand("wire the pill")], NOW).minted[0];
    const added: MintDemand = { source: "hand", source_ref: "hand/test", step: "", statement: "test" };
    const free = mintBothSources(r, BACKLOG, [added], NOW).minted[0];

    assert.equal(boundToItsState(derived), true, "its card demands it");
    assert.equal(boundToItsState(free), false, "nothing demanded this one");
  });

  // THE RULE BINDS THE HAND, NOT THE MOVER. The engine's own placement moves
  // work between positions on purpose — req-moving-work-releases-the-state-it-
  // left — so a refusal inside `place` contradicted a standing requirement, and
  // did: six tests went red on it.
  test("the drag door refuses it, and the store's own mover does not", () => {
    const r = root();
    const minted = mintBothSources(r, AT, [demand("wire the pill")], NOW).minted[0];
    const home = homeFor(r, AT, "record");

    place(home, minted.id, "iterations/i-test/verify");
    assert.equal(readOne(home, minted.id)?.place, "iterations/i-test/verify", "the engine may still place it");

    const src = engineSource("mirror.ts");
    assert.match(src, /function byHand\(/, "the person's door is its own function");
    assert.match(src, /item\.place !== to && boundToItsState\(item\)/, "and that is where the refusal lives");
    assert.match(src, /cannot be dragged out/, "saying so in words a reader can act on");
  });

  // FILING IS NOT MOVING. A bucket groups the work and says nothing about where
  // it is done, so the rule above has nothing to say about it.
  test("derived work can still be filed under a bucket", () => {
    const r = root();
    const minted = mintBothSources(r, AT, [demand("wire the pill")], NOW).minted[0];
    const home = homeFor(r, AT, "record");

    rebucket(home, minted.id, "this afternoon");

    assert.equal(readOne(home, minted.id)?.bucket, "this afternoon");
    assert.equal(readOne(home, minted.id)?.place, AT, "and it did not move");
  });
});

// A DROP ONTO A PLACE UNFILES THE WORK, even the place it already stands at.
//
// MEASURED: two tokens were filed under a bucket and could not be dropped back
// onto their own state. The place was unchanged, the mover returned early, and
// the bucket stayed — so the drop landed and nothing happened at all.
describe("a drop onto a place takes the work out of its bucket", () => {
  test("dropping onto the state it already stands at clears the bucket", () => {
    const r = root();
    const minted = mintBothSources(r, AT, [demand("wire the pill")], NOW).minted[0];
    const home = homeFor(r, AT, "record");
    rebucket(home, minted.id, "test2");
    assert.equal(readOne(home, minted.id)?.bucket, "test2", "it is filed");

    place(home, minted.id, AT);

    assert.equal(readOne(home, minted.id)?.bucket, "", "the drop brought it home");
    assert.equal(readOne(home, minted.id)?.place, AT, "and left the place alone");
  });

  test("an unfiled piece at its own place is left entirely alone", () => {
    const r = root();
    const minted = mintBothSources(r, AT, [demand("wire the pill")], NOW).minted[0];
    const home = homeFor(r, AT, "record");

    const said = place(home, minted.id, AT);

    assert.deepEqual(said, { from: AT, to: AT }, "nothing to do, and nothing done");
  });
});

// EVERY COLUMN SELECTS, THE FIRST ONE INCLUDED (owner). Not being editable is
// not a reason not to be selectable.
describe("a row is selected from any column", () => {
  test("the statement column selects like every other", () => {
    assert.ok(!WORK_SCRIPT.includes('if (ev.target.closest(".tbl-opens") !== null) return;'), "the first column no longer opts out");
    assert.match(WORK_SCRIPT, /row\.classList\.toggle\("work-ticked"\)/, "any press on a row ticks it");
  });

  test("the note still opens, on a double press", () => {
    assert.match(WORK_SCRIPT, /addEventListener\("dblclick"/, "the rarer act gets the rarer gesture");
    assert.ok(WORK_SCRIPT.includes('closest(".work-pane .tbl-opens")'), "and it is the statement that opens");
  });

  test("the statement is still a door on the page", async () => {
    const r = root();
    mintBothSources(r, AT, [demand("wire the pill")], NOW);
    await warmVault(r);

    assert.match(workCard(r, ""), /<a class="doclink tbl-link"[^>]*>wire the pill<\/a>/, "it is a link to the markdown");
  });
});
