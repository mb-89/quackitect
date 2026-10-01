// A level zero call where the cage stands off: it posts to the server, and a
// dead server says so. The hook reaches the outside through the engine's own
// doors, so this drives it over a fake session.
// [[spec/design_output/level0#the-first-call-pays]] [[spec/tickets/level0-tools-leave-the-bridge]]

import assert from "node:assert/strict";
import { test } from "node:test";
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
      // The bridgehead appends its row through node, and a case counts the start runs apart from it. [[spec/tickets/a-down-index-refuses-calls]]
      run: (argv) =>
        String(argv?.[2]).includes("appendFileSync")
          ? { exitCode: 0 }
          : void ran.push(argv) || (answers.start ?? { exitCode: 0 }),
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

// The ask asks a case a tool, so the loop names each one the bridge's read path served. [[spec/tickets/level0-tools-leave-the-bridge]]
for (const name of ["find", "patch", "replace", "undo"]) {
  const called = `mcp__level0__${name}`;

  test(`a ${name} call meeting a server posts once, and answers what it says`, async () => {
    const it = opened({
      fetch: (where) =>
        where.endsWith("/event") ? { ok: true, status: 200, text: SAID } : null,
    });

    const said = await calls(it, called);

    assert.equal(posts(it), 1, "one post reaches the server");
    assert.equal(it.ran.length, 0, "no start runs where the server answers");
    assert.equal(said.result, "a line", "the answer rides back as the tool's own");
  });

  test(`a ${name} call where the road launched nothing names the port and the log`, async () => {
    const it = opened({ fetch: () => null, start: { exitCode: 3 } });

    const said = await calls(it, called);

    assert.equal(posts(it), 1, "a dead server takes one post before the start");
    assert.match(String(said.result), /6510/, "the line names the port");
    assert.match(String(said.result), /serve\.log/, "the line names the log");
  });
}

const healths = (it) => it.asked.filter((one) => one.where.endsWith("/health")).length;

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
