// The one read of where a box runs: a desk works on trunk alone, and a cloud
// box works each work branch. The doors and the verbs ask it here.
// [[spec/design_output/work#a-desk-works-on-trunk]]

import assert from "node:assert/strict";
import { test } from "node:test";
import * as applied from "../../.claude/skills/level0/lib/apply.js";
import {
  cloudHere,
  deskRefusal,
  onDesk,
} from "../../.claude/skills/level0/lib/cloud.js";
import { TICKETS as PRIVATE_TICKETS } from "../../.claude/skills/level0/lib/folders.js";
import { NOTE_END, TICKETS } from "../../src/engine/group.js";
import { FIELD_HOW } from "../../src/engine/named.js";
import { pushed } from "../../src/scripts/pull-push.js";

test("a desk stands on a work branch where the box runs off the cloud, and on no other branch", () => {
  assert.equal(onDesk({ env: {} }, "work/one-group"), true);
  assert.equal(onDesk({ env: {} }, "main"), false, "trunk is the desk's own");
  assert.equal(onDesk({ env: {} }, "claude/a-thing"), false, "a branch off the queue");
  assert.equal(
    onDesk({ env: { SE_CLOUD: "1" } }, "work/one-group"),
    false,
    "a cloud box works it",
  );
});

test("the doors' own flag answers the cloud first, and the environment answers where the flag stands unset", () => {
  assert.equal(cloudHere({ cloud: false, env: { CLAUDE_CODE_REMOTE: "true" } }), false);
  assert.equal(cloudHere({ cloud: true, env: {} }), true);
  assert.equal(cloudHere({ env: { CLAUDE_CODE_REMOTE: "true" } }), true);
  assert.equal(cloudHere({ env: { SE_CLOUD: "0" } }), false);
  assert.equal(cloudHere({}), false);
});

test("a desk's refusal says what stands undone, and names main and the merge", () => {
  const said = deskRefusal("the pull hands nothing out", "one-group").join("\n");
  assert.match(said, /the pull hands nothing out/);
  assert.match(said, /git switch main/);
  assert.match(said, /\.\/RUNME\.sh branch merge one-group/);
  assert.match(deskRefusal("x").join("\n"), /branch merge <name>/);
});

// A reader holding the doors' flag answers the way the Bash door does. [[spec/tickets/each-fact-keeps-one-owner]]
test("every reader of the cloud asks cloudHere, and a push reads the doors' own flag first", () => {
  const said = pushed({ cloud: false, env: { SE_CLOUD: "1" } }, "work/one-group");
  assert.equal(said.local, true, "the doors' flag says a desk, whatever the environment says");
});

// [[spec/tickets/each-fact-keeps-one-owner]]
test("the ticket field and the named faults spell the folders out of one place", () => {
  const where = String(applied.TICKET_WHERE);
  assert.match(where, new RegExp(`${TICKETS}.+${PRIVATE_TICKETS}.+${NOTE_END}`));
  assert.ok(applied.patchSpec().inputSchema.properties.ticket.description.includes(where));
  assert.ok(FIELD_HOW.includes(where));
});
