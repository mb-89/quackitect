// The start road the bridgehead runs: node carries every guard, a desk box
// stays quiet, and a session outside the cage reads one block saying so.
// [[spec/design_output/level0#the-bridgehead-starts-it-too]]
// [[spec/design_output/level0#a-session-says-its-cage]]

import assert from "node:assert/strict";
import { test } from "node:test";

const HERE = "/tree";
const NO_MODULES = 6;

// A fresh copy of the hook a case, because the bridgehead holds what the start road answered. [[spec/design_output/level0#a-session-says-its-cage]]
let made = 0;
async function hookHere() {
  made += 1;
  return import(`../../.claude/skills/level0/hooks/level0.js?case=${made}`);
}

// The harness the bridgehead reaches: a wire, a file system, a process and the lines a person reads. [[spec/design_output/doors#a-fake-behaves]]
function harness({
  answers = false,
  exitCode = 0,
  stderr = "",
  ui = true,
  logs = true,
} = {}) {
  const wrote = new Map();
  const ran = [];
  const said = [];
  // Every write the log takes, failing or landing, so a case counts what the row's mark holds. [[spec/tickets/the-bridge-says-it-falls]]
  const tries = [];
  // Every address the hook fetches, so a case reads that nothing polls. [[spec/design_output/level0#the-first-call-pays]]
  const asked = [];
  let up = answers;
  const $ = {
    http: {
      fetch: async (where) => {
        asked.push(String(where));
        if (!up) throw new Error("fetch failed");
        return { ok: true, status: 200, text: JSON.stringify({ pass: true }) };
      },
    },
    fs: {
      read: async (path) => {
        if (!wrote.has(path)) throw new Error("no file");
        return wrote.get(path);
      },
      write: async (path, text) => {
        tries.push(String(text));
        if (!logs) throw new Error("the log stands read only");
        wrote.set(path, text);
      },
    },
    process: {
      run: async (argv) => {
        ran.push(argv);
        return { exitCode, stderr };
      },
    },
  };
  if (ui) $.ui = { log: (line) => said.push(String(line)) };
  function serves(on) {
    up = on;
  }
  return { wrote, ran, said, tries, asked, $, serves };
}

// One event through the bridgehead's own door, so a case drives the road event by event. [[spec/tickets/the-bridge-says-it-falls]]
function runner(hook, box) {
  const held = {};
  hook.register((event, ...rest) => {
    held[event] = rest.at(-1);
  }, {});
  const star = held["*"];
  return (event, said) =>
    star(
      box.$,
      said ?? {},
      Object.assign(async (back) => back ?? {}, { event }),
    );
}

async function opensThen(hook, box, e) {
  const runs = runner(hook, box);
  await runs("session.start", { cwd: HERE });
  return runs("prompt.context", e ?? {});
}

// A Windows box carries no shell on the host's path, so every guard runs in node. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
test("the start road runs node, and reaches no shell to read its guards", async () => {
  const hook = await hookHere();
  const box = harness({ exitCode: 3 });
  await opensThen(hook, box);

  assert.equal(box.ran.length, 1, "the road runs once");
  assert.equal(box.ran[0][0], "node", "and node carries it");
  assert.equal(box.ran[0][1], "-e", "off the script the hook holds");
  assert.equal(
    /^(sh|bash|cmd|powershell)$/.test(box.ran[0][0]),
    false,
    "no shell stands between the hook and the guards",
  );
});

test("the script reads every guard the shell read, and puts node behind it", async () => {
  const hook = await hookHere();
  const box = harness({ exitCode: 3 });
  await opensThen(hook, box);
  const script = box.ran[0][2];

  assert.match(script, /CLAUDE_CODE_REMOTE/, "the cloud variables");
  assert.match(script, /SE_CLOUD/);
  assert.match(script, /existsSync\(method\)/, "the method root");
  assert.match(script, /node_modules/, "the modules");
  assert.match(script, /detached: true/, "and the server stands behind it");
});

test("a desk box reads no line off the start road, because a person starts it there", async () => {
  const hook = await hookHere();
  const box = harness({ exitCode: 3 });
  await opensThen(hook, box);

  const rows = [...box.wrote.values()].join("\n");
  assert.doesNotMatch(rows, /the start of the server fails/, "the road fails nowhere");
  assert.doesNotMatch(rows, /a person starts the server here/, "and says nothing");
  assert.match(
    rows,
    /the server answers nothing/,
    "the log names the down server alone",
  );
});

