// A cloud branch's merge, driven through fake doors: it reads against trunk by
// its commits, runs the check, and deletes the branch once trunk reaches origin.
// [[spec/design_output/work#a-cloud-branch-comes-in]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { merge } from "../../src/scripts/work-merge.js";
import { work } from "../../src/scripts/work.js";
import { doorsSaying, heard, merging, ranGit, ROOT } from "./work-doors.js";

// A cloud branch reads against trunk by its commits, and takes no group. [[spec/design_output/work#a-cloud-branch-comes-in]]
const CLOUD = "claude/a-thing";
const CHECK = `node ${join(ROOT, "src/scripts/cli.js")} check --errors`;
function cloudMerge(cherry, more = {}) {
  const { it, outside } = doorsSaying(
    merging({ [`git cherry main origin/${CLOUD}`]: { stdout: cherry }, ...more }),
  );
  const { code, said } = heard(() => merge({ ...it, root: ROOT, node: "node" }, CLOUD));
  return { code, said, ran: ranGit(outside) };
}

// [[spec/design_output/work#a-cloud-branch-comes-in]]
test("merge takes a claude branch in, runs the check and deletes the branch", () => {
  const { code, said, ran } = cloudMerge("+ abc123\n- def456\n");

  assert.equal(code, 0, said);
  assert.ok(ran.includes(`git merge --no-ff --no-edit origin/${CLOUD}`));
  assert.ok(!ran.some((one) => one.startsWith("git show")), "no group reads");
  assert.ok(ran.includes(CHECK), "the check runs");
  const pushed = ran.indexOf("git push origin main");
  assert.ok(pushed >= 0, "main reaches origin");
  assert.ok(
    ran.indexOf(`git push origin --delete ${CLOUD}`) > pushed,
    "then the branch goes",
  );
  assert.match(said, new RegExp(`${CLOUD} is merged`));
});

// Main reaches origin before the branch goes, so a refused push leaves the branch standing. [[spec/tickets/merge-deletes-after-the-push]]
test("merge keeps a claude branch where the push of main comes back refused", () => {
  const { code, said, ran } = cloudMerge("+ abc123\n", {
    "git push origin main": { exitCode: 1 },
  });

  assert.equal(code, 1);
  assert.match(said, new RegExp(`${CLOUD} stands`));
  assert.ok(!ran.includes(`git push origin --delete ${CLOUD}`), "the branch stays");
});

// [[spec/design_output/work#a-cloud-branch-comes-in]]
test("merge names main as carrying a claude branch's work, and deletes the branch", () => {
  const { code, said, ran } = cloudMerge("- abc123\n");

  assert.equal(code, 0, said);
  assert.ok(!ran.some((one) => one.startsWith("git merge")), "nothing merges");
  assert.ok(ran.includes(CHECK), "the check runs");
  assert.ok(ran.includes(`git push origin --delete ${CLOUD}`));
  assert.match(said, new RegExp(`main carries ${CLOUD}`));
});

// The install ran before the merge and read the old wants, so the merge runs it again before the check. [[spec/design_output/work#the-merge-lands-the-truth]]
test("merge builds the merged tree's tools before its check", () => {
  const { ran } = cloudMerge("+ abc123\n");
  const install = ran.findIndex((one) =>
    one.endsWith(join("src", "scripts", "install.sh")),
  );
  const check = ran.indexOf(CHECK);
  assert.ok(install >= 0, "the merge runs the install");
  assert.ok(install < check, "and runs it before the check");
});

// A work branch's merge closes it once trunk reaches origin, and a refused push leaves it standing. [[spec/design_output/work#a-dependency-waits-for-trunk]]
test("merge of a work branch pushes main and closes the branch, and keeps it where the push comes back refused", () => {
  const closed = doorsSaying(merging());
  closed.it.node = "node";
  const shut = heard(() =>
    work(ROOT, ["merge", "one-group"], { ...closed.it, cloud: false }),
  );
  assert.equal(shut.code, 0, shut.said);
  const ran = ranGit(closed.outside);
  assert.ok(
    ran.indexOf("git push origin main") <
      ran.indexOf("git push origin --delete work/one-group"),
  );

  const kept = doorsSaying(merging({ "git push origin main": { exitCode: 1 } }));
  kept.it.node = "node";
  const held = heard(() =>
    work(ROOT, ["merge", "one-group"], { ...kept.it, cloud: false }),
  );
  assert.equal(held.code, 0, held.said);
  assert.ok(!ranGit(kept.outside).includes("git push origin --delete work/one-group"));
  assert.match(held.said, /then run \.\/RUNME\.sh branch close one-group/);

  const refused = doorsSaying(
    merging({ "git push origin --delete work/one-group": { exitCode: 1 } }),
  );
  refused.it.node = "node";
  const left = heard(() =>
    work(ROOT, ["merge", "one-group"], { ...refused.it, cloud: false }),
  );
  assert.equal(left.code, 0, "a refused delete leaves the merge green");
  assert.match(left.said, /stands on the remote, and trunk carries its ticket closed/);
});

// GitHub lands a branch a pull request carries, so the desk merge leaves it alone. [[spec/tickets/groups-land-through-pull-requests]]
test("branch merge refuses a branch a pull request carries, and names it", () => {
  const { it, outside } = doorsSaying(
    merging({
      "git rev-parse origin/work/one-group": { stdout: "tip999\n" },
      "git ls-remote origin refs/pull/*/head": {
        stdout: "abc000\trefs/pull/7/head\ntip999\trefs/pull/42/head\n",
      },
    }),
  );
  it.node = "node";

  const { code, said } = heard(() =>
    work(ROOT, ["merge", "one-group"], { ...it, cloud: false }),
  );

  assert.equal(code, 1, said);
  assert.match(said, /pull request #42/);
  assert.ok(
    !ranGit(outside).some((one) => one.startsWith("git merge")),
    "nothing merges",
  );
});
