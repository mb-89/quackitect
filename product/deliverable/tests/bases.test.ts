// THE CONTROLS WRITE THE FILE, AND THE FILE IS WHAT RE-RENDERS.
//
// The property carrying the most weight here is NOT LOSING ANYTHING. Our
// renderer models a subset of the format; Obsidian writes more of it. If
// ticking a column deleted the owner's formulas, the damage would be silent,
// permanent, and discovered in Obsidian days later. So the first suite is the
// round-trip, and everything else is behaviour on top of it.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { parse } from "yaml";
import {
  addView,
  createBase,
  duplicateView,
  fromExpression,
  hideAll,
  OPERATORS,
  removeView,
  renameView,
  setDisplayName,
  setGlobalFilters,
  setGroupBy,
  setLayout,
  setOrder,
  setSort,
  setViewFilters,
  toExpression,
  toggleProperty,
  type FilterRow,
} from "../engine/bases.ts";
import { Rejection } from "../engine/errors.ts";
import { parseBase } from "../engine/tables.ts";

const RICH = `filters:
  and:
    - kind == "matrix-row"
formulas:
  ppu: "(price / age).toFixed(2)"
summaries:
  formula.ppu: Average
properties:
  file.name:
    displayName: State
views:
  - type: table
    name: The matrix
    limit: 10
    groupBy:
      property: note.age
      direction: DESC
    order:
      - file.name
      - state_kind
    sort:
      - property: file.name
        direction: ASC
    summaries:
      formula.ppu: Average
`;

/** A fresh root per case: setup is cheap and shared state is what breaks a suite. */
function root(body = RICH): { root: string; rel: string; read: () => string; doc: () => Record<string, unknown> } {
  const dir = mkdtempSync(join(tmpdir(), "se-bases-"));
  mkdirSync(join(dir, "product"), { recursive: true });
  const rel = "m.base";
  writeFileSync(join(dir, "product", rel), body);
  const read = (): string => readFileSync(join(dir, "product", rel), "utf8");
  return { root: dir, rel, read, doc: () => parse(read()) as Record<string, unknown> };
}

function refusal(fn: () => unknown): Rejection {
  try {
    fn();
  } catch (e) {
    if (e instanceof Rejection) return e;
    throw e;
  }
  throw new Error("expected a refusal, got a value");
}

const view = (d: Record<string, unknown>, name = "The matrix"): Record<string, unknown> =>
  (d.views as Record<string, unknown>[]).find((v) => v.name === name)!;

describe("the round-trip — what a control must never delete", () => {
  test("ticking a column leaves formulas, summaries, limit and groupBy standing", () => {
    const v = root();
    toggleProperty(v.root, v.rel, "The matrix", "patch", true);
    const d = v.doc();
    assert.deepEqual(d.formulas, { ppu: "(price / age).toFixed(2)" });
    assert.deepEqual(d.summaries, { "formula.ppu": "Average" });
    assert.deepEqual(d.filters, { and: ['kind == "matrix-row"'] });
    assert.equal(view(d).limit, 10);
    assert.deepEqual(view(d).groupBy, { property: "note.age", direction: "DESC" });
    assert.deepEqual(view(d).summaries, { "formula.ppu": "Average" });
  });

  test("the top-level property settings survive an unrelated edit", () => {
    const v = root();
    setSort(v.root, v.rel, "The matrix", [{ property: "patch", direction: "DESC" }]);
    assert.deepEqual(v.doc().properties, { "file.name": { displayName: "State" } });
  });

  test("what is written parses again, and the renderer sees the change", () => {
    const v = root();
    toggleProperty(v.root, v.rel, "The matrix", "patch", true);
    const spec = parseBase(v.read());
    assert.deepEqual(spec.views[0].order, ["file.name", "state_kind", "patch"]);
    assert.equal(spec.properties["file.name"].displayName, "State");
  });
});

