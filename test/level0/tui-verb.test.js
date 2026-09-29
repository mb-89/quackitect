// The tui verb holds no count road: the badge asks the index, so a count
// flag reaches the verb as any other word does.
// [[spec/tickets/the-count-chain-leaves]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { openTui } from "../../src/scripts/tui.js";

// What the verb prints on stdout while it runs. [[spec/tickets/the-count-chain-leaves]]
async function heard(what) {
  const out = [];
  const was = { log: console.log, error: console.error };
  console.log = (...said) => out.push(said.join(" "));
  console.error = () => {};
  try {
    return { code: await what(), out: out.join("\n") };
  } finally {
    console.log = was.log;
    console.error = was.error;
  }
}

// [[spec/tickets/the-count-chain-leaves]]
test("tui work --count prints no count, and asks no viewer for one", async () => {
  const doors = {
    root: "/tree",
    join,
    disk: fakeDisk({}),
    proc: fakeProc({}),
    viewer: () => ({ exe: "", why: "go builds no viewer here" }),
    show: (path) => path,
    names: () => [],
  };
  const said = await heard(() => openTui(doors, ["work", "--count"]));
  assert.doesNotMatch(said.out, /"count"/);
  assert.deepEqual(doors.proc.ran, []);
});
