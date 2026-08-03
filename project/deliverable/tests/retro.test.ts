// The retro's scope: draining is RESTRICTED, so "all" never grants it and a
// state earns it by naming it. The retro is a PLAIN STATE (the one-state
// rule, owner 2026-07-28); entering it demands the method read.
//
// THE SPLIT (owner 2026-07-29): the front desk names the drain too, but only
// for the mechanical verdicts. The desk could add to the inbox and never
// take anything out, while its own method opens by weighing that inbox.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { CallLog } from "../engine/calllog.ts";
import { backlogNotes } from "../engine/inbox.ts";
import { seDir } from "../engine/paths.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot, pullBoot, pullTo } from "./helpers.ts";

test("draining splits: done and obsolete anywhere, carried and backlog only in the retro", async () => {
  const root = freshRoot();
  const session = new Session(root);
  session.setAutonomy(1); // the retro weighs 1.0 - lift the slider clear
  const server = buildServer(root, session);
  await pullBoot(server, session);
  const minted = await call(server, "se_note", { text: "a stray to drain" });
  const ref = String(minted.body.captured);
  // AN INBOX YOU MAY ONLY ADD TO IS NOT AN INBOX (owner ruling 2026-08-01).
  // done and obsolete are checks anyone can run, so they drain anywhere the
  // walk happens to stand — here, at idle.
  const drained = await call(server, "se_note_drain", { ref, disposition: "done", where: "checked the code, it is there" });
  assert.equal(drained.isError, false, JSON.stringify(drained.body));
  assert.equal(drained.body.disposition, "done");

  // The JUDGMENT half did not move. carried and backlog decide what the work
  // MEANS and when it returns, which still wants the whole picture.
  const second = await call(server, "se_note", { text: "a stray for the retro" });
  const judged = await call(server, "se_note_drain", { ref: String(second.body.captured), disposition: "backlog", where: "ready when someone cares" });
  assert.equal(judged.isError, true, "backlog outside the retro is still refused");
  const ref2 = String(second.body.captured);
  // Enter the retro — one plain state; the way in owes the METHOD read,
  // which the pull serves through the reading loop.
  await pullTo(session, "retro");
  // Here, and ONLY here, the judgment dispositions work.
  const parked = await call(server, "se_note_drain", { ref: ref2, disposition: "backlog", where: "ready when someone cares" });
  assert.equal(parked.isError, false, JSON.stringify(parked.body));
  assert.equal(parked.body.inbox, 0, "both notes have now left the inbox");
  // An unknown ref refuses with v2's carried clause.
  const missing = await call(server, "se_note_drain", { ref: "note-nope", disposition: "done" });
  assert.equal(missing.isError, true);
  assert.equal(missing.body.clause, "SE-C-073");
});

test("the backlog home (v1 port): backlog demands its ready-when, parks the note, and migration re-drains it", async () => {
  const root = freshRoot();
  const session = new Session(root);
  session.setAutonomy(1); // the retro weighs 1.0 - lift the slider clear
  const server = buildServer(root, session);
  await pullBoot(server, session);
  const minted = await call(server, "se_note", { text: "future scope" });
  const ref = String(minted.body.captured);
  await pullTo(session, "retro");
  // A made-up disposition refuses; backlog without its ready-when refuses.
  const bad = await call(server, "se_note_drain", { ref, disposition: "later" });
  assert.equal(bad.isError, true);
  const bare = await call(server, "se_note_drain", { ref, disposition: "backlog" });
  assert.equal(bare.isError, true);
  assert.match(String(bare.body.expected), /ready when/);
  // With the condition, the note parks: out of the inbox, on the backlog.
  const parked = await call(server, "se_note_drain", { ref, disposition: "backlog", where: "ready when iterations exist" });
  assert.equal(parked.isError, false, JSON.stringify(parked.body));
  assert.equal(parked.body.inbox, 0);
  assert.equal(backlogNotes(seDir(root)).length, 1);
  // Migration IS a re-drain: the parked note pulls into scope.
  const pulled = await call(server, "se_note_drain", { ref, disposition: "carried", where: "this round" });
  assert.equal(pulled.isError, false, JSON.stringify(pulled.body));
  assert.equal(backlogNotes(seDir(root)).length, 0);
});

