// THE RESOLUTION SEAM (tsp-bound-resolution). Written test-first at i27's
// author-tests, against a seam that is decided and not yet built.
//
// SOME CASES PASS TODAY and two are RED on purpose. The red ones are the
// design's owed work, stated as an executable claim rather than as prose: a
// resolution that names its store, and a call naming trunk that routes
// instead of refusing.
//
// exp-one-seam measured the ground this rests on. A child shell inherits its
// working directory, the platform refuses no escape, and one path string
// reached two different trees on 2026-08-14.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import * as paths from "../engine/paths.ts";
import { anyGuidanceDoc } from "./helpers.ts";

// ASKED, NEVER NAMED. These tests are about the SEAM, not about any one page,
// so moving guidance must change the answer rather than falsify the test.
const GUIDE = anyGuidanceDoc();

import { resolve as seam } from "../engine/resolve.ts";

const ROOT = mkdtempSync(join(tmpdir(), "se-resolve-"));

// ---------------------------------------------------------------- the jail

test("a root-relative path resolves inside the root", () => {
  const abs = paths.resolveInRoot(ROOT, "spec/thing.md", "test");
  assert.equal(abs.startsWith(ROOT), true, "a path inside the root must resolve inside it");
});

test("a relative path climbing out of the root is refused", () => {
  assert.throws(
    () => paths.resolveInRoot(ROOT, "../../elsewhere.md", "test"),
    /inside the project root/,
    "the platform serves an escaping path without complaint, so the seam must refuse it",
  );
});

test("an absolute path outside the root is refused", () => {
  assert.throws(() => paths.resolveInRoot(ROOT, join(tmpdir(), "not-mine.md"), "test"), /inside the project root/);
});

test("a declared root is read-only, so the write lane refuses it", () => {
  assert.throws(() => paths.resolveInRoot(ROOT, "@desktop/sketch.png", "test"), /READ-ONLY/);
});

// ------------------------------------------------- what decides the store

test("the kind of a path decides its store, never where the walk stands", () => {
  assert.equal(paths.pathKind(".se/notes.jsonl"), "session");
  assert.equal(paths.pathKind(GUIDE), "method");
  assert.equal(paths.pathKind("deliverable/engine/session.ts"), "method");
  assert.equal(paths.pathKind("spec/iterations/i27-x/evidence/a.md"), "record");
  assert.equal(paths.pathKind("spec/trace/requirement/req-x.md"), "content");
});

test("a record path names the record that owns it", () => {
  assert.deepEqual(paths.recordOwnerOf("spec/iterations/i27-x/evidence/a.md"), {
    container: "iterations",
    id: "i27-x",
  });
});

// THE SEAM'S CHOOSING HALF IS GONE (i34), and the cases that proved it chose
// correctly go with it. What replaces them is the demand that it CANNOT
// choose: req-every-record-path-resolves-in-one-tree asks for the absence of a
// chooser, so what these cases now assert is sameness.
//
// WHAT WAS HERE AND WHY IT IS NOT ANY MORE:
//
// - `fansOut` said a method path must reach every tree. One tree, so it does.
// - `Roots.bound` was the second store. There is no second store.
//
// THE DEFECT THEY GUARDED IS STILL GUARDED, and by a stronger check: two lanes
// asking for one path cannot differ when there is only one place to look.

test("every path resolves to the one root, whatever kind it is", () => {
  const machine = join(ROOT, "repo");
  const session = seam(machine, ".se/HANDOVER.md", "lint");
  const method = seam(machine, GUIDE, "lint");
  const content = seam(machine, "spec/trace/requirement/req-x.md", "lint");
  assert.equal(session.store, machine, "session state resolves to the root");
  assert.equal(method.store, machine, "shared method resolves to the root");
  assert.equal(content.store, machine, "a record's content resolves to the root");
});

