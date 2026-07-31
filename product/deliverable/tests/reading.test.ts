// THE READING — one document for the whole way.
//
// Naming the paths was never the expensive part; asking for them was. A list
// of eight documents is still eight things to fetch, and a boot that split
// the list into two calls read the same set twice as slowly. So the engine
// concatenates everything still owed into ONE file, serves it like any other,
// and credits every document it showed.
//
// The proof that matters is the LAST one here: after reading that single
// file, a walk to the target passes every read gate with NO read_hashes at
// all. If crediting were cosmetic, that sweep would refuse.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot, READ_DOCS } from "./helpers.ts";

interface Reading {
  path: string;
  documents: number;
  note: string;
}

test("the first packet hands over one file, not a list of chores", async () => {
  const server = buildServer(freshRoot());
  const first = await call(server, "se_tick", {});
  const reading = first.body.reading as unknown as Reading;
  assert.ok(reading !== undefined, "anything owed means a reading is offered");
  assert.equal(reading.path, ".se/reading.md", "one known path, so nothing has to be remembered");
  assert.equal(reading.documents, (first.body.route_reads as string[]).length, "it holds exactly what the way demands");
});

test("one read of the reading carries the whole walk, with no hashes to send", async () => {
  const server = buildServer(freshRoot());
  const first = await call(server, "se_tick", {});
  const owed = (first.body.route_reads as string[]).length;

  const got = await call(server, "se_file_read", { path: ".se/reading.md" });
  assert.equal(got.isError, false, JSON.stringify(got.body));
  const credited = got.body.credited as string[];
  assert.equal(credited.length, owed, "reading it credited every document inside it");
  for (const p of READ_DOCS) {
    assert.ok(credited.includes(p), `${p} rode in the reading and was credited by it`);
  }
  const content = String(got.body.content);
  assert.ok(content.includes("# The reading"), "it introduces itself");
  for (const p of READ_DOCS) {
    assert.ok(content.includes(`## ${p}`), `${p} is headed by its own path, so a reader can tell the parts apart`);
  }

  // THE POINT: no read_hashes. The engine credited what it served.
  const swept = await call(server, "se_tick", { to: "front_desk", sweep: true });
  assert.equal(swept.isError, false, JSON.stringify(swept.body));
  assert.deepEqual(swept.body.active, ["front_desk"], `every read gate on the way was already satisfied: ${JSON.stringify(swept.body.refusal ?? swept.body.note)}`);
});

test("the reading holds only what is still owed", async () => {
  const server = buildServer(freshRoot());
  await call(server, "se_tick", {});
  await call(server, "se_file_read", { path: ".se/reading.md" });
  const again = await call(server, "se_file_read", { path: ".se/reading.md" });
  assert.deepEqual(again.body.credited, [], "nothing is credited twice");
  assert.ok(String(again.body.content).includes("Nothing is owed"), "read once, it says so plainly rather than repeating itself");
});

test("a page credits only the documents it showed whole", async () => {
  const server = buildServer(freshRoot());
  const first = await call(server, "se_tick", {});
  const owed = (first.body.route_reads as string[]).length;
  // Four lines is the reading's own preamble and nothing else.
  const page = await call(server, "se_file_read", { path: ".se/reading.md", offset: 1, limit: 4 });
  assert.deepEqual(page.body.credited, [], "half a document is not a read, and no document fits in four lines");
  const still = await call(server, "se_tick", {});
  assert.equal((still.body.reading as unknown as Reading).documents, owed, "nothing was waved through, so everything is still owed");
});

test("a multi-read is remembered too, so its hashes never have to be carried", async () => {
  const server = buildServer(freshRoot());
  const reads = (await call(server, "se_tick", {})).body.route_reads as string[];
  const got = await call(server, "se_file_read", { paths: reads });
  assert.equal(got.isError, false, JSON.stringify(got.body));
  // No read_hashes: the buffer filled itself from the set, as it always did
  // for a single path. Only the multi shape was ever forgotten.
  const swept = await call(server, "se_tick", { to: "front_desk", sweep: true });
  assert.deepEqual(swept.body.active, ["front_desk"], `a set read in one call proves as much as one read at a time: ${JSON.stringify(swept.body.refusal ?? swept.body.note)}`);
});