describe("properties — the column picker", () => {
  test("a tick appends, so the order is the order ticked", () => {
    const v = root();
    toggleProperty(v.root, v.rel, "The matrix", "patch", true);
    toggleProperty(v.root, v.rel, "The matrix", "minor", true);
    assert.deepEqual(view(v.doc()).order, ["file.name", "state_kind", "patch", "minor"]);
  });

  test("unticking removes only that column", () => {
    const v = root();
    toggleProperty(v.root, v.rel, "The matrix", "state_kind", false);
    assert.deepEqual(view(v.doc()).order, ["file.name"]);
  });

  test("ticking twice does not double the column", () => {
    const v = root();
    toggleProperty(v.root, v.rel, "The matrix", "patch", true);
    toggleProperty(v.root, v.rel, "The matrix", "patch", true);
    assert.deepEqual(view(v.doc()).order, ["file.name", "state_kind", "patch"]);
  });

  test("unticking something absent is not an error", () => {
    const v = root();
    toggleProperty(v.root, v.rel, "The matrix", "never-there", false);
    assert.deepEqual(view(v.doc()).order, ["file.name", "state_kind"]);
  });

  test("a drag-reorder sends the whole list", () => {
    const v = root();
    setOrder(v.root, v.rel, "The matrix", ["state_kind", "file.name"]);
    assert.deepEqual(view(v.doc()).order, ["state_kind", "file.name"]);
  });

  test("hide all empties the columns and writes no empty key", () => {
    const v = root();
    hideAll(v.root, v.rel, "The matrix");
    assert.equal("order" in view(v.doc()), false);
  });
});

describe("display names", () => {
  test("a name is set for a property that had none", () => {
    const v = root();
    setDisplayName(v.root, v.rel, "state_kind", "Kind");
    assert.deepEqual((v.doc().properties as Record<string, unknown>).state_kind, { displayName: "Kind" });
  });

  test("clearing a name removes the property entry rather than emptying it", () => {
    const v = root();
    setDisplayName(v.root, v.rel, "file.name", null);
    assert.equal("properties" in v.doc(), false);
  });
});

describe("sort, and the group-by that shares its popover", () => {
  test("several clauses are written in order", () => {
    const v = root();
    setSort(v.root, v.rel, "The matrix", [
      { property: "state_kind", direction: "ASC" },
      { property: "file.name", direction: "DESC" },
    ]);
    assert.deepEqual(view(v.doc()).sort, [
      { property: "state_kind", direction: "ASC" },
      { property: "file.name", direction: "DESC" },
    ]);
  });

  test("an empty sort clears the key", () => {
    const v = root();
    setSort(v.root, v.rel, "The matrix", []);
    assert.equal("sort" in view(v.doc()), false);
  });

  test("one group level writes the documented object form", () => {
    const v = root();
    setGroupBy(v.root, v.rel, "The matrix", [{ property: "patch", direction: "ASC" }]);
    assert.deepEqual(view(v.doc()).groupBy, { property: "patch", direction: "ASC" });
  });

  test("clearing group-by removes it", () => {
    const v = root();
    setGroupBy(v.root, v.rel, "The matrix", []);
    assert.equal("groupBy" in view(v.doc()), false);
  });
});

describe("the filter builder compiles to the expression language", () => {
  const cases: [FilterRow, string][] = [
    [{ property: "status", operator: "is", value: "open" }, 'status == "open"'],
    [{ property: "status", operator: "isNot", value: "open" }, 'status != "open"'],
    [{ property: "title", operator: "contains", value: "x" }, 'title.contains("x")'],
    [{ property: "title", operator: "notContains", value: "x" }, '!title.contains("x")'],
    [{ property: "title", operator: "startsWith", value: "a" }, 'title.startsWith("a")'],
    [{ property: "title", operator: "endsWith", value: "z" }, 'title.endsWith("z")'],
    [{ property: "comment", operator: "isEmpty" }, "comment.isEmpty()"],
    [{ property: "comment", operator: "isNotEmpty" }, "!comment.isEmpty()"],
    [{ property: "weight", operator: "gt", value: "5" }, "weight > 5"],
    [{ property: "weight", operator: "lte", value: "5" }, "weight <= 5"],
    [{ property: "accessed", operator: "after", value: "2026-01-01" }, 'accessed > date("2026-01-01")'],
    [{ property: "file", operator: "hasTag", value: "book" }, 'file.hasTag("book")'],
    [{ property: "file", operator: "linksTo", value: "Author" }, 'file.hasLink("Author")'],
  ];

  for (const [row, expr] of cases) {
    test(`${row.operator} builds ${expr}`, () => assert.equal(toExpression(row), expr));
  }

  test("every operator the popover offers can be built", () => {
    for (const op of OPERATORS) {
      assert.equal(typeof op.build("p", "v"), "string", op.id);
    }
  });

  test("an unknown operator refuses and lists the vocabulary", () => {
    const r = refusal(() => toExpression({ property: "p", operator: "sideways" }));
    assert.equal(r.got, "sideways");
  });
});

