// THE WALK'S FEEDBACK LOOP — places the machine knows something and does not
// say it. i3's charter.
//
// TEST-FIRST: the reproduction is the requirement's voice, and a behaviour fix
// with no reproducing check is the lazy work the process exists to stop. Both
// cases here are RED until i3 builds its half.
//
// THE ORACLE IS `credited`, NOT THE OWED LIST. A first draft asserted that
// route_reads falls to zero after a read, and both cases then failed at that
// precondition instead of at their claim — coverage that proves nothing, which
// is the exact failure this file's spec warns about. The way ahead recomputes
// what it demands, so the owed list is not a credit ledger.
//
// What IS a credit ledger is the read's own answer. reading.test.ts pins the
// rule these cases build on: read the reading twice in one session and the
// second read credits nothing, because nothing is credited twice.
//
// So a surviving credit is observable as an EMPTY `credited` after a reload,
// and a died credit is observable as the same documents credited all over
// again.
import { strict as assert } from "node:assert";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot } from "./helpers.ts";

// THIS FILE WRITES process.env, so it stays sequential and quarantined here
// rather than sharing a file with independent cases. The credit rides the
// session stamp on purpose — it restores for THIS session and never the next,
// which is what keeps req-compaction-reowes-the-reading true. A case with no
// stamp would prove the opposite of what it claims.
process.env.SE_SESSION = "feedback-loop-test";

// A RELOAD IS A NEW PROCESS OVER ONE TREE. A test cannot replace its own
// process, so it does the one thing a reload does that matters here: it makes
// the stored credit belong to a DIFFERENT process. Same session, new engine.
//
// Without this the case would prove the opposite of what it claims. Two
// Session objects inside one process are NOT a reload, and reads.test.ts
// exists to forbid the second one inheriting anything.
const simulateReload = (root: string): void => {
  const p = join(root, ".se", "settings.json");
  const s = JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown>;
  s.reads_pid = process.pid + 1;
  writeFileSync(p, `${JSON.stringify(s)}\n`, "utf8");
};

const readTheReading = async (root: string): Promise<string[]> => {
  const session = new Session(root);
  const server = buildServer(root, session);
  const got = await call(server, "se_file_read", { path: ".se/reading.md" });
  assert.equal(got.isError, false, JSON.stringify(got.body));
  return got.body.credited as string[];
};

// A RELOAD IS A SECOND SESSION OVER ONE ROOT. That is what se_reload does to
// the engine: the process is replaced and the tree is not.
//
// req-reading-credit-survives-a-reload
test("the reading credit survives a reload", async () => {
  const root = freshRoot();

  const first = await readTheReading(root);
  assert.ok(first.length > 0, "a fresh root owes reading, or this case proves nothing");

  simulateReload(root);
  const afterReload = await readTheReading(root);
  assert.deepEqual(afterReload, [], "RED until i3: the credit keys to document content and survives the reload, so nothing is owed again");
});

// THE OTHER HALF OF THE SAME DEMAND. A credit that survived everything would
// be worse than one that survives nothing, because the reader would hold old
// words while the engine called them read.
//
// req-reading-credit-survives-a-reload
test("a document whose content moved is owed again", async () => {
  const root = freshRoot();

  const credited = await readTheReading(root);
  const moved = credited[0];
  assert.ok(moved !== undefined, "something was credited, or there is nothing to move");

  // THE FIXTURE WRITES THROUGH THE FILESYSTEM, never the lane. At boot the
  // lane allows se_pull and se_file_read only, and walking the session
  // somewhere writable would change the very reading this case measures.
  appendFileSync(join(root, moved), "\nA line that moves the content.\n", "utf8");

  simulateReload(root);
  const afterReload = await readTheReading(root);
  assert.deepEqual(afterReload, [moved], "RED until i3: exactly the changed document is owed again, and no credit outlives its own words");
});

// THE TWO REMAINING CHARTER ITEMS OWE THEIR FIXTURES, and neither is written
// here rather than written badly.
//
// - req-red-objective-serves-its-fill needs a route whose OBJECTIVE carries a
//   red claim. A fresh root walks boot to the desk with nothing red, so the
//   fixture has to stand a record up and redden the state the route lands on.
// - req-one-verb-says-why-a-state-is-grey needs the verb's name, which is a
//   design decision this iteration has not taken. Asserting against a name
//   nobody chose would fail for the wrong reason — which is precisely what
//   this file's first draft did, and why the oracle above changed.
//
// Both are named in tsp-walk-feedback-loop as steps this state still owes.
