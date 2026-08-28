// THE FIRST PAINT IS WHAT A PERSON SEES WHEN THEY OPEN THE EDITOR, and it was
// reported showing every backlog row and then losing them on the next repaint.
// Rows that appear and then vanish mean one draw ran the fold and the other did
// not.
//
// WHAT WAS ALREADY COVERED IS THE HEADING. `collapsed-is-declared.test.ts`
// proves the view declares which groups fold and the served heading wears the
// mark. Neither says anything about the ROWS UNDERNEATH, and those are the
// hundreds that bury the page.
//
// SO THIS ASKS THE ONE REMAINING QUESTION: does the HTML a reader receives
// already have them hidden, or does it hand over every row and rely on a script
// to take them back? The second is a frame of wrong answer, and on a group of
// 154 it is the whole page.
//
// THE REAL ROOT IS THE SUBJECT, the way the sibling file uses it. A fresh root
// has no backlog to bury anything with.
// see ux.md#a-drawing-change-is-not-done-until-its-output-is-measured
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { BASES_SCRIPT } from "../engine/basesclient.ts";
import { warmVault } from "../engine/vault.ts";
import { workCard } from "../engine/work-card.ts";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
await warmVault(ROOT);
const CARD = workCard(ROOT, "");

/** Every `<tr>` of the left pane, in document order. Both panes draw the same
 *  rows, so reading the whole card would count each one twice. */
function leftRows(html: string): string[] {
  const from = html.indexOf('data-side="left"');
  const to = html.indexOf('data-seam="panes"');
  const left = from === -1 || to === -1 ? html : html.slice(from, to);
  return [...left.matchAll(/<tr\b[^>]*>/g)].map((m) => m[0]);
}

const isHead = (tr: string): boolean => tr.includes("tbl-group");
const isShut = (tr: string): boolean => /class="tbl-group[^"]*\bshut\b/.test(tr);
const isHidden = (tr: string): boolean => / hidden(?=[ >])/.test(tr);
const depthOf = (tr: string): number => Number((/data-depth="(\d+)"/.exec(tr) ?? [])[1] ?? 0);

describe("the editor's first paint arrives already folded", { concurrency: true }, () => {
  test("no row under a closed heading arrives visible", () => {
    const rows = leftRows(CARD);
    assert.ok(rows.length > 0, "the pane drew a table at all");

    // WALKING IN ORDER IS ENOUGH, the same rule the client's own pass takes: a
    // heading deeper than the closed one is inside it, and the first heading at
    // that depth or shallower ends it.
    let closedAt: number | null = null;
    let loose = 0;
    for (const tr of rows) {
      if (isHead(tr)) {
        const d = depthOf(tr);
        if (closedAt !== null && d <= closedAt) closedAt = null;
        if (closedAt === null && isShut(tr)) closedAt = d;
        continue;
      }
      if (closedAt !== null && !isHidden(tr)) loose++;
    }

    assert.equal(loose, 0, `${String(loose)} row(s) under a closed heading arrived visible`);
  });

  // A CLOSED HEADING IS NOT A HIDDEN ONE. Folding the heading away with its
  // rows would leave the reader nothing to press to open it again.
  test("a closed heading is still on screen", () => {
    const shut = leftRows(CARD).filter((tr) => isHead(tr) && isShut(tr) && depthOf(tr) === 0);

    assert.ok(shut.length > 0, "at least one top-level group ships closed");
    for (const tr of shut) assert.ok(!isHidden(tr), "and the reader can still press it open");
  });

  // THE OTHER HALF OF THE SAME WIRE. Every later repaint hands back fresh
  // markup, so the client narrows it again — on arrival and after the editor
  // redraws itself. Two green halves are not a green wire, and this is the
  // second half of the one above.
  test("the client narrows a repaint as well as the first frame", () => {
    assert.match(BASES_SCRIPT, /DOMContentLoaded", bsShowAll/, "arrival runs it");
    assert.match(BASES_SCRIPT, /window\.seBasesShow = bsShowAll;/, "and a repaint has it to call");
  });
});
