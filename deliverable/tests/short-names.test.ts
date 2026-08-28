// THE SHORT NAME IS THE NAME (owner ruling).
//
// A state is called what its drawing calls it. The machine path in front of it
// — `iterations/i15/` — is the engine's bookkeeping, not the reader's
// vocabulary, and every verb that takes a state should answer to the short
// form.
//
// MEASURED ON THE i15 WALK, at the moment the walk was already stuck: it read
// `iterations/i15/draft-vision` in the engine's own answer, passed that back to
// se_reopen, and was refused for naming "a state of i15 with an evidence form".
// The prefix was the whole problem and the refusal never said so. se_why had
// normalised the same shape for months, with the reason written out beside it.
//
// SO BOTH FORMS ARE TAKEN EVERYWHERE. Refusing the long one would be the worst
// of both while the engine still emits long ids in its own answers.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { bootedServer, call, freshRoot, gitInit, readEverything } from "./helpers.ts";

/** Standing where the iterations container offers its doors — the cheapest
 *  real branch in the machine, and the one whose names carry a prefix. */
async function atTheIterationsOffer(): Promise<{ s: Session; door: string }> {
  const root = freshRoot();
  gitInit(root);
  spawnSync("git", ["add", "-A"], { cwd: root, encoding: "utf8" });
  spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "f"], { cwd: root, encoding: "utf8" });
  const server = await bootedServer(root);
  await call(server, "se_seed_iteration", {
    goal: "a fixture iteration, seeded so a state inside it can be named two ways",
    vision: "entered so the short name and the qualified name both resolve to the same state",
    depends_on: [],
  });
  const s = new Session(root);
  await readEverything(s);
  s.setTarget("iterations");
  // Boot lands directly on front_desk now (idle was removed from the state
  // machine), so entering "iterations" owes a reading proof it did not owe
  // before. Drain it and pull forward until the offer actually appears.
  let first = (await readEverything(s)) as { options?: { to: string }[] };
  for (let i = 0; i < 40 && (first.options ?? []).length === 0; i++) {
    first = (await readEverything(s)) as { options?: { to: string }[] };
  }
  const door = (first.options ?? []).map((o) => o.to).find((to) => !to.endsWith("/end")) ?? "";
  assert.notEqual(door, "", "the fixture did not offer the seeded iteration as a door");
  return { s, door };
}

test("a door may be taken by its short name, exactly as by its qualified one", async () => {
  const { s, door } = await atTheIterationsOffer();
  const short = door.slice(door.lastIndexOf("/") + 1);
  assert.notEqual(short, door, "the fixture's door has no prefix to drop, so there is nothing to test");

  // The refusal this pins is SE-C-110 "one of the offered doors", raised on a
  // pick that names the right state in the wrong vocabulary. It threw here
  // before short names were taken.
  await s.pull({ form: { choice: short } });
  assert.equal(s.active()[0], `${door}/start`, `the short name "${short}" did not enter ${door}: the walk stands at ${s.active()[0]}`);
});

test("a reopen takes the qualified name the engine's own answers hand back", async () => {
  const { s, door } = await atTheIterationsOffer();
  await s.pull({ form: { choice: door } });
  // Not submitted, so the reopen refuses on that ground — which is the point:
  // the refusal must be about the CLAIM, never about the prefix. A name that
  // is not understood refuses with a different clause and a different word.
  let said = "";
  try {
    s.reopenClaim(`${door}/gate-kickoff`, "checking which refusal comes back", "agent", door.slice(door.lastIndexOf("/") + 1));
  } catch (e) {
    said = String((e as Error).message);
  }
  assert.doesNotMatch(said, /with an evidence form/, `the qualified name was rejected as an unknown state: ${said}`);
});
