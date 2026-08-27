// THE DATABASE EDITOR PAGES ITS ROWS, so the work editor pages too (owner).
//
// THE SIZE IS TYPED RATHER THAN PICKED. Every other pager in this product
// offers a fixed set of options; the right page for a table of 249 is not on
// anybody's list of four.
//
// PAGING HIDES, IT NEVER PRUNES. Every row stays in the markup, so a page
// change costs no fetch and the reader's place survives it.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { BASES_SCRIPT, BASES_TABLE_STYLE } from "../engine/basesclient.ts";
import { basesCard } from "../engine/baseui.ts";
import { warmVault } from "../engine/vault.ts";
import { freshRoot } from "./helpers.ts";

// A COLD VAULT IS NOT AN EMPTY ONE. The card says it is warming and draws no
// block at all, so a case asking about the block would be asking about the
// warming notice instead.
const ROOT = freshRoot();
await warmVault(ROOT);
const CARD = basesCard(ROOT, "");

describe("the generic editor pages, and the size is typed", { concurrency: true }, () => {
  test("the block carries a pager", () => {
    assert.match(CARD, /class="bs-pager" hidden/, "and it ships hidden until the page decides");
    assert.match(CARD, /class="bs-prev"/);
    assert.match(CARD, /class="bs-next"/);
    assert.match(CARD, /class="bs-where"/, "where you are is said in words");
  });

  test("the page size is a number the reader types, not a list they pick from", () => {
    assert.match(CARD, /<input type="number" class="bs-per"/, "any number, not four options");
    assert.ok(!/<select[^>]*class="bs-per"/.test(CARD), "nothing offers a fixed set here");
    assert.match(CARD, /min="0"/, "and zero is allowed");
  });

  // A READER CLEARING THE BOX WANTS THE WHOLE TABLE. That is the honest reading
  // of an empty page size, and it must not read as a page of nothing.
  test("zero and anything unreadable mean all", () => {
    assert.match(BASES_SCRIPT, /Number\.isFinite\(n\) && n > 0 \? Math\.floor\(n\) : 0/);
    assert.match(BASES_SCRIPT, /var to = per > 0 \? from \+ per : total;/, "a size of zero shows every row");
  });

  test("stepping a page moves one and never below the first", () => {
    assert.match(BASES_SCRIPT, /Math\.max\(0, \(bsPage\[id\] \|\| 0\) \+ \(step\.classList\.contains\("bs-next"\) \? 1 : -1\)\)/);
    assert.match(BASES_SCRIPT, /prev\.disabled = page === 0/, "and the control says so");
    assert.match(BASES_SCRIPT, /next\.disabled = page >= pages - 1/);
  });

  // A PAGER OVER ONE PAGE IS NOISE. It says nothing the result count does not.
  test("the pager hides itself when everything fits", () => {
    assert.match(BASES_SCRIPT, /bar\.hidden = per > 0 && total <= per;/);
  });

  // A REPAINT HANDS BACK FRESH MARKUP WITH EVERY ROW VISIBLE, and nothing would
  // narrow it again. Both the first draw and the editor's own redraw run it.
  test("the page is recomputed on arrival and after a repaint", () => {
    assert.match(BASES_SCRIPT, /window\.seBasesShow = bsShowAll;/, "the redraw has something to call");
    assert.match(BASES_SCRIPT, /DOMContentLoaded", bsShowAll/, "and the first draw narrows itself");
  });

  test("the pager wears the chrome's own voice rather than a colour of its own", () => {
    assert.match(BASES_TABLE_STYLE, /\.bs-pager\{[^}]*var\(--se-muted\)/);
    assert.ok(!/\.bs-pager\{[^}]*#[0-9a-f]{3,6}/i.test(BASES_TABLE_STYLE), "no colour is written where it is used");
  });
});
