// SORTING IN LEVELS, AND GROUPING IN LEVELS.
//
// Both were controls that wrote to the file and changed nothing on screen:
// `sort` was applied but could never gain a second clause through the
// interface, and `groupBy` was written and then ignored by the renderer
// entirely. A control that writes and does not show is the same lie as one
// that does not write, and harder to notice.
//
// The cases are pure computation over rows built here, so the file is the unit
// of parallelism and nothing inside it needs isolating.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { parse } from "yaml";
import { setGroupBy, setSort } from "../engine/bases.ts";
import { parseBase, renderView, selectRows, type Row } from "../engine/tables.ts";

const rows: Row[] = [
  { name: "alpha", ext: "go", area: "engine", size: 3, file: { name: "alpha", path: "a.md" } },
  { name: "bravo", ext: "go", area: "engine", size: 1, file: { name: "bravo", path: "b.md" } },
  { name: "charlie", ext: "go", area: "web", size: 2, file: { name: "charlie", path: "c.md" } },
  { name: "delta", ext: "ts", area: "engine", size: 9, file: { name: "delta", path: "d.md" } },
  { name: "echo", ext: "ts", area: "web", size: 4, file: { name: "echo", path: "e.md" } },
  { name: "foxtrot", area: "web", size: 5, file: { name: "foxtrot", path: "f.md" } },
];

const view = (over: string): ReturnType<typeof parseBase>["views"][0] =>
  parseBase(`views:\n  - type: table\n    name: V\n    order:\n      - name\n${over}`).views[0];

const spec = parseBase("views: []");

/** The row labels a render produced, in the order it produced them. */
function names(html: string): string[] {
  const body = html.match(/<tbody>([\s\S]*)<\/tbody>/);
  if (body === null) return [];
  return body[1]
    .split("<tr")
    .slice(1)
    .filter((r) => !r.includes("tbl-group"))
    .map((r) => (r.match(/<td[^>]*>([^<]*)</) ?? ["", ""])[1]);
}

/** The group headers, as `property value` at their nesting depth. */
function groups(html: string): { depth: number; label: string; count: string }[] {
  return [...html.matchAll(/<tr class="tbl-group" data-depth="(\d+)">[\s\S]*?<span class="grp-prop">([^<]*)<\/span> <span class="grp-val">([^<]*)<\/span> <span class="grp-count">(\d+)<\/span>/g)]
    .map((m) => ({ depth: Number(m[1]), label: `${m[2]} ${m[3]}`, count: m[4] }));
}

describe("sorting in levels", () => {
  test("one level orders the rows", () => {
    const html = renderView(spec, view("    sort:\n      - property: size\n        direction: ASC\n"), rows).html;
    assert.deepEqual(names(html), ["bravo", "charlie", "alpha", "echo", "foxtrot", "delta"]);
  });

  test("DESC reverses it", () => {
    const html = renderView(spec, view("    sort:\n      - property: size\n        direction: DESC\n"), rows).html;
    assert.deepEqual(names(html), ["delta", "foxtrot", "echo", "alpha", "charlie", "bravo"]);
  });

  test("the second level settles what the first left tied", () => {
    const v = view("    sort:\n      - property: area\n        direction: ASC\n      - property: size\n        direction: DESC\n");
    const html = renderView(spec, v, rows).html;
    // engine first, and inside it by size descending; then web, the same way.
    assert.deepEqual(names(html), ["delta", "alpha", "bravo", "foxtrot", "echo", "charlie"]);
  });

  test("a third level settles what the first two left tied", () => {
    const v = view("    sort:\n      - property: ext\n        direction: ASC\n      - property: area\n        direction: ASC\n      - property: size\n        direction: ASC\n");
    assert.deepEqual(names(renderView(spec, v, rows).html).slice(0, 3), ["bravo", "alpha", "charlie"]);
  });

  test("numbers order as numbers rather than as text", () => {
    const many: Row[] = [{ name: "n9", size: 9 }, { name: "n10", size: 10 }, { name: "n2", size: 2 }];
    const html = renderView(spec, view("    sort:\n      - property: size\n        direction: ASC\n"), many).html;
    assert.deepEqual(names(html), ["n2", "n9", "n10"]);
  });

  test("an empty cell sorts last rather than first", () => {
    const v = view("    sort:\n      - property: ext\n        direction: ASC\n");
    assert.equal(names(renderView(spec, v, rows).html).at(-1), "foxtrot", "the row with no ext");
  });

  test("a clause with no property is ignored rather than breaking the sort", () => {
    const v = view("    sort:\n      - property: ''\n        direction: ASC\n      - property: size\n        direction: ASC\n");
    assert.deepEqual(names(renderView(spec, v, rows).html).slice(0, 2), ["bravo", "charlie"]);
  });
});

