// A cloud branch's merge, driven through fake doors: it reads against trunk by
// its commits, runs the check, and deletes the branch once trunk reaches origin.
// [[spec/design_output/work#a-cloud-branch-comes-in]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { merge } from "../../src/scripts/work-merge.js";
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
