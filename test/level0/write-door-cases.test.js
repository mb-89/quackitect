// The bridge against the shared write door case table, which the Go door
// answers alike. The table holds the bridge's own answers, so a drift reads here first.
// [[spec/tickets/cage-write-door-port]]

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { onToolWrite, schemasHere } from "../../src/bridge/write.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { projectionsHere } from "../../src/engine/projection.js";

const TABLE = JSON.parse(
  readFileSync(
    new URL("../replay/cage/write-door-cases.json", import.meta.url),
    "utf8",
  ),
);
const REPO = new URL("../../", import.meta.url);

// A box over the live schemas and projections, the table's tree and the case's files, with Vale answering the case's findings. [[spec/tickets/cage-write-door-port]]
function box(one) {
  const live = Object.fromEntries(
    TABLE.live.map((path) => [path, readFileSync(new URL(path, REPO), "utf8")]),
  );
  const files = Object.fromEntries(
    Object.entries({ ...live, ...TABLE.tree, ...(one.files ?? {}) }).map(
      ([path, text]) => [`${TABLE.root}/${path}`, text],
    ),
  );
  const disk = fakeDisk(files);
  const found = one.voice ?? null;
  return {
    root: TABLE.root,
    work: TABLE.root,
    method: TABLE.root,
    disk,
    proc: fakeProc({}),
    log: { say: () => {} },
    schemas: schemasHere(disk, TABLE.root),
    projections: projectionsHere(disk, TABLE.root),
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
  test(`the bridge answers the shared write case: ${one.name}`, async () => {
    const said = await onToolWrite(one.e, box(one));
    assert.equal(decision(said), one.decision);
    assert.equal(String(said?.result?.deny ?? ""), one.text);
  });
}
