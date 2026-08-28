// THE WORK EDITOR IS THE DATABASE, TWICE, SIDE BY SIDE.
//
// The surface tested here before was written from scratch: a plus per bucket, a
// narrowing box, a row's own editor panel, four hand-drawn columns. Every one of
// those is something the database already does, and the owner struck the lot.
//
// SO THESE CASES ASSERT REUSE, not markup. That the panes ARE database blocks,
// that they carry the database's own chrome, and that the one new control is the
// only new thing. A case pinning the shape of a row would be re-inventing the
// old surface in the test suite.
//
// THE DRAG ITSELF IS DEMONSTRATED, NOT TESTED. Whether a person can steer by
// dragging is a thing a person judges. WHAT IS TESTED IS THE WIRE — ux.md: two
// green halves are not a green wire, so each case asserts BOTH ends.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { renderMirror } from "../engine/render.ts";
import { Session } from "../engine/session.ts";
import { warmVault } from "../engine/vault.ts";
import { workCard } from "../engine/work-card.ts";
import { WORK_SCRIPT } from "../engine/workclient.ts";
import { type MintDemand, mint, rebucket } from "../engine/workstore.ts";
import { freshRoot } from "./helpers.ts";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const NOW = "2026-08-26T10:00:00Z";
const HERE = "iterations/i63/decompose";

function demand(name: string, extra: Partial<MintDemand> = {}): MintDemand {
  return { source: "step", source_ref: `meth.md#${name}`, step: name, statement: name, difficulty: "mechanical", ...extra };
}

function engine(file: string): string {
  return readFileSync(join(REPO_ROOT, "deliverable", "engine", file), "utf8");
}

/** A root that looks like the product, holding some work, with its vault read.
 *
 *  THE VAULT HAS TO BE WARM. The editor reads the same index the database does,
 *  and a cold one answers nothing — which is why the card says so rather than
 *  claiming no work matched.
 *
 *  THE WORK GOES IN A RECORD, NOT IN `.se/`. The vault excludes `.se` by design,
 *  so work in the private home is invisible to the editor — a real gap in the
 *  product, captured as a note, and not something a fixture should paper over. */
async function editor(statements: string[] = ["wire the pill"]): Promise<{ root: string; html: string }> {
  const root = freshRoot();
  mint(
    join(root, "spec", "iterations", "i-test"),
    HERE,
    statements.map((s) => demand(s)),
    NOW,
  );
  await warmVault(root);
  return { root, html: workCard(root, "") };
}

