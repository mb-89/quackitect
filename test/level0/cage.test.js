// The cage road under new: the key it reads, the effects it maps, the ask-back it answers on agent.spoke, and the refusal it names. [[spec/tickets/a-down-index-refuses-calls]]

import assert from "node:assert/strict";
import test from "node:test";
import {
  BRIDGE,
  doored,
  doorOf,
  refusedText,
} from "../../.claude/skills/level0/hooks/cage.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const ROOT = "/tree";
const STANDING = JSON.stringify({ port: 7001, token: "t0k" });

function disk(extra = {}) {
  const files = fakeDisk({
    [`${ROOT}/.se/.runtime/hooks.json`]: STANDING,
    ...extra,
  });
  return { read: async (rel) => files.read(`${ROOT}/${rel}`) };
}

function road(extra = {}) {
  const said = { starts: 0, downs: [] };
  return {
    said,
    road: {
      fill: async () => ({}),
      starts: async () => {
        said.starts += 1;
      },
      down: async (_$, event, _error, where) => {
        said.downs.push({ event, where });
      },
      answered: () => {},
      root: () => ROOT,
      spoken: async () => ({ text: "the reply", texts: ["the reply"], rows: [] }),
      merged: (a, b) => ({ ...(a ?? {}), ...b }),
      served: (tool) => tool.startsWith("mcp__level0__"),
      reads: () => false,
      ...extra,
    },
  };
}

const handed = async (e) => ({ handed: e });

test("a local override moves the cage as the tracked key does", async () => {
  const tracked = JSON.stringify({ migration: { cage: "shadow" } });
  const local = JSON.stringify({ migration: { cage: "new" } });
  const $ = {
    fs: disk({
      [`${ROOT}/spec/config/level0.json`]: tracked,
      [`${ROOT}/.se/.runtime/config.json`]: local,
    }),
  };
  assert.equal(await doored($, "tool.call"), true, "the override reads new");
  assert.equal(await doored($, "prompt.context"), false, "the bridge keeps the prompt");
});

test("a held call asks back on agent.spoke with the effect's call id, and the second answer stands", async () => {
  const posts = [];
  const $ = {
    fs: disk(),
    http: {
      fetch: async (url, init) => {
        const body = JSON.parse(init.body);
        posts.push({ url, body });
        const effects =
          body.event === "agent.spoke"
            ? [{ kind: "result", text: "the hold refuses" }]
            : [{ kind: "rows", call: "s1.2" }];
        return { ok: true, status: 200, text: JSON.stringify({ effects }) };
      },
    },
  };
  const door = doorOf(road().road);

  const said = await door($, "tool.call", { tool: "Bash" }, handed);

  assert.deepEqual(said, { deny: "the hold refuses" });
  assert.equal(
    posts[1].url,
    "http://127.0.0.1:7001/hook",
    "the answer goes to the door",
  );
  assert.equal(posts[1].body.event, "agent.spoke");
  assert.equal(posts[1].body.e.call, "s1.2", "and names the call it answers");
  assert.equal(posts[1].body.e.text, "the reply");
});

test("a block holds the Stop, and a level zero tool the door passes goes on to the bridge", async () => {
  const answer = (effects) => ({
    fs: disk(),
    http: {
      fetch: async () => ({ ok: true, status: 200, text: JSON.stringify({ effects }) }),
    },
  });
  const door = doorOf(road().road);

  const held = await door(
    answer([{ kind: "block", text: "say it first" }]),
    "classic.Stop",
    {},
    handed,
  );
  const served = await door(
    answer([{ kind: "pass" }]),
    "tool.call",
    { tool: "mcp__level0__plan" },
    handed,
  );

  assert.deepEqual(held, { block: "say it first" });
  assert.equal(served, BRIDGE);
});

test("a door with no standing file starts the road once, and a Stop passes while it stands down", async () => {
  const { said, road: reached } = road();
  const $ = { fs: { read: async () => Promise.reject(new Error("no file")) } };
  const door = doorOf(reached);

  const out = await door($, "classic.Stop", {}, handed);

  assert.deepEqual(out, { handed: {} }, "the Stop passes");
  assert.equal(said.starts, 1);
  assert.equal(
    said.downs[0].where,
    ".se/.runtime/hooks.json",
    "the fall names the file",
  );
});

test("the refusal names the alarm and the command that clears it", () => {
  const text = refusedText({ tool: "Bash" });
  assert.match(text, /Bash/);
  assert.match(text, /session\/alarms/);
  assert.match(text, /\.\/RUNME\.sh serve/);
});
