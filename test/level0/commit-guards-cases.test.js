// The bridge against the shared commit guard case table, which the Go door
// answers alike. The table holds the bridge's own answers, so a drift reads here first.
// [[spec/tickets/cage-commit-guards-port]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { onBash } from "../../src/bridge/bash.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import MASKED from "../replay/cage/commit-guards-cases.json" with { type: "json" };

const ROOT = "/tree";

// The table masks each private shape, so its own commit meets the private delta clean. [[spec/tickets/cage-commit-guards-port]]
function unmasked(text) {
  const { masks } = JSON.parse(text);
  let out = text;
  for (const [mask, raw] of Object.entries(masks)) {
    if (mask !== raw) out = out.split(mask).join(raw);
  }
  return JSON.parse(out);
}

const TABLE = unmasked(JSON.stringify(MASKED));

// A box answering each git read the case teaches, and every other run as a failure git reads as empty. [[spec/tickets/cage-commit-guards-port]]
function box(one) {
  const files = Object.fromEntries(
    Object.entries({ ...TABLE.tree, ...(one.files ?? {}) }).map(([path, text]) => [
      `${ROOT}/${path}`,
      text,
    ]),
  );
  const git = Object.fromEntries(
    Object.entries(one.git ?? {}).map(([args, stdout]) => [`git ${args}`, { stdout }]),
  );
  const found = one.voice ?? null;
  return {
    env: one.env ?? {},
    cloud: one.cloud,
    disk: fakeDisk(files),
    proc: fakeProc(git),
    work: ROOT,
    method: ROOT,
    log: { say: () => {} },
    vale: found
      ? { stands: () => true, lint: async () => ({ ran: true, found }) }
      : { stands: () => false },
  };
}

// The decision word the Go door's OldDecisionOf reads off an answer. [[spec/tickets/cage-command-rules-port]]
function decision(said) {
  if (said?.needs) return "hold";
  if (said?.result?.deny !== undefined || said?.result?.block !== undefined)
    return "refuse";
  return "pass";
}

for (const one of TABLE.cases) {
  test(`the bridge answers the shared commit case: ${one.name}`, async () => {
    const e = { tool: "Bash", command: one.command, description: one.description };
    const said = await onBash(e, box(one));
    assert.equal(decision(said), one.decision);
    assert.equal(String(said?.result?.deny ?? ""), one.text);
  });
}
