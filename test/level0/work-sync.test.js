// The sync verb takes main in: into a work branch from trunk, and into a
// desk's main from the remote, stopping on a conflict so the hand resolves it.
// [[spec/tickets/sync-takes-origin-main]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { sync } from "../../src/scripts/work-stands.js";
import { doorsSaying, heard, onBranch, ranGit } from "./work-doors.js";

const BEHIND = { "git rev-list --count HEAD..origin/main": { stdout: "2\n" } };
const ON_MAIN = "git merge origin/main --no-edit -m main: take origin/main in";

test("sync on main takes the remote's main in", () => {
  const { it, outside } = doorsSaying({ ...onBranch("main"), ...BEHIND });
  const { code, said } = heard(() => sync(it));
  assert.equal(code, 0, said);
  assert.ok(ranGit(outside).includes(ON_MAIN), ranGit(outside).join("\n"));
  assert.match(said, /main took 2 commit\(s\) from origin\/main/);
});

test("sync on main stops on a conflict and leaves the merge to the hand", () => {
  const { it } = doorsSaying({
    ...onBranch("main"),
    ...BEHIND,
    [ON_MAIN]: { exitCode: 1 },
  });
  const { code, said } = heard(() => sync(it));
  assert.equal(code, 1);
  assert.match(said, /origin\/main conflicts with main/);
  assert.match(said, /git status names the files/);
});

test("sync on a work branch takes main in as before", () => {
  const { it, outside } = doorsSaying({ ...onBranch("work/one-group"), ...BEHIND });
  const { code, said } = heard(() => sync(it));
  assert.equal(code, 0, said);
  assert.ok(
    ranGit(outside).includes(
      "git merge origin/main --no-edit -m work/one-group: take main in",
    ),
  );
  assert.match(said, /work\/one-group took 2 commit\(s\) from main/);
});

test("sync on any other branch refuses, and names where it runs", () => {
  const { it } = doorsSaying(onBranch("claude/a-thing"));
  const { code, said } = heard(() => sync(it));
  assert.equal(code, 2);
  assert.match(
    said,
    /branch sync runs on main or a work branch, and this is claude\/a-thing/,
  );
});