describe("the editor is the database, twice", () => {
  test("it draws two panes, and each one is a database block", async () => {
    const { html } = await editor();

    assert.match(html, /work-panes/, "the two sit side by side");
    assert.match(html, /data-side="left"/);
    assert.match(html, /data-side="right"/);
    assert.equal((html.match(/class="bs-block"/g) ?? []).length, 2, "two database blocks, not two hand-drawn lists");
  });

  // THE CHROME IS THE DATABASE'S OWN. A pane that had lost it would be the
  // custom surface growing back.
  test("each pane carries the database's own count, sort and properties", async () => {
    const { html } = await editor();

    assert.equal((html.match(/class="bs-chrome"/g) ?? []).length, 2, "one set of controls per pane");
    assert.match(html, /bs-level/, "the sort and group levels");
  });

  test("the work is listed, one row per token", async () => {
    const { html } = await editor(["wire the pill", "light the bucket"]);

    assert.match(html, /wire the pill/);
    assert.match(html, /light the bucket/);
  });

  // DONE IS A FILTER, NOT A PLACE. A finished token never moves; it drops out of
  // the list because the view filters it.
  test("the view filters out what is finished, and says so in the file", () => {
    const base = readFileSync(join(REPO_ROOT, "deliverable", "views", "work.base"), "utf8");

    assert.match(base, /status != "done"/, "done is filtered");
    assert.match(base, /status != "dropped"/);
    assert.match(base, /status != "superseded"/);
  });

  // THE BUCKET IS THE GROUP, AND THE PLACE IS ITS FALLBACK (owner). A token
  // carrying a bucket groups under it; one without groups under where it will be
  // done. The fallback lives here rather than in the file, so an unbucketed
  // token stays honestly unbucketed on disk.
  test("the view groups by the bucket, falling back to the place", () => {
    const base = readFileSync(join(REPO_ROOT, "deliverable", "views", "work.base"), "utf8");

    // THE QUOTES ARE THE WRITER'S BUSINESS. A control the reader presses
    // rewrites this file through the base serialiser, which quotes as it sees
    // fit — so the assertion reads the expression rather than its punctuation.
    assert.match(base, /property: '?if\(bucket, bucket, place\)'?/, "the bucket wins, and the place stands in for it");
    assert.equal((base.match(/if\(bucket, bucket, place\)/g) ?? []).length, 2, "both panes group the same way");
  });

  // THE STATEMENT IS A DOOR, NOT A FIELD (owner). Renaming work has its own
  // route, so a cell editor here would be a second way to do it.
  test("the statement opens its note rather than editing in place", async () => {
    const { html } = await editor(["wire the pill"]);

    assert.match(html, /class="tbl-locked tbl-opens"/, "the cell is not an edit box");
    assert.match(html, /<a class="doclink tbl-link"[^>]*>wire the pill<\/a>/, "and it is a link to the markdown");
  });

  // IT SHIPS FOLDED (owner). A reader looking at a drawing asked for the
  // drawing, and the same press closes it again.
  test("it ships folded, and the button toggles it", async () => {
    const { html } = await editor();

    assert.match(html, /id="work-dock"[^>]* hidden>/, "closed until asked for");
    assert.match(WORK_SCRIPT, /function toggleEditor\(\)/, "the same press closes it");
    assert.ok(WORK_SCRIPT.includes('closest("#work-btn")'), "and the button beside escape calls it");
  });

  // THE OPENER AND THE CARD MUST NAME THE SAME ELEMENT. They did not once, and
  // the button looked broken while both halves read correctly on their own.
  test("the opener looks up the id the card actually emits", async () => {
    const { html } = await editor();
    const id = /id="(work-dock)"/.exec(html)?.[1] ?? "";

    assert.notEqual(id, "", "the card emits the dock");
    assert.ok(WORK_SCRIPT.includes(`getElementById("${id}")`), "and the client opens that same one");
  });

  // EVERY SEAM IS DRAGGED (owner): between the two panes, and between the editor
  // and the drawing. A border that cannot be dragged makes the split this
  // renderer's decision rather than the reader's.
  test("every seam is a real element, and the client sizes both by pointer", async () => {
    const { html } = await editor();

    assert.match(html, /data-seam="panes"/, "the seam between the two panes is the card's own");
    assert.ok(!html.includes('data-seam="dock"'), "and the one between the editor and the drawing is their sibling, drawn by the page");
    assert.ok(WORK_SCRIPT.includes('closest(".work-seam")'), "one mechanism serves both");
    assert.match(WORK_SCRIPT, /pointerdown/, "a pointer drag, not an HTML drag");
  });

  // THE EDITOR IS A WIDGET LIKE THE DRAWING IS (owner), with its own header bar
  // hosting the controls the database has no opinion about.
  test("the editor has its own header, and the panes start below it", async () => {
    const { html } = await editor();

    assert.match(html, /class="widget work-widget"/, "one widget, like the drawing");
    assert.match(html, /<div class="widget-head"><span>work<\/span>/, "with a header of its own");
    assert.match(html, /class="widget-body work-panes"/, "and the panes start under it");
    for (const control of ["work-bucket", "work-rename", "work-second"]) {
      assert.ok(html.includes(control), `${control} sits in the header, not in the database's chrome`);
    }
  });

  // A DEAD BUTTON WITH NO EXPLANATION IS A MYSTERY. Both acts need a selection,
  // so both start disabled and the header says how many rows are ticked.
  test("the acts that need a selection start disabled, and the count is shown", async () => {
    const { html } = await editor();

    assert.match(html, /class="ghost work-bucket" disabled/, "filing needs rows");
    assert.match(html, /class="ghost work-rename" disabled/, "so does renaming");
    assert.match(html, /class="work-picked" data-count="0">nothing selected/, "and the header says so");
    assert.ok(WORK_SCRIPT.includes("work-ticked"), "the client ticks rows");
  });
});

