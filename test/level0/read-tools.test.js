// The read tools registering at session start, and the first call bringing the
// server up. The hook reaches the outside through the engine's own doors, so
// this drives it over a fake session.
// [[spec/design_output/level0#the-first-call-pays]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { READ_TOOLS } from "../../.claude/skills/level0/hooks/level0.js";
import { POINTER } from "../../.claude/skills/level0/lib/vehicle.js";
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
    fs: { read: async (path) => answers.read?.(path) ?? "", write: async () => {} },
    ui: { log: () => {} },
  };
  return { on, $, held, registered, ran, asked };
}

const firing = (it, event, filter) =>
  it.held.find(
    (one) => one.event === event && (!filter || one.filter?.tool === filter),
  );

// The hook holds one start a session, so each case takes a session of its own. [[spec/design_output/level0#the-first-call-pays]]
const opened = (answers) => {
  const it = engine(answers);
  register(it.on, {});
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

  test(`a ${spec.name} call meeting no server starts one, and says at once that level zero starts`, async () => {
    const it = opened({ fetch: () => null });

    const said = await calls(it, called);

    assert.ok(it.ran.length, "the start runs where the server answers nothing");
    assert.equal(
      it.asked.some((one) => one.where.endsWith("/health")),
      false,
      "the call reads no health, so it waits on nothing",
    );
    assert.equal(posts(it), 1, "one post, before the start");
    assert.match(
      String(said.result),
      /Level zero is starting/,
      "the line says it starts",
    );
    assert.match(String(said.result), /Call it again/, "and what the reader does");
  });

  test(`a ${spec.name} call where the road launched nothing names the port and the log`, async () => {
    const it = opened({ fetch: () => null, start: { exitCode: 3 } });

    const said = await calls(it, called);

    assert.equal(posts(it), 1, "a dead server takes one post before the start");
    assert.match(String(said.result), /6510/, "the line names the port");
    assert.match(String(said.result), /serve\.log/, "the line names the log");
  });
}

const healths = (it) => it.asked.filter((one) => one.where.endsWith("/health")).length;

// [[spec/design_output/level0#the-first-call-pays]]
test("a second call before the server answers says it starts again, and runs no second road", async () => {
  const it = opened({ fetch: () => null });
  await calls(it, "mcp__level0__find");

  const said = await calls(it, "mcp__level0__find");
  assert.equal(healths(it), 0, "no call reads the health");
  assert.equal(it.ran.length, 1, "the road runs once");
  assert.match(String(said.result), /Level zero is starting/);
});

// [[spec/design_output/level0#the-first-call-pays]]
test("a start road starting no server leaves the call nothing to wait on", async () => {
  const it = opened({ fetch: () => null, start: { exitCode: 3 } });
  const said = await calls(it, "mcp__level0__find");
  assert.equal(healths(it), 0, "a person starts the server here, so nobody waits");
  assert.match(String(said.result), /no server answers/);
});

// [[spec/design_output/level0#the-bridge-says-it-falls]]
test("a post nobody takes reads the pointer again, and lands on the port it names", async () => {
  const it = opened({
    read: (path) => (path === POINTER ? '{"port":7001}' : ""),
    fetch: (where) =>
      where.startsWith("http://127.0.0.1:7001/event")
        ? { ok: true, status: 200, text: SAID }
        : null,
  });
  const said = await calls(it, "mcp__level0__find");
  assert.equal(said.result, "a line", "the moved server answers");
  assert.equal(it.ran.length, 0, "no start runs where the server moved");
});

// A tool the hook registers answers nowhere past it, so a reply paid on the call posts the call again. [[spec/design_output/level0#the-first-call-pays]]
for (const tool of ["patch", "replace"]) {
  test(`a ${tool} call meeting an owed reply runs the tool once the reply pays`, async () => {
    const events = [];
    const it = opened({
      fetch: (where, _count) => {
        if (!where.endsWith("/event")) return null;
        const event = JSON.parse(it.asked.at(-1).init.body).event;
        events.push(event);
        const tools = events.filter((one) => one === "tool.call").length;
        if (event === "agent.spoke")
          return { ok: true, status: 200, text: '{"pass":true}' };
        return tools === 1
          ? { ok: true, status: 200, text: '{"needs":"reply"}' }
          : { ok: true, status: 200, text: SAID };
      },
    });
    it.$.session = { messages: async () => [] };
    const said = await calls(it, `mcp__level0__${tool}`);
    assert.equal(said.result, "a line", "the tool answers, and no call falls through");
    assert.deepEqual(events, ["tool.call", "agent.spoke", "tool.call"]);
  });
}

// The answer door keys a prompt on the newest transcript row, so the spoke post carries each row's role and id. [[spec/tickets/a-reply-follows-its-prompt]]
test("a reply the door asks for posts the transcript rows with their ids", async () => {
  const bodies = [];
  const it = opened({
    fetch: (where) => {
      if (!where.endsWith("/event")) return null;
      const body = JSON.parse(it.asked.at(-1).init.body);
      bodies.push(body);
      if (body.event === "agent.spoke")
        return { ok: true, status: 200, text: '{"pass":true}' };
      return bodies.filter((one) => one.event === "tool.call").length === 1
        ? { ok: true, status: 200, text: '{"needs":"reply"}' }
        : { ok: true, status: 200, text: SAID };
    },
  });
  it.$.session = {
    messages: async () => [
      { role: "user", text: "go on", uuid: "r1" },
      { role: "assistant", text: " The door first. ", uuid: "r2" },
    ],
  };
  await calls(it, "mcp__level0__patch");
  const spoke = bodies.find((one) => one.event === "agent.spoke");
  assert.deepEqual(spoke.e.rows, [
    { role: "user", id: "r1" },
    { role: "assistant", id: "r2", text: "The door first." },
  ]);
});

// [[spec/tickets/a-reply-follows-its-prompt]]
test("a prompt posts the id of the newest transcript row", async () => {
  const bodies = [];
  const it = opened({
    fetch: (where) => {
      if (!where.endsWith("/event")) return null;
      bodies.push(JSON.parse(it.asked.at(-1).init.body));
      return { ok: true, status: 200, text: '{"pass":true}' };
    },
  });
  it.$.session = {
    messages: async () => [{ role: "assistant", text: "old", uuid: "r7" }],
  };
  const next = Object.assign(async (e) => e, { event: "prompt.submit" });
  await firing(it, "*").run(it.$, { text: "go on" }, next);
  const prompt = bodies.find((one) => one.event === "prompt.submit");
  assert.equal(prompt.e.before, "r7");
});
