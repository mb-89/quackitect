// The lib keeps the readers the door and the hooks import, and no Vale config.
// [[spec/tickets/vale-leaves-the-tree]]

import assert from "node:assert/strict";
import { test } from "node:test";
import * as lib from "../../.claude/skills/level0/lib/vale.js";

test("the lib exports no config and no styles reader", () => {
  assert.equal("CONFIG" in lib, false);
  assert.equal("stylesIn" in lib, false);
  assert.equal(typeof lib.unreasoned, "function");
});
