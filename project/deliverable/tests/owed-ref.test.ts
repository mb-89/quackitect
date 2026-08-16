// AN OWED BOX POINTS AT A LIVE REGISTER ENTRY, and "live" is the whole
// question.
//
// The check tested `status === "open"` while its own comment named three dead
// statuses — closed, decided and missing. Those disagree about four statuses
// the vocabulary allows: probed, mitigated, accepted and deferred, every one
// of them an entry with an owner and a trigger.
//
// FOUND AT i6's VERIFICATION. Two cloud demonstrations name an ACCEPTED debt
// entry in their own text as the reason they cannot be observed, and the check
// called that reference unresolved. Accepted debt is the strongest carrier
// there is: somebody looked and decided to ship anyway, on the record.
//
// req-a-harmless-finding-names-an-open-entry
import { strict as assert } from "node:assert";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fieldProblems } from "../engine/stateform.ts";
import type { TraceNode } from "../engine/trace.ts";
import { freshRoot } from "./helpers.ts";

const META = {
  editor: "checklist",
  line_pattern: "^- \\[(x| |owed)\\] .+",
  line_help: "every line is `- [x] <item>` checked, `- [ ] <item>` while it is not, or `- [owed] <item> — <ref>`",
} as unknown as Parameters<typeof fieldProblems>[1];

// ONLY `items` IS READ by a checklist field, and FieldArgs carries twenty-odd
// keys for every other template. Casting through unknown says that plainly
// rather than filling nineteen fields nothing looks at.
const ARGS = { items: ["tsp-demo"], columns: [] } as unknown as Parameters<typeof fieldProblems>[2];

/** One raid entry on disk at the named status, and the node that points at it.
 *  The check reads the status off the FILE, so the file has to exist. */
function entry(root: string, id: string, status: string): TraceNode {
  const dir = join(root, "project", "spec", "trace", "raid");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${id}.md`);
  writeFileSync(
    file,
    `---\nid: ${id}\ntype: "[[raid]]"\nkind: debt\nstatus: ${status}\nowner: the owner\ntrigger: the first run on a host this machine cannot make\n---\n\n# ${id}\n`,
    "utf8",
  );
  return { id, type: "raid", statement: "", refines: [], file };
}

function owedAgainst(status: string): string[] {
  const root = freshRoot();
  const node = entry(root, "raid-debt-a-carrier", status);
  return fieldProblems("claims", META, ARGS, "- [owed] tsp-demo — raid-debt-a-carrier", [node], root);
}

// EVERY LIVE STATUS CARRIES A CLAIM. Each has an owner and a trigger, which is
// the reason the check's own comment gives for demanding a reference at all.
for (const status of ["open", "accepted", "probed", "mitigated", "deferred"]) {
  test(`an owed box rests on a ${status} entry`, () => {
    assert.deepEqual(owedAgainst(status), [], `${status} is live — somebody is still holding the claim`);
  });
}

// AND THE SETTLED ONES REFUSE, exactly like an unchecked box, because there is
// nobody left holding the claim.
for (const status of ["closed", "decided", "superseded"]) {
  test(`an owed box resting on a ${status} entry refuses`, () => {
    const problems = owedAgainst(status);
    assert.equal(problems.length, 1, `${status} is settled: ${JSON.stringify(problems)}`);
    assert.match(problems[0], /tsp-demo/, "the refusal names the item");
    assert.match(problems[0], /raid-debt-a-carrier/, "and the reference that did not resolve");
  });
}

test("an owed box pointing at nothing refuses", () => {
  const root = freshRoot();
  const problems = fieldProblems("claims", META, ARGS, "- [owed] tsp-demo — raid-nothing-here", [], root);
  assert.equal(problems.length, 1, `a missing entry refuses: ${JSON.stringify(problems)}`);
});

test("an unchecked box still refuses, and an owed one is not a tick", () => {
  const root = freshRoot();
  assert.equal(fieldProblems("claims", META, ARGS, "- [ ] tsp-demo", [], root).length, 1, "unchecked refuses");
  assert.deepEqual(fieldProblems("claims", META, ARGS, "- [x] tsp-demo", [], root), [], "checked passes");
});
