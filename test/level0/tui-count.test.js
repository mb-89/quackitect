// The tui verb's count road, over a fake process door. The viewer counts the
// rows its work tab draws as it opens, and the verb prints what it answers.
// [[spec/design_output/tui#the-work-tab]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { SESSION } from "../../src/scripts/log-read.js";
import { openTui } from "../../src/scripts/tui.js";

const ROOT = "/tree";
const EXE = "/tree/.se/.runtime/bin/logview";

function doorsOf(viewer, answer) {
  return {
    root: ROOT,
    join,
    disk: fakeDisk({}),
    proc: fakeProc(answer ? { [EXE]: answer } : {}),
    viewer: () => viewer,
    show: (path) => path,
    names: () => [],
  };
}

// What the verb prints on each stream, and every ask it sends a standing window. [[spec/design_output/tui#a-second-launch-hands-over]]
async function heard(what) {
  const out = [];
  const err = [];
  const fetched = [];
  const was = { log: console.log, error: console.error, fetch: globalThis.fetch };
  console.log = (...said) => out.push(said.join(" "));
  console.error = (...said) => err.push(said.join(" "));
  globalThis.fetch = async (...asked) => {
    fetched.push(asked);
    throw new Error("no window stands in a case");
  };
  try {
    return { code: await what(), out: out.join("\n"), err: err.join("\n"), fetched };
  } finally {
    console.log = was.log;
    console.error = was.error;
    globalThis.fetch = was.fetch;
  }
}

test("tui work --count prints the viewer's count and leaves a standing viewer its tab", async () => {
  const doors = doorsOf(
    { exe: EXE, why: "" },
    { exitCode: 0, stdout: '{"count":4}\n' },
  );
  const said = await heard(() => openTui(doors, ["work", "--count"]));
  assert.equal(said.code, 0);
  assert.equal(said.out, '{"count":4}');
  assert.deepEqual(said.fetched, []);
  assert.deepEqual(
    doors.proc.ran.map((one) => one.argv),
    [[EXE, "--count", join(ROOT, SESSION)]],
  );
});

test("tui work --count on a tree lacking the viewer prints a null count", async () => {
  const doors = doorsOf({ exe: "", why: "go builds no viewer here" });
  const said = await heard(() => openTui(doors, ["work", "--count"]));
  assert.equal(said.code, 0);
  assert.equal(said.out, '{"count":null}');
  assert.deepEqual(doors.proc.ran, []);
});

test("tui work --count where the viewer answers an error says it on stderr, and exits 1", async () => {
  const doors = doorsOf(
    { exe: EXE, why: "" },
    { exitCode: 1, stdout: "", stderr: "no index stands here\n" },
  );
  const said = await heard(() => openTui(doors, ["work", "--count"]));
  assert.equal(said.code, 1);
  assert.equal(said.out, "");
  assert.match(said.err, /no index stands here/);
});