describe("grouping in levels", () => {
  test("one level puts a header over each group", () => {
    const html = renderView(spec, view("    groupBy:\n      property: ext\n      direction: ASC\n"), rows).html;
    const g = groups(html);
    assert.deepEqual(g.map((x) => x.label), ["ext go", "ext ts", "ext —"]);
    assert.deepEqual(g.map((x) => x.count), ["3", "2", "1"]);
    assert.equal(new Set(g.map((x) => x.depth)).size, 1, "one level is all at depth zero");
  });

  test("every row still appears under its group", () => {
    const html = renderView(spec, view("    groupBy:\n      property: ext\n"), rows).html;
    assert.equal(names(html).length, rows.length);
  });

  test("a missing value gets its own group rather than losing the row", () => {
    const html = renderView(spec, view("    groupBy:\n      property: ext\n"), rows).html;
    assert.ok(groups(html).some((g) => g.label === "ext —"), "foxtrot has no ext and is still shown");
  });

  test("a second level SUBDIVIDES the first", () => {
    const v = view("    groupBy:\n      - property: ext\n        direction: ASC\n      - property: area\n        direction: ASC\n");
    const g = groups(renderView(spec, v, rows).html);
    assert.deepEqual(g.map((x) => `${x.depth}:${x.label}`), [
      "0:ext go",
      "1:area engine",
      "1:area web",
      "0:ext ts",
      "1:area engine",
      "1:area web",
      "0:ext —",
      "1:area web",
    ]);
  });

  test("the counts at each level add up to the level above", () => {
    const v = view("    groupBy:\n      - property: ext\n      - property: area\n");
    const g = groups(renderView(spec, v, rows).html);
    const go = g.findIndex((x) => x.label === "ext go");
    assert.equal(g[go].count, "3");
    assert.equal(Number(g[go + 1].count) + Number(g[go + 2].count), 3);
  });

  test("a group level reverses on DESC, and the empty group still trails", () => {
    const v = view("    groupBy:\n      property: ext\n      direction: DESC\n");
    assert.deepEqual(groups(renderView(spec, v, rows).html).map((x) => x.label), ["ext ts", "ext go", "ext —"]);
  });

  test("sorting applies inside the groups", () => {
    const v = view("    groupBy:\n      property: ext\n      direction: ASC\n    sort:\n      - property: size\n        direction: ASC\n");
    assert.deepEqual(names(renderView(spec, v, rows).html).slice(0, 3), ["bravo", "charlie", "alpha"]);
  });

  test("a bare property name is a group level too", () => {
    assert.deepEqual(groups(renderView(spec, view("    groupBy: ext\n"), rows).html).map((x) => x.label), ["ext go", "ext ts", "ext —"]);
  });

  test("no groupBy means no group rows at all", () => {
    assert.equal(groups(renderView(spec, view(""), rows).html).length, 0);
  });
});

describe("what the controls write", () => {
  function base(): { root: string; read: () => Record<string, unknown> } {
    const root = mkdtempSync(join(tmpdir(), "se-group-"));
    mkdirSync(join(root, "product"), { recursive: true });
    writeFileSync(join(root, "product", "v.base"), "views:\n  - type: table\n    name: V\n");
    return { root, read: () => parse(readFileSync(join(root, "product", "v.base"), "utf8")) as Record<string, unknown> };
  }
  const first = (d: Record<string, unknown>): Record<string, unknown> => (d.views as Record<string, unknown>[])[0];

  test("one group level writes the single object Obsidian expects", () => {
    const b = base();
    setGroupBy(b.root, "v.base", "V", [{ property: "ext", direction: "ASC" }]);
    assert.deepEqual(first(b.read()).groupBy, { property: "ext", direction: "ASC" });
  });

  test("several group levels write a list", () => {
    const b = base();
    setGroupBy(b.root, "v.base", "V", [{ property: "ext", direction: "ASC" }, { property: "area", direction: "DESC" }]);
    assert.deepEqual(first(b.read()).groupBy, [{ property: "ext", direction: "ASC" }, { property: "area", direction: "DESC" }]);
  });

  test("a blank level is dropped rather than written", () => {
    const b = base();
    setGroupBy(b.root, "v.base", "V", [{ property: "ext", direction: "ASC" }, { property: "", direction: "ASC" }]);
    assert.deepEqual(first(b.read()).groupBy, { property: "ext", direction: "ASC" });
  });

  test("no levels clears the key", () => {
    const b = base();
    setGroupBy(b.root, "v.base", "V", [{ property: "ext", direction: "ASC" }]);
    setGroupBy(b.root, "v.base", "V", []);
    assert.equal("groupBy" in first(b.read()), false);
  });

  test("what setGroupBy wrote is what the renderer reads back", () => {
    const b = base();
    setGroupBy(b.root, "v.base", "V", [{ property: "ext", direction: "ASC" }, { property: "area", direction: "ASC" }]);
    const spec2 = parseBase(readFileSync(join(b.root, "product", "v.base"), "utf8"));
    assert.equal(spec2.views[0].groupBy.length, 2);
    assert.equal(groups(renderView(spec2, spec2.views[0], rows).html).length, 8);
  });

  test("what setSort wrote is what the renderer reads back", () => {
    const b = base();
    setSort(b.root, "v.base", "V", [{ property: "area", direction: "ASC" }, { property: "size", direction: "DESC" }]);
    const spec2 = parseBase(readFileSync(join(b.root, "product", "v.base"), "utf8"));
    assert.equal(spec2.views[0].sort.length, 2);
    assert.deepEqual(selectRows(spec2, spec2.views[0], rows).map((r) => r.name), ["delta", "alpha", "bravo", "foxtrot", "echo", "charlie"]);
  });
});
