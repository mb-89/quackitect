// The i4 law-and-lane set: toll grace, test-run scope, schema refusals,
// dot-path fields, canvas surgical ops, collision-free evidence ids, FTS
// sanitizing, the JSON tree render. Red-first against the designed API.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { Rejection } from "../engine/errors.ts";
import { layout } from "../engine/layout.ts";
import { dryRun, execute } from "../engine/apply.ts";
import { renderJsonTree } from "../engine/jsontree.ts";
import { evidenceName } from "../engine/loop.ts";

const freshRoot = (): string => {
  const root = mkdtempSync(join(tmpdir(), "se-lanes-"));
  mkdirSync(layout.seDir(root), { recursive: true });
  return root;
};

const plantNode = (root: string): string => {
  const dir = join(root, "product", "spec", "ledger", "se");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "x.md"), "---\nid: se.x\nkind: note\nstatement: A fixture.\n---\n\n## Body\nb\n", "utf8");
  return layout.ledger(root);
};

test("schema refusal: an off-vocabulary kind refuses with the vocabulary named", () => {
  const root = freshRoot();
  try {
    const ledgerRoot = plantNode(root);
    assert.throws(
      () => dryRun(ledgerRoot, [{ op: "create", id: "se.bad", kind: "totally-invented" } as never]),
      (e: unknown) => e instanceof Rejection && /kind/.test(e.expected),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("set_field reaches nested frontmatter through a dot path", () => {
  const root = freshRoot();
  try {
    const ledgerRoot = plantNode(root);
    const ops = [{ op: "set_field", id: "se.x", field: "provenance.adjudicated_by", value: "owner" } as never];
    const d = dryRun(ledgerRoot, ops);
    execute(ledgerRoot, ops, d.diff_hash);
    const text = readFileSync(join(ledgerRoot, "se", "x.md"), "utf8");
    assert.match(text, /provenance:\s*\n\s+adjudicated_by: owner/, "the nested key landed");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("canvas surgical ops: add_canvas_node and add_canvas_edge without a whole-canvas resend", () => {
  const root = freshRoot();
  try {
    const dir = join(root, "product", "spec", "ledger", "se");
    mkdirSync(dir, { recursive: true });
    const note = (state: string, kind: string) =>
      writeFileSync(
        join(dir, `machine-t-${state}.md`),
        `---\nid: se.machine-t-${state}\nkind: machine_state\nstatement: S.\nmachine: se.machine-t\nstate: ${state}\nstate_kind: ${kind}\nfilled_by: agent\n---\n\n## Guidance\ng\n`,
        "utf8",
      );
    note("a", "work");
    note("b", "terminal");
    note("mid", "work");
    writeFileSync(
      join(dir, "machine-t.canvas"),
      JSON.stringify({
        metadata: { version: "1.0-1.0", frontmatter: { id: "se.machine-t", kind: "machine", statement: "T.", entry: "a" } },
        nodes: [
          { id: "n-a", type: "file", file: "spec/ledger/se/machine-t-a.md", x: 0, y: 0, width: 100, height: 50 },
          { id: "n-b", type: "file", file: "spec/ledger/se/machine-t-b.md", x: 0, y: 200, width: 100, height: 50 },
        ],
        edges: [{ id: "e1", fromNode: "n-a", toNode: "n-b", fromSide: "bottom", toSide: "top" }],
      }),
      "utf8",
    );
    const ledgerRoot = layout.ledger(root);
    const ops = [
      { op: "add_canvas_node", id: "se.machine-t", node: { id: "n-mid", type: "file", file: "spec/ledger/se/machine-t-mid.md", x: 0, y: 100, width: 100, height: 50 } },
      { op: "remove_canvas_edge", id: "se.machine-t", edge_id: "e1" },
      { op: "add_canvas_edge", id: "se.machine-t", edge: { id: "e1a", fromNode: "n-a", toNode: "n-mid", fromSide: "bottom", toSide: "top" } },
      { op: "add_canvas_edge", id: "se.machine-t", edge: { id: "e1b", fromNode: "n-mid", toNode: "n-b", fromSide: "bottom", toSide: "top" } },
    ] as never[];
    const d = dryRun(ledgerRoot, ops);
    execute(ledgerRoot, ops, d.diff_hash);
    const canvas = JSON.parse(readFileSync(join(dir, "machine-t.canvas"), "utf8")) as { nodes: unknown[]; edges: { id: string }[] };
    assert.equal(canvas.nodes.length, 3);
    assert.deepEqual(canvas.edges.map((e) => e.id).sort(), ["e1a", "e1b"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("evidence ids are collision-free: state and attempt, never list length", () => {
  assert.equal(evidenceName("fix_findings", 1), "fix_findings-1.json");
  assert.equal(evidenceName("fix_findings", 2), "fix_findings-2.json");
  assert.notEqual(evidenceName("a", 1), evidenceName("b", 1));
});

test("the JSON tree renders structured data as nested collapsible elements", () => {
  const html = renderJsonTree({ tool: "se_boot", args: { project: "q", flags: [1, 2] }, ok: true });
  assert.match(html, /<details/, "collapsible containers exist");
  assert.match(html, /<summary>[^<]*tool/, "keys ride the summaries");
  assert.match(html, /se_boot/, "values render verbatim");
  assert.doesNotMatch(html, /\{"tool"/, "no raw JSON string leaks");
});
