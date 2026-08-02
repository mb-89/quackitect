// Reading a SET of files in one call.
//
// Read-proof is a set, not a sequence: leaving boot demands eight hashes
// together. Asking one at a time paid a round trip per document, and this
// session's own boot spent eight of them before the tool existed.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { bootedServer, call, freshRoot } from "./helpers.ts";

interface Multi {
  files: { path: string; hash?: string; content?: string; refused?: { clause: string; remedy: unknown } }[];
  failed?: number;
}

test("se_file_read takes a set, and every entry carries its own hash", async () => {
  const server = await bootedServer(freshRoot());
  for (const n of ["one", "two", "three"]) {
    await call(server, "se_file_write", { path: `${n}.md`, content: `body of ${n}\n`, base_hash: null });
  }
  const r = await call(server, "se_file_read", { paths: ["one.md", "two.md", "three.md"] });
  assert.equal(r.isError, false, JSON.stringify(r.body));
  const m = r.body as unknown as Multi;
  assert.equal(m.files.length, 3);
  assert.equal(m.failed, undefined, "nothing failed, so nothing is reported failed");
  for (const f of m.files) {
    assert.ok(f.hash, `${f.path} came back with the hash a write will demand`);
    assert.match(String(f.content), /body of/);
  }
  // The hashes are the SAME tokens a single read hands out — a set read is
  // not a weaker proof.
  const single = await call(server, "se_file_read", { path: "two.md" });
  assert.equal((single.body as { hash: string }).hash, m.files[1].hash);
});

test("one bad path refuses for itself, and the good ones still arrive", async () => {
  const server = await bootedServer(freshRoot());
  await call(server, "se_file_write", { path: "here.md", content: "here\n", base_hash: null });
  const r = await call(server, "se_file_read", { paths: ["here.md", "gone.md"] });
  assert.equal(r.isError, false, "a set read does not fail whole because one entry did");
  const m = r.body as unknown as Multi;
  assert.equal(m.files.length, 2);
  assert.equal(m.failed, 1);
  assert.ok(m.files[0].hash, "the readable file still came back");
  assert.ok(m.files[1].refused, "the missing one carries its own refusal");
  assert.ok(m.files[1].refused?.remedy, "with a remedy, like any other refusal");
});

test("a set read takes per-file windows, and refuses a greedy call", async () => {
  const server = await bootedServer(freshRoot());
  await call(server, "se_file_write", { path: "long.md", content: Array.from({ length: 40 }, (_, i) => `line ${i + 1}`).join("\n"), base_hash: null });
  const r = await call(server, "se_file_read", { paths: [{ path: "long.md", offset: 5, limit: 2 }] });
  const m = r.body as unknown as Multi;
  assert.match(String(m.files[0].content), /line 5/);
  assert.doesNotMatch(String(m.files[0].content), /line 8/, "the window holds");

  // A cheap multi-read makes it easy to pull documents nobody needed.
  const greedy = await call(server, "se_file_read", { paths: Array.from({ length: 21 }, (_, i) => `f${i}.md`) });
  assert.equal(greedy.isError, true);
  assert.match(String(greedy.body.expected), /at most 20/);
});

test("se_file_read still refuses when nothing is named", async () => {
  const server = await bootedServer(freshRoot());
  const r = await call(server, "se_file_read", {});
  assert.equal(r.isError, true);
  assert.match(String(r.body.expected), /path .*or paths/);
});
