// The Bash door marks a push and a verb it lets through, so the push door
// knows the level0 hooks hold the session that runs it.
// [[spec/tickets/push-gate-needs-the-engine]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { ENGINE } from "../../.claude/skills/level0/lib/runs.js";
import { markedPush } from "../../src/bridge/bash.js";

const MARK = `export ${ENGINE}=1; `;

test("the Bash door marks a push and a verb with the engine variable, and leaves every other command as written", () => {
  const e = { tool: "Bash", command: "git push -u origin main", description: "x" };
  assert.deepEqual(markedPush(e.command, e), {
    event: { ...e, command: `${MARK}${e.command}` },
  });
  const verb = { tool: "Bash", command: "./RUNME.sh push" };
  assert.equal(
    markedPush(verb.command, verb)?.event?.command,
    `${MARK}./RUNME.sh push`,
  );
  assert.equal(markedPush("git status", { command: "git status" }), null);
  assert.equal(markedPush("ls", { command: "ls" }), null);
});
