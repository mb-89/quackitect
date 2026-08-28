// A COLUMN HEADER SORTS BY THAT COLUMN (owner).
//
// ONE CLICK, ONE KEY. The header REPLACES the sort rather than adding a level:
// the sort menu is where a reader builds a multi-level order, and two controls
// that disagree about what the table is showing is one too many.
//
// CLICKING THE SORTED COLUMN REVERSES IT, and the header says which way.
//
// GROUPING ALWAYS COMES FIRST and is untouched. This orders rows INSIDE each
// group, which is what a table header has always meant.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { BASES_SCRIPT, BASES_TABLE_STYLE } from "../engine/basesclient.ts";
import { type BaseSpec, type BaseView, type Row, renderView } from "../engine/tables.ts";

const SPEC: BaseSpec = { properties: { statement: {} }, views: [] };

function view(sort: { property: string; direction: string }[]): BaseView {
  return {
    type: "table",
    name: "left",
    order: ["statement", "file.ctime"],
    sort,
    groupBy: [{ property: "place", direction: "ASC" }],
    columnSize: {},
  };
}

const ROWS: Row[] = [
  { statement: "a token", place: "here", "file.ctime": "2026-08-27T09:00:00Z" },
  { statement: "another", place: "here", "file.ctime": "2026-08-27T10:00:00Z" },
];

function headOf(sort: { property: string; direction: string }[]): string {
  return renderView(SPEC, view(sort), ROWS).html.split("</thead>")[0];
}

describe("a column header carries its sort", { concurrency: true }, () => {
  test("an unsorted column carries no mark and says what a click does", () => {
    const head = headOf([]);
    assert.ok(!head.includes("data-sort="), "nothing claims to be the sort key");
    assert.match(head, /title="click to sort by this column"/, "the header says what pressing it does");
  });

  test("the sorted column wears its direction, and the others do not", () => {
    const head = headOf([{ property: "file.ctime", direction: "ASC" }]);
    assert.match(head, /data-col="file\.ctime" data-sort="asc"/, "the sort key is marked");
    assert.match(head, /▴/, "and the mark is readable, not only an attribute");
    assert.ok(!/data-col="statement" data-sort/.test(head), "a column that is not the key carries nothing");
  });

  test("descending is drawn as descending", () => {
    const head = headOf([{ property: "statement", direction: "DESC" }]);
    assert.match(head, /data-col="statement" data-sort="desc"/);
    assert.match(head, /▾/);
    assert.match(head, /sorted descending — click to reverse/);
  });

  // SEVERAL LEVELS COME FROM THE SORT MENU, and no single column describes
  // them. An arrow on the first of three would say something untrue about what
  // the reader is looking at.
  test("a multi-level sort marks no column at all", () => {
    const head = headOf([
      { property: "statement", direction: "ASC" },
      { property: "file.ctime", direction: "DESC" },
    ]);
    assert.ok(!head.includes("data-sort="), "no single arrow can describe two keys");
  });

  test("the click replaces the sort and reverses what it finds", () => {
    assert.match(
      BASES_SCRIPT,
      /var way = was === "asc" \? "DESC" : "ASC";/,
      "ascending reverses to descending, and everything else starts ascending",
    );
    assert.match(
      BASES_SCRIPT,
      /post\(th, "setSort", \{ sort: \[\{ property: col, direction: way \}\] \}\)/,
      "one key, never a level added to the ones already there",
    );
  });

  // THE GRIP MEASURES, IT DOES NOT SORT. A click that landed on the resize
  // handle would reorder the table the reader was only sizing.
  test("the resize grip is not a sort control", () => {
    assert.match(BASES_SCRIPT, /if \(ev\.target\.closest\("\.th-grip"\) !== null\) return;/);
  });

  test("the mark takes the accent from the theme rather than a colour of its own", () => {
    assert.match(BASES_TABLE_STYLE, /\.th-sort\{[^}]*var\(--se-accent\)/);
    assert.ok(!/\.th-sort\{[^}]*#[0-9a-f]{3,6}/i.test(BASES_TABLE_STYLE), "no colour is written where it is used");
  });
});
