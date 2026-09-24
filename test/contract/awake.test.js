// The awake door, against the real box. The hold is a child that lives while
// its input stands open, so one case holds and releases, and the fake answers
// the same shape.
// [[spec/design_output/level0#the-server-holds-off-sleep]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { awake, holdArgv } from "../../src/doors/awake.js";
import { fakeAwake } from "../../src/doors/fake/awake.js";

const shaped = (held) => ({
  held: typeof held.held === "boolean",
  why: typeof held.why === "string",
  release: typeof held.release === "function",
});

const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

test("each box names the child that holds it, and an unknown box names none", () => {
  assert.equal(holdArgv("win32", 1)[0], "powershell");
  assert.deepEqual(holdArgv("darwin", 42), ["caffeinate", "-i", "-w", "42"]);
  assert.equal(holdArgv("linux", 1)[0], "systemd-inhibit");
  assert.deepEqual(holdArgv("sunos", 1), []);
});

test("the real door holds a child while the server lives, and the release ends it", async () => {
  const held = awake().hold();
  if (!held.held) {
    assert.match(
      held.why,
      /no hold stands|ENOENT|not found/i,
      "a box with no tool says so",
    );
    return;
  }
  assert.ok(alive(held.pid), "the child stands");

  const ended = held.release();
  assert.ok(ended instanceof Promise, "the release answers a promise");
  await ended;
  assert.equal(alive(held.pid), false, "the child ends before the release settles");
});

// A caller awaits the release on every road, so no branch answers nothing. [[spec/design_output/level0#the-server-holds-off-sleep]]
test("every release answers a promise that settles, the unheld door and the fake alike", async () => {
  for (const held of [awake("sunos").hold(), fakeAwake().hold(), fakeAwake("other").hold()]) {
    const ended = held.release();
    assert.ok(ended instanceof Promise, "the release answers a promise");
    await ended;
  }
});

test("the fake answers what the real door answers, and records the release", () => {
  const fake = fakeAwake();
  const held = fake.hold();
  assert.deepEqual(shaped(held), shaped(awake("sunos").hold()));
  held.release();
  assert.deepEqual(fake.holds, [{ held: true, released: true }]);
  assert.equal(fakeAwake("other").hold().held, false);
});
