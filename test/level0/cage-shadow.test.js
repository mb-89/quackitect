// The cage's shadow: while the slice reads shadow, the bridge posts each
// event and its decision to the port the hooks IO module stands at.
// [[spec/tickets/the-hooks-door-lands]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { shadowsCage } from "../../src/bridge/cage-shadow.js";
import { answersEvent, boxOf as serverBox } from "../../src/bridge/server.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeHttp } from "../../src/doors/fake/http.js";
import { fakeLog } from "../../src/doors/fake/log.js";

const ROOT = "/tree";
const STANDING = join(ROOT, ".se", ".runtime", "hooks.json");
const TRACKED = join(ROOT, "spec", "config", "level0.json");

function boxOf(mode) {
  const disk = fakeDisk({
    [TRACKED]: JSON.stringify({ migration: { cage: mode } }),
    [STANDING]: JSON.stringify({ port: 7001, token: "t0k" }),
  });
  const http = fakeHttp({
    "POST http://127.0.0.1:7001/hook": () => ({ status: 200, text: '{"effects":[]}' }),
  });
  return { method: ROOT, work: ROOT, disk, http, env: {} };
}

test("in shadow the bridge posts the event and its decision to the hooks port", async () => {
  const box = boxOf("shadow");
  const said = { event: "tool.call", e: { tool: "Read" }, root: ROOT };
  await shadowsCage(box, said, { pass: true });
  assert.equal(box.http.sent.length, 1);
  assert.deepEqual(JSON.parse(box.http.sent[0].body), { ...said, old: { pass: true } });
  assert.equal(box.http.sent[0].headers.authorization, "Bearer t0k");
});

test("under old the bridge posts nothing", async () => {
  const box = boxOf("old");
  await shadowsCage(box, { event: "tool.call", e: {} }, { pass: true });
  assert.equal(box.http.sent.length, 0);
});

// The hook module posts itself under new, so the bridge's copy would reach the door twice. [[spec/tickets/a-down-index-refuses-calls]]
test("under new the bridge posts no shadow", async () => {
  const box = boxOf("new");
  await shadowsCage(box, { event: "tool.call", e: {} }, { pass: true });
  assert.equal(box.http.sent.length, 0);
});

test("a hooks port that refuses leaves the bridge's answer standing", async () => {
  const box = boxOf("shadow");
  box.http = {
    sent: [],
    send: async () => {
      throw new Error("connection refused");
    },
  };
  await assert.doesNotReject(async () =>
    shadowsCage(box, { event: "tool.call", e: {} }, { pass: true }),
  );
});

test("the bridge's answer to an event goes out, and its shadow copy reaches the hooks port beside it", async () => {
  const held = boxOf("shadow");
  const box = serverBox(ROOT, ROOT, {
    disk: held.disk,
    http: held.http,
    log: fakeLog(),
    env: {},
  });
  const said = await answersEvent(
    JSON.stringify({ event: "an.event.no.door.reads", e: {}, root: ROOT }),
    false,
    () => box,
    box,
  );
  assert.equal(said.pass, true);
  await new Promise((settle) => setImmediate(settle));
  assert.equal(held.http.sent.length, 1);
  assert.deepEqual(JSON.parse(held.http.sent[0].body).old, said);
});