// AN ASSERTION THAT CANNOT FAIL REPORTS COVERAGE IT NEVER HAD. What proves
// one store answers is the inspection spec tsp-read-back-inspection and the
// case below, which pins that two lanes asking for one path get one answer.

test("two lanes asking for one path get one answer, which is the 2026-08-14 defect", () => {
  // se_lint once resolved `.se/HANDOVER.md` against one store while the file
  // lane resolved it against another. Both were correct against their own
  // ambient root, and neither answer said which.
  const asLint = seam(ROOT, ".se/HANDOVER.md", "lint");
  const asFileLane = seam({ machine: ROOT }, ".se/HANDOVER.md", "files");
  assert.equal(asLint.abs, asFileLane.abs, "one path string must reach one tree");
  assert.equal(asLint.store, asFileLane.store);
});

test("a bare root and a Roots object are the same thing now", () => {
  // A bare string used to mean "the tree I am standing in", with the machine
  // root derived from it. It means the root, and the two forms agree.
  const asString = seam(ROOT, "spec/trace/requirement/req-x.md", "test");
  const asObject = seam({ machine: ROOT }, "spec/trace/requirement/req-x.md", "test");
  assert.equal(asString.abs, asObject.abs);
  assert.equal(asString.store, asObject.store);
});

// ------------------------------------------------ the seam says where it went

test("every resolution names the store it resolved to", () => {
  const r = seam(ROOT, "spec/thing.md", "test");
  assert.equal(r.store, ROOT, "the answer must name the root that served it");
  assert.equal(r.abs.startsWith(ROOT), true);
});

test("every resolution names the owner, so routing is visible at the call", () => {
  assert.deepEqual(seam(ROOT, GUIDE, "test").owner, { kind: "core" });
  assert.deepEqual(seam(ROOT, "spec/iterations/i27-x/evidence/a.md", "test").owner, {
    kind: "record",
    container: "iterations",
    id: "i27-x",
  });
  assert.deepEqual(seam(ROOT, "spec/trace/requirement/req-x.md", "test").owner, { kind: "bound" });
});

test("a call naming a different owner is routed rather than refused as an escape", () => {
  // Method belongs to the core. Today SE-C-134 refuses this write from inside
  // a record; routing says who owns it instead of saying no.
  assert.deepEqual(paths.routeToOwner("deliverable/engine/paths.ts"), { kind: "core" });
  assert.deepEqual(paths.routeToOwner(".se/HANDOVER.md"), { kind: "core" });
});

test("routing never refuses, because a misresolution and a different owner are not the same thing", () => {
  // The seam REFUSES an escaping path...
  assert.throws(() => seam(ROOT, "../../elsewhere.md", "test"), /inside the project root/);
  // ...and routing ANSWERS for a path owned elsewhere. Confusing the two is
  // what closes the door method changes and commits both use.
  assert.deepEqual(paths.routeToOwner(GUIDE), { kind: "core" });
});

// ------------------------------- a write is proved by reading back, per kind
//
// tsp-read-back-inspection checks the SHAPE of these: every case writes, then
// reads back from the store the answer named. None concludes from the write
// not throwing.

/** Write through the seam, then read back from the store it named. */
function writeThenReadBack(rel: string, body: string): { readBack: string; store: string } {
  const r = seam(ROOT, rel, "test");
  mkdirSync(dirname(r.abs), { recursive: true });
  writeFileSync(r.abs, body, "utf8");
  return { readBack: readFileSync(join(r.store, rel), "utf8"), store: r.store };
}

test("a method write reads back from the store the answer named", () => {
  const { readBack, store } = writeThenReadBack("guidance/probe.md", "method body");
  assert.equal(readBack, "method body");
  assert.equal(store, ROOT);
});

test("a record write reads back from that record's store", () => {
  const rel = "spec/iterations/i27-x/evidence/probe.md";
  const { readBack, store } = writeThenReadBack(rel, "record body");
  assert.equal(readBack, "record body");
  assert.equal(store, ROOT);
});

