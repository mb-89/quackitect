// Copilot translation uses the same decisions on both surfaces.
// [[spec/design_output/copilot#events-and-feedback]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { refusedText } from "../../.claude/skills/level0/hooks/cage.ts";
import {
  callsOf,
  eventOf,
  failureOf,
  replyOf,
} from "../../.claude/skills/level0/lib/copilot.js";
import { answers } from "../../src/scripts/copilot-door.js";

const STANDING = ".se/.runtime/hooks.json";
const HOOK = "http://127.0.0.1:7001/hook";

// A box whose standing file names the door, and whose door answers the effects the case hands it, or falls. [[spec/tickets/copilot-answers-off-the-door]]
function doored(effects, files = {}) {
  const posts = [];
  const held = { [STANDING]: JSON.stringify({ port: 7001, token: "t0k" }), ...files };
  return {
    posts,
    it: {
      root: "/tree",
      read: (rel) => {
        if (!(rel in held)) throw new Error(`no file at ${rel}`);
        return held[rel];
      },
      fetch: async (url, init) => {
        posts.push({ url, body: JSON.parse(init.body) });
        if (!effects) throw new Error("Unable to connect");
        return { ok: true, status: 200, text: JSON.stringify({ effects }) };
      },
    },
  };
}

const pre = (tool, args) => ({
  event: "PreToolUse",
  surface: "vscode",
  session: "s1",
  tool,
  args,
  retry: false,
});

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

// [[spec/tickets/copilot-answers-off-the-door]]
test("a shell call posts Bash with its command", () => {
  assert.deepEqual(
    callsOf(pre("run_in_terminal", { command: "ls" }), () => ""),
    [{ tool: "Bash", command: "ls" }],
  );
});

// [[spec/tickets/copilot-answers-off-the-door]]
test("an edit call posts one Write a changed file with its whole text", () => {
  const read = (path) => (path === "spec/a.md" ? "The door reads.\n" : "");
  assert.deepEqual(
    callsOf(
      pre("replace_string_in_file", {
        filePath: "spec/a.md",
        oldString: "reads",
        newString: "writes",
      }),
      read,
    ),
    [{ tool: "Write", file_path: "spec/a.md", content: "The door writes.\n" }],
  );
  assert.deepEqual(
    callsOf(pre("create_file", { filePath: "spec/b.md", content: "New.\n" }), read),
    [{ tool: "Write", file_path: "spec/b.md", content: "New.\n" }],
  );
});

// [[spec/tickets/copilot-answers-off-the-door]]
test("a Copilot hook answers the door's deny as its result", async () => {
  const box = doored([{ kind: "result", text: "the door refuses this call" }]);

  const said = await answers(pre("run_in_terminal", { command: "ls" }), box.it);

  assert.deepEqual(said, { deny: "the door refuses this call" });
  assert.equal(box.posts[0]?.url, HOOK, "the call goes to the hooks door");
  assert.equal(box.posts[0].body.event, "tool.call");
  assert.deepEqual(box.posts[0].body.e, {
    tool: "Bash",
    command: "ls",
    session_id: "s1",
  });
});

// [[spec/tickets/copilot-answers-off-the-door]]
test("the door's afters answer as the result's context", async () => {
  const box = doored([
    { kind: "after", text: "one note" },
    { kind: "after", text: "two note" },
  ]);

  const said = await answers(
    { event: "SessionStart", surface: "vscode", session: "s1", tool: "", args: {} },
    box.it,
  );

  assert.deepEqual(said, { context: "one note\n\ntwo note" });
  assert.equal(box.posts[0]?.body.event, "session.start");
});

// [[spec/tickets/copilot-answers-off-the-door]]
test("a guarded call meets the refusal while the door stands down, and a session start passes", async () => {
  const write = pre("create_file", { filePath: "spec/b.md", content: "New.\n" });
  const said = await answers(write, doored(null).it);
  assert.deepEqual(said, {
    deny: refusedText({ tool: "Write", file_path: "spec/b.md", content: "New.\n" }),
  });

  const start = {
    event: "SessionStart",
    surface: "vscode",
    session: "s1",
    tool: "",
    args: {},
  };
  assert.deepEqual(await answers(start, doored(null).it), {});
});
