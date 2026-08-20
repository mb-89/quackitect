// THE QUERY VERB (tsp-query-answers). Written test-first at i15's
// author-tests, against el-query-evaluator, which does not exist yet.
//
// Every case here is RED on purpose: answerStructuredQuery throws until
// build-steps lands it. Writing the claim now, before the build, is the
// point (meth-test-first).
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { answerStructuredQuery } from "../engine/query.ts";

function mintRaid(root: string, id: string, kind: string, status: string): void {
  const dir = join(root, "spec", "trace", "raid");
  mkdirSync(dir, { recursive: true });
  const lines = [
    "---",
    `id: ${id}`,
    'type: "[[raid]]"',
    `kind: ${kind}`,
    `statement: fixture for query.test.ts`,
    `status: ${status}`,
    "---",
    "",
  ];
  writeFileSync(join(dir, `${id}.md`), lines.join("\n"), "utf8");
}

function fixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "se-query-"));
  mintRaid(root, "raid-fixture-one", "risk", "open");
  mintRaid(root, "raid-fixture-two", "issue", "open");
  mintRaid(root, "raid-fixture-three", "risk", "closed");
  return root;
}

// req-query-returns-named-fields
test("a query returns only the matching rows, each carrying exactly the requested fields", () => {
  const root = fixtureRoot();
  const result = answerStructuredQuery(root, {
    kind: "raid",
    filters: { and: [{ field: "kind", equals: "risk" }] },
    fields: ["id", "kind"],
  });
  assert.equal(result.rows.length, 2, "both risk-kind fixtures match, the issue does not");
  for (const row of result.rows) {
    assert.deepEqual(Object.keys(row).sort(), ["id", "kind"], "a row carries exactly the requested fields, nothing more");
  }
});

// req-query-refuses-unknown-field
test("a request for a field the matched kind does not define is refused, naming the legal fields", () => {
  const root = fixtureRoot();
  assert.throws(
    () => answerStructuredQuery(root, { kind: "raid", fields: ["not_a_real_field"] }),
    /not_a_real_field/,
    "the refusal names the offending field",
  );
});

// req-query-empty-result-explicit
test("a query matching nothing returns an explicit empty result, not an omitted response", () => {
  const root = fixtureRoot();
  const result = answerStructuredQuery(root, {
    kind: "raid",
    filters: { and: [{ field: "status", equals: "no-such-status" }] },
    fields: ["id"],
  });
  assert.deepEqual(result.rows, [], "zero matches is a defined empty array, never undefined");
});

// req-query-is-deterministic
test("the same request run twice against an unchanged corpus returns identical rows", () => {
  const root = fixtureRoot();
  const request = { kind: "raid", filters: { and: [{ field: "kind", equals: "risk" }] }, fields: ["id", "kind", "status"] };
  const first = answerStructuredQuery(root, request);
  const second = answerStructuredQuery(root, request);
  assert.deepEqual(first, second, "no write landed between the two calls, so the rows must match exactly");
});