describe("reading an expression back into the builder", () => {
  test("every built row reads back as the same row", () => {
    const rows: FilterRow[] = [
      { property: "status", operator: "is", value: "open" },
      { property: "status", operator: "isNot", value: "open" },
      { property: "title", operator: "contains", value: "x" },
      { property: "title", operator: "notContains", value: "x" },
      { property: "title", operator: "startsWith", value: "a" },
      { property: "comment", operator: "isEmpty" },
      { property: "comment", operator: "isNotEmpty" },
      { property: "weight", operator: "gt", value: "5" },
      { property: "accessed", operator: "after", value: "2026-01-01" },
      { property: "file", operator: "hasTag", value: "book" },
      { property: "file", operator: "linksTo", value: "Author" },
    ];
    for (const row of rows) {
      assert.deepEqual(fromExpression(toExpression(row)), row, row.operator);
    }
  });

  test("a dotted property survives the round-trip", () => {
    assert.deepEqual(fromExpression('file.name == "x"'), { property: "file.name", operator: "is", value: "x" });
  });

  test("an expression beyond the builder answers null, which is the raw escape", () => {
    assert.equal(fromExpression("price / age > 2"), null);
    assert.equal(fromExpression('a == "x" && b == "y"'), null);
    assert.equal(fromExpression("[1,2].filter(value > 1)"), null);
  });

  test("something that does not parse answers null rather than throwing", () => {
    assert.equal(fromExpression("=== nonsense ("), null);
  });
});

describe("filters land in the file", () => {
  test("the two halves are independent, and both survive", () => {
    const v = root();
    setGlobalFilters(v.root, v.rel, { and: ['kind == "matrix-row"'] });
    setViewFilters(v.root, v.rel, "The matrix", { and: ['patch == "none"'] });
    assert.deepEqual(v.doc().filters, { and: ['kind == "matrix-row"'] });
    assert.deepEqual(view(v.doc()).filters, { and: ['patch == "none"'] });
  });

  test("a view's tree is written under that view", () => {
    const v = root();
    setViewFilters(v.root, v.rel, "The matrix", { and: ['kind == "matrix-row"', 'patch == "none"'] });
    assert.deepEqual(view(v.doc()).filters, { and: ['kind == "matrix-row"', 'patch == "none"'] });
  });

  test("clearing a view's filters removes the key", () => {
    const v = root();
    setViewFilters(v.root, v.rel, "The matrix", { or: ["a"] });
    setViewFilters(v.root, v.rel, "The matrix", null);
    assert.equal("filters" in view(v.doc()), false);
  });

  test("the all-views half writes at the top level", () => {
    const v = root();
    setGlobalFilters(v.root, v.rel, { not: 'kind == "draft"' });
    assert.deepEqual(v.doc().filters, { not: 'kind == "draft"' });
    assert.deepEqual(view(v.doc()).order, ["file.name", "state_kind"], "the view is untouched");
  });

  test("a nested group survives the write", () => {
    const v = root();
    const tree = { or: ['file.hasTag("tag")', { and: ['file.hasTag("book")', 'file.hasLink("Textbook")'] }] };
    setViewFilters(v.root, v.rel, "The matrix", tree);
    assert.deepEqual(view(v.doc()).filters, tree);
  });
});

