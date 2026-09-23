// The box a hand names: the box file under the work root, and where none
// stands, the identity file under the method root, so a stub names its own box.
// [[spec/design_output/vehicle#the-work-root-inherits]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { IDENTITY } from "../../.claude/skills/level0/lib/vehicle.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { handOf } from "../../src/scripts/pull-hand-of.js";

const METHOD = "/method";
const WORK = "/work";
const at = (root, path) => join(root, ...path.split("/"));

test("a work root holding no box file takes the identity under the method root", () => {
  const it = {
    root: WORK,
    method: METHOD,
    join,
    disk: fakeDisk({
      [at(METHOD, IDENTITY)]: JSON.stringify({ id: "d462e994b4cef" }),
      [at(WORK, ".se/.runtime/session.json")]: JSON.stringify({
        id: "s7",
        harness: "claude-code",
      }),
    }),
    git: fakeGit({}, WORK),
    clock: fakeClock(),
    // The session file reads on a harness alone. [[spec/design_output/pull#the-hand-and-the-hold]]
    env: { CLAUDECODE: "1" },
  };
  assert.equal(
    IDENTITY,
    ".se/.runtime/identity.json",
    "the identity file carries its own name",
  );
  assert.equal(handOf(it), "box d462e994b4cef · session s7 · claude-code");
});
