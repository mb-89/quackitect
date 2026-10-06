// The start road the bridgehead runs: the index binary's serve verb answers
// the row the log takes, a desk box stays quiet, and a door that falls says so
// once.
// [[spec/design_output/level0#the-bridgehead-starts-it-too]]

import assert from "node:assert/strict";
import { test } from "node:test";

const HERE = "/tree";

// A fresh copy of the hook a case, because the bridgehead holds what the start road answered. [[spec/design_output/level0#a-session-says-its-cage]]
let made = 0;
async function hookHere() {
  made += 1;
  return import(`../../.claude/skills/level0/hooks/level0.ts?case=${made}`);
}

// The harness the bridgehead reaches: a wire, a file system, a process and the lines a person reads. [[spec/design_output/doors#a-fake-behaves]]
function harness({
  answers = false,
  exitCode = 0,
  stdout = "",
  stderr = "",
  ui = true,
  logs = true,
  missing = false,
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
      run: async (argv, init) => {
        // A box whose binary stands nowhere refuses every spawn of it. [[spec/tickets/level0-hooks-hold-no-rule]]
        if (missing) throw new Error(`spawn ${argv[0]} ENOENT`);
        // The bridgehead appends its row through the log verb, and the append lands in the log the case reads. [[spec/tickets/level0-hooks-hold-no-rule]]
        if (argv.includes("log") && argv.includes("--say")) {
          const said = String(argv.at(-1));
          tries.push(said);
          if (!logs) return { exitCode: 1, stdout: "", stderr: "the log stands read only" };
          const file = `${init?.cwd ?? "."}/.se/.log/session.jsonl`;
          wrote.set(file, `${wrote.get(file) ?? ""}${said}\n`);
          return { exitCode: 0, stdout: "", stderr: "" };
        }
        ran.push(argv);
        return { exitCode, stdout, stderr };
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

// Go owns the road, so the hook runs the index binary's serve verb once, and no node and no shell. [[spec/tickets/level0-hooks-hold-no-rule]]
test("the start road runs the serve verb of the index binary under the bridge flag", async () => {
  const hook = await hookHere();
  const box = harness();
  await opensThen(hook, box);

  assert.equal(box.ran.length, 1, "the road runs once");
  assert.match(box.ran[0][0], /\/se-index$/, "and the index binary carries it");
  assert.deepEqual(box.ran[0].slice(-2), ["serve", "--bridge"]);
});

// A desk prints nothing, so the log names the down server alone. [[spec/tickets/level0-hooks-hold-no-rule]]
test("a desk box reads no line off the start road, because a person starts it there", async () => {
  const hook = await hookHere();
  const box = harness();
  await opensThen(hook, box);

  const rows = [...box.wrote.values()].join("\n");
  assert.doesNotMatch(rows, /start road answers no row/, "the road fails nowhere");
  assert.match(rows, /the server answers nothing/, "the log names the down server alone");
});

// The row Go prints lands in the log as it came. [[spec/tickets/level0-hooks-hold-no-rule]]
test("the row the start road prints lands in the log as it came", async () => {
  const hook = await hookHere();
  const row = { level: "info", said: "the go row", event: "session.start", detail: "port 7001" };
  const box = harness({ stdout: `${JSON.stringify(row)}\n` });
  await opensThen(hook, box);

  const said = box.tries.map((one) => JSON.parse(one)).find((one) => one.said === "the go row");
  assert.deepEqual(said, { level: "info", kind: "bridge", said: "the go row", extra: { event: "session.start", detail: "port 7001" } });
});

// A box whose binary stands nowhere writes one fall row, through the file door. [[spec/tickets/level0-hooks-hold-no-rule]]
test("a binary standing nowhere writes the fall row through the file door", async () => {
  const hook = await hookHere();
  const box = harness({ missing: true });
  await opensThen(hook, box);

  const rows = [...box.wrote.values()].join("\n");
  assert.match(rows, /start road answers no row/);
  assert.match(rows, /ENOENT/, "and the row names the spawn's fault");
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
  assert.match(lines, /hooks\.json/, "and names the door file it reads");
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
  box.wrote.set(".se/.runtime/hooks.json", JSON.stringify({ port: 7001, token: "t" }));
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

// [[spec/design_output/level0#a-session-says-its-cage]]
test("a cloud stop where the start road stood down passes, so a caged box loops nowhere", async () => {
  const hook = await hookHere();
  const box = harness({ exitCode: 1, stderr: "go stands nowhere" });
  const runs = runner(hook, box);
  await runs("session.start", { cwd: HERE });

  const said = await runs("classic.Stop", { stop_hook_active: false });

  assert.deepEqual(said, { stop_hook_active: false }, "the stop passes as it came");
});

// [[spec/design_output/level0#rules-ride-the-first-answer]]
test("a desk stop meeting no server passes, because a person starts it there", async () => {
  const hook = await hookHere();
  const box = harness();
  const runs = runner(hook, box);
  await runs("session.start", { cwd: HERE });

  const said = await runs("classic.Stop", {});

  assert.equal(said?.block, undefined);
});