test("since last_retro: the log query scopes to the period after the newest drain call", async () => {
  const root = freshRoot();
  const session = new Session(root);
  session.setAutonomy(1); // the retro weighs 1.0 - lift the slider clear
  const server = buildServer(root, session);
  await pullBoot(server, session);
  // No drain yet: last_retro means no floor — everything counts.
  const log = new CallLog(seDir(root));
  const before = log.query({ filter: { since: "last_retro" } }).total;
  assert.ok(before > 0, "boot calls are on the log");
  // Run a drain (the retro marker) …
  const minted = await call(server, "se_note", { text: "marker" });
  await pullTo(session, "retro");
  await call(server, "se_note_drain", { ref: String(minted.body.captured), disposition: "done", where: "test" });
  // … then act once more: the scoped query sees only the tail.
  await call(server, "se_file_read", { path: "project/guidance/contract.md", offset: 1, limit: 1 });
  const scoped = log.query({ filter: { since: "last_retro" } });
  assert.ok(scoped.total < log.query({}).total, "the floor cuts the earlier period off");
  assert.ok(scoped.total >= 1, "the tail after the drain is visible");
});

test("the desk drains the mechanical verdicts and is refused the judgment ones", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  await pullBoot(server, session);
  const stale = String((await call(server, "se_note", { text: "a later note supersedes this one" })).body.captured);
  const judged = String((await call(server, "se_note", { text: "what this means is the retro's call" })).body.captured);
  // The desk weighs 0.2 — the default slider clears it; the way in owes
  // the method, and the pull's reading loop serves it.
  await pullTo(session, "front_desk");
  // MECHANICAL — superseded, already built, ruled on since. Anyone may check it.
  const dropped = await call(server, "se_note_drain", { ref: stale, disposition: "obsolete", where: "superseded" });
  assert.equal(dropped.isError, false, JSON.stringify(dropped.body));
  assert.equal(dropped.body.inbox, 1, "it leaves the inbox, and the other note stays");
  // JUDGMENT — parking and carrying decide what work MEANS. Refused, typed.
  const parked = await call(server, "se_note_drain", { ref: judged, disposition: "backlog", where: "ready when later" });
  assert.equal(parked.isError, true);
  assert.equal(parked.body.clause, "SE-C-110");
  assert.match(String((parked.body.remedy as { args: { to: unknown } }).args.to), /retro/, "the remedy names the state that may");
  const carried = await call(server, "se_note_drain", { ref: judged, disposition: "carried", where: "this round" });
  assert.equal(carried.isError, true);
  assert.equal(carried.body.clause, "SE-C-110");
});

test("the survey lists a note by title — cut at a word, never mid-word, and never lost", async () => {
  const root = freshRoot();
  // The survey asks git what expeditions stand, so the root must be a repo.
  for (const a of [["init"], ["config", "user.email", "se@test.local"], ["config", "user.name", "se test"]]) {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
    if (r.status !== 0) throw new Error(`git ${a.join(" ")} failed: ${r.stderr}`);
  }
  const session = new Session(root);
  const server = buildServer(root, session);
  await pullBoot(server, session);
  // Every real note opens with a heading and carries its content below it.
  // The old defect took the first line and then 120 characters of it, so the
  // survey showed a title cut mid-word and none of the substance. A listing
  // is fine; cutting a word in half and dropping the body is not.
  const heading = "A HEADING LINE LONG ENOUGH THAT ONE HUNDRED AND TWENTY CHARACTERS WOULD END IT SOMEWHERE IN THE MIDDLE OF A WORD RATHER THAN AT ITS END.";
  const substance = "The substance lives down here, which is the only reason anyone reads a note at all.";
  const ref = String((await call(server, "se_note", { text: heading + "\n\n" + substance })).body.captured);
  assert.ok(heading.length > 120, "the heading alone outruns the old slice");
  const answered = await call(server, "se_survey", {});
  assert.equal(answered.isError, false, JSON.stringify(answered.body));
  const note = (answered.body.notes as { ref: string; title: string; text?: string }[]).find((n) => n.ref === ref);
  assert.ok(note !== undefined, "the pending note is in the survey");

  const shown = note.title.replace(/…$/, "");
  assert.ok(heading.startsWith(shown), "the title is a prefix of the heading the author wrote");
  assert.ok(heading[shown.length] === undefined || heading[shown.length] === " ", "and it ends at a word boundary, never inside a word");

  // The substance is not in the listing, and that is the point — it is one
  // ref away rather than in every survey anyone ever runs.
  assert.equal(note.text, undefined, "the body stays out of the listing");
  const whole = await call(server, "se_log_query", { ref });
  assert.ok(String((whole.body as unknown as { text: string }).text).includes(substance), "and the whole note comes back by ref");
});

// The needs-retro gate moved (owner design 2026-07-27): it holds the FIRST
// start of a never-walked iteration inside the iterations container —
// tests/iterations.test.ts walks it end to end.
