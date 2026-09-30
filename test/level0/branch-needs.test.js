// A need naming a branch verb reads the table work answers, so the verbs a
// step names and the verbs a box runs stand in one place.
// [[spec/tickets/branch-list-reads-work-table]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { holdsVerb } from "../../src/scripts/pull-route.js";
import { WORK_VERBS } from "../../src/scripts/work.js";

test("the branch needs answer each verb work answers, and no other", () => {
  for (const verb of Object.keys(WORK_VERBS)) {
    assert.equal(holdsVerb(`branch ${verb}`), true, verb);
    assert.equal(holdsVerb(`work ${verb}`), true, verb);
  }
  assert.equal(holdsVerb("branch open"), true);
  assert.equal(holdsVerb("branch unblock"), true);
  assert.equal(holdsVerb("branch new"), false);
});
