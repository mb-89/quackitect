// The push a hand-back ends with: a desk lands it on this box, a cloud box
// pushes its work branch, and a refusal names the push door's own cause.
// [[spec/design_output/pull#the-rejected-push]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fieldOf, withEntry, withField } from "../../src/engine/group.js";
import { pushed } from "../../src/scripts/pull-writes.js";
import { pulling } from "../../src/scripts/work.js";
import {
  at,
  BRANCH,
  CHILD,
  doors,
  filled,
  GROUP_NOTE,
  HAND,
  HOLD,
  heard,
  ROOT,
  ranGit,
  SHA,
  standing,
} from "./pull-doors.js";

const CHECK = `node ${join(ROOT, "src", "scripts", "cli.js")} check`;
const PUSH = "git push origin main";
const FREE = (step = "design/draft") =>
  filled(
    filled(
      CHILD("open", step).replace("group: one-group\n", ""),
      "### approach",
      "The approach.",
    ),
    "### tests",
    "node --test test/x.test.js\n\n### checked\n\n- it touches the two files\n- the proc fake stands",
  );
const onTrunk = (extra = {}) => ({
  "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
  "git rev-list --count HEAD..origin/main": { stdout: "0\n" },
  ...extra,
});

// A desk takes the free ticket on trunk, so the pull runs here. [[spec/tickets/a-desk-pull-pushes-nothing]]
function handedBack(step, answers) {
  const { it, outside, disk } = doors(
    { [at("spec/tickets/free-one.md")]: FREE(step) },
    onTrunk(answers),
    { cloud: false },
  );
  heard(() => pulling(ROOT, ["pull"], it));
  const said = heard(() => pulling(ROOT, ["pull", "free-one", "--pass"], it));
  return { ...said, ran: ranGit(outside), disk };
}

// A cloud box's push of its work branch, driven at the push itself. [[spec/design_output/pull#the-rejected-push]]
function branchPush(answers = {}) {
  const { it, outside } = doors({}, answers, { cloud: true, root: ROOT });
  const said = pushed(it, BRANCH);
  return { said, why: said.why.join("\n"), ran: ranGit(outside) };
}

// [[spec/design_output/pull#the-rejected-push]]
test("pushed answers ok, local and why, and a work branch pushes with no check", () => {
  const { said, ran } = branchPush();
  assert.deepEqual(said, { ok: true, local: false, why: [] });
  assert.ok(!ran.includes(CHECK), "a work branch meets no battery");
  assert.ok(ran.includes(`git push origin ${BRANCH}`));
});

// No cloud box hands back on trunk, so the push holds no road of its own there. [[spec/tickets/every-road-has-a-caller]]
test("a push names no trunk road: it runs no check before it pushes, whatever the branch", () => {
  const { it, outside } = doors({}, onTrunk(), { cloud: true, root: ROOT });
  assert.deepEqual(pushed(it, "main"), { ok: true, local: false, why: [] });
  assert.ok(!ranGit(outside).includes(CHECK), "the push runs no check");
  assert.ok(ranGit(outside).includes(PUSH));
});

// A desk lands its hand-back on this box, and a cloud box pushes it. [[spec/tickets/a-desk-pull-pushes-nothing]]
test("a desk's hand-back commits and pushes nothing, and a cloud box's pushes", () => {
  const desk = handedBack("design/draft");
  assert.equal(desk.code, 0, desk.said);
  assert.ok(
    desk.ran.includes("git commit -m free-one: passes design/draft"),
    "the desk commits",
  );
  assert.ok(
    !desk.ran.some((one) => one.startsWith("git push")),
    "the desk pushes nothing",
  );
  assert.ok(!desk.ran.includes(CHECK), "the next push meets the check");
  assert.match(desk.said, /stands on this box, and main goes out with the next push/);

  const branch = doors({}, {}, { cloud: false });
  assert.equal(pushed(branch.it, BRANCH).local, true);
  assert.ok(!ranGit(branch.outside).some((one) => one.startsWith("git push")));

  const cloud = branchPush();
  assert.equal(cloud.said.ok, true, cloud.why);
  assert.ok(cloud.ran.includes(`git push origin ${BRANCH}`), "the cloud box pushes");
});

// [[spec/design_output/pull#the-rejected-push]]
test("a push the door refuses names the door's own line, and no rebase runs", () => {
  const { said, why, ran } = branchPush({
    [`git push origin ${BRANCH}`]: {
      exitCode: 1,
      stderr:
        "the door holds this branch for another box.\nerror: failed to push some refs to 'origin'\n",
    },
  });
  assert.equal(said.ok, false);
  assert.match(why, /the door holds this branch for another box\./);
  assert.ok(!ran.some((one) => one.startsWith("git rebase")), "no rebase runs");
  assert.ok(!why.includes("moves"), "the answer names no moved branch");
});

// [[spec/design_output/pull#the-rejected-push]]
test("a tests-red close on a desk moves the step and stays local", () => {
  const { code, said, ran, disk } = handedBack("implement/tests-red", {
    sh: { exitCode: 1, stdout: "assertion, 1 test(s) fail on their own assertion\n" },
  });
  assert.equal(code, 0, said);
  assert.equal(
    fieldOf(disk.read(at("spec/tickets/free-one.md")), "step"),
    "implement/change",
  );
  assert.ok(ran.includes("git commit -m free-one: passes implement/tests-red"));
  assert.ok(!ran.includes(PUSH), "the close stays local");
  assert.ok(!ran.includes(CHECK), "a red close runs no check");
});

// [[spec/design_output/pull#the-hand-back-matches-the-hold]]
test("a hand-back the record holds already pushes again, and a refusal says the record holds it", () => {
  const answered = withEntry(CHILD("open", "design/review"), {
    step: "design/draft",
    hand: HAND,
    hash_before: SHA,
    hash_after: SHA,
  });
  const { it, disk } = doors(
    standing(answered, withField(GROUP_NOTE, "step", "children")),
    {
      [`git push origin ${BRANCH}`]: {
        exitCode: 1,
        stderr: "the remote hangs up at once\n",
      },
    },
  );
  disk.write(
    HOLD,
    JSON.stringify({
      ticket: "a-child",
      path: "spec/tickets/a-child.md",
      step: "design/draft",
      hand: HAND,
      hash: SHA,
    }),
  );
  const { code, said } = heard(() => pulling(ROOT, ["pull", "a-child", "--pass"], it));
  assert.equal(code, 1);
  assert.match(said, /the record holds this hand-back already/);
  assert.match(said, /the remote hangs up at once/);
});
