// Records survive callbacks and keep handovers exclusive, on the real door
// and on the fake alike.
// [[spec/design_output/copilot#state-between-processes]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";
import { fakeSession } from "../../src/doors/fake/session.js";
import { session } from "../../src/doors/session.js";

const HANDOVER = ".se/HANDOVER.md";

// Each door as a case opens it: the real one anew on each call, since its records stand on the disk, and the fake once, since its records stand in memory. [[spec/tickets/index-session-suites-run-fakes]]
const DOORS = {
  real: () => session,
  fake: (root) => {
    const one = fakeSession(root);
    return () => one;
  },
};

for (const [name, opens] of Object.entries(DOORS)) {
  test(`records survive process adapters and isolate session IDs, on the ${name} door`, async () => {
    const files = disk();
    const root = files.tempDir("quack-session-");
    const session = opens(root);
    try {
      await session(root).withState("one", (state, save) => {
        state.said = "retained";
        save();
      });
      await session(root).withState("one", (state) =>
        assert.equal(state.said, "retained"),
      );
      await session(root).withState("two", (state) => assert.deepEqual(state, {}));
      assert.throws(() => session(root).path("../escape"), /outside/);
    } finally {
      files.remove(root);
    }
  });

  test(`a missing path or session ID is refused, on the ${name} door`, async () => {
    const files = disk();
    const root = files.tempDir("quack-session-");
    const session = opens(root);
    try {
      assert.throws(() => session(root).path(""), /Missing file path/);
      await assert.rejects(
        session(root).withState("", () => {}),
        /session ID/,
      );
    } finally {
      files.remove(root);
    }
  });

  test(`a crash retains the saved handover and releases the lock, on the ${name} door`, async () => {
    const files = disk();
    const root = files.tempDir("quack-session-");
    const session = opens(root);
    try {
      await assert.rejects(
        session(root).withState("one", (state, save, claim) => {
          claim(HANDOVER, "the result");
          state.said = "the result";
          save();
          throw new Error("interrupted");
        }),
        /interrupted/,
      );
      await session(root).withState("one", (state) =>
        assert.equal(state.said, "the result"),
      );
      await assert.rejects(
        session(root).withState("two", (_state, _save, claim) =>
          claim(HANDOVER, "the result"),
        ),
        /owns/,
      );
      await session(root).withState("one", (_state, _save, _claim, release) =>
        release(HANDOVER),
      );
      await session(root).withState("two", (_state, _save, claim) =>
        claim(HANDOVER, "another result"),
      );
    } finally {
      files.remove(root);
    }
  });
}
