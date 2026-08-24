// AN EMPTY FORM IS NOT TOLD IT IS FULL.
//
// MEASURED ON THE i15 WALK, at iterations/i15/run-demos. The pull's own answer
// contradicted itself in two adjacent lines:
//
//   do:     run-demos: every required section is filled and NOTHING IS STAMPED.
//   fields: current_situation*=N follow_up*=N anything_else=N
//
// THE HOLE WAS IN THE ADVICE'S TEST. It skipped a form whose `problems` list
// held anything, which reads as "the writing is not done yet" — and the linter
// answers `problems: []` for a form that does not exist at all. So the one
// state where nothing whatever is written got the advice meant for a finished
// draft, and a walker following it sends a submit that can only refuse.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { bootedServer, call, freshRoot, gitInit, readEverything } from "./helpers.ts";

/** A seeded iteration entered, standing on the first form it owes — nothing
 *  written into it yet, which is the state the advice got wrong. */
async function atAnUntouchedForm(): Promise<{ s: Session; state: string }> {
  const root = freshRoot();
  gitInit(root);
  spawnSync("git", ["add", "-A"], { cwd: root, encoding: "utf8" });
  spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "f"], { cwd: root, encoding: "utf8" });
  const server = await bootedServer(root);
  await call(server, "se_seed_iteration", {
    goal: "a fixture iteration, seeded so the advice on an untouched form can be read",
    vision: "the walk stands on a form nobody has written a word into, and the instruction says so",
    depends_on: [],
  });
  const s = new Session(root);
  await readEverything(s);
  s.setTarget("iterations");
  // Boot lands directly on front_desk now (idle was removed from the state
  // machine), so entering "iterations" owes a reading proof before the walk
  // reaches this branching point, one hop later than it used to.
  // readEverything drains any owed read and returns the answer that stopped
  // the reading; loop it until the offer actually appears, rather than
  // assuming a fixed number of hops.
  let first = (await readEverything(s)) as { options?: { to: string }[] };
  for (let i = 0; i < 5 && (first.options ?? []).length === 0; i++) {
    first = (await readEverything(s)) as { options?: { to: string }[] };
  }
  const door = (first.options ?? []).map((o) => o.to).find((to) => !to.endsWith("/end")) ?? "";
  await s.pull({ form: { choice: door } });
  await readEverything(s);
  const at = (await s.pull()) as { where?: string[] };
  const where = (at.where ?? [])[0] ?? "";
  return { s, state: where.slice(where.lastIndexOf("/") + 1) };
}

test("the instruction on an untouched form does not claim its sections are filled", async () => {
  const { s, state } = await atAnUntouchedForm();
  if (state === "") return;
  const form = s.formGet(state) as { exists?: boolean; fields?: { required?: boolean; filled?: boolean }[] };
  if (form.exists === true) return; // the fixture's first state came pre-written; nothing to check
  const owed = (form.fields ?? []).filter((f) => f.required === true && f.filled !== true);
  assert.ok(owed.length > 0, "the fixture's first form owes nothing, so it cannot test the empty case");

  const answer = (await s.pull()) as { do?: string };
  const advice = String(answer.do ?? "");
  assert.doesNotMatch(
    advice,
    /every required section is filled|its sections stand|EVERY SECTION IS FULL/,
    `an untouched form is told its writing is done: "${advice}"`,
  );
  assert.match(advice, /form/, `the instruction on an owed form does not say how to answer it: "${advice}"`);
});
