// The push a hand-back ends with: on trunk the check runs over the close
// first, a refusal names the push door's own cause, and a tests-red close
// stands on this box. Trunk here is a fake door, so a work branch drives it.
// [[spec/design_output/pull#the-rejected-push]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fieldOf, withEntry, withField } from "../../src/engine/group.js";
import { saidBy } from "../../src/scripts/commit-verb.js";
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
  [CHECK]: { exitCode: 0, stdout: "The rules pass.\n" },
  ...extra,
});
const REJECTED = (reason) => ({
  exitCode: 1,
  stderr: ` ! [rejected]        main -> main (${reason})\nerror: failed to push some refs to 'origin'\nhint: Updates were rejected.\n`,
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

// A cloud box's push on trunk, driven at the push itself. [[spec/design_output/pull#the-rejected-push]]
function trunkPush(answers = {}, red = false) {
  const { it, outside } = doors({}, onTrunk(answers), { cloud: true, root: ROOT });
  const said = pushed(it, "main", { red });
  return { said, why: said.why.join("\n"), ran: ranGit(outside) };
}

// [[spec/design_output/pull#the-rejected-push]]
test("pushed answers ok, local and why, and a work branch pushes with no check", () => {
  const { it, outside } = doors({});
  assert.deepEqual(pushed(it, BRANCH), { ok: true, local: false, why: [] });
  assert.ok(!ranGit(outside).includes(CHECK), "a work branch meets no battery");
  assert.ok(ranGit(outside).includes(`git push origin ${BRANCH}`));
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
  assert.ok(!desk.ran.includes(CHECK), "the owner's push meets the check");
  assert.match(desk.said, /stands on this box, and the owner pushes main/);

  const branch = doors({}, {}, { cloud: false });
  assert.equal(pushed(branch.it, BRANCH).local, true);
  assert.ok(!ranGit(branch.outside).some((one) => one.startsWith("git push")));

  const cloud = trunkPush();
  assert.equal(cloud.said.ok, true, cloud.why);
  assert.ok(cloud.ran.includes(PUSH), "the cloud box pushes");
});

// [[spec/design_output/pull#the-rejected-push]]
test("on trunk a push runs the check, then the push, in that order", () => {
  const { said, ran } = trunkPush();
  assert.deepEqual(said, { ok: true, local: false, why: [] });
  const checked = ran.indexOf(CHECK);
  assert.ok(checked >= 0, "the check runs first");
  assert.ok(ran.indexOf(PUSH) > checked, "the push goes after the check");
});

// [[spec/design_output/pull#the-rejected-push]]
test("a push the door refuses names the door's own line, and no rebase runs", () => {
  const { said, why, ran } = trunkPush({
    [PUSH]: {
      exitCode: 1,
      stderr:
        "main takes a green battery, and the stamp names another commit.\nerror: failed to push some refs to 'origin'\n",
    },
  });
  assert.equal(said.ok, false);
  assert.match(why, /main takes a green battery, and the stamp names another commit\./);
  assert.ok(!ran.some((one) => one.startsWith("git rebase")), "no rebase runs");
  assert.ok(!why.includes("moves"), "the answer names no moved branch");
});

// [[spec/design_output/pull#the-rejected-push]]
test("on trunk a rebase moves the commit off the stamp, so the check runs again before the second push", () => {
  let pushes = 0;
  const { said, why, ran } = trunkPush({
    [PUSH]: () => (pushes++ ? { exitCode: 0 } : REJECTED("fetch first")),
  });
  assert.equal(said.ok, true, why);
  const rebase = ran.indexOf("git rebase origin/main");
  assert.ok(rebase >= 0, "a moved branch takes one rebase");
  assert.equal(ran.filter((one) => one === CHECK).length, 2);
  assert.ok(
    ran.lastIndexOf(CHECK) > rebase,
    "the second check reads the rebased commit",
  );
  assert.ok(ran.lastIndexOf(PUSH) > ran.lastIndexOf(CHECK));
});

// [[spec/design_output/pull#the-rejected-push]]
test("a tests-red close on a desk moves the step and stays local, and a cloud box's red close pushes nothing", () => {
  const { code, said, ran, disk } = handedBack("implement/tests-red", {
    sh: { exitCode: 1, stdout: "assertion, 1 test(s) fail on their own assertion\n" },
  });
  assert.equal(code, 0, said);
  assert.equal(
    fieldOf(disk.read(at("spec/tickets/free-one.md")), "step"),
    "implement/change",
  );
  assert.ok(
    ran.includes(
      "git commit -m free-one: passes implement/tests-red, skips implement/reflect",
    ),
  );
  assert.ok(!ran.includes(PUSH), "the close stays local");
  assert.ok(!ran.includes(CHECK), "a red close runs no check");

  const cloud = trunkPush({}, true);
  assert.equal(cloud.said.local, true);
  assert.match(cloud.why, /stands on this box, and the next green push carries it/);
  assert.ok(!cloud.ran.includes(PUSH), "a red close pushes nothing");
});

// [[spec/design_output/pull#the-rejected-push]]
test("a red check on trunk keeps the close local, and the answer names the check's cause", () => {
  const red = {
    exitCode: 1,
    stderr: "EveryModuleTested: src/scripts/x.js has no test\n",
  };
  const { said, why, ran } = trunkPush({ [CHECK]: red });
  assert.equal(said.ok, false);
  assert.match(why, /check answers red/);
  assert.ok(why.includes(saidBy(red)), "the answer names the check's own cause");
  assert.ok(!ran.includes(PUSH), "no push reaches origin");
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
