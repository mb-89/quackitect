// The ticket verb's bless --desk: the owner's word on whether an agent at this
// desk blesses, which a person writes and the verb refuses to an agent.
// [[spec/tickets/the-sidebar-writes-through-actions]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { BLESS_FILE } from "../../src/scripts/pull-bless.js";
import { ticket } from "../../src/scripts/ticket.js";
import { at, deskDoors, heard } from "./pull-doors.js";

const FILE = at(BLESS_FILE);

async function blessed(desk, hand) {
  const { it, disk } = deskDoors({}, {}, hand);
  const said = heard(() => ticket(it.work, ["bless", `--desk=${desk}`], it));
  return {
    code: await said.code,
    said: said.said,
    wrote: disk.exists(FILE) ? JSON.parse(disk.read(FILE)) : undefined,
  };
}

test("ticket bless --desk writes the bless file for a person, and refuses an agent", async () => {
  const person = { agent: false, env: {} };
  const yes = await blessed("true", person);
  assert.equal(yes.code, 0, `the person's bless answers ${yes.code}: ${yes.said}`);
  assert.deepEqual(yes.wrote, { agent: true }, "--desk=true writes agent true");
  const no = await blessed("false", person);
  assert.equal(no.code, 0, `the person's bless answers ${no.code}: ${no.said}`);
  assert.deepEqual(no.wrote, { agent: false }, "--desk=false writes agent false");

  const agent = await blessed("true", { agent: true, env: { CLAUDECODE: "1" } });
  assert.notEqual(agent.code, 0, "an agent's bless refuses");
  assert.equal(agent.wrote, undefined, "an agent writes no bless file");
  assert.match(
    agent.said,
    /sidebar button/,
    "the refusal names the button that writes it",
  );
});
