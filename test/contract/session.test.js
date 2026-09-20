// Real records survive callbacks and keep handovers exclusive.
// [[spec/design_output/copilot#state-between-processes]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";
import { session } from "../../src/doors/session.js";

const HANDOVER = ".se/HANDOVER.md";

test("records survive process adapters and isolate session IDs", async () => {
  const files = disk();
  const root = files.tempDir("quack-session-");
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

test("a crash retains the saved handover and releases the lock", async () => {
  const files = disk();
  const root = files.tempDir("quack-session-");
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