test("a session write reads back from the project root and nowhere else", () => {
  const { readBack, store } = writeThenReadBack(".se/probe.md", "session body");
  assert.equal(readBack, "session body");
  assert.equal(store, ROOT);
});

test("a repo-root file reads back from the root", () => {
  const { readBack, store } = writeThenReadBack("README-probe.md", "root body");
  assert.equal(readBack, "root body");
  assert.equal(store, ROOT);
});

// -------------------------------------------- the bound that travels

// AN ACT THAT PRODUCES A TREE IS BOUNDED BY THE TREE IT IS PRODUCING, for the
// duration of that act and no longer
// (raid-dec-a-producing-act-is-bounded-by-the-tree-it-produces). The rule does
// not change — every act writes inside one tree and nowhere else. What changes
// is that WHICH tree is asked rather than assumed.
//
// RED UNTIL chunk-travelling-bound LANDS.

test("a write during a producing act lands in the tree being produced", async () => {
  const { withActBound } = await import("../engine/resolve.ts");
  const produced = mkdtempSync(join(tmpdir(), "se-produced-"));
  // A METHOD PATH ON PURPOSE. Method resolves to the machine root whatever is
  // bound, which is correct during a walk and catastrophic during production:
  // it would write the ENGINE while copying it. The act's bound has to beat
  // the kind routing, and this case is where that is proved.
  const landed = withActBound(produced, "test", () => seam(ROOT, GUIDE, "test").abs);
  assert.ok(landed.startsWith(produced), `the act's bound must answer, and the write went to ${landed}`);
});

test("a write outside the act's bound is refused, naming the tree being produced", async () => {
  const { withActBound } = await import("../engine/resolve.ts");
  const produced = mkdtempSync(join(tmpdir(), "se-produced-"));
  let said = "";
  try {
    withActBound(produced, "test", () => seam(ROOT, join(tmpdir(), "somewhere-else.md"), "test"));
  } catch (e) {
    const r = e as { expected?: string; got?: string };
    said = `${r.expected ?? ""} ${r.got ?? ""} ${String((e as Error).message ?? "")}`;
  }
  // A WRITE THAT LEFT THE ACT'S BOUND IS A DIFFERENT FAULT from one that left
  // the project, and telling them apart is what makes the mechanism
  // debuggable. So the refusal has to name the tree the act is producing.
  assert.ok(
    said.includes(produced),
    `the refusal must name the tree being produced — it said: ${said.trim() || "nothing, it did not refuse"}`,
  );
  assert.ok(
    /produc/i.test(said),
    `and it must say the bound came from a producing act — it said: ${said.trim() || "nothing, it did not refuse"}`,
  );
});

test("a READ during a producing act still reaches the tree being copied", async () => {
  const { withActBound } = await import("../engine/resolve.ts");
  const produced = mkdtempSync(join(tmpdir(), "se-produced-"));
  const read = withActBound(produced, "test", () => seam(ROOT, GUIDE, "test", true).abs);
  assert.ok(read.startsWith(ROOT), `the act copies FROM the engine, so a read must not be bounded by what it produces — it read ${read}`);
});

test("the bound is torn down even when the act fails", async () => {
  const { withActBound } = await import("../engine/resolve.ts");
  const produced = mkdtempSync(join(tmpdir(), "se-produced-"));
  assert.throws(
    () =>
      withActBound(produced, "test", () => {
        throw new Error("the act failed");
      }),
    /the act failed/,
  );
  // AN ACT THAT OPENS A BOUND AND FAILS MUST LEAVE NOTHING BOUND BEHIND, or
  // the bound stops being a property of the act and becomes a mode somebody
  // left switched on.
  const after = seam(ROOT, "spec/thing.md", "test").abs;
  assert.ok(after.startsWith(ROOT), `an ordinary write after a failed act must be back on the project root, and it went to ${after}`);
});

