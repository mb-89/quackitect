// The read tools registering at session start, and the first call bringing the
// server up. The hook reaches the outside through the engine's own doors, so
// this drives it over a fake session.
// [[spec/design_output/level0#the-first-call-pays]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { READ_TOOLS } from "../../.claude/skills/level0/hooks/level0.js";
// The plugin loads the pull module, which holds the one session start and calls the bridgehead's register. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
import { register } from "../../.claude/skills/level0/hooks/pull-tool.js";

// The engine hands a hook one `on`, and the hook names the events it takes. [[spec/design_output/level0#the-bridgehead-and-the-server]]
function engine(answers = {}) {
  const held = [];
  const registered = [];
  const ran = [];
  const asked = [];
  const on = (event, filter, made) => {
    held.push({ event, filter: made ? filter : undefined, run: made ?? filter });
  };
  const $ = {
    tool: { register: (spec) => void registered.push(spec) },
    process: {
      run: (argv) => void ran.push(argv) || (answers.start ?? { exitCode: 0 }),
    },
    http: {
      fetch: (where, init) => {
        asked.push({ where, init });
        const said = answers.fetch?.(where, asked.length);
        if (said) return said;
        throw new Error("the server answers nothing");
      },
    },
    fs: { read: async () => "", write: async () => {} },
    ui: { log: () => {} },
  };
  return { on, $, held, registered, ran, asked, waiting: answers.waiting };
}

const firing = (it, event, filter) =>
  it.held.find(
    (one) => one.event === event && (!filter || one.filter?.tool === filter),
  );

// The hook holds one start a session, so each case takes a session of its own. [[spec/design_output/level0#the-first-call-pays]]
const opened = (answers) => {
  const it = engine(answers);
  register(it.on, { waiting: it.waiting });
  return it;
};

// [[spec/design_output/level0#the-bridgehead-and-the-server]]
test("the hook names every read tool, so a reader knows what registers", () => {
  assert.ok(Array.isArray(READ_TOOLS), "the hook names the tools it registers");
  assert.deepEqual(
    READ_TOOLS.map((one) => one.name).sort(),
    ["find", "patch", "replace", "undo"],
    "the four read tools stand",
  );
});

// [[spec/design_output/level0#the-first-call-pays]]
test("the session start registers every read tool, whatever the server answers", async () => {
  const it = opened();

  const start = firing(it, "session.start");
  assert.ok(start, "the hook takes the session start");
  await start.run(it.$, {}, (e) => e);

  const reads = READ_TOOLS.map((one) => one.name);
  assert.deepEqual(
    it.registered.map((one) => one.name).filter((one) => reads.includes(one)).sort(),
    ["find", "patch", "replace", "undo"],
    "every read tool registers with no server standing, beside the pull",
  );
});

// The ask asks a case a tool, so the loop names each one the hook registers. [[spec/design_output/level0#the-first-call-pays]]
for (const spec of READ_TOOLS) {
  const called = `mcp__level0__${spec.name}`;

  test(`a ${spec.name} call meeting no server starts one, and calls again`, async () => {
    const it = opened({
      fetch: (where, count) => {
        if (where.endsWith("/health"))
          return count > 2 ? { ok: true, status: 200 } : null;
        return count === 1
          ? null
          : { ok: true, status: 200, text: '{"result":"a line"}' };
      },
    });

    const call = firing(it, "tool.call", called);
    assert.ok(call, `the hook takes a call of ${spec.name}`);
    const said = await call.run(it.$, {}, (e) => e);

    assert.ok(it.ran.length, "the start runs where the server answers nothing");
    assert.ok(
      it.asked.some((one) => one.where.endsWith("/health")),
      "the wait reads the server's health",
    );
    assert.equal(said.result, "a line", "the second call answers the reader");
  });

  test(`a ${spec.name} wait running out names the port and the log`, async () => {
    const it = opened({ fetch: () => null, waiting: 20 });

    const said = await firing(it, "tool.call", called).run(it.$, {}, (e) => e);

    assert.match(String(said.result), /6510/, "the line names the port");
    assert.match(String(said.result), /serve\.log/, "the line names the log");
  });
}
