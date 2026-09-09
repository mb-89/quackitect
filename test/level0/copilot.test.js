// Copilot translation uses the same decisions on both surfaces.
// [[spec/design_output/copilot#events-and-feedback]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  eventOf,
  failureOf,
  replyOf,
} from "../../.claude/skills/level0/lib/copilot.js";

test("cloud accepts object and JSON tool arguments", () => {
  for (const toolArgs of [{ path: "a.md" }, '{"path":"a.md"}']) {
    const event = eventOf(
      { sessionId: "one", toolName: "edit", toolArgs },
      "preToolUse",
      "cloud",
    );
    assert.equal(event.session, "one");
    assert.equal(event.event, "PreToolUse");
    assert.deepEqual(event.args, { path: "a.md" });
  }
});

test("a refusal reaches either agent without asking a person", () => {
  const vscode = replyOf({ surface: "vscode" }, { deny: "Fix line two." });
  assert.equal(vscode.hookSpecificOutput.permissionDecision, "deny");
  assert.equal(vscode.hookSpecificOutput.additionalContext, "Fix line two.");
  assert.deepEqual(replyOf({ surface: "cloud" }, { deny: "Fix line two." }), {
    permissionDecision: "deny",
    permissionDecisionReason: "Fix line two.",
  });
});

test("stop asks the agent to continue on either surface", () => {
  assert.equal(
    replyOf({ surface: "vscode" }, { block: "Write the result." }).hookSpecificOutput
      .decision,
    "block",
  );
  assert.deepEqual(replyOf({ surface: "cloud" }, { block: "Write the result." }), {
    decision: "block",
    reason: "Write the result.",
  });
});

test("unknown surfaces do not quietly lose enforcement", () => {
  assert.throws(() => eventOf({}, "PreToolUse", "other"), /surface/);
});

test("tool namespaces preserve the guarded tool name", () => {
  assert.equal(
    eventOf({ tool_name: "functions.run_in_terminal" }, "PreToolUse", "vscode").tool,
    "run_in_terminal",
  );
});

test("repeated stop errors terminate without claiming completion", () => {
  const event = { surface: "vscode", event: "Stop", retry: false };
  assert.ok(failureOf(event, "Checker missing").block);
  event.retry = true;
  const result = replyOf(event, failureOf(event, "Checker missing"));
  assert.equal(result.continue, false);
  assert.equal(result.systemMessage, "Checker missing");
  assert.equal(
    replyOf({ ...event, surface: "cloud" }, failureOf(event, "Checker missing"))
      .decision,
    undefined,
  );
});