test("a box whose start road stands down says so in the first prompt", async () => {
  const hook = await hookHere();
  const box = harness({ exitCode: NO_MODULES, stderr: "npm stands nowhere" });
  const said = await opensThen(hook, box);

  const block = (said.blocks ?? []).find((one) => one.name === hook.CAGE_BLOCK);
  assert.ok(block, "the first prompt carries the cage block");
  assert.match(block.text, /LEVEL ZERO STANDS DOWN/);
  assert.match(block.text, new RegExp(String(NO_MODULES)), "it names the code");
  assert.match(block.text, /npm stands nowhere/, "and what the road says");
  assert.match(block.text, /RUNME\.sh serve/, "and what a person runs");
});

test("a box whose server answers says no block of its own", async () => {
  const hook = await hookHere();
  const box = harness({ answers: true });
  const said = await opensThen(hook, box);
  assert.equal(
    (said.blocks ?? []).some((one) => one.name === hook.CAGE_BLOCK),
    false,
  );
});

test("a code saying a person starts the server carries no block", async () => {
  const hook = await hookHere();
  const box = harness({ exitCode: 3 });
  const said = await opensThen(hook, box);
  assert.equal(
    (said.blocks ?? []).some((one) => one.name === hook.CAGE_BLOCK),
    false,
    "a person standing at the box reads the sidebar",
  );
});

test("the block names the code, what it means, and what a person runs", async () => {
  const hook = await hookHere();
  const said = hook.cageText(NO_MODULES, "");
  assert.match(said, new RegExp(hook.reasonOf(NO_MODULES)[1]));
  assert.match(said, /RUNME\.sh/);
});

// A fall reaches the person at the moment it falls, beside the row the log takes. [[spec/tickets/the-bridge-says-it-falls]]
test("a server answering nothing at a later event says so in the chat", async () => {
  const hook = await hookHere();
  const box = harness();
  const runs = runner(hook, box);
  await runs("session.start", { cwd: HERE });
  await runs("tool.call", { tool: "Read" });

  const lines = box.said.join("\n");
  assert.match(lines, /answers nothing/, "the chat carries the fall");
  assert.match(lines, /6510/, "and names the address the event route holds");
  assert.match(lines, /RUNME\.sh serve/, "and what a person runs");
});

// [[spec/tickets/the-bridge-says-it-falls]]
test("the session start says nothing, because the start road runs under it", async () => {
  const hook = await hookHere();
  const box = harness();
  const runs = runner(hook, box);
  await runs("session.start", { cwd: HERE });

  assert.deepEqual(box.said, [], "a healthy cloud start draws no line");
  assert.match(
    [...box.wrote.values()].join("\n"),
    /answers nothing/,
    "the log row stands as it does",
  );
});

// [[spec/tickets/the-bridge-says-it-falls]]
test("a second event answering nothing says it once", async () => {
  const hook = await hookHere();
  const box = harness();
  const runs = runner(hook, box);
  await runs("session.start", { cwd: HERE });
  await runs("tool.call", { tool: "Read" });
  await runs("tool.call", { tool: "Edit" });

  assert.equal(box.said.length, 1, "the flag holds the line to one");
});

// [[spec/tickets/the-bridge-says-it-falls]]
test("a server answering, then falling, says it again", async () => {
  const hook = await hookHere();
  const box = harness({ answers: true });
  const runs = runner(hook, box);
  await runs("session.start", { cwd: HERE });
  await runs("tool.call", { tool: "Read" });
  assert.deepEqual(box.said, [], "a standing server draws no line");

  box.serves(false);
  await runs("tool.call", { tool: "Edit" });
  assert.equal(box.said.length, 1, "the fall after an answer says so");
});

// [[spec/tickets/the-bridge-says-it-falls]]
test("a harness carrying no chat log leaves the row alone", async () => {
  const hook = await hookHere();
  const box = harness({ ui: false });
  const runs = runner(hook, box);
  await runs("session.start", { cwd: HERE });
  await runs("tool.call", { tool: "Read" });

  assert.match([...box.wrote.values()].join("\n"), /answers nothing/);
});

// [[spec/tickets/the-bridge-says-it-falls]]
test("a session log that takes no write takes one row a fall", async () => {
  const hook = await hookHere();
  const box = harness({ logs: false });
  const runs = runner(hook, box);
  await runs("session.start", { cwd: HERE });
  await runs("tool.call", { tool: "Read" });
  await runs("tool.call", { tool: "Edit" });

  const falls = box.tries.filter((one) => one.includes("answers nothing"));
  assert.equal(falls.length, 1, "the row's mark stands off the answer of the write");
  assert.equal(box.said.length, 1, "and the chat line stands at one");
});

