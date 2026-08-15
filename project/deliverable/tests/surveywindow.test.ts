// The survey LISTS what stands open, and can still be walked when the list
// is long.
//
// Answering in full was never enough on its own: at 43 pending notes the
// whole survey ran past the token ceiling and landed outside the project
// root, where the lane could not read it back. A listing carries a title and
// a priority; the body is one se_log_query {ref} away.
import { strict as assert } from "node:assert";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { bootedServer, call, freshRoot, gitInit } from "./helpers.ts";

interface Survey {
  counts: { notes: number };
  notes: { ref: string; title: string; priority: string; text?: string }[];
  notes_window?: { offset: number; shown: number; remaining: number };
}

const BODY = "\n\nThe substance lives down here, under the heading.\n";

async function withNotes(count: number) {
  const root = freshRoot();
  gitInit(root); // the survey lists expeditions, and that runs git
  const server = await bootedServer(root);
  for (let i = 0; i < count; i++) {
    await call(server, "se_note", { text: `NOTE ${i} — the heading line.${BODY}` });
  }
  return server;
}

test("se_survey windows its notes, and the counts stay whole", async () => {
  const server = await withNotes(5);
  const all = (await call(server, "se_survey", {})).body as unknown as Survey;
  assert.equal(all.counts.notes, 5);
  assert.equal(all.notes.length, 5, "unwindowed, the survey answers with everything");
  assert.equal(all.notes_window, undefined, "no window declared when none was applied");

  const first = (await call(server, "se_survey", { limit: 2 })).body as unknown as Survey;
  assert.equal(first.notes.length, 2);
  assert.equal(first.counts.notes, 5, "the COUNT is the whole inbox, never the window");
  assert.deepEqual(first.notes_window, { offset: 0, shown: 2, remaining: 3 });

  const next = (await call(server, "se_survey", { limit: 2, offset: 2 })).body as unknown as Survey;
  assert.deepEqual(next.notes_window, { offset: 2, shown: 2, remaining: 1 });
  assert.ok(
    next.notes.every((n) => !first.notes.some((f) => f.ref === n.ref)),
    "the second page is different notes",
  );

  const past = (await call(server, "se_survey", { limit: 2, offset: 99 })).body as unknown as Survey;
  assert.equal(past.notes.length, 0);
  assert.equal(past.notes_window?.remaining, 0);
});

test("se_survey lists title and priority; the body rides only on detail: full", async () => {
  const server = await withNotes(2);
  const listed = (await call(server, "se_survey", {})).body as unknown as Survey;
  assert.match(listed.notes[0].title, /the heading line\./, "an untitled note is listed by its first line");
  assert.equal(listed.notes[0].text, undefined, "and the body stays out of the listing");
  assert.equal(listed.notes[0].priority, "could", "an unmarked stray is a could");

  const full = (await call(server, "se_survey", { detail: "full" })).body as unknown as Survey;
  assert.match(String(full.notes[0].text), /substance lives down here/, "full still means full");
});

test("a note carries its own title and priority, and the listing sorts by it", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);
  await call(server, "se_note", { title: "a could", text: "body", priority: "could" });
  await call(server, "se_note", { title: "a must", text: "body", priority: "must" });
  await call(server, "se_note", { title: "a should", text: "body", priority: "should" });

  const listed = (await call(server, "se_survey", {})).body as unknown as Survey;
  assert.deepEqual(
    listed.notes.map((n) => n.priority),
    ["must", "should", "could"],
    "highest first",
  );
  assert.deepEqual(
    listed.notes.map((n) => n.title),
    ["a must", "a should", "a could"],
    "the author's title, not a derived one",
  );
});

test("a title alone is a legal note, and an empty call still refuses", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);
  const made = await call(server, "se_note", { title: "the title says it all" });
  assert.equal(made.isError, false, JSON.stringify(made.body));

  const listed = (await call(server, "se_survey", {})).body as unknown as Survey;
  assert.equal(listed.notes[0].title, "the title says it all");

  const empty = await call(server, "se_note", {});
  assert.equal(empty.isError, true, "neither text nor title is not a note");
});

test("se_log_query answers for a note ref, so a reference can be followed", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);
  const made = (await call(server, "se_note", { text: `FOLLOW ME — the heading.${BODY}` })).body as { captured: string };
  const got = await call(server, "se_log_query", { ref: made.captured });
  assert.equal(got.isError, false, JSON.stringify(got.body));
  const note = got.body as unknown as { ref: string; text: string };
  assert.equal(note.ref, made.captured);
  assert.match(note.text, /substance lives down here/, "the note comes back whole");

  // An unknown ref still refuses, and now says both vocabularies.
  const bad = await call(server, "se_log_query", { ref: "note-000000000000" });
  assert.equal(bad.isError, true);
  assert.match(String(bad.body.expected), /note ref/);
});

// req-survey-counts-only-open-records: itList calls a record open when its
// WORKTREE DIRECTORY exists, and a close leaves that directory behind. So a
// shipped record stayed in the list headed "what stands open", and the desk
// advises from that list.
//
// Seen on 2026-08-15: i27 read as open the day after it shipped, and the count
// it inflated was the one the front desk had just used to recommend.
test("a shipped iteration leaves the open list, whatever its worktree says", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const seeded = await call(server, "se_seed_iteration", {
    goal: "a record seeded only to be marked shipped",
    vision: "it exists so the listing can be asked whether a shipped record still stands open",
  });
  const id = String((seeded.body as { seeded?: string }).seeded ?? "");
  assert.notEqual(id, "", `the seed answers with its id: ${JSON.stringify(seeded.body)}`);

  const opened = (await call(server, "se_survey", {})).body as unknown as { iterations: { id: string }[] };
  assert.ok(
    opened.iterations.some((i) => i.id === id),
    `a seeded iteration stands open: ${JSON.stringify(opened.iterations)}`,
  );

  // The close leaves the worktree behind, so the record's own status is the
  // only thing that can say it is finished. While a record is open its record
  // is read from ITS OWN TREE, which is where a close stamps the status.
  const dir = join(root, ".worktrees", id, "project", "spec", "iterations", id);
  mkdirSync(dir, { recursive: true });
  const shipped = ["---", `id: ${id}`, "status: shipped", 'goal: "a record seeded only to be marked shipped"', "---", ""];
  writeFileSync(join(dir, "record.md"), shipped.join("\n"), "utf8");

  const after = (await call(server, "se_survey", {})).body as unknown as {
    counts: { iterations: number };
    iterations: { id: string }[];
  };
  assert.ok(!after.iterations.some((i) => i.id === id), `a shipped record is not open: ${JSON.stringify(after.iterations)}`);
  assert.equal(after.counts.iterations, after.iterations.length, "the count matches the list it counts");
});
