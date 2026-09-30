// The bridge against the shared command case table, which the Go door answers
// alike. The table holds the bridge's own answers, so a drift reads here first.
// [[spec/tickets/cage-command-rules-port]]

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { onBash, onPowerShell } from "../../src/bridge/bash.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const ROOT = "/tree";
const TABLE = JSON.parse(
  readFileSync(new URL("../replay/cage/command-cases.json", import.meta.url), "utf8"),
);

// Every command the table names runs no process, so the box answers every run empty. [[spec/tickets/cage-command-rules-port]]
function box(one) {
  const files = Object.fromEntries(
    Object.entries(TABLE.tree).map(([path, text]) => [`${ROOT}/${path}`, text]),
  );
  if (one.todo)
    files[`${ROOT}/.se/.runtime/plan.json`] = JSON.stringify({ working: one.todo });
  const empty = () => ({ exitCode: 0, stdout: "", stderr: "" });
  return {
    env: {},
    disk: fakeDisk(files),
    proc: { run: empty, start: empty },
    work: ROOT,
    method: ROOT,
    log: { say: () => {} },
    vale: { stands: () => false },
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
  test(`the bridge answers the shared case: ${one.name}`, async () => {
    const e = { tool: one.tool, command: one.command };
    if (one.description) e.description = one.description;
    const door = one.tool === "PowerShell" ? onPowerShell : onBash;
    const said = await door(e, box(one));
    assert.equal(decision(said), one.decision);
    assert.equal(String(said?.result?.deny ?? ""), one.text ?? "");
  });
}
