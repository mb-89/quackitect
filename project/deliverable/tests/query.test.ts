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
  const dir = join(root, "project");
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
