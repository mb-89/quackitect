// The ticket folders and the note end stand in one place, so the patch tool,
// the named faults and the engine spell them out of it.
// [[spec/tickets/each-fact-keeps-one-owner]]

import assert from "node:assert/strict";
import { test } from "node:test";
import * as applied from "../../.claude/skills/level0/lib/apply.js";
import {
  NOTE_END as PLUGIN_NOTE_END,
  TICKETS as PRIVATE_TICKETS,
  PUBLIC_TICKETS,
} from "../../.claude/skills/level0/lib/folders.js";
import { NOTE_END, TICKETS } from "../../src/engine/group.js";
import { FIELD_HOW } from "../../src/engine/named.js";

// [[spec/tickets/each-fact-keeps-one-owner]]
test("the ticket field and the named faults spell the folders out of one place", () => {
  const where = String(applied.TICKET_WHERE);
  assert.match(where, new RegExp(`${TICKETS}.+${PRIVATE_TICKETS}.+${NOTE_END}`));
  assert.ok(applied.patchSpec().inputSchema.properties.ticket.description.includes(where));
  assert.ok(FIELD_HOW.includes(where));
});

// The plugin imports nothing outside its folder, so the engine reads the folders the plugin owns. [[spec/tickets/each-fact-keeps-one-owner]]
test("the engine's ticket folder and note end are the ones the plugin owns", () => {
  assert.equal(TICKETS, PUBLIC_TICKETS);
  assert.equal(NOTE_END, PLUGIN_NOTE_END);
  assert.ok(String(applied.TICKET_WHERE).includes(PUBLIC_TICKETS));
});
