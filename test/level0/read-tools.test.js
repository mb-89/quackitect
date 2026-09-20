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
    it.registered
      .map((one) => one.name)
      .filter((one) => reads.includes(one))
      .sort(),
    ["find", "patch", "replace", "undo"],
    "every read tool registers with no server standing, beside the pull",
  );
});

// The engine hands the `*` door every event, and its `next` names the event. A call of a read tool runs through that door, and `next` chains into a door filtered on the tool where the hook holds one, the way the engine chains. So the count reads true whichever shape the hook takes. [[spec/design_output/level0#the-first-call-pays]]
function calls(it, called) {
  const chained = Object.assign(
    async (e) => {
      const door = firing(it, "tool.call", called);
      return door ? door.run(it.$, e, async (back) => back) : e;
    },
    { event: "tool.call" },
  );
  return firing(it, "*").run(it.$, { tool: called }, chained);
}

// The server answers a tool call as a result inside a result, and the door hands the inner one to the engine. [[spec/design_output/level0#the-bridgehead-and-the-server]]
const SAID = '{"result":{"result":"a line"}}';
const posts = (it) => it.asked.filter((one) => one.where.endsWith("/event")).length;

// The ask asks a case a tool, so the loop names each one the hook registers. [[spec/design_output/level0#the-first-call-pays]]
for (const spec of READ_TOOLS) {
  const called = `mcp__level0__${spec.name}`;

  test(`a ${spec.name} call meeting a server posts once, and answers what it says`, async () => {
    const it = opened({
      fetch: (where) =>
        where.endsWith("/event") ? { ok: true, status: 200, text: SAID } : null,
    });

    const said = await calls(it, called);

    assert.equal(posts(it), 1, "one post reaches the server");
    assert.equal(it.ran.length, 0, "no start runs where the server answers");
    assert.equal(said.result, "a line", "the answer rides back as the tool's own");
  });

  test(`a ${spec.name} call meeting no server starts one, and posts once more on the far side`, async () => {
    const it = opened({
      fetch: (where, count) => {
        if (where.endsWith("/health"))
          return count > 2 ? { ok: true, status: 200 } : null;
        return count === 1 ? null : { ok: true, status: 200, text: SAID };
      },
    });

    const said = await calls(it, called);

    assert.ok(it.ran.length, "the start runs where the server answers nothing");
    assert.ok(
      it.asked.some((one) => one.where.endsWith("/health")),
      "the wait reads the server's health",
    );
    assert.equal(posts(it), 2, "one post before the start, and one after");
    assert.equal(said.result, "a line", "the second post answers the reader");
  });

  test(`a ${spec.name} wait running out names the port and the log`, async () => {
    const it = opened({ fetch: () => null, waiting: 20 });

    const said = await calls(it, called);

    assert.equal(posts(it), 1, "a dead server takes one post before the start");
    assert.match(String(said.result), /6510/, "the line names the port");
    assert.match(String(said.result), /serve\.log/, "the line names the log");
  });
}
