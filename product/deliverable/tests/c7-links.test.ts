// c7: the rename ripple (edges, markdown links incl. #section, canvas
// refs) and the plan insert/renumber ops.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, existsSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { layout } from "../engine/layout.ts";
import { dryRun, execute, type ApplyOp } from "../engine/apply.ts";
import { Rejection } from "../engine/errors.ts";

const freshRoot = (): string => {
  const root = mkdtempSync(join(tmpdir(), "se-c7-"));
  mkdirSync(layout.seDir(root), { recursive: true });
  mkdirSync(join(root, "product", "spec", "ledger", "se"), { recursive: true });
  mkdirSync(join(root, "product", "spec", "iterations"), { recursive: true });
  return root;
};

const apply = (ledgerRoot: string, ops: ApplyOp[]): void => {
  const d = dryRun(ledgerRoot, ops);
  execute(ledgerRoot, ops, d.diff_hash);
};

test("rename moves the node and rewrites edges, section links and canvas refs in one apply", () => {
  const root = freshRoot();
  try {
    const dir = join(root, "product", "spec", "ledger", "se");
    writeFileSync(join(dir, "alpha.md"), "---\nid: se.alpha\nkind: note\nstatement: A.\n---\n\n## Body\na\n", "utf8");
    writeFileSync(
      join(dir, "beta.md"),
      "---\nid: se.beta\nkind: note\nstatement: About se.alpha.\nedges:\n  refines: [se.alpha]\nsource_refs:\n  - se.alpha\n---\n\n## Body\nSee [alpha](alpha.md#body) and [q](se/alpha.md).\n",
      "utf8",
    );
    writeFileSync(
      join(dir, "board.canvas"),
      JSON.stringify({
        metadata: { version: "1.0-1.0", frontmatter: { id: "se.board", kind: "machine", statement: "B.", entry: "a" } },
        nodes: [{ id: "n1", type: "file", file: "spec/ledger/se/alpha.md", x: 0, y: 0, width: 100, height: 50 }],
        edges: [],
      }),
      "utf8",
    );
    const ledgerRoot = layout.ledger(root);
    apply(ledgerRoot, [{ op: "rename", id: "se.alpha", new_id: "se.alpha-two" }]);
    assert.ok(!existsSync(join(dir, "alpha.md")), "the old file is gone");
    const movedText = readFileSync(join(dir, "alpha-two.md"), "utf8");
    assert.match(movedText, /id: se\.alpha-two/);
    const beta = readFileSync(join(dir, "beta.md"), "utf8");
    assert.match(beta, /refines: \[se\.alpha-two\]/, "the edge target rippled");
    assert.match(beta, /source_refs:\n  - se\.alpha-two/, "extra id refs (source_refs) rippled");
    assert.match(beta, /\(alpha-two\.md#body\)/, "the section link rippled with its anchor");
    assert.match(beta, /\(se\/alpha-two\.md\)/, "the qualified link rippled");
    assert.match(beta, /About se\.alpha-two\./, "id mentions in statements ripple");
    assert.match(readFileSync(join(dir, "board.canvas"), "utf8"), /spec\/ledger\/se\/alpha-two\.md/, "canvas refs ripple");
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("plan ops insert after an anchor and renumber planned iterations; started ids are frozen", () => {
  const root = freshRoot();
  try {
    const iterations = join(root, "product", "spec", "iterations");
    writeFileSync(
      join(iterations, "plan.json"),
      JSON.stringify({ iterations: [{ id: "i7-kb", goal: "kb" }, { id: "i8-phone", goal: "phone", depends_on: ["i7-kb"] }] }, null, 2) + "\n",
      "utf8",
    );
    mkdirSync(join(iterations, "i3-started"), { recursive: true });
    const ledgerRoot = layout.ledger(root);
    apply(ledgerRoot, [
      { op: "plan_insert", entry: { id: "i7b-extra", goal: "wedge" }, after: "i7-kb" },
      { op: "plan_renumber", id: "i7-kb", new_id: "i7-knowledge" },
    ]);
    const plan = JSON.parse(readFileSync(join(iterations, "plan.json"), "utf8")) as {
      iterations: { id: string; depends_on?: string[] }[];
    };
    assert.deepEqual(plan.iterations.map((i) => i.id), ["i7-knowledge", "i7b-extra", "i8-phone"]);
    assert.deepEqual(plan.iterations[2].depends_on, ["i7-knowledge"], "depends_on renumbers along");
    assert.throws(
      () => dryRun(ledgerRoot, [{ op: "plan_renumber", id: "i3-started", new_id: "i3-again" }]),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-071",
      "started iterations are frozen",
    );
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});
