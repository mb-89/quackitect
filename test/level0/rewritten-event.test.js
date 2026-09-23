// A door rewriting the event and naming what it changed: the rewritten event
// goes on, and the note rides the answer the call gives.
// [[spec/design_output/schema#the-verbs-own-their-fields]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { register } from "../../.claude/skills/level0/hooks/pull-tool.js";

// [[spec/design_output/level0#the-bridgehead-and-the-server]]
function engine(answer) {
  const held = [];
  const on = (event, filter, made) => {
    held.push({ event, run: made ?? filter });
  };
  const $ = {
    tool: { register: () => {} },
    process: { run: () => ({ exitCode: 0 }) },
    http: {
      fetch: (where) =>
        where.endsWith("/event")
          ? { ok: true, status: 200, text: JSON.stringify(answer) }
          : null,
    },
    fs: { read: async () => "", write: async () => {} },
    ui: { log: () => {} },
  };
  register(on, {});
  return { $, door: held.find((one) => one.event === "*") };
}

// [[spec/design_output/schema#the-verbs-own-their-fields]]
test("an answer carrying an event and a note hands the event on, and the note rides back", async () => {
  const rewritten = { tool: "Write", file_path: "/t/a.md", content: "state: open" };
  const it = engine({ event: rewritten, after: { context: ["state stands"] } });
  const handed = [];
  const next = Object.assign(
    async (e) => {
      handed.push(e);
      return { context: ["the write lands"] };
    },
    { event: "tool.call" },
  );

  const said = await it.door.run(
    it.$,
    { tool: "Write", file_path: "/t/a.md", content: "state: closed" },
    next,
  );

  assert.deepEqual(handed, [rewritten], "the rewritten event goes on");
  assert.deepEqual(said.context, ["the write lands", "state stands"]);
});
