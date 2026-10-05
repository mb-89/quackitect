// Every verb of the table registers in Go, since no verb program stands.
// [[spec/tickets/program-of-drops-node]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { commands, goVerbs } from "./commands.js";

test("every verb of the table registers in Go", () => {
  const go = goVerbs();
  for (const verb of commands().keys()) assert.ok(go.has(verb), `${verb} registers no Go verb`);
});
