// The opening prompt a cleared conversation reads first.
// [[spec/design_output/stop#the-context-hands-over]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { RESUME } from "../../src/bridge/handover.js";
import { READ } from "../../src/scripts/ephemeral.js";

test("the resume prompt names the key that cleared, the pull, and the read ticket in hand", () => {
  assert.match(RESUME, /^Level zero cleared the conversation/);
  assert.ok(RESUME.includes("`context.handoverAt`"), "the key");
  assert.ok(RESUME.includes("`./RUNME.sh ticket pull`"), "the pull");
  assert.ok(RESUME.includes(`\`${READ}\` stands in your hand`), "the read ticket");
  assert.match(RESUME, /the handover block says where the work stands\.$/);
});
