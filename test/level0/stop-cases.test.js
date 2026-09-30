// The bridge against the shared stop case table, which the Go door answers
// alike. The table holds the bridge's own answers over the live stop rules,
// so a drift in the rules or the bridge reads here first.
// [[spec/tickets/cage-stop-rules-port]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { boxOf, decide } from "../../src/bridge/server.js";
import { disk } from "../../src/doors/disk.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const TREE = new URL("../../", import.meta.url);
const TABLE = JSON.parse(
  disk().read(new URL("../replay/cage/stop-cases.json", import.meta.url)),
);

// The case's dotted keys, nested the way spec/config/level0.json holds them. [[spec/tickets/cage-stop-rules-port]]
function nested(config) {
  const out = {};
  for (const [key, value] of Object.entries(config ?? {})) {
    const [section, leaf] = key.split(".");
    out[section] = { ...(out[section] ?? {}), [leaf]: value };
  }
  return out;
}

// A box over the live rules and schema, the case's config, its files and its git reads. [[spec/tickets/cage-stop-rules-port]]
function box(one) {
  const files = {
    [`${ROOT}/spec/config/level0.json`]: JSON.stringify(nested(one.config)),
  };
  for (const path of TABLE.live)
    files[`${ROOT}/${path}`] = disk().read(new URL(path, TREE));
  for (const [path, text] of Object.entries(one.files ?? {}))
    files[`${ROOT}/${path}`] = text;
  const git = Object.fromEntries(
    Object.entries(one.git ?? {}).map(([args, stdout]) => [`git ${args}`, { stdout }]),
  );
  const made = boxOf(ROOT, ROOT, {
    disk: fakeDisk(files),
    clock: fakeClock(),
    log: fakeLog(),
    proc: fakeProc(git),
    env: {},
    index: { dead: () => "", fault: () => "", warm: () => ({ warmed: false }) },
    vale: { stands: () => false },
    biome: { stands: () => false },
  });
  made.cloud = Boolean(one.cloud);
  return made;
}

// The decision word the Go door's OldDecisionOf reads off an answer. [[spec/tickets/cage-tool-block-reads-refuse]]
function decision(event, said) {
  if (said?.needs) return "hold";
  if (said?.result?.deny !== undefined) return "refuse";
  if (said?.result?.block !== undefined)
    return event === "classic.Stop" ? "block" : "refuse";
  return "pass";
}

for (const one of TABLE.cases) {
  test(`the bridge answers the shared stop case: ${one.name}`, async () => {
    const made = box(one);
    for (const each of one.events) await decide(each, made);
    const said = await decide(one.call, made);
    assert.equal(decision(one.call.event, said), one.decision);
    assert.equal(String(said?.result?.block ?? said?.result?.deny ?? ""), one.text);
  });
}