describe("views — the switcher and Configure view", () => {
  test("a new view joins the file", () => {
    const v = root();
    addView(v.root, v.rel, "Cards", "cards");
    const names = (v.doc().views as Record<string, unknown>[]).map((x) => x.name);
    assert.deepEqual(names, ["The matrix", "Cards"]);
    assert.equal(view(v.doc(), "Cards").type, "cards");
  });

  test("renaming keeps everything else about the view", () => {
    const v = root();
    renameView(v.root, v.rel, "The matrix", "Everything");
    const d = v.doc();
    assert.deepEqual(view(d, "Everything").order, ["file.name", "state_kind"]);
    assert.equal(view(d, "Everything").limit, 10);
  });

  test("the layout changes without touching the columns", () => {
    const v = root();
    setLayout(v.root, v.rel, "The matrix", "list");
    assert.equal(view(v.doc()).type, "list");
    assert.deepEqual(view(v.doc()).order, ["file.name", "state_kind"]);
  });

  test("duplicating copies the view under a new name", () => {
    const v = root();
    duplicateView(v.root, v.rel, "The matrix", "A copy");
    assert.deepEqual(view(v.doc(), "A copy").order, ["file.name", "state_kind"]);
    assert.deepEqual(view(v.doc(), "The matrix").order, ["file.name", "state_kind"]);
  });

  test("a duplicate keeps its own columns when the original changes", () => {
    const v = root();
    duplicateView(v.root, v.rel, "The matrix", "A copy");
    toggleProperty(v.root, v.rel, "The matrix", "patch", true);
    assert.deepEqual(view(v.doc(), "A copy").order, ["file.name", "state_kind"]);
  });

  test("removing takes the view out and leaves the rest", () => {
    const v = root();
    addView(v.root, v.rel, "Cards", "cards");
    removeView(v.root, v.rel, "The matrix");
    const names = (v.doc().views as Record<string, unknown>[]).map((x) => x.name);
    assert.deepEqual(names, ["Cards"]);
    assert.deepEqual(v.doc().formulas, { ppu: "(price / age).toFixed(2)" });
  });

  test("a base can be created from nothing", () => {
    const v = root();
    const text = createBase(v.root, "fresh.base");
    const d = parse(text) as Record<string, unknown>;
    assert.equal((d.views as Record<string, unknown>[])[0].name, "Table");
  });
});

describe("refusals — a control that cannot do the thing says so", () => {
  test("an unknown view names the ones that exist", () => {
    const v = root();
    const r = refusal(() => toggleProperty(v.root, v.rel, "Nowhere", "p", true));
    assert.equal(r.got, "Nowhere");
    assert.match(r.expected, /The matrix/);
  });

  test("a duplicate view name refuses", () => {
    const v = root();
    const r = refusal(() => addView(v.root, v.rel, "The matrix"));
    assert.equal(r.got, "The matrix");
  });

  test("renaming onto an existing name refuses", () => {
    const v = root();
    addView(v.root, v.rel, "Cards", "cards");
    refusal(() => renameView(v.root, v.rel, "Cards", "The matrix"));
  });

  test("an unknown layout refuses and lists the registry", () => {
    const v = root();
    const r = refusal(() => setLayout(v.root, v.rel, "The matrix", "hologram" as "table"));
    assert.equal(r.got, "hologram");
    assert.match(r.expected, /table/);
  });

  test("a control may not write outside the vault", () => {
    const v = root();
    refusal(() => toggleProperty(v.root, "../../escape.base", "The matrix", "p", true));
  });

  test("a control may not write anything but a base", () => {
    const v = root();
    refusal(() => toggleProperty(v.root, "note.md", "The matrix", "p", true));
  });

  test("creating a base that exists refuses rather than overwriting", () => {
    const v = root();
    refusal(() => createBase(v.root, v.rel));
    assert.match(v.read(), /formulas/, "the file is untouched by the refusal");
  });

  test("a base whose top level is not a mapping refuses", () => {
    const v = root("- one\n- two\n");
    refusal(() => toggleProperty(v.root, v.rel, "The matrix", "p", true));
  });
});