const LAUNCHED = 0;

// [[spec/design_output/level0#rules-ride-the-first-answer]]
test("a prompt meeting no server starts the road once, and passes on", async () => {
  const hook = await hookHere();
  const box = harness({ exitCode: LAUNCHED });
  const runs = runner(hook, box);

  const said = await runs("prompt.context", { blocks: [] });
  await runs("prompt.context", { blocks: [] });

  assert.equal(
    box.ran.length,
    1,
    "the prompt starts the road, and a second one starts none",
  );
  assert.deepEqual(said, { blocks: [] }, "the prompt passes on as it came");
});

// [[spec/design_output/level0#the-first-call-pays]]
test("a read tool before the server answers says level zero starts, and polls nothing", async () => {
  const hook = await hookHere();
  const box = harness({ exitCode: LAUNCHED });
  const runs = runner(hook, box);
  await runs("session.start", { cwd: HERE });

  const said = await runs("tool.call", { tool: "mcp__level0__find" });

  assert.match(String(said?.result ?? ""), /level zero is starting/i);
  assert.match(
    String(said.result),
    /call it again/i,
    "the line says what the agent does",
  );
  assert.equal(
    box.asked.some((one) => one.endsWith("/health")),
    false,
    "the call reads no health, so it waits on nothing",
  );
});

// [[spec/design_output/level0#the-first-call-pays]]
test("a read tool after the server answered and fell names the dead server", async () => {
  const hook = await hookHere();
  const box = harness({ answers: true, exitCode: LAUNCHED });
  const runs = runner(hook, box);
  await runs("session.start", { cwd: HERE });
  box.serves(false);

  const said = await runs("tool.call", { tool: "mcp__level0__find" });

  assert.match(String(said?.result ?? ""), /no server answers/);
});

// [[spec/design_output/level0#rules-ride-the-first-answer]]
test("a cloud stop before any server answers holds with the starting line", async () => {
  const hook = await hookHere();
  const box = harness({ exitCode: LAUNCHED });
  const runs = runner(hook, box);
  await runs("session.start", { cwd: HERE });

  const said = await runs("classic.Stop", {});

  assert.match(String(said?.block ?? ""), /level zero is starting/i);
  assert.match(String(said.block), /next event carries its rules/i);
});

// [[spec/design_output/level0#rules-ride-the-first-answer]]
test("a cloud stop holds a few times at most, so a server that never stands frees the turn", async () => {
  const hook = await hookHere();
  const box = harness({ exitCode: LAUNCHED });
  const runs = runner(hook, box);
  await runs("session.start", { cwd: HERE });

  const blocks = [];
  for (let at = 0; at < 6; at++)
    blocks.push(Boolean((await runs("classic.Stop", {}))?.block));

  assert.ok(blocks[0], "the first stop holds");
  assert.equal(blocks.at(-1), false, "a later stop passes");
});

// [[spec/design_output/level0#rules-ride-the-first-answer]]
test("a helper's stop passes while the server starts", async () => {
  const hook = await hookHere();
  const box = harness({ exitCode: LAUNCHED });
  const runs = runner(hook, box);
  await runs("session.start", { cwd: HERE });

  const said = await runs("classic.Stop", { agentId: "a1" });

  assert.equal(said?.block, undefined);
});

// [[spec/design_output/level0#a-session-says-its-cage]]
test("a cloud stop where the start road stood down passes, so a caged box loops nowhere", async () => {
  const hook = await hookHere();
  const box = harness({ exitCode: NO_MODULES, stderr: "npm stands nowhere" });
  const runs = runner(hook, box);
  await runs("session.start", { cwd: HERE });

  const said = await runs("classic.Stop", { stop_hook_active: false });

  assert.deepEqual(said, { stop_hook_active: false }, "the stop passes as it came");
});

// [[spec/design_output/level0#rules-ride-the-first-answer]]
test("a desk stop meeting no server passes, because a person starts it there", async () => {
  const hook = await hookHere();
  const box = harness({ exitCode: 3 });
  const runs = runner(hook, box);
  await runs("session.start", { cwd: HERE });

  const said = await runs("classic.Stop", {});

  assert.equal(said?.block, undefined);
});