describe("a row is dragged, and both ends of the wire agree", () => {
  test("a row carries its own note and can be picked up", async () => {
    const { html } = await editor();

    assert.match(html, /<tr data-path="[^"]*" draggable="true">/, "the row names the file it came from");
  });

  // THE DROP NAMES ITS BUCKET TOO (owner). A state carries three drop zones, so
  // where the row landed says which bucket as well as which state.
  test("the surface sends a path, a destination and the bucket it landed in", () => {
    assert.match(WORK_SCRIPT, /send\("\/work\/move", \{ path: path, to: t\.to, slot: t\.slot \}\)/);
  });

  test("the engine reads both back out, and the id comes off the path", () => {
    const server = engine("mirror.ts");

    assert.match(server, /"\/work\/move":/, "the engine serves that route");
    assert.match(server, /body\.path !== undefined/, "and reads the path the surface sent");
    assert.match(server, /String\(body\.to \?\? ""\)/);
    assert.match(server, /place\(home, id, to, slot\)/, "each one goes through the store's one mover");
    assert.match(server, /String\(body\.slot \?\? ""\)/, "and the bucket the drop named rides with it");
  });

  // TWO KINDS OF DESTINATION, and the design input names both: a state on the
  // drawing, and the other pane.
  test("a drop lands on a state or on the other pane", () => {
    assert.match(WORK_SCRIPT, /closest\('g\.clickable\[data-detail\^="state:"\]'\)/, "a state on the drawing");
    assert.match(WORK_SCRIPT, /closest\("\.work-pane"\)/, "or the pane beside it");
  });

  // A REFUSED MOVE SAYS WHY. A row snapping back with nothing said is the
  // failure the design names.
  test("a refusal reaches the reader rather than being swallowed", () => {
    assert.match(WORK_SCRIPT, /the work editor was refused/);
    assert.match(WORK_SCRIPT, /answer\.ok !== true/);
  });
});

// ADDING WORK IS A CONTROL IN THE ENTRY PANEL, beside the one that captures a
// note (owner). Both are the same act, and the editor lists what exists rather
// than making more of it.
describe("adding a piece of work", () => {
  test("the entry panel declares the control, beside the note it sits with", () => {
    const panel = readFileSync(join(REPO_ROOT, "deliverable", "machines", "panels", "note-entry.md"), "utf8");

    assert.match(panel, /\| text \| work_statement \|/, "a line to name the work");
    assert.match(panel, /\| action \| \/work\/mint \|/, "and a button that files it");
    assert.match(panel, /\| text \| note_body \|/, "the note entry is still its neighbour");
  });

  test("the surface sends it to the backlog, and the engine reads every field", () => {
    const live = engine("renderclient-live.ts");

    assert.match(live, /place: "backlog"/, "a token with no home yet goes to the backlog");
    assert.match(live, /getElementById\("work-statement"\)/, "read off the declared control");
    const server = engine("mirror.ts");
    assert.match(server, /"\/work\/mint":/);
    for (const field of ["place", "slot", "statement"]) {
      assert.match(server, new RegExp(`String\\(body\\.${field}`), `the engine reads ${field}`);
    }
  });

  test("an unnamed piece is never sent, because it could not be judged later", () => {
    assert.match(engine("renderclient-live.ts"), /w\.value\.trim\(\) !== ""/);
  });

  // THE EDITOR DOES NOT MAKE WORK. A control growing back inside it is the
  // custom surface returning by another door.
  test("the editor itself carries no entry control", async () => {
    const { html } = await editor();

    for (const gone of ["work-new-go", "work-new-text", "work-new-row"]) {
      assert.ok(!html.includes(gone), `${gone} belongs to the entry panel, not to the editor`);
    }
  });
});

describe("the client keeps only what the database does not do", () => {
  // THE CUSTOM SURFACE IS GONE, and this is what stops it growing back. Each of
  // these was hand-written for a job the database already does.
  test("nothing in the client re-implements sorting, narrowing or folding", () => {
    for (const gone of ["work-find", "applyNarrow", "applyFolds", "work-plus", "work-col-empty", "work-restate"]) {
      assert.ok(!WORK_SCRIPT.includes(gone), `${gone} belongs to the database, not to this client`);
    }
  });

  test("the client script is served wherever the card is", () => {
    const r = engine("render.ts");

    assert.equal((r.match(/\$\{WORK_SCRIPT\}/g) ?? []).length, 3, "the machine page, the card page and the expanded widget all carry it");
  });
});

