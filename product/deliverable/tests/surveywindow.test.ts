// The survey answers in full, and can still be walked when full is too much.
//
// Answering in full was the right ruling and was not enough on its own: at
// 43 pending notes the whole survey ran past the token ceiling and landed
// outside the project root, where the lane could not read it back.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { bootedServer, call, freshRoot, gitInit } from "./helpers.ts";

interface Survey {
  counts: { notes: number };
  notes: { ref: string; text: string }[];
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
  assert.ok(next.notes.every((n) => !first.notes.some((f) => f.ref === n.ref)), "the second page is different notes");

  const past = (await call(server, "se_survey", { limit: 2, offset: 99 })).body as unknown as Survey;
  assert.equal(past.notes.length, 0);
  assert.equal(past.notes_window?.remaining, 0);
});

test("se_survey brief gives the opening PARAGRAPH, never a cut-off line", async () => {
  const server = await withNotes(2);
  const full = (await call(server, "se_survey", {})).body as unknown as Survey;
  assert.match(full.notes[0].text, /substance lives down here/, "full means full");

  const brief = (await call(server, "se_survey", { detail: "brief" })).body as unknown as Survey;
  assert.match(brief.notes[0].text, /the heading line\./, "the whole opening paragraph survives");
  assert.doesNotMatch(brief.notes[0].text, /substance lives down here/, "later paragraphs do not");
  // The old defect was a 120-character slice that cut mid-word. A paragraph
  // ends where the author ended it.
  assert.ok(!brief.notes[0].text.endsWith("…") && !brief.notes[0].text.endsWith("..."), "nothing is elided");
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
