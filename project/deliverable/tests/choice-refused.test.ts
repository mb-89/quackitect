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
// same pass and withheld, so the only way forward was to guess again.
//
// WHY ONE HALF IS A SOURCE-SHAPE TEST.
//
// A pull carrying a choice meets two different refusals. Where a form is
// OWED, a separate branch already answers well — it names the owed form and
// how to move in either direction, and a walking fixture reaches it. The
// branch this fix is about is the other one: a target is set, nothing is
// owed, and the choice matches no door. A freshly seeded root always owes its
// first form, so the walk cannot stand there.
//
// The precedent is stuck-wait.test.ts, which records the same limitation for
// the same reason, and the same warning: a walking fixture that cannot reach
// its branch passes without the fix, which is worse than no test.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { Session } from "../engine/session.ts";
import { bootedServer, call, freshRoot, gitInit, readEverything } from "./helpers.ts";

const SRC = readFileSync(fileURLToPath(new URL("../engine/session.ts", import.meta.url)), "utf8");

/** The branch that answers a choice when no step wanted a form. Found by the
 *  sentence it is the only place to build. */
function unwantedFormBranch(): string {
  const at = SRC.indexOf("a filled form, but nothing on the way wants one");
  assert.ok(at > 0, "the refusal this guards has been reworded — find it and re-anchor this test");
  // Everything from the choice check above it down to that sentence.
  const start = SRC.lastIndexOf("if (form.choice !== undefined) {", at);
  assert.ok(start > 0 && start < at, "the choice-aware branch no longer sits above the form refusal");
  return SRC.slice(start, at);
}

test("a choice with no door is answered about the choice, not about a form", () => {
  const branch = unwantedFormBranch();
  assert.match(branch, /a choice of/, "the refusal still describes a filled form nobody asked for");
  assert.doesNotMatch(branch.split("throw new Rejection")[1] ?? "", /a filled form/, "the choice branch reuses the form wording");
});

test("it hands over the doors it computed rather than withholding them", () => {
  const branch = unwantedFormBranch();
  assert.match(branch, /this\.pullOptions\(\)/, "the branch does not look up the doors it could offer");
  assert.match(branch, /doors from here/, "the doors are computed and never said");
});

test("with no door at all it names the verb that aims", () => {
  const branch = unwantedFormBranch();
  assert.match(branch, /se_aim/, "a reader with no door offered is left with no way to move");
});

// AND THE HALF A WALK CAN REACH. Where a form is owed, a choice must still be
// answered as a choice — this branch was already right, and it must stay right.
test("a choice while a form is owed says so, and says how to move either way", async () => {
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

  try {
    await s.pull({ form: { choice: "there-is-no-such-state-here" } });
    assert.fail("a choice matching no door was accepted");
  } catch (e) {
    const r = e as { got?: string; remedy?: { note?: string } };
    assert.match(String(r.got), /a choice/, `the refusal does not mention the choice: "${r.got}"`);
    assert.match(String(r.got), /nothing was saved/, "the refusal does not say the payload was dropped");
    assert.match(String(r.remedy?.note ?? ""), /go FORWARD|se_reopen/, "the refusal names no way to move");
  }
});
