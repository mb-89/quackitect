// The cloud marker: the group ticket on trunk carries `cloud: true` while its
// branch stands in the cloud. Open writes it, the merge and the close drop it,
// and the release leaves it.
// [[spec/tickets/groups-carry-the-cloud-marker]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeFront } from "../../src/doors/fake/front.js";
import { fieldOf, withEntry, withField } from "../../src/engine/group.js";
import { work } from "../../src/scripts/work.js";
import {
  doorsSaying,
  GROUP_AT,
  GROUP_NOTE,
  groupRemote,
  heard,
  merging,
  on,
  onBranch,
  ROOT,
  ranGit,
  remoteSaying,
  SHA,
} from "./work-doors.js";

const MARKED = withField(GROUP_NOTE, "cloud", "true", fakeFront());
const BRANCH_PUSH = `git push origin ${SHA}:refs/heads/work/one-group`;
const TRUNK_PUSH = "git push origin main";

const opening = (extra = {}) => ({
  ...remoteSaying([]),
  ...onBranch("main"),
  [`git show origin/main:${GROUP_AT}`]: { stdout: GROUP_NOTE },
  "git rev-parse origin/main^{tree}": { stdout: "t0t0\n" },
  "git commit-tree t0t0 -p origin/main -m work/one-group opens": { stdout: `${SHA}\n` },
  ...extra,
});

test("branch open writes the marker on trunk once the branch push lands", () => {
  const { it, outside, disk } = doorsSaying(opening(), {
    [on("one-group")]: GROUP_NOTE,
  });

  const { code, said } = heard(() => work(ROOT, ["open", "one-group"], it));

  assert.equal(code, 0, said);
  assert.equal(fieldOf(disk.read(on("one-group")), "cloud"), "true");
  const ran = ranGit(outside);
  assert.ok(
    ran.includes("git commit -m one-group: opens in the cloud"),
    ran.join("\n"),
  );
  assert.ok(
    ran.indexOf(BRANCH_PUSH) < ran.indexOf(TRUNK_PUSH),
    "the branch push lands first",
  );
});

test("branch open refuses off trunk, and pushes nothing", () => {
  const { it, outside } = doorsSaying(opening(onBranch("work/other")), {
    [on("one-group")]: GROUP_NOTE,
  });

  const { code, said } = heard(() => work(ROOT, ["open", "one-group"], it));

  assert.equal(code, 2);
  assert.match(said, /runs on main/);
  assert.ok(!ranGit(outside).some((one) => one.startsWith("git push")));
});

test("a refused branch push leaves trunk without the marker", () => {
  const { it, outside, disk } = doorsSaying(
    opening({ [BRANCH_PUSH]: { exitCode: 1 } }),
    { [on("one-group")]: GROUP_NOTE },
  );

  const { code } = heard(() => work(ROOT, ["open", "one-group"], it));

  assert.equal(code, 1);
  assert.equal(fieldOf(disk.read(on("one-group")), "cloud"), "");
  assert.ok(!ranGit(outside).includes(TRUNK_PUSH));
});

test("branch open marks a branch already standing in the cloud", () => {
  const { it, outside, disk } = doorsSaying(
    {
      ...groupRemote(),
      ...onBranch("main"),
      [`git show origin/main:${GROUP_AT}`]: { stdout: GROUP_NOTE },
    },
    { [on("one-group")]: GROUP_NOTE },
  );

  const { code, said } = heard(() => work(ROOT, ["open", "one-group"], it));

  assert.equal(code, 0, said);
  assert.match(said, /already stands in the cloud/);
  assert.equal(fieldOf(disk.read(on("one-group")), "cloud"), "true");
  assert.ok(ranGit(outside).includes(TRUNK_PUSH));
  assert.ok(!ranGit(outside).includes(BRANCH_PUSH));
});

test("branch merge drops the marker on the merge commit", () => {
  const { it, outside, disk } = doorsSaying(merging(), { [on("one-group")]: MARKED });
  it.node = "node";

  const { code, said } = heard(() =>
    work(ROOT, ["merge", "one-group"], { ...it, cloud: false }),
  );

  assert.equal(code, 0, said);
  assert.equal(fieldOf(disk.read(on("one-group")), "cloud"), "");
  assert.ok(ranGit(outside).includes("git commit --amend --no-edit"));
});

const closing = (extra = {}) => ({
  ...onBranch("main"),
  "git rev-list --count origin/main..main": { stdout: "0\n" },
  "git branch -r --merged origin/main": { stdout: "  origin/main\n" },
  "git branch -r --points-at origin/main": { stdout: "  origin/main\n" },
  ...extra,
});

test("branch close drops the marker on trunk before the branch goes", () => {
  const { it, outside, disk } = doorsSaying(closing(), { [on("one-group")]: MARKED });

  const { code, said } = heard(() => work(ROOT, ["close", "one-group", "--force"], it));

  assert.equal(code, 0, said);
  assert.equal(fieldOf(disk.read(on("one-group")), "cloud"), "");
  const ran = ranGit(outside);
  assert.ok(ran.includes("git commit -m one-group: leaves the cloud"), ran.join("\n"));
  assert.ok(
    ran.indexOf(TRUNK_PUSH) < ran.indexOf("git push origin --delete work/one-group"),
    "trunk reaches origin before the branch goes",
  );
});

test("branch close refuses off trunk, and deletes nothing", () => {
  const { it, outside } = doorsSaying(closing(onBranch("work/other")), {
    [on("one-group")]: MARKED,
  });

  const { code, said } = heard(() => work(ROOT, ["close", "one-group", "--force"], it));

  assert.equal(code, 2);
  assert.match(said, /runs on main/);
  assert.ok(!ranGit(outside).some((one) => one.startsWith("git push")));
});

test("branch release leaves the marker, and the branch stands at todo", () => {
  const held = withEntry(
    MARKED,
    { step: "sync", hand: "box 3f9a", hash_before: "a1b2c3" },
    fakeFront(),
  );
  const { it, outside, disk } = doorsSaying(
    {
      ...groupRemote(held),
      "git rev-list --count origin/work/one-group..work/one-group": { stdout: "0\n" },
    },
    { [on("one-group")]: held },
  );

  const { code, said } = heard(() => work(ROOT, ["release"], it));

  assert.equal(code, 0, said);
  assert.match(said, /stands at todo again/);
  assert.equal(fieldOf(disk.read(on("one-group")), "cloud"), "true");
  assert.ok(!ranGit(outside).includes(TRUNK_PUSH));
});
