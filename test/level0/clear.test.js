// The clear a handover asks for, held until a place the host runs it from.
// [[spec/tickets/the-clear-runs-live-remote]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { holdsClear, takesClear } from "../../.claude/skills/level0/hooks/clear.ts";

test("a held clear is taken once, and then none waits", () => {
  takesClear();
  assert.equal(takesClear(), null, "none waits before a hold");
  holdsClear("resume");
  assert.equal(takesClear(), "resume");
  assert.equal(takesClear(), null, "the second take finds none");
});
