// B1 pass condition: the index rebuilds from files alone; hashes are stable
// across rebuilds.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadLedger } from "../engine/store.ts";
import { WarmIndex } from "../engine/warmindex.ts";
import { parseNode, serializeNode } from "../engine/node.ts";

const REQ = `---
id: se.req-toll-arming
kind: requirement
statement: The toll arms only after the first submit of a session.
provenance:
  created_by: bootstrap-test
breaks_if_removed: the first call of a session pays a toll for a session with no history
edges:
  refines: [se.uc-3]
---

## Detail

When a session has no prior submit, the server MUST NOT refuse calls for
missing updates. EARS: WHILE a session has no submitted evidence, the se
server shall accept tool calls without an update payment.
`;

const UC = `---
id: se.uc-3
kind: use_case
statement: Work an iteration interactively at the desk.
---

One agent, one iteration. next tells it what to do; it does; it submits
evidence; the step closes.
`;

function fixtureLedger(): string {
  const root = mkdtempSync(join(tmpdir(), "se-ledger-"));
  mkdirSync(join(root, "se"), { recursive: true });
  writeFileSync(join(root, "se", "req-toll-arming.md"), REQ);
  writeFileSync(join(root, "se", "uc-3.md"), UC);
  return root;
}

test("ledger loads, ids match paths, edges resolve", () => {
  const root = fixtureLedger();
  try {
    const ledger = loadLedger(root);
    assert.equal(ledger.nodes.size, 2);
    assert.deepEqual(ledger.findings, []);
    const req = ledger.nodes.get("se.req-toll-arming")!;
    assert.equal(req.kind, "requirement");
    assert.equal(req.module, "se");
    assert.deepEqual(req.edges.refines, ["se.uc-3"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("hashes are stable across independent loads", () => {
  const root = fixtureLedger();
  try {
    const a = loadLedger(root);
    const b = loadLedger(root);
    for (const [id, node] of a.nodes) {
      assert.equal(node.hash, b.nodes.get(id)!.hash, `hash moved for ${id}`);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("hash is over canonical form — CRLF and key order do not move it", () => {
  const crlf = REQ.replace(/\n/g, "\r\n");
  const a = parseNode(REQ, "a.md");
  const b = parseNode(crlf, "b.md");
  assert.equal(a.hash, b.hash);
});

test("serialize -> parse round-trips to the same hash", () => {
  const a = parseNode(REQ, "a.md");
  const b = parseNode(serializeNode(a), "b.md");
  assert.equal(a.hash, b.hash);
  assert.deepEqual(b.edges, a.edges);
});

test("index rebuilds from files alone, and a fresh rebuild is identical", () => {
  const root = fixtureLedger();
  try {
    const idx1 = new WarmIndex();
    idx1.rebuild(loadLedger(root));
    const hashes1 = idx1.allHashes();
    idx1.close();

    // "Delete the db" — a brand-new index from the same files.
    const idx2 = new WarmIndex();
    idx2.rebuild(loadLedger(root));
    assert.equal(idx2.count(), 2);
    assert.deepEqual(idx2.allHashes(), hashes1);

    const hits = idx2.search("toll");
    assert.equal(hits[0].id, "se.req-toll-arming");
    assert.ok(hits[0].snippet.length > 0);

    assert.deepEqual(idx2.edgesFrom("se.req-toll-arming"), [{ kind: "refines", dst: "se.uc-3" }]);
    assert.deepEqual(idx2.edgesTo("se.uc-3"), [{ kind: "refines", src: "se.req-toll-arming" }]);
    idx2.close();
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("unknown edge kinds are refused at parse", () => {
  const bad = UC.replace("---\n\nOne agent", "edges:\n  serves: [se.uc-3]\n---\n\nOne agent");
  assert.throws(() => parseNode(bad, "bad.md"), /unknown edge kind: serves/);
});

test("missing breaks_if_removed on a requirement is a lint finding", () => {
  const root = fixtureLedger();
  try {
    writeFileSync(
      join(root, "se", "req-bare.md"),
      "---\nid: se.req-bare\nkind: requirement\nstatement: A bare requirement.\n---\n\nBody.\n",
    );
    const ledger = loadLedger(root);
    assert.ok(ledger.findings.some((f) => f.node === "se.req-bare" && f.rule === "breaks-if-removed-missing"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
