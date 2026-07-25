// Canvas files as ledger nodes: pinned version, envelope in the
// frontmatter, key-order-independent hash, and the write_canvas apply op.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseCanvasNode, CANVAS_VERSION } from "../engine/canvas.ts";
import { NodeParseError } from "../engine/node.ts";
import { loadLedger } from "../engine/store.ts";
import { dryRun, execute } from "../engine/apply.ts";
import { Rejection } from "../engine/errors.ts";

const CANVAS = {
  metadata: {
    version: CANVAS_VERSION,
    frontmatter: { id: "se.machine-demo", kind: "machine", statement: "A demo machine.", entry: "a", reentry: "restart" },
  },
  nodes: [{ id: "n1", type: "file", file: "spec/ledger/se/x.md", x: 0, y: 0, width: 100, height: 50 }],
  edges: [],
};

test("a canvas parses into a node: envelope from frontmatter, canvas payload kept", () => {
  const node = parseCanvasNode(JSON.stringify(CANVAS), "se/machine-demo.canvas");
  assert.equal(node.id, "se.machine-demo");
  assert.equal(node.kind, "machine");
  assert.equal(node.format, "canvas");
  assert.equal(node.extra.entry, "a");
  assert.equal(node.body, "");
});

test("the hash ignores key order (Obsidian may rewrite the file)", () => {
  const a = parseCanvasNode(JSON.stringify(CANVAS), "f.canvas");
  const reordered = { nodes: CANVAS.nodes, edges: CANVAS.edges, metadata: CANVAS.metadata };
  const b = parseCanvasNode(JSON.stringify(reordered), "f.canvas");
  assert.equal(a.hash, b.hash);
});

test("an unknown canvas version refuses loudly — never a guess", () => {
  const wrong = { ...CANVAS, metadata: { ...CANVAS.metadata, version: "2.0-1.0" } };
  assert.throws(
    () => parseCanvasNode(JSON.stringify(wrong), "f.canvas"),
    (e: unknown) => e instanceof NodeParseError && /pinned to/.test(e.message),
  );
});

test("the store loads canvas nodes and checks id against path", () => {
  const root = mkdtempSync(join(tmpdir(), "se-canvas-store-"));
  try {
    mkdirSync(join(root, "se"), { recursive: true });
    writeFileSync(join(root, "se", "machine-demo.canvas"), JSON.stringify(CANVAS), "utf8");
    const ledger = loadLedger(root);
    assert.ok(ledger.nodes.has("se.machine-demo"));

    writeFileSync(join(root, "se", "wrong-name.canvas"), JSON.stringify(CANVAS), "utf8");
    assert.throws(() => loadLedger(root), /does not match path/);
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("write_canvas rides the dry_run -> execute lane; partial ops refuse on canvas nodes", () => {
  const root = mkdtempSync(join(tmpdir(), "se-canvas-apply-"));
  try {
    mkdirSync(join(root, "se"), { recursive: true });
    const ops = [{ op: "write_canvas" as const, id: "se.machine-demo", canvas: CANVAS }];
    const dry = dryRun(root, ops);
    assert.equal(dry.changes.length, 1);
    assert.equal(dry.changes[0].file, "se/machine-demo.canvas");
    execute(root, ops, dry.diff_hash);
    assert.ok(existsSync(join(root, "se", "machine-demo.canvas")));
    assert.ok(loadLedger(root).nodes.has("se.machine-demo"));

    // In-place field edits are illegal on drawings: the canvas is the unit.
    assert.throws(
      () => dryRun(root, [{ op: "set_field" as const, id: "se.machine-demo", field: "statement", value: "x" }]),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-067",
    );
    // A payload that is not a pinned, well-formed canvas refuses.
    assert.throws(
      () => dryRun(root, [{ op: "write_canvas" as const, id: "se.machine-demo", canvas: { metadata: { version: "9" } } }]),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-066",
    );
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});
