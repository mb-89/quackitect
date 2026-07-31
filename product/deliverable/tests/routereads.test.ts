// THE WAY'S READING, HANDED OVER UNASKED.
//
// The target is known before the first step, so the reading it takes to
// reach it is known with it. Revealing that one state at a time cost a
// round trip per wave: a real boot spent three read calls on eleven
// documents, and an agent that has just started knows no special syntax to
// ask for better. The packet carries the list, or nothing does.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot, READ_DOCS } from "./helpers.ts";

interface Multi {
  files: { path: string; hash?: string }[];
}

test("the first packet names every document the way to the target demands", async () => {
  const server = buildServer(freshRoot());
  const first = await call(server, "se_tick", {});
  assert.equal(first.body.target, "front_desk", "the session aims at the front desk from its first breath");
  const reads = first.body.route_reads as string[];
  assert.ok(Array.isArray(reads), "the way's reading arrives without being asked for");
  for (const p of READ_DOCS) {
    assert.ok(reads.includes(p), `${p} is demanded on the way and must be listed`);
  }
});

test("one read of the listed set carries the whole walk to the target", async () => {
  const root = freshRoot();
  // A handover is only sometimes there. When it is, it is read like the rest.
  mkdirSync(join(root, ".se"), { recursive: true });
  writeFileSync(join(root, ".se", "HANDOVER.md"), "# Handover\n\nNothing outstanding.\n", "utf8");
  const server = buildServer(root);

  const reads = (await call(server, "se_tick", {})).body.route_reads as string[];
  assert.ok(reads.includes(".se/HANDOVER.md"), "a handover that exists joins the list");

  // ONE read for the whole way. This is the point of the list.
  const got = await call(server, "se_file_read", { paths: reads });
  assert.equal(got.isError, false, JSON.stringify(got.body));
  const read_hashes: Record<string, string> = {};
  for (const f of (got.body as unknown as Multi).files) {
    if (f.hash !== undefined) read_hashes[f.path] = f.hash;
  }
  assert.equal(Object.keys(read_hashes).length, reads.length, "every listed document came back readable");

  // ONE sweep, proving those same hashes at every gate on the way.
  const swept = await call(server, "se_tick", { to: "front_desk", sweep: true, read_hashes });
  assert.equal(swept.isError, false, JSON.stringify(swept.body));
  assert.deepEqual(swept.body.active, ["front_desk"], "the way was walked on the reading the packet named");
});

test("the list goes away once the target is reached", async () => {
  const root = freshRoot();
  const server = buildServer(root);
  const reads = (await call(server, "se_tick", {})).body.route_reads as string[];
  const got = await call(server, "se_file_read", { paths: reads });
  const read_hashes: Record<string, string> = {};
  for (const f of (got.body as unknown as Multi).files) {
    if (f.hash !== undefined) read_hashes[f.path] = f.hash;
  }
  const swept = await call(server, "se_tick", { to: "front_desk", sweep: true, read_hashes });
  assert.equal(swept.body.target, "", "arriving clears the target");
  assert.equal(swept.body.route_reads, undefined, "with nowhere to be, there is no reading to hand over");
});
