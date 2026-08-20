// THE QUERY VERB (tsp-query-answers). Executes a .base file's own declared
// view against the vault, through the pinned subset engine/tables.ts already
// implements for the mirror widget — not a second grammar. See
// engine/query.ts's own header for why: record.md's DONE LOOKS LIKE names
// "our own reader over Obsidian Bases compatible files", and a verb with no
// connection to the .base format would leave the 25-file harvest with
// nothing to execute it.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { answerStructuredQuery } from "../engine/query.ts";

const BASE = `views:
  - type: table
    name: Risks
    order:
      - id
      - kind
    filters:
      kind == "risk"
  - type: table
    name: Nothing
    order:
      - id
    filters:
      kind == "no-such-kind"
`;

/** A fresh vault-shaped root per case: a .base file plus fixture notes, the
 *  same layout tables.ts's readVault walks. */
function fixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "se-query-"));
  const dir = root;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "q.base"), BASE);
  writeFileSync(join(dir, "one.md"), "---\nid: raid-fixture-one\nkind: risk\nstatus: open\n---\n\n# one\n");
  writeFileSync(join(dir, "two.md"), "---\nid: raid-fixture-two\nkind: issue\nstatus: open\n---\n\n# two\n");
  writeFileSync(join(dir, "three.md"), "---\nid: raid-fixture-three\nkind: risk\nstatus: closed\n---\n\n# three\n");
  return root;
}

// req-query-returns-named-fields
test("a query returns only the matching rows, each carrying exactly the requested fields", () => {
  const root = fixtureRoot();
  const result = answerStructuredQuery(root, { base: "q.base", view: "Risks" });
  assert.equal(result.rows.length, 2, "both risk-kind fixtures match, the issue does not");
  for (const row of result.rows) {
    assert.deepEqual(Object.keys(row).sort(), ["id", "kind"], "a row carries exactly the view's own order, nothing more");
  }
});

// req-query-refuses-unknown-field
test("a request for a field the view's own order does not carry is refused, naming the legal fields", () => {
  const root = fixtureRoot();
  assert.throws(
    () => answerStructuredQuery(root, { base: "q.base", view: "Risks", fields: ["not_a_real_field"] }),
    /not_a_real_field/,
    "the refusal names the offending field",
  );
});

// req-query-empty-result-explicit
test("a query matching nothing returns an explicit empty result, not an omitted response", () => {
  const root = fixtureRoot();
  const result = answerStructuredQuery(root, { base: "q.base", view: "Nothing" });
  assert.deepEqual(result.rows, [], "zero matches is a defined empty array, never undefined");
});

// req-query-is-deterministic
test("the same request run twice against an unchanged corpus returns identical rows", () => {
  const root = fixtureRoot();
  const request = { base: "q.base", view: "Risks" };
  const first = answerStructuredQuery(root, request);
  const second = answerStructuredQuery(root, request);
  assert.deepEqual(first, second, "no write landed between the two calls, so the rows must match exactly");
});

// CONFORMANCE FIXTURES — the shapes the 25 harvested .base files actually
// use, pinned here so a change to the pinned Bases subset shows as a red
// case instead of a silent drift. Each filter clause below is copied
// verbatim from a harvested file (see spec/queries/*.base).

const SHAPES_BASE = `views:
  - type: table
    name: AndNesting
    order:
      - id
    filters:
      and:
        - 'type == "raid"'
        - 'kind == "assumption"'
  - type: table
    name: NotEquals
    order:
      - id
    filters:
      and:
        - 'probe == "notequals"'
        - referenced != false
  - type: table
    name: HasTag
    order:
      - id
    filters:
      file.hasTag("strategy")
  - type: table
    name: InFolderExact
    order:
      - id
    filters:
      file.inFolder("docs")
  - type: table
    name: SortedByFileName
    order:
      - id
    filters:
      type == "manifest"
    sort:
      - property: file.name
        direction: ASC
`;

/** A fixture whose filter shapes mirror assumptions.base (and-nesting),
 *  fundamentals.base (!=), decisions-strategy.base (file.hasTag),
 *  fundamentals.base/methods.base (file.inFolder, exact and sub-folder),
 *  and ifus.base (sort by file.name). */
function shapesRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "se-query-shapes-"));
  const dir = root;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "shapes.base"), SHAPES_BASE);
  writeFileSync(join(dir, "raid-one.md"), "---\nid: r1\ntype: raid\nkind: assumption\n---\n\n# one\n");
  writeFileSync(join(dir, "raid-two.md"), "---\nid: r2\ntype: raid\nkind: risk\n---\n\n# two\n");
  writeFileSync(join(dir, "ref-true.md"), "---\nid: f1\nprobe: notequals\nreferenced: true\n---\n\n# ref-true\n");
  writeFileSync(join(dir, "ref-false.md"), "---\nid: f2\nprobe: notequals\nreferenced: false\n---\n\n# ref-false\n");
  writeFileSync(join(dir, "ref-unset.md"), "---\nid: f3\nprobe: notequals\n---\n\n# ref-unset\n");
  writeFileSync(join(dir, "tagged.md"), "---\nid: t1\ntags:\n  - strategy\n---\n\n# tagged\n");
  writeFileSync(join(dir, "untagged.md"), "---\nid: t2\n---\n\n# untagged\n");
  mkdirSync(join(dir, "docs"), { recursive: true });
  mkdirSync(join(dir, "docs", "sub"), { recursive: true });
  mkdirSync(join(dir, "elsewhere"), { recursive: true });
  writeFileSync(join(dir, "docs", "in-docs.md"), "---\nid: d1\n---\n\n# in-docs\n");
  writeFileSync(join(dir, "docs", "sub", "in-sub.md"), "---\nid: d2\n---\n\n# in-sub\n");
  writeFileSync(join(dir, "elsewhere", "outside.md"), "---\nid: d3\n---\n\n# outside\n");
  writeFileSync(join(dir, "manifest-b.md"), "---\nid: m1\ntype: manifest\n---\n\n# manifest-b\n");
  writeFileSync(join(dir, "manifest-a.md"), "---\nid: m2\ntype: manifest\n---\n\n# manifest-a\n");
  return root;
}

