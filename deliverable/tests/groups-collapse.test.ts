// A GROUP HEADING OPENS AND CLOSES, AND THE BACKLOG SHIPS CLOSED (owner).
//
// A GROUP THAT HOLDS HUNDREDS OF ROWS IS NOT A GROUP, IT IS THE PAGE. The
// backlog draws every standing pool token — 154 measured — and would bury the
// handful of rows a reader came for.
//
// THE SERVER DECIDES WHICH SHIP CLOSED. Drawing them all and hiding them
// afterwards flashes the whole list on every repaint, which is the reader's
// place being reset in front of them.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { BASES_SCRIPT, BASES_TABLE_STYLE } from "../engine/basesclient.ts";
import { type BaseSpec, type BaseView, type Row, renderView } from "../engine/tables.ts";

const SPEC: BaseSpec = { properties: {}, views: [] };

const VIEW: BaseView = {
  type: "table",
  name: "left",
  order: ["statement"],
  sort: [],
  groupBy: [{ property: "place", direction: "ASC" }],
  columnSize: {},
};

const ROWS: Row[] = [
  { statement: "a", place: "backlog", file: { path: "x/a.md" } },
  { statement: "b", place: "backlog", file: { path: "x/b.md" } },
  { statement: "c", place: "here", file: { path: "x/c.md" } },
];

function drawn(shut?: (name: string) => boolean): string {
  return renderView(SPEC, VIEW, ROWS, undefined, shut === undefined ? undefined : (n) => shut(n)).html;
}

/** The rows between one heading and the next. */
function rowsUnder(html: string, group: string): string[] {
  const from = html.indexOf(`data-group="${group}"`);
  assert.notEqual(from, -1, `no heading for ${group}`);
  const rest = html.slice(from);
  const next = rest.indexOf("tbl-group", 20);
  return [...(next === -1 ? rest : rest.slice(0, next)).matchAll(/<tr[^>]*data-path[^>]*>/g)].map((m) => m[0]);
}

describe("a group can be closed, and the server says which", { concurrency: true }, () => {
  test("nothing is closed when the caller names nothing", () => {
    const html = drawn();
    assert.ok(!html.includes("tbl-group shut"), "no group closes itself");
    assert.ok(!rowsUnder(html, "backlog").some((r) => r.includes("hidden")), "and every row is drawn open");
  });

  test("a named group ships closed, with its rows drawn and hidden", () => {
    const html = drawn((n) => n === "backlog");

    assert.match(html, /class="tbl-group shut"[^>]*data-group="backlog"/, "the heading says it is closed");
    const rows = rowsUnder(html, "backlog");
    assert.equal(rows.length, 2, "both rows are still in the markup");
    assert.ok(
      rows.every((r) => r.startsWith("<tr hidden")),
      "and both are hidden, so opening costs no second fetch",
    );
  });

  test("closing one group leaves its neighbours alone", () => {
    const html = drawn((n) => n === "backlog");
    assert.ok(!rowsUnder(html, "here").some((r) => r.includes("hidden")), "the other group is untouched");
  });

  test("the heading carries a mark saying which way it stands", () => {
    assert.match(
      drawn((n) => n === "backlog"),
      /class="grp-fold">▸/,
      "closed points right",
    );
    assert.match(drawn(), /class="grp-fold">▾/, "and open points down");
  });

  // A LINK INSIDE THE HEADING IS NOT THE HEADING. The group name is a door to
  // its state, and following it must not also fold the group away.
  test("the client toggles on the heading and never on a link inside it", () => {
    assert.match(BASES_SCRIPT, /if \(ev\.target\.closest\("a"\) !== null\) return;/, "a link is followed, not folded");
    assert.match(BASES_SCRIPT, /closest\("tr\.tbl-group"\)/, "the heading is the target");
    assert.match(BASES_SCRIPT, /head\.classList\.toggle\("shut", shut\)/, "and the click flips it");
  });

  // TWO THINGS HIDE A ROW and they share one attribute: a closed group above
  // it, and a page it does not fall on. Two handlers writing that flag would
  // fight, and the loser would be whichever ran second.
  test("one pass decides both, group state first", () => {
    assert.match(BASES_SCRIPT, /function bsCandidates\(block\)/, "the group state names the candidates");
    assert.match(BASES_SCRIPT, /var open = bsCandidates\(block\);/, "and the page windows those");
    assert.match(BASES_SCRIPT, /open\[j\]\.hidden = j < from \|\| j >= to;/, "nothing else writes the flag");
  });

  // A NESTED HEADING INSIDE A CLOSED GROUP IS SWALLOWED WITH ITS ROWS. Walking
  // in order is enough: the first heading at that depth or shallower ends it.
  test("a closed heading swallows the headings inside it too", () => {
    assert.match(BASES_SCRIPT, /if \(closedAt !== null && d <= closedAt\) closedAt = null;/, "a shallower heading ends the closure");
    assert.match(BASES_SCRIPT, /r\.hidden = closedAt !== null;/, "and a nested heading hides with the rest");
  });

  // CLOSING A GROUP OF 154 MUST NOT LEAVE A PAGE SHOWING FOUR ROWS AND 146
  // GAPS. The page refills from what is left.
  test("a fold refills the page", () => {
    assert.match(BASES_SCRIPT, /bsPage\[bsIdOf\(head\.closest\("\.bs-block"\)\)\] = 0;/);
  });

  test("the heading reads as pressable", () => {
    assert.match(BASES_TABLE_STYLE, /\.tbl-group\{[^}]*cursor:pointer/);
  });
});
