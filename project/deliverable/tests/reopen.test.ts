// THE REOPEN, END TO END, through a positioned session. Two green halves are
// not a green wire (ux.md): stripping stamps and painting from the record are
// each tested elsewhere, and this is the line that joins them.
//
// Sequential: it walks one session through boot and into an iteration.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { withSignedOff } from "../engine/forms.ts";
import { itFind, itPinRel, pinIteration } from "../engine/iterations.ts";
import { Session } from "../engine/session.ts";
import { checkDocs, freshRoot } from "./helpers.ts";

function gitInit(root: string): void {
  for (const a of [
    ["init"],
    ["config", "user.email", "se@test.local"],
    ["config", "user.name", "se test"],
    ["add", "-A"],
    ["commit", "-q", "-m", "seed"],
  ]) {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
    if (r.status !== 0) throw new Error(`git ${a.join(" ")} failed: ${r.stderr}`);
  }
}

test("a matrix that moves under a standing claim reopens it and strips its stamps", async () => {
  const root = freshRoot();
  gitInit(root);
  const session = new Session(root);
  await session.advance();
  await session.advance();
  checkDocs(session);
  await session.advance();
  await session.advance();
  await session.advance();
  session.setAutonomy(1);
  const id = String(session.iterationSeed("prove the reopen", "a moved demand reaches the record").seeded);
  const sid = id.match(/^(i\d+)-/)?.[1] as string;
  await session.advance("iterations");
  await session.advance(sid);

  // Pin the column directly: the kickoff's own walk is another test's subject.
  const it = itFind(root, id);
  pinIteration(root, it, "patch");
  const decl = session.currentMachine();
  const step = decl.states.find((s) => s.evidence_form.length > 0 && s.kind !== "gate");
  assert.ok(step !== undefined, "the column must ask for evidence somewhere");

  // A STANDING CLAIM, written by an earlier session — stamped on disk, and
  // absent from this instance's history. That is the normal case after any
  // restart, and it is the case the reopen used to miss entirely.
  const ev = join(root, ".worktrees", id, "project", "spec", "iterations", id, "evidence", `${step.id}.md`);
  mkdirSync(dirname(ev), { recursive: true });
  writeFileSync(ev, `---\nsigned_off: an earlier session\nauthors: human\n---\n\nwhat was claimed the first time\n`, "utf8");
  assert.ok(session.recordDone(decl).includes(step.id), "green from the record");

  // The matrix moves under it: the pinned ledger now records a demand the
  // live matrix no longer makes.
  const pinAbs = join(root, ".worktrees", id, itPinRel(id));
  const pin = JSON.parse(readFileSync(pinAbs, "utf8")) as { demands: Record<string, { evidence: string }>; rigor_matrix_hash: string };
  for (const d of Object.values(pin.demands)) d.evidence = "what it used to ask";
  pin.rigor_matrix_hash = "0000stalehash";
  writeFileSync(pinAbs, JSON.stringify(pin, null, 2), "utf8");

  // ONE PULL. Nothing else.
  await session.pull();

  const after = readFileSync(ev, "utf8");
  assert.doesNotMatch(after, /^signed_off:/m, "the stamp is gone");
  assert.match(after, /^suspect: /m, "and a suspect mark replaces it — re-look, then re-approve");
  assert.match(after, new RegExp(`suspect:.*${step.id}`), "which names what moved, so nobody has to go hunting");
  assert.match(after, /^authors: human$/m, "an unrelated key is untouched");
  assert.match(after, /what was claimed the first time/, "and the claim stays — it is re-approved, not re-written");
  assert.ok(!session.recordDone(decl).includes(step.id), "so the drawing stops painting it green");

  // AND IT SETTLES. The pin caught up in the same pull, so a second one finds
  // nothing to do — without that the step would reopen forever.
  writeFileSync(ev, withSignedOff(after, "re-attested"), "utf8");
  assert.doesNotMatch(readFileSync(ev, "utf8"), /^suspect:/m, "re-attesting clears the mark in the same act");
  await session.pull();
  assert.match(readFileSync(ev, "utf8"), /^signed_off: re-attested$/m, "and it is not marked again");
  assert.ok(session.recordDone(decl).includes(step.id), "green again, by one act rather than a re-fill");
});