test("and-nesting: both clauses must hold, mirroring assumptions.base", () => {
  const result = answerStructuredQuery(shapesRoot(), { base: "shapes.base", view: "AndNesting" });
  assert.deepEqual(result.rows, [{ id: "r1" }], "only the raid+assumption note matches, not the raid+risk one");
});

test("!= treats an unset property as not-equal, mirroring fundamentals.base", () => {
  const result = answerStructuredQuery(shapesRoot(), { base: "shapes.base", view: "NotEquals" });
  const ids = result.rows.map((r) => r.id).sort();
  assert.deepEqual(ids, ["f1", "f3"], "referenced: true and the unset note both pass referenced != false");
});

test("file.hasTag matches a real vault note's own frontmatter tags, mirroring decisions-strategy.base", () => {
  const result = answerStructuredQuery(shapesRoot(), { base: "shapes.base", view: "HasTag" });
  assert.deepEqual(result.rows, [{ id: "t1" }], "only the tagged note matches");
});

test("file.inFolder matches the exact folder and its sub-folders, mirroring fundamentals.base/methods.base", () => {
  const result = answerStructuredQuery(shapesRoot(), { base: "shapes.base", view: "InFolderExact" });
  const ids = result.rows.map((r) => r.id).sort();
  assert.deepEqual(ids, ["d1", "d2"], "docs/in-docs.md and docs/sub/in-sub.md both count as inFolder(docs); elsewhere/outside.md does not");
});

test("a declared sort orders the rows, mirroring ifus.base's sort by file.name", () => {
  const result = answerStructuredQuery(shapesRoot(), { base: "shapes.base", view: "SortedByFileName" });
  assert.deepEqual(
    result.rows.map((r) => r.id),
    ["m2", "m1"],
    "manifest-a.md sorts before manifest-b.md",
  );
});

// TOP-LEVEL filters -- the shape every one of the 26 harvested files under
// spec/queries/ actually writes (see decisions-architecture.base,
// requirements.base, raid.base: filters: sits ABOVE views:, once, shared by
// every view). Every fixture above nests filters INSIDE the view instead,
// which is legal but is not what a harvested file does -- so none of them
// caught parseBase silently dropping a document-level filters: and matching
// the whole vault. Found by i15 own run-demos demonstration against
// decisions-architecture.base: 1907 rows back with no type == adr filter
// applied at all.
const TOP_LEVEL_FILTERS_BASE = `filters:
  and:
    - type == "raid"
    - kind == "assumption"
views:
  - type: table
    name: Assumptions
    order:
      - id
`;

function topLevelFiltersRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "se-query-toplevel-"));
  const dir = root;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "top.base"), TOP_LEVEL_FILTERS_BASE);
  writeFileSync(join(dir, "raid-one.md"), "---\nid: r1\ntype: raid\nkind: assumption\n---\n\n# one\n");
  writeFileSync(join(dir, "raid-two.md"), "---\nid: r2\ntype: raid\nkind: risk\n---\n\n# two\n");
  writeFileSync(join(dir, "other.md"), "---\nid: o1\ntype: manifest\n---\n\n# other\n");
  return root;
}

test("top-level filters, above views and shared by them, narrow the rows, mirroring every harvested file", () => {
  const result = answerStructuredQuery(topLevelFiltersRoot(), { base: "top.base", view: "Assumptions" });
  assert.deepEqual(
    result.rows,
    [{ id: "r1" }],
    "only the raid+assumption note matches, not the raid+risk note, not the manifest, and not all three",
  );
});

test("a view own filters still win over the base top-level ones when both are present", () => {
  const overriding = `filters:
  and:
    - type == "raid"
views:
  - type: table
    name: OnlyRisk
    order:
      - id
    filters:
      kind == "risk"
`;
  const root = mkdtempSync(join(tmpdir(), "se-query-override-"));
  const dir = root;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "o.base"), overriding);
  writeFileSync(join(dir, "a.md"), "---\nid: a1\ntype: raid\nkind: assumption\n---\n\n# a\n");
  writeFileSync(join(dir, "b.md"), "---\nid: a2\ntype: raid\nkind: risk\n---\n\n# b\n");
  const result = answerStructuredQuery(root, { base: "o.base", view: "OnlyRisk" });
  assert.deepEqual(result.rows, [{ id: "a2" }], "the view own kind==risk filter applies, not the base broader type==raid alone");
});
