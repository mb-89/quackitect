// THE WAY'S READING, HANDED OVER UNASKED.
//
// The target is known before the first step, so the reading it takes to
// reach it is known with it. The agent's half of this is the pull: it
// answers `read` and serves the whole way's documents, one a
// call. The PACKET half (route_reads) still serves the mirror — the
// person sees what the way demands — and one multi-read of that list
// still credits the lot, so a single lane read can carry a whole walk.
import { strict as assert } from "node:assert";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot, READ_DOCS } from "./helpers.ts";

test("the first packet names every document the way to the target demands", () => {
  const s = new Session(freshRoot());
  const first = s.packet() as { target: string; route_reads: string[] };
  assert.equal(first.target, "front_desk", "the session aims at the front desk from its first breath");
  const reads = first.route_reads;
  assert.ok(Array.isArray(reads), "the way's reading arrives without being asked for");
  for (const p of READ_DOCS) {
    assert.ok(reads.includes(p), `${p} is demanded on the way and must be listed`);
  }
});

test("one multi-read of the listed set carries the whole walk to the target", async () => {
  const root = freshRoot();
  // A LEFT-BEHIND HANDOVER IS NOT PART OF THE WAY any more (owner ruling
  // 2026-08-07). It used to join the list whenever it existed; the whole
  // mechanism was retired, and the last session is derived from the call log
  // onto the boot banner instead. Written here to prove it is ignored rather
  // than merely absent.
  mkdirSync(join(root, ".se"), { recursive: true });
  writeFileSync(join(root, ".se", "HANDOVER.md"), "# Handover\n\nfrom the old world.\n", "utf8");
  const session = new Session(root);
  const server = buildServer(root, session);

  const reads = (session.packet() as { route_reads: string[] }).route_reads;
  assert.ok(!reads.includes(".se/HANDOVER.md"), `a handover on disk is not demanded: ${reads.join(", ")}`);
  assert.ok(reads.length > 0, "but the way still names the guidance it needs");

  // ONE read for the whole way — each served file credits itself.
  const got = await call(server, "se_file_read", { paths: reads });
  assert.equal(got.isError, false, JSON.stringify(got.body));

  // ONE pull walks the whole way on those credits: no read instruction,
  // straight to `do`, arrived at the default target.
  const walked = await call(server, "se_pull");
  assert.equal(walked.body.pull, "do", JSON.stringify(walked.body));
  assert.equal(walked.body.arrived, true, "the way was walked on the reading the packet named");
  assert.deepEqual(session.active(), ["front_desk"]);
});

test("the list goes away once the target is reached", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  const reads = (session.packet() as { route_reads: string[] }).route_reads;
  await call(server, "se_file_read", { paths: reads });
  const walked = await call(server, "se_pull");
  assert.equal(walked.body.arrived, true, JSON.stringify(walked.body));
  const after = session.packet() as { target: string; route_reads?: string[] };
  assert.equal(after.target, "", "arriving clears the target");
  assert.equal(after.route_reads, undefined, "with nowhere to be, there is no reading to hand over");
});
