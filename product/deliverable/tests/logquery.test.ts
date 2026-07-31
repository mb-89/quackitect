// Paging and searching the call log — the lane's door onto its own trail.
//
// A window with no way to ask for the next one is not a door. A fifty-record
// answer once ran past the token ceiling and was saved outside the project
// root, where the lane could not read it at all.
//
// THE LOG OBSERVES ITSELF, and every assertion here has to survive that: a
// query is a call, so asking a question APPENDS a record and the next
// question sees a longer log. Nothing below compares record identity across
// two calls, because that comparison is a race with the logger.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { bootedServer, call, freshRoot } from "./helpers.ts";

interface Page {
  total: number;
  offset: number;
  older: number;
  records: { ref: string; tool: string }[];
}

async function page(server: Awaited<ReturnType<typeof bootedServer>>, args: Record<string, unknown>): Promise<Page> {
  const r = await call(server, "se_log_query", args);
  assert.equal(r.isError, false, JSON.stringify(r.body));
  return r.body as unknown as Page;
}

test("se_log_query pages backwards from the newest, and accounts for the whole log", async () => {
  const server = await bootedServer(freshRoot());
  for (const name of ["alpha", "beta", "gamma"]) {
    await call(server, "se_file_write", { path: `${name}.md`, content: name, base_hash: null });
  }

  // THE INVARIANT: a window plus what stands in front of it plus what stands
  // behind it IS the log. It holds at any offset, which is what makes the
  // caller able to walk the whole thing without guessing.
  for (const offset of [0, 1, 3]) {
    const p = await page(server, { limit: 2, offset });
    assert.equal(p.offset, offset);
    assert.ok(p.records.length <= 2, "limit caps the window");
    assert.equal(p.older + p.records.length + p.offset, p.total, `the window accounts for the log at offset ${offset}`);
  }

  const newest = await page(server, { limit: 1 });
  assert.equal(newest.offset, 0, "no offset means the newest window");
  assert.equal(newest.older, newest.total - 1, "everything else stands behind it");

  // Walking past the beginning stops empty rather than wrapping or throwing.
  const past = await page(server, { limit: 5, offset: 100_000 });
  assert.equal(past.records.length, 0);
  assert.equal(past.older, 0, "nothing stands behind the beginning");
});

test("se_log_query narrows by text, so finding a topic is not reading every record", async () => {
  const server = await bootedServer(freshRoot());
  for (const name of ["alpha", "beta", "gamma"]) {
    await call(server, "se_file_write", { path: `${name}.md`, content: name, base_hash: null });
  }

  const hits = await page(server, { filter: { text: "gamma" }, limit: 50 });
  assert.ok(hits.records.length > 0, "the write that named gamma is in there");
  for (const r of hits.records) {
    assert.match(JSON.stringify(r), /gamma/i, "every record returned actually carries the text");
  }

  // Case does not decide a match — a topic is a topic however it was typed.
  // The count only ever GROWS between the two, because the first query is
  // itself a record carrying the word.
  const upper = await page(server, { filter: { text: "GAMMA" }, limit: 50 });
  assert.ok(upper.records.length >= hits.records.length);
  for (const r of upper.records) assert.match(JSON.stringify(r), /gamma/i);

  const none = await page(server, { filter: { text: "no-such-topic-anywhere" }, limit: 50 });
  assert.equal(none.records.length, 0);
  assert.equal(none.total, 0, "a filter that matches nothing reports nothing, not the whole log");
});