// A HEADING THAT NAMES A PLACE IS A DOOR (owner). A place is WHERE THE WORK IS
// DONE, so its name is a state on the drawing and pressing it goes to that
// state. A bucket is a name somebody typed, and no state answers to it.
//
// THE NAME ALONE DOES NOT SAY WHICH, so the store is asked — `groupIsPlace`.
// The client cannot decide it, which is why the link is drawn by the server.
describe("a heading that names a place goes to that state", () => {
  /** The editor over one token filed under a bucket of the reader's own. */
  async function bucketed(name: string): Promise<string> {
    const root = freshRoot();
    const home = join(root, "spec", "iterations", "i-test");
    const minted = mint(home, HERE, [demand("wire the pill")], NOW).minted[0];
    rebucket(home, minted.id, name);
    await warmVault(root);
    return workCard(root, "");
  }

  // THE STATE'S OWN ID, NOT THE WHOLE POSITION. The drawing names a state by
  // its last segment, which is exactly what `workByState` files a count under.
  test("a place heading is a link carrying the state's id and its machine", async () => {
    const { html } = await editor();

    assert.match(html, /<a class="state-link"[^>]*data-state="decompose"/, "the drawn state id");
    assert.match(html, /<a class="state-link"[^>]*data-machine="i63"/, "and the machine that holds it");
    assert.match(
      html,
      /<span class="grp-val"><a class="state-link"[^>]*>iterations\/i63\/decompose<\/a><\/span>/,
      "the heading itself is the link",
    );
  });

  // THE GROUPING VALUE IS STILL READ OFF THE HEADING. A drop onto it, the
  // rename control and the pill's own highlight all take `.grp-val` text.
  test("the link sits inside the value the drop and the rename already read", async () => {
    const { html } = await editor();

    assert.match(html, /class="grp-val"/, "the span the client asks for is still there");
    assert.ok(WORK_SCRIPT.includes('querySelector(".grp-val")'), "and the client still reads its text");
  });

  test("a bucket heading stays plain text, because no state answers to it", async () => {
    const html = await bucketed("this afternoon");

    assert.match(html, /<span class="grp-val">this afternoon<\/span>/, "the reader's own name, drawn as text");
    assert.ok(!html.includes("state-link"), "nothing on this card offers to go anywhere");
  });

  // IT IS NOT A DOCLINK. A doclink carries a PATH and opens a document; this
  // carries a state id and moves the drawing.
  test("the served page carries the handler, and it is its own kind of link", () => {
    const html = renderMirror({ session: new Session(freshRoot()), root: freshRoot(), lastPacket: undefined, mode: "manual" });

    assert.ok(html.includes('closest(".state-link")'), "the page answers a press on one");
    assert.match(engine("renderclient-panel.ts"), /state-link[\s\S]{0,900}dataset\.state/, "and reads the state off it, never a path");
  });

  // THE READER KEEPS THEIR PLACE. Acting in one pane may not reset another, so
  // where the drawing on screen already holds the state the press is handed to
  // that state and nothing else on the page moves.
  test("a state already on the drawing is pressed in place, never reloaded", () => {
    const panel = engine("renderclient-panel.ts");

    assert.match(panel, /closest\("\.state-link"\)[\s\S]{0,900}dispatchEvent\(new MouseEvent\("click"/, "the state takes the press itself");
    assert.match(panel, /dispatchEvent\(new MouseEvent\("click"[\s\S]{0,120}return;/, "and the handler stops there");
  });

  // THE WORK CLIENT STILL NEVER NAVIGATES. The editor and the drawing share one
  // document because a row is dragged from one onto the other.
  test("the handler lives with the drawing, not in the work client", () => {
    assert.ok(!WORK_SCRIPT.includes("state-link"), "the editor draws the link and the drawing answers it");
    assert.ok(!WORK_SCRIPT.includes("navigateTo"), "nothing in the work client navigates");
  });
});
