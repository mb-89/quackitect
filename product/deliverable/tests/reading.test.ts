// THE READING — one document for the whole way.
//
// Naming the paths was never the expensive part; asking for them was. A list
// of eight documents is still eight things to fetch, and a boot that split
// the list into two calls read the same set twice as slowly. So the engine
// concatenates everything still owed into ONE file, serves it like any other,
// and credits every document it showed.
//
// The proof that matters is the walk after each case: having read, a pull
// carries the whole way with nothing handed in. If crediting were cosmetic,
// that walk would stop at the first read gate.
//
// THE PULL is how an agent reads: se_reading, one call, one document, until
// the loop answers done. The concatenated file survives as the PERSON's view
// of the same list. A single document cannot be truncated by a host that
// moves large tool results to disk — which is exactly how a credited reading
// once went unread.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot, proofFor, READ_DOCS } from "./helpers.ts";

interface Reading {
  path: string;
  documents: number;
  note: string;
}

function pair(): { session: Session; server: ReturnType<typeof buildServer> } {
  const root = freshRoot();
  const session = new Session(root);
  return { session, server: buildServer(root, session) };
}

test("the first packet hands over one file, not a list of chores", () => {
  const { session } = pair();
  const first = session.packet() as { reading?: Reading; route_reads: string[] };
  assert.ok(first.reading !== undefined, "anything owed means a reading is offered");
  assert.equal(first.reading.path, ".se/reading.md", "one known path, so nothing has to be remembered");
  assert.equal(first.reading.documents, first.route_reads.length, "it holds exactly what the way demands");
});

test("one read of the reading carries the whole walk, with nothing handed in", async () => {
  const { session, server } = pair();
  const owed = (session.packet() as { route_reads: string[] }).route_reads.length;

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

  // THE POINT: nothing handed in. The engine credited what it served,
  // and a bare pull walks the default target (the desk).
  const walked = await call(server, "se_pull");
  assert.equal(walked.body.pull, "do", JSON.stringify(walked.body));
  assert.equal(walked.body.arrived, true, "every read gate on the way was already satisfied");
});

test("the reading holds only what is still owed", async () => {
  const { server } = pair();
  await call(server, "se_file_read", { path: ".se/reading.md" });
  const again = await call(server, "se_file_read", { path: ".se/reading.md" });
  assert.deepEqual(again.body.credited, [], "nothing is credited twice");
  assert.ok(String(again.body.content).includes("Nothing is owed"), "read once, it says so plainly rather than repeating itself");
});

test("a page credits only the documents it showed whole", async () => {
  const { session, server } = pair();
  const owed = (session.packet() as { route_reads: string[] }).route_reads.length;
  // Four lines is the reading's own preamble and nothing else.
  const page = await call(server, "se_file_read", { path: ".se/reading.md", offset: 1, limit: 4 });
  assert.deepEqual(page.body.credited, [], "half a document is not a read, and no document fits in four lines");
  const still = session.packet() as { reading: Reading };
  assert.equal(still.reading.documents, owed, "nothing was waved through, so everything is still owed");
});

test("the reading PULLS: one document a pull, until it stops asking", async () => {
  const { session, server } = pair();
  const owed = (session.packet() as { route_reads: string[] }).route_reads.length;

  const seen: string[] = [];
  let r = await call(server, "se_pull");
  // Bounded on purpose: a loop that never drains is the bug this guards.
  for (let i = 0; i < owed + 2 && r.body.pull === "read"; i++) {
    assert.equal(r.isError, false, JSON.stringify(r.body));
    const doc = r.body.document as { path: string; content: string };
    assert.ok(doc.content.length > 0, `${doc.path} came back as TEXT, not as a path to go and fetch`);
    assert.equal(r.body.remaining, owed - seen.length - 1, "it says how much is left, and counts down");
    const probes = (r.body.prove as { quote: string[] }).quote;
    assert.ok(probes.length > 1, "more than one probe, so the whole document has to be in hand");
    seen.push(doc.path);
    r = await call(server, "se_pull", { form: { read: proofFor(doc.content) } });
  }
  assert.notEqual(r.body.pull, "read", "pulling until nothing comes back terminates");
  assert.deepEqual(seen.length, owed, "one pull per document the way demanded");
  assert.equal(new Set(seen).size, seen.length, "what is read is never served twice");
  for (const p of READ_DOCS) assert.ok(seen.includes(p), `${p} was handed over by the loop`);

  // THE POINT: the proofs credited what was served, so the walk goes on.
  assert.equal(r.body.pull, "do", JSON.stringify(r.body));
  assert.equal(r.body.arrived, true);
});

test("a wrong answer credits nothing, and the same document comes again", async () => {
  const { server } = pair();
  const first = await call(server, "se_pull");
  const doc = first.body.document as { path: string; content: string };
  const again = await call(server, "se_pull", { form: { read: "not what the document says" } });
  assert.equal(again.body.pull, "read", "a wrong answer does not move the walk");
  assert.equal((again.body.document as { path: string }).path, doc.path, "the same document is served again");
});

test("the END alone is not enough — a lazy reader that skips to it is refused", async () => {
  const { server } = pair();
  const first = await call(server, "se_pull");
  const doc = first.body.document as { path: string; content: string };
  const tailOnly = doc.content.split(/\s+/).filter((w) => w !== "").slice(-8).join(" ");
  const again = await call(server, "se_pull", { form: { read: tailOnly } });
  assert.equal(again.body.pull, "read", "answering only the last probe proves only the last page");
  assert.equal((again.body.document as { path: string }).path, doc.path);
});

test("the reading is machinery: no state can gate it", () => {
  const { session } = pair();
  const first = session.packet() as { legal_tools: string[]; reading: { tool?: string } };
  assert.ok(first.legal_tools.includes("se_pull"), "the one verb is legal in every state");
  assert.equal(first.reading.tool, "se_pull", "and the packet says so where anything is owed");
});

test("a multi-read is remembered too, so nothing ever has to be carried", async () => {
  const { session, server } = pair();
  const reads = (session.packet() as { route_reads: string[] }).route_reads;
  const got = await call(server, "se_file_read", { paths: reads });
  assert.equal(got.isError, false, JSON.stringify(got.body));
  // The buffer filled itself from the set, as it always did for a single
  // path. Only the multi shape was ever forgotten.
  const walked = await call(server, "se_pull");
  assert.equal(walked.body.pull, "do", JSON.stringify(walked.body));
  assert.equal(walked.body.arrived, true, "a set read in one call proves as much as one read at a time");
});
