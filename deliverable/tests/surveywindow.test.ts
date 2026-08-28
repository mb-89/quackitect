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
// RECORD DIRECTORY exists, and a close leaves that directory behind. So a
// shipped record stayed in the list headed "what stands open", and the desk
// advises from that list.
//
// Seen on 2026-08-15: i27 read as open the day after it shipped, and the count
// it inflated was the one the front desk had just used to recommend.
test("a shipped iteration leaves the open list, whatever stands on disk", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const seeded = await call(server, "se_seed_iteration", {
    goal: "a record seeded only to be marked shipped",
    vision: "it exists so the listing can be asked whether a shipped record still stands open",
    depends_on: [],
  });
  const id = String((seeded.body as { seeded?: string }).seeded ?? "");
  assert.notEqual(id, "", `the seed answers with its id: ${JSON.stringify(seeded.body)}`);

  const opened = (await call(server, "se_survey", {})).body as unknown as { iterations: { id: string }[] };
  assert.ok(
    opened.iterations.some((i) => i.id === id),
    `a seeded iteration stands open: ${JSON.stringify(opened.iterations)}`,
  );

  // THE RECORD IS READ FROM ONE PLACE: its folder. One tree means one path,
  // and the status alone decides.
  const dir = join(root, "spec", "iterations", id);
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

// AN ITEM WITH A PLACE IS NOT IN THE BACKLOG, and the desk has to read that.
//
// MEASURED 2026-08-28, and the owner found it rather than a test: 352 items
// were given a place, 300 of them onto a record or a state, and the desk went
// on listing all 352. The place was written into every file, `workpen` was
// already drawing each item at its place, and the ONE SURFACE A PERSON READS
// was the one that ignored the field.
//
// A COUNT IS EXACTLY THE KIND OF THING THAT READS RIGHT WHILE BEING WRONG.
test("an item placed at a state leaves the desk's backlog", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const token = (slug: string, place: string | undefined): void => {
    const dir = join(root, "spec", "trace", "work-token");
    mkdirSync(dir, { recursive: true });
    const lines = [
      "---",
      `id: ${slug}`,
      'type: "[[work-token]]"',
      "statement: a fixture item",
      "ready_when: ready now",
      "source: a fixture",
      ...(place === undefined ? [] : [`place: ${place}`]),
      "---",
      "",
    ];
    writeFileSync(join(dir, `${slug}.md`), lines.join("\n"), "utf8");
  };
  token("wt-carries-no-place-at-all", undefined);
  token("wt-says-backlog-explicitly", "backlog");
  token("wt-was-routed-to-a-record", "i99-somewhere-else");
  token("wt-was-routed-to-a-state", "retro");

  const s = (await call(server, "se_survey", {})).body as unknown as {
    counts: { backlog: number };
    backlog: { ref: string }[];
  };
  const refs = s.backlog.map((b) => b.ref);
  assert.ok(refs.includes("wt-carries-no-place-at-all"), "no place means the backlog, which is what a mint gives");
  assert.ok(refs.includes("wt-says-backlog-explicitly"), "saying backlog is the same as saying nothing");
  assert.ok(!refs.includes("wt-was-routed-to-a-record"), "an item routed to a record has left the backlog");
  assert.ok(!refs.includes("wt-was-routed-to-a-state"), "and so has one routed to a state");
  assert.equal(s.counts.backlog, s.backlog.length, "the count matches the list it counts");
});

