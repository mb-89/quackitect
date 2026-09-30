// The cage's words and choices under new: the events the door decides, the post it takes, the step its effects answer, the guard, and the refusal. [[spec/tickets/a-down-index-refuses-calls]]

import assert from "node:assert/strict";
import test from "node:test";
import {
  doors,
  guarded,
  postOf,
  refusedText,
  stepOf,
} from "../../.claude/skills/level0/hooks/cage.js";

test("the door decides the tool call and the Stop, and the bridge keeps the prompt", () => {
  assert.equal(doors("tool.call"), true);
  assert.equal(doors("classic.Stop"), true);
  assert.equal(doors("prompt.context"), false);
});

test("the post goes to the standing port with its token as a bearer", () => {
  const post = postOf(
    { port: 7001, token: "t0k" },
    "tool.call",
    { tool: "Bash" },
    "/tree",
    {
      fill: 9,
    },
  );
  assert.equal(post.where, "http://127.0.0.1:7001/hook");
  assert.equal(post.init.headers.authorization, "Bearer t0k");
  assert.deepEqual(JSON.parse(post.init.body), {
    event: "tool.call",
    e: { tool: "Bash" },
    root: "/tree",
    fill: 9,
  });
});

test("an event effect answers the rewritten event", () => {
  assert.deepEqual(
    stepOf(
      { effects: [{ kind: "event", result: { text: "first, then the prompt" } }] },
      "prompt.submit",
      {
        asks: true,
        served: false,
      },
    ),
    { answer: { event: { text: "first, then the prompt" } } },
  );
});

test("a clear effect answers the clear prompt, and the turn passes", () => {
  assert.deepEqual(
    stepOf(
      { effects: [{ kind: "clear", text: "read the handover" }] },
      "turn.complete",
      {
        asks: true,
        served: false,
      },
    ),
    { answer: { pass: true, clear: { prompt: "read the handover" } } },
  );
});

test("a result's text answers as a deny, its result as the tool result, and a block holds the Stop", () => {
  const plain = { asks: true, served: false };
  assert.deepEqual(
    stepOf({ effects: [{ kind: "result", text: "no" }] }, "tool.call", plain),
    {
      answer: { deny: "no" },
    },
  );
  assert.deepEqual(
    stepOf(
      { effects: [{ kind: "result", result: { result: "a line" } }] },
      "tool.call",
      plain,
    ),
    { answer: { result: "a line" } },
  );
  assert.deepEqual(
    stepOf({ effects: [{ kind: "block", text: "say it" }] }, "classic.Stop", plain),
    {
      answer: { block: "say it" },
    },
  );
});

test("rows ask back once, an after rides as context, and a served tool the door passes goes to the bridge", () => {
  const rows = { effects: [{ kind: "rows", call: "s1.2" }] };
  assert.deepEqual(stepOf(rows, "tool.call", { asks: true, served: false }), {
    rows: "s1.2",
  });
  assert.deepEqual(stepOf(rows, "tool.call", { asks: false, served: false }), {});
  const after = { effects: [{ kind: "pass" }, { kind: "after", text: "a note" }] };
  assert.deepEqual(stepOf(after, "classic.Stop", { asks: true, served: false }), {
    after: ["a note"],
  });
  assert.deepEqual(
    stepOf({ effects: [{ kind: "pass" }] }, "tool.call", { asks: true, served: true }),
    { bridge: true },
  );
});

test("a read passes while the door stands down, and every other call stands guarded", () => {
  const reads = ["mcp__level0__find"];
  assert.equal(guarded("tool.call", { tool: "Read" }, reads), false);
  assert.equal(guarded("tool.call", { tool: "mcp__level0__find" }, reads), false);
  assert.equal(guarded("tool.call", { tool: "Bash", command: "ls" }, reads), true);
  assert.equal(guarded("classic.Stop", {}, reads), false);
});

test("the command the refusal names passes, so a box with no index brings it back", () => {
  const bash = (command) => guarded("tool.call", { tool: "Bash", command }, []);
  assert.equal(bash("./RUNME.sh serve"), false);
  assert.equal(bash("./RUNME.sh doctor"), false);
  assert.equal(
    bash("./RUNME.sh serve; rm -rf x"),
    true,
    "a chain behind it stays guarded",
  );
  assert.equal(bash("./RUNME.sh serve && rm -rf x"), true);
  assert.equal(bash("./RUNME.sh serve --inspect"), false);
  assert.equal(bash("./RUNME.sh check"), true);
});

test("the refusal names the call, the alarm and the command that clears it", () => {
  const text = refusedText({ tool: "Bash" });
  assert.match(text, /Bash/);
  assert.match(text, /session\/alarms/);
  assert.match(text, /\.\/RUNME\.sh serve/);
});
