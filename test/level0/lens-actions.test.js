// The ticket buttons post their actions through the index door, which a fake
// records.
// [[spec/tickets/the-lens-calls-actions]]

import assert from "node:assert/strict";
import { test } from "node:test";
import schema from "../../spec/config/level0.schema.json" with { type: "json" };
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { ticketLensOf } from "../../src/extension/lib/lens.js";
import { routeHostOf } from "../../src/extension/lib/route-host.js";
import { SCHEMA, sidebarOf } from "../../src/extension/sidebar.js";
import { orderedOf } from "./v1-index.js";

const PATH = "spec/tickets/one.md";
const PICKED = "one";

// A press whose door lacks the old seam throws, so the case reads what it posted. [[spec/tickets/the-lens-calls-actions]]
async function pressed(press) {
  try {
    await press();
  } catch {}
}

function doorOf({
  answer = { code: 0, out: "work\n  the next leaf\n" },
  rows = [],
} = {}) {
  const files = fakeDisk({ [SCHEMA]: JSON.stringify(schema) });
  const said = { posted: [], told: [], opened: [], saved: [] };
  const answers = { "work/yours": rows, [`config/${SCHEMA}`]: orderedOf(schema) };
  return {
    said,
    files,
    read: async (path) => (files.exists(path) ? files.read(path) : ""),
    write: async (path, text) => files.write(path, text),
    list: async () => [],
    page: () => null,
    panel: () => null,
    folds: () => {},
    unfolds: () => {},
    asksLine: async () => "the ask stands unmet",
    picks: async () => "pass",
    saves: async (path) => said.saved.push(path),
    says: () => {},
    tells: (title, detail, refused) => said.told.push([title, detail, refused]),
    opens: async (path) => said.opened.push(path),
    lensChanged: () => {},
    index: {
      values: async (name) => answers[name],
      calls: async () => undefined,
      acts: async (name, input) => {
        said.posted.push([name, input]);
        return answer;
      },
    },
  };
}

const post = (args) => ["ticket/pull", { args, person: true }];

test("each ticket button posts ticket/pull with its words, as a person", async () => {
  for (const [act, args] of [
    ["take", [PICKED]],
    ["back", [PICKED]],
    ["pass", [PICKED, "--pass"]],
    ["fail", [PICKED, "--fail", "the ask stands unmet"]],
    ["drop", ["--drop"]],
  ]) {
    const door = doorOf();
    await pressed(() => ticketLensOf(door).took(act, PICKED, PATH));
    assert.deepEqual(door.said.posted, [post(args)], `the ${act} button`);
  }
});

test("a save posts ticket/fill, and a route edit posts ticket/route", async () => {
  const door = doorOf();
  const text = "---\nkind: [[ticket]]\nprocess: [[spec/processes/standard]]\n---\n";
  await pressed(() => ticketLensOf(door).saved(PATH, text));
  assert.deepEqual(door.said.posted, [["ticket/fill", { args: [PATH], person: true }]]);

  const routed = doorOf();
  const host = routeHostOf(routed);
  await pressed(() => host.took?.(PATH, { kind: "edit", steps: [{ name: "do" }] }));
  assert.deepEqual(routed.said.posted, [
    ["ticket/route", { args: [PICKED, '--steps=[{"name":"do"}]'], person: true }],
  ]);
});

test("a refusal reads its word off the detail the index answers", async () => {
  const door = doorOf({
    answer: { code: 1, err: "refused\n  the leaf holds no hand" },
  });
  await pressed(() => ticketLensOf(door).took("pass", PICKED, PATH));
  assert.deepEqual(door.said.told, [
    [`${PICKED}: refused`, "the leaf holds no hand", true],
  ]);
  assert.equal(door.said.posted.length, 1);
});

test("pull for me takes the first row of work/yours", async () => {
  const door = doorOf({ rows: [{ ticket: PICKED, path: PATH }] });
  await pressed(() => sidebarOf(door).took({ kind: "run", key: "work.pull" }));
  assert.deepEqual(door.said.posted, [post([PICKED])]);
  assert.deepEqual(door.said.opened, [PATH]);
});