test("a second act cannot open a bound while one is open", async () => {
  const { withActBound } = await import("../engine/resolve.ts");
  const a = mkdtempSync(join(tmpdir(), "se-produced-a-"));
  const b = mkdtempSync(join(tmpdir(), "se-produced-b-"));
  assert.throws(
    () => withActBound(a, "test", () => withActBound(b, "test", () => 0)),
    "one act names one tree; a nested bound is how a write lands in the wrong one",
  );
});

// WHERE THE BOUND IS ENFORCED, which is not where it is most obvious.
//
// Measured: the seam is imported by engine/tools.ts and by this
// file, and tools.ts reaches it twice, both times for se_lint READS. Every
// file WRITE verb calls resolveInRoot directly. A bound placed only at the
// seam would therefore guard two reads and nothing else.

test("the bound catches the jail every write verb calls, not only the seam", async () => {
  const { withActBound } = await import("../engine/resolve.ts");
  const produced = mkdtempSync(join(tmpdir(), "se-produced-"));
  const landed = withActBound(produced, "test", () => paths.resolveInRoot(ROOT, "spec/thing.md", "test"));
  assert.ok(landed.startsWith(produced), `resolveInRoot must honour the act's bound, and the write went to ${landed}`);
});

test("a read stays unbounded even though it shares the containment rule", async () => {
  const { withActBound } = await import("../engine/resolve.ts");
  const produced = mkdtempSync(join(tmpdir(), "se-produced-"));
  const read = withActBound(produced, "test", () => paths.resolveForRead(ROOT, GUIDE, "test"));
  assert.ok(read.startsWith(ROOT), `resolveForRead must stay on the project root during an act, and it read ${read}`);
});

// THE CONTAINMENT RULE HAS ONE HOME, and the separator is the whole of it.
//
// FIVE SITES HELD THIS QUESTION and they did not agree. One tested a bare
// prefix, which puts `/x/vaultevil` inside `/x/vault`, and it guarded a write.
// scope-non-goals graded that crippling and put it in scope even if every door
// were dismissed.
test("a sibling whose name merely starts with the directory's is not inside it", () => {
  const home = join(tmpdir(), "jail");
  assert.equal(
    paths.isInside(home, join(tmpdir(), "jailbreak", "x.md")),
    false,
    "a bare prefix test would call this contained, and one did",
  );
  assert.equal(paths.isInside(home, join(home, "x.md")), true, "and a real child is still inside");
});

// THE COPIES DISAGREED ABOUT THE DIRECTORY ITSELF TOO, and that difference is
// real rather than an accident: a jail admits its own root, and a guard over a
// recursive delete must not.
test("whether a directory is inside itself is the caller's to say", () => {
  const home = join(tmpdir(), "jail");
  assert.equal(paths.isInside(home, home), true, "a jail admits its own root by default");
  assert.equal(paths.isInside(home, home, false), false, "and the bench guard asks for strictly under");
});

// BOTH SHAPES OF ESCAPE, because the copies caught different ones.
test("climbing out is refused whether the target is relative or absolute", () => {
  const home = join(tmpdir(), "jail");
  assert.equal(paths.isInside(home, join("..", "elsewhere", "x.md")), false, "a relative climb leaves the directory");
  assert.equal(paths.isInside(home, join(tmpdir(), "elsewhere", "x.md")), false, "and so does an absolute path pointing away");
});

// AND THE COPIES MUST NOT COME BACK. A ratchet, not a style rule: each of these
// files held its own containment test, and one of them was wrong.
test("no module writes its own containment test", () => {
  for (const file of ["bases.ts", "tables.ts", "benchmark.ts"]) {
    const src = readFileSync(new URL(`../engine/${file}`, import.meta.url), "utf8");
    assert.ok(src.includes("isInside("), `${file} asks the one predicate`);
    assert.ok(!src.includes('startsWith("..")'), `${file} tests containment by hand again, which is how the five disagreed`);
  }
});
