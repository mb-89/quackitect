// A CHOICE IS AN AIM, AND THE REFUSAL HAS TO ANSWER THAT QUESTION.
//
// MEASURED ON THE i15 WALK: ten pulls refused this way, and three in a row
// were the SAME DOOR sent three ways — as a list, as a short name, as a long
// name with a submit flag beside it. Each got the identical sentence:
//
//   expected: a step that asked for a form
//   got:      a filled form, but nothing on the way wants one
//   remedy:   pull with no payload
//
// Every word of that is true and none of it is about what the reader wanted,
// which was to GO somewhere. The doors from that position were computed on the
// same pass and withheld, so the only way forward was to guess again — and the
// walk guessed three times before giving up on the door entirely.
//
// THE OTHER BRANCH WAS ALREADY RIGHT. Where a form is OWED, a choice is met by
// a separate refusal that names the owed form and how to move in either
// direction. Both branches are exercised here, because the fix must not make
// the good one worse.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { bootedServer, call, freshRoot, gitInit, readEverything, refusalAsync } from "./helpers.ts";

test("a choice where the road has not split is answered as a choice, not as a form", async () => {
  // A fresh session aims at the desk, so the road has not split and no choice
  // was offered — which is exactly the position the i15 walk kept sending
  // doors from.
  const s = new Session(freshRoot());
  const r = await refusalAsync(() => s.pull({ form: { choice: "front_desk" } }));
  assert.match(r.got, /a choice of/, `the refusal still describes a form nobody asked for: "${r.got}"`);
  assert.doesNotMatch(r.got, /a filled form/, "a choice is still reported as a filled form");
  assert.match(r.got, /branching point/, "the refusal never says why a choice is not readable here");
});

test("it hands over the doors it computed, or the verb that aims when there are none", async () => {
  const s = new Session(freshRoot());
  const r = await refusalAsync(() => s.pull({ form: { choice: "front_desk" } }));
  const said = `${r.remedy?.tool} ${r.remedy?.note}`;
  assert.match(said, /se_aim|doors from here/, `the refusal names no way to move at all: "${said}"`);
  // The remedy tool is se_pull where doors exist — sending one IS a pull — so
  // what must be true is that the NOTE carries something to act on, never that
  // the tool changed.
  assert.doesNotMatch(
    String(r.remedy?.note ?? ""),
    /says what it wants before you fill anything/,
    "the remedy is still the generic pull-empty line",
  );
});

test("the same door sent three ways gets three answers about the door", async () => {
  // The exact i15 sequence: a list, a short name, a long name with a submit
  // flag beside it. None of them may come back as an unwanted-form refusal.
  for (const shape of [["front_desk"], "front_desk", "main/front_desk"]) {
    const s = new Session(freshRoot());
    const r = await refusalAsync(() => s.pull({ form: { choice: shape } as Record<string, unknown> }));
    assert.doesNotMatch(r.got, /a filled form, but nothing/, `a choice shaped as ${JSON.stringify(shape)} is answered as an unwanted form`);
  }
});

test("a payload with no choice in it still gets the form refusal", async () => {
  // The other branch must not regress. A section nobody asked for is not an
  // aim, and the old wording is the right answer for it.
  const s = new Session(freshRoot());
  const r = await refusalAsync(() => s.pull({ form: { some_section_nobody_asked_for: "text" } }));
  assert.match(r.got, /filled form/, `a non-choice payload is now answered as a choice: "${r.got}"`);
});

test("a choice while a form is owed says so, and names the ways forward and back", async () => {
  const root = freshRoot();
  gitInit(root);
  spawnSync("git", ["add", "-A"], { cwd: root, encoding: "utf8" });
  spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "f"], { cwd: root, encoding: "utf8" });
  const server = await bootedServer(root);
  await call(server, "se_seed_iteration", {
    goal: "a fixture iteration, seeded so a choice arrives while a form is owed",
    vision: "the answer names the owed form and the ways forward and back",
    depends_on: [],
  });
  const s = new Session(root);
  await readEverything(s);
  s.setTarget("iterations");
  const first = (await s.pull()) as { options?: { to: string }[] };
  const door = (first.options ?? []).map((o) => o.to).find((to) => !to.endsWith("/end")) ?? "";
  if (door === "") return;
  await s.pull({ form: { choice: door } });
  await readEverything(s);

  const r = await refusalAsync(() => s.pull({ form: { choice: "there-is-no-such-state-here" } }));
  assert.match(r.got, /a choice/, `the refusal does not mention the choice: "${r.got}"`);
  assert.match(r.got, /nothing was saved/, "the refusal does not say the payload was dropped");
  assert.match(String(r.remedy?.note ?? ""), /go FORWARD|se_reopen/, "the refusal names no way to move");
});
