// The bridgehead: one door for every event, one request an event, and the
// answer decides. A dead server blocks nothing, and one warn line says so.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { register } from "../../.claude/skills/level0/hooks/level0.js";
import { rowsOf, SESSION } from "../../.claude/skills/level0/lib/log.js";

function harness(answer) {
  const files = new Map();
  const posted = [];
  let hook = null;
  const on = (event, given) => {
    assert.equal(event, "*");
    hook = given;
  };
  const $ = {
    fs: {
      read: async (path) => {
        if (!files.has(path)) throw new Error(`no ${path}`);
        return files.get(path);
      },
      write: async (path, text) => {
        files.set(path, text);
      },
    },
    http: {
      fetch: async (url, init) => {
        posted.push({ url, body: JSON.parse(init.body) });
        return answer(url, init);
      },
    },
  };
  register(on, {});
  const raise = (event, e, next = async (later) => ({ passed: later })) => {
    next.event = event;
    return hook($, e, next);
  };
  return { raise, posted, lines: () => rowsOf(files.get(SESSION) ?? "") };
}

const up = (reply) => async () => ({
  ok: true,
  status: 200,
  headers: {},
  text: JSON.stringify(reply),
});

test("a pass answer hands the event on, and the request names the event and carries it whole", async () => {
  const it = harness(up({ pass: true }));
  const said = await it.raise("tool.call", { tool: "Read", file_path: "a.md" });

  assert.deepEqual(said, { passed: { tool: "Read", file_path: "a.md" } });
  assert.equal(it.posted.length, 1);
  assert.match(it.posted[0].url, /^http:\/\/127\.0\.0\.1:6510\/event$/);
  assert.deepEqual(it.posted[0].body, {
    event: "tool.call",
    e: { tool: "Read", file_path: "a.md" },
  });
});

test("a result answer returns to the client, and a changed event hands that one on", async () => {
  const denied = harness(up({ result: { deny: "no" } }));
  assert.deepEqual(await denied.raise("tool.call", { tool: "Bash" }), { deny: "no" });

  const changed = harness(up({ event: { tool: "Bash", command: "ls -a" } }));
  assert.deepEqual(await changed.raise("tool.call", { tool: "Bash", command: "ls" }), {
    passed: { tool: "Bash", command: "ls -a" },
  });
});

test("a dead server blocks nothing: the event goes on, and one warn line lands once", async () => {
  const it = harness(async () => {
    throw new Error("connection refused");
  });
  const first = await it.raise("tool.call", { tool: "Read" });
  const second = await it.raise("turn.complete", { reason: "answer" });

  assert.deepEqual(first, { passed: { tool: "Read" } });
  assert.deepEqual(second, { passed: { reason: "answer" } });
  const warned = it.lines().filter((one) => one.kind === "bridge");
  assert.equal(warned.length, 1);
  assert.equal(warned[0].level, "warn");
  assert.match(warned[0].said, /answers nothing/);
});

test("a server answering an error counts as down, and writes the line too", async () => {
  const it = harness(async () => ({ ok: false, status: 500, headers: {}, text: "" }));
  assert.deepEqual(await it.raise("prompt.submit", { text: "hi" }), {
    passed: { text: "hi" },
  });
  assert.equal(it.lines().filter((one) => one.kind === "bridge").length, 1);
});