// THE PILL AND THE LIST COUNTED DIFFERENT SETS.
//
// workpen draws BOTH pool tokens and open register entries at the backlog, and
// the board's pill counts what the pen draws. The desk's own list read the pool
// alone, so the pill said 42 while the list showed 23. The 19 that never
// appeared were open issues and debts — the oldest work there is.
//
// Measured 2026-08-28, on the same surface and in the same week as the defect
// above. Same shape too: the field was right, one reader ignored it.
test("an open register entry stands in the desk's backlog beside a pool token", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const entry = (slug: string, place: string | undefined): void => {
    const dir = join(root, "spec", "trace", "raid");
    mkdirSync(dir, { recursive: true });
    const lines = [
      "---",
      `id: ${slug}`,
      'type: "[[raid]]"',
      "kind: issue",
      "status: open",
      "statement: a fixture issue nobody has placed",
      "trigger: ready when somebody picks it up",
      ...(place === undefined ? [] : [`place: ${place}`]),
      "---",
      "",
    ];
    writeFileSync(join(dir, `${slug}.md`), lines.join("\n"), "utf8");
  };
  entry("raid-iss-a-fixture-nobody-placed", undefined);
  entry("raid-iss-a-fixture-routed-to-a-record", "i99-somewhere-else");

  const s = (await call(server, "se_survey", {})).body as unknown as {
    counts: { backlog: number };
    backlog: { ref: string; ready_when: string }[];
  };
  const refs = s.backlog.map((b) => b.ref);
  assert.ok(refs.includes("raid-iss-a-fixture-nobody-placed"), "an unplaced open issue stands in the backlog");
  assert.ok(!refs.includes("raid-iss-a-fixture-routed-to-a-record"), "and a placed one has left it, exactly as a token does");
  // THE TRIGGER IS THE READY-WHEN. Both answer what has to happen before
  // somebody looks again, so the list carries one column rather than two.
  const row = s.backlog.find((b) => b.ref === "raid-iss-a-fixture-nobody-placed");
  assert.equal(row?.ready_when, "ready when somebody picks it up");
  assert.equal(s.counts.backlog, s.backlog.length, "the count matches the list it counts");
});

// A PARKED ITEM WAITING ON A RECORD IS WAITING FOR AN EVENT NOBODY FIRES.
//
// "ready when i60 is seeded" reads like a promise that the item wakes when
// that record opens. Nothing wakes it. It waits until somebody happens to read
// the backlog at the right hour, and usually nobody does.
//
// MEASURED 2026-08-28: sixteen items named the walk-speed record. It shipped
// four days earlier and collected none of them. Twenty-four in total named a
// record already shipped or abandoned.
test("a backlog item waiting on a record that already closed says so", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const record = (id: string, status: string): void => {
    const dir = join(root, "spec", "iterations", id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "record.md"), ["---", `id: ${id}`, `status: ${status}`, "goal: a fixture", "---", ""].join("\n"), "utf8");
  };
  record("i60-the-one-that-shipped", "shipped");
  record("i61-the-one-still-open", "seeded");

  const token = (slug: string, readyWhen: string): void => {
    const dir = join(root, "spec", "trace", "work-token");
    mkdirSync(dir, { recursive: true });
    const text = [
      "---",
      `id: ${slug}`,
      'type: "[[work-token]]"',
      "statement: a fixture item parked against a moment",
      `ready_when: ${readyWhen}`,
      "source: a fixture",
      "---",
      "",
    ].join("\n");
    writeFileSync(join(dir, `${slug}.md`), text, "utf8");
  };
  token("wt-waits-on-a-record-that-shipped", "ready when i60 is seeded");
  token("wt-waits-on-a-record-still-open", "ready when i61 reaches its build");
  token("wt-waits-on-nothing-in-particular", "ready when somebody looks at it again");

  const s = (await call(server, "se_survey", {})).body as unknown as {
    passed_moments?: { ref: string; names: string; status: string }[];
  };
  const flagged = s.passed_moments ?? [];
  assert.equal(flagged.length, 1, `only the one whose record closed is flagged: ${JSON.stringify(flagged)}`);
  assert.equal(flagged[0].ref, "wt-waits-on-a-record-that-shipped");
  assert.equal(flagged[0].names, "i60-the-one-that-shipped", "the answer names the record, not just the number");
  assert.equal(flagged[0].status, "shipped", "and says what that record actually is now");
});
