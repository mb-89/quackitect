// THE TWO REAL BOUNDARIES, crossed for real.
//
// Everything else about the split is testable with an injected function. These
// are not: a worker thread and a child process either start and answer, or
// they do not, and only starting one finds out.
//
// THE ID CORRELATION IS THE PART WORTH TESTING HARDEST. Both channels are
// asynchronous, so two calls can be in flight at once. Without the id the
// second answer goes to whoever asked first — and that bug reads as a wrong
// RESOLUTION rather than as a crossed wire, which is the worst way for it to
// present.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import type { SatelliteSpec } from "../engine/bin/se-satellite.ts";
import { type Boundary, processBoundary, threadBoundary } from "../engine/transports.ts";

const RECORD = "project/spec/iterations/i27-x";

/** A tree with no override, so levelling has nothing to reconcile and the
 *  satellite comes up without needing a repository under it. */
function plainTree(): SatelliteSpec {
  const tree = mkdtempSync(join(tmpdir(), "se-bound-"));
  const abs = join(tree, "project/deliverable/engine/paths.ts");
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, "trunk's own", "utf8");
  return { record: "i27-x", tree, recordRel: RECORD, trunkBranch: "v3" };
}

/** A tree whose record overrides one engine file.
 *
 *  IT NEEDS A REAL REPOSITORY, and that is the levelling working rather than a
 *  test inconvenience: an override is what makes `levelRecordTree` reconcile,
 *  and reconciling is a merge. A tree with no override never touches git,
 *  which is why `plainTree` needs none. */
function overridingTree(): SatelliteSpec {
  const spec = plainTree();
  const abs = join(spec.tree, RECORD, "delta", "project/deliverable/engine/paths.ts");
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, "the record's own", "utf8");

  const git = (...a: string[]): void => {
    const r = spawnSync("git", a, { cwd: spec.tree, encoding: "utf8" });
    assert.equal(r.status, 0, `git ${a.join(" ")}: ${r.stderr}`);
  };
  // The trunk branch IS the current branch, so the merge is a no-op that still
  // exercises the real adapter rather than a stub.
  git("init", "-q", "-b", spec.trunkBranch);
  git("config", "user.name", "t");
  git("config", "user.email", "t@t");
  git("add", "-A");
  git("commit", "-q", "-m", "seed");
  return spec;
}

const BOUNDARIES: { name: string; make: (s: SatelliteSpec) => Boundary }[] = [
  { name: "thread", make: threadBoundary },
  { name: "process", make: processBoundary },
];

for (const b of BOUNDARIES) {
  describe(`the ${b.name} boundary`, () => {
    test("a call crosses and comes back naming the store", async () => {
      const spec = plainTree();
      const boundary = b.make(spec);
      try {
        const up = await boundary.cross({ record: spec.record, rel: "project/deliverable/engine/paths.ts", payload: {} });
        assert.equal(up.store, spec.tree, "the answer says WHICH tree produced it");
        assert.equal((up.body as { from: string }).from, "trunk", "nothing was overridden, so trunk answers");
      } finally {
        await boundary.stop();
      }
    });

    test("the record's own copy wins across the boundary too", async () => {
      const spec = overridingTree();
      const boundary = b.make(spec);
      try {
        const up = await boundary.cross({ record: spec.record, rel: "project/deliverable/engine/paths.ts", payload: {} });
        assert.equal((up.body as { from: string }).from, "record", "record first, trunk second, across a real boundary");
      } finally {
        await boundary.stop();
      }
    });

    test("CALLS IN FLIGHT AT ONCE each get their OWN answer", async () => {
      // The id correlation. Fire several without awaiting, then check every
      // answer matches the question that asked it.
      const spec = plainTree();
      const boundary = b.make(spec);
      const rels = ["a.ts", "b.ts", "c.ts", "d.ts", "e.ts"].map((n) => `project/deliverable/engine/${n}`);
      try {
        const ups = await Promise.all(rels.map((rel) => boundary.cross({ record: spec.record, rel, payload: {} })));
        for (const [i, up] of ups.entries()) {
          const abs = (up.body as { abs: string }).abs.replace(/\\/g, "/");
          assert.equal(abs.endsWith(rels[i]), true, `answer ${i} must be for the path that asked, got ${abs}`);
        }
      } finally {
        await boundary.stop();
      }
    });

    test("stopping REJECTS what is still waiting rather than hanging it", async () => {
      // A caller left awaiting a satellite that has gone is the hang
      // exp-watchdog measured the deadline for. An error somebody can read
      // beats a promise nobody settles.
      const spec = plainTree();
      const boundary = b.make(spec);
      const inflight = boundary.cross({ record: spec.record, rel: "project/deliverable/engine/paths.ts", payload: {} });
      // THE EXPECTATION IS ATTACHED BEFORE THE STOP, on purpose. Attaching it
      // afterwards leaves the rejection unhandled for a tick, and Node fails
      // the run for that rather than for anything the boundary did.
      const settled = assert.rejects(async () => {
        await inflight;
      });
      await boundary.stop();
      await settled;
    });
  });
}
