// A done branch joins the desk queue: the pull on trunk hands it out as the
// review, the merge and the close, and a cloud box's pull leaves it be.
// [[spec/design_output/review#the-queue-takes-done-branches]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { probeOf, startOf } from "../../src/scripts/serve.js";
import { pulling } from "../../src/scripts/work.js";
import { remoteSaying } from "./work-doors.js";

const ROOT = "/tree";
const BRIEF =
  "---\nstatus: done\n---\n\n# The brief\n\nOne thing.\n\n# What surprises me\n\nNothing.\n";

function heard(what) {
  const lines = [];
  const was = [console.log, console.error];
  console.log = (...said) => lines.push(said.join(" "));
  console.error = console.log;
  try {
    return { code: what(), said: lines.join("\n") };
  } finally {
    [console.log, console.error] = was;
  }
}

function doors(cloud) {
  const said = fakeGit(
    {
      "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
      "git rev-parse HEAD": { stdout: "b818c390c02737351bf1b73aba36a573d34d2ecc\n" },
      ...remoteSaying([{ branch: "work/one-done", tip: "aaa" }], {
        "work/one-done:HANDOVER.md": BRIEF,
      }),
      "git rev-list --count HEAD..origin/main": { stdout: "0\n" },
      "git status --porcelain": { stdout: "" },
    },
    ROOT,
  );
  said.proc.teach(probeOf("node", 6510), { exitCode: 1 });
  said.proc.teach(startOf(ROOT), { exitCode: 0 });
  const disk = fakeDisk({
    [join(ROOT, ".se", "box.json")]: JSON.stringify({ id: "d462e994b4cef" }),
  });
  return {
    it: {
      proc: said.proc,
      disk,
      git: said,
      join,
      clock: fakeClock(),
      agent: true,
      cloud,
      node: "node",
    },
    outside: said,
  };
}

test("a desk's pull on trunk hands out a done branch as the review, the merge and the close", () => {
  const { it, outside } = doors(false);
  const { code, said } = heard(() => pulling(ROOT, ["pull"], it));
  assert.equal(code, 0, said);
  assert.match(said, /^work {2}work\/one-done stands done/m);
  assert.match(said, /branch review one-done/);
  assert.match(said, /branch merge one-done/);
  assert.match(said, /branch close one-done/);
  assert.ok(
    !outside.ran.some((one) => one.argv.join(" ").startsWith("git switch")),
    "the desk stays on trunk",
  );
});

test("a cloud box's pull takes a branch and names no done one", () => {
  const { it } = doors(true);
  const { said } = heard(() => pulling(ROOT, ["pull"], it));
  assert.ok(!said.includes("stands done"), "the done branch is the desk's");
});
