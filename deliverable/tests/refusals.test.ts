// THE CLAUSE-GUIDANCE PAIRING: a refusal clause
// without guidance is incomplete. Every clause in the registry must have a
// feed-forward section in guidance/refusals.md, and every section there must
// name a clause the registry still carries. The payload carries the pointer,
// so a cold reader can go from any refusal to its rule in one hop.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { CLAUSES, clauseGuidance, Rejection } from "../engine/errors.ts";
import { GUIDANCE } from "./helpers.ts";

const here = dirname(fileURLToPath(import.meta.url));
// tests/ sits in the deliverable; the page sits at the guidance root.
const PAGE = join(here, "..", "..", "guidance", "refusals.md");

describe("the clause-guidance pairing", () => {
  const page = readFileSync(PAGE, "utf8");
  const codes = Object.values(CLAUSES) as string[];

  test("every registry clause has its section in refusals.md", () => {
    const missing = codes.filter((code) => !page.includes(`### ${code} `));
    assert.deepEqual(missing, [], `a new clause is not done until its section stands in ${GUIDANCE.refusalsPage}`);
  });

  test("every section in refusals.md names a clause the registry carries", () => {
    const headed = [...page.matchAll(/^### (SE-C-\d+) /gm)].map((m) => m[1]);
    const orphans = headed.filter((code) => !codes.includes(code));
    assert.deepEqual(orphans, [], "a section for a clause the registry dropped is guidance for a rule that no longer exists");
  });

  test("no clause has two sections", () => {
    const headed = [...page.matchAll(/^### (SE-C-\d+) /gm)].map((m) => m[1]);
    const dupes = headed.filter((code, i) => headed.indexOf(code) !== i);
    assert.deepEqual(dupes, [], "one clause, one section — two would drift apart");
  });

  test("the rejection payload carries the feed-forward pointer", () => {
    const r = new Rejection({
      clause: CLAUSES.PATH_ESCAPE,
      expected: "a root-relative path",
      got: "an absolute one",
      remedy: { tool: "se_file_read", args: {} },
      source: "refusals.test.ts",
    });
    assert.equal(r.toJSON().guidance, clauseGuidance(CLAUSES.PATH_ESCAPE));
    assert.ok(r.toJSON().guidance.includes(GUIDANCE.refusalsPage), "the pointer names the page");
    assert.ok(r.toJSON().guidance.includes(CLAUSES.PATH_ESCAPE), "the pointer names the clause");
  });
});
