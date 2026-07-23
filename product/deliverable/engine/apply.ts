// se.set.apply — the single write lane (§5, §8).
//
// One mechanism: dry_run computes diff = [(file, old_hash, new_content)];
// diff_hash = hash(diff). Executing with that hash re-walks the list and
// checks every CAS precondition simultaneously. The outer gate cannot
// disagree with the inner ones because it is computed from them.
//
// A bless is bound to a starting state, not just to a change: if anything
// moved underneath, the hash no longer matches and the apply is void.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Rejection } from "./errors.ts";
import { sha256 } from "./hash.ts";
import { EDGE_KIND_NAMES } from "./edges.ts";
import { parseNode, serializeNode, type LedgerNode } from "./node.ts";
import { loadLedger } from "./store.ts";
import { replaceSection } from "./sections.ts";
import type { YamliteValue } from "./yamlite.ts";

export type ApplyOp =
  | { op: "create"; id: string; kind: string; statement: string; provenance?: Record<string, string>; breaks_if_removed?: string; extra?: Record<string, YamliteValue>; body?: string }
  | { op: "delete"; id: string }
  | { op: "set_field"; id: string; field: string; value: YamliteValue }
  | { op: "replace_section"; id: string; section: string; content: string }
  | { op: "add_edge"; id: string; kind: string; target: string }
  | { op: "remove_edge"; id: string; kind: string; target: string };

export interface DiffEntry {
  /** Ledger-relative file path, `<module>/<localId>.md`. */
  file: string;
  /** Canonical node hash before, or null when the file is being created. */
  old_hash: string | null;
  /** Full new file content, or null when the file is being deleted. */
  new_content: string | null;
}

export interface DryRunResult {
  diff_hash: string;
  changes: { file: string; old_hash: string | null; new_hash: string | null }[];
  diff: DiffEntry[];
}

export interface ExecuteResult {
  applied: true;
  diff_hash: string;
  files: string[];
}

const SRC = "engine/apply.ts";

function reject(clause: string, expected: string, got: string, remedyArgs: Record<string, unknown>, note: string): never {
  throw new Rejection({
    clause,
    expected,
    got,
    remedy: { tool: "se_set_apply", args: remedyArgs, note },
    source: SRC,
  });
}

function nodePath(id: string): string {
  const dot = id.indexOf(".");
  return `${id.slice(0, dot)}/${id.slice(dot + 1)}.md`;
}

/** Pure: compute the diff an op list produces over the current ledger. */
export function computeDiff(ledgerRoot: string, ops: ApplyOp[]): DiffEntry[] {
  const ledger = loadLedger(ledgerRoot);
  const working = new Map<string, LedgerNode>();
  const beforeHash = new Map<string, string>();
  for (const [id, n] of ledger.nodes) {
    working.set(id, n);
    beforeHash.set(id, n.hash);
  }
  const deleted = new Set<string>();

  const mustGet = (id: string, op: string): LedgerNode => {
    const n = working.get(id);
    if (!n || deleted.has(id)) {
      reject(
        "SE-C-012",
        `an existing node for op ${op}`,
        `unknown node id: ${id}`,
        { ops: [], dry_run: true },
        "check the id with se_get_search, then re-send the corrected op list",
      );
    }
    return n;
  };

  const reparse = (n: LedgerNode): LedgerNode => parseNode(serializeNode(n), nodePath(n.id));

  for (const op of ops) {
    switch (op.op) {
      case "create": {
        if (working.has(op.id) && !deleted.has(op.id)) {
          reject("SE-C-013", `a fresh id for create`, `node already exists: ${op.id}`, { ops: [], dry_run: true },
            "ids are minted deterministically; use set_field/replace_section to edit the existing node");
        }
        const draft: Omit<LedgerNode, "hash"> = {
          id: op.id,
          module: op.id.slice(0, op.id.indexOf(".")),
          localId: op.id.slice(op.id.indexOf(".") + 1),
          kind: op.kind,
          statement: op.statement,
          provenance: op.provenance ?? {},
          edges: {},
          extra: op.extra ?? {},
          body: op.body ?? "",
          ...(op.breaks_if_removed !== undefined ? { breaks_if_removed: op.breaks_if_removed } : {}),
        };
        deleted.delete(op.id);
        working.set(op.id, reparse(draft as LedgerNode));
        break;
      }
      case "delete": {
        mustGet(op.id, "delete");
        deleted.add(op.id);
        break;
      }
      case "set_field": {
        const base = mustGet(op.id, "set_field");
        const n = { ...base, provenance: { ...base.provenance }, edges: { ...base.edges }, extra: { ...base.extra } };
        if (op.field === "edges" || EDGE_KIND_NAMES.has(op.field)) {
          reject("SE-C-011", "edge writes via add_edge/remove_edge only", `set_field on ${op.field}`,
            { ops: [{ op: "add_edge", id: op.id, kind: op.field, target: "<target-id>" }], dry_run: true },
            "trace links are written only through the declared edge ops");
        }
        if (op.field === "id") {
          reject("SE-C-014", "ids are immutable (rename rides se.set.refactor)", `set_field on id`,
            { ops: [], dry_run: true }, "use se.set.refactor kind=rename when it exists; ids never change in place");
        }
        if (op.field === "statement" && typeof op.value === "string") n.statement = op.value;
        else if (op.field === "kind" && typeof op.value === "string") n.kind = op.value;
        else if (op.field === "breaks_if_removed" && typeof op.value === "string") n.breaks_if_removed = op.value;
        else if (op.field === "provenance" && typeof op.value === "object" && !Array.isArray(op.value)) n.provenance = { ...(op.value as Record<string, string>) };
        else n.extra = { ...n.extra, [op.field]: op.value };
        working.set(op.id, reparse(n));
        break;
      }
      case "replace_section": {
        const n = { ...mustGet(op.id, "replace_section") };
        try {
          n.body = replaceSection(n.body, op.section, op.content);
        } catch {
          reject("SE-C-015", `an existing section in ${op.id}`, `section not found: ${op.section}`,
            { ops: [], dry_run: true }, "read the node with se_get_node mode=outline to see its sections");
        }
        working.set(op.id, reparse(n));
        break;
      }
      case "add_edge":
      case "remove_edge": {
        const base = mustGet(op.id, op.op);
        const n = { ...base, edges: { ...base.edges } };
        if (!EDGE_KIND_NAMES.has(op.kind)) {
          reject("SE-C-016", `an edge kind from the vocabulary`, op.kind, { ops: [], dry_run: true },
            "the vocabulary is fixed (p4 rev 2); serves is a projection, not an edge");
        }
        const list = [...(n.edges[op.kind] ?? [])];
        if (op.op === "add_edge") {
          if (!list.includes(op.target)) list.push(op.target);
        } else {
          const i = list.indexOf(op.target);
          if (i === -1) {
            reject("SE-C-017", `an existing ${op.kind} edge to remove`, `${op.id} has no ${op.kind} -> ${op.target}`,
              { ops: [], dry_run: true }, "read the node's edges with se_get_node mode=outline");
          }
          list.splice(i, 1);
        }
        if (list.length === 0) delete n.edges[op.kind];
        else n.edges[op.kind] = list;
        working.set(op.id, reparse(n));
        break;
      }
    }
  }

  const diff: DiffEntry[] = [];
  for (const id of deleted) {
    diff.push({ file: nodePath(id), old_hash: beforeHash.get(id) ?? null, new_content: null });
  }
  for (const [id, n] of working) {
    if (deleted.has(id)) continue;
    const before = beforeHash.get(id) ?? null;
    if (before !== n.hash) {
      diff.push({ file: nodePath(id), old_hash: before, new_content: serializeNode(n) });
    }
  }
  diff.sort((a, b) => a.file.localeCompare(b.file));
  return diff;
}

export function diffHash(diff: DiffEntry[]): string {
  return sha256(
    JSON.stringify(diff.map((d) => [d.file, d.old_hash, d.new_content === null ? null : sha256(d.new_content)])),
  );
}

export function dryRun(ledgerRoot: string, ops: ApplyOp[]): DryRunResult {
  const diff = computeDiff(ledgerRoot, ops);
  return {
    diff_hash: diffHash(diff),
    changes: diff.map((d) => ({
      file: d.file,
      old_hash: d.old_hash,
      new_hash: d.new_content === null ? null : sha256(d.new_content),
    })),
    diff,
  };
}

/**
 * Execute with the hash from a prior dry_run. Recomputes the diff against
 * current state; any mismatch (mid-air collision, stale grant, replay) dies
 * here with a one-turn-recoverable rejection.
 */
export function execute(ledgerRoot: string, ops: ApplyOp[], executeHash: string): ExecuteResult {
  const diff = computeDiff(ledgerRoot, ops);
  const current = diffHash(diff);
  if (current !== executeHash) {
    throw new Rejection({
      clause: "SE-C-010",
      expected: `diff hash ${executeHash} (the state you saw at dry_run)`,
      got: `diff hash ${current} — the ledger moved underneath you`,
      remedy: {
        tool: "se_set_apply",
        args: { ops, dry_run: true },
        note: "re-run dry_run to see the current diff, then execute with the fresh hash",
      },
      source: SRC,
    });
  }
  const files: string[] = [];
  for (const d of diff) {
    const abs = join(ledgerRoot, d.file);
    // CAS per file, checked again at write time.
    if (d.old_hash !== null) {
      const onDisk = parseNode(readFileSync(abs, "utf8"), d.file).hash;
      if (onDisk !== d.old_hash) {
        throw new Rejection({
          clause: "SE-C-010",
          expected: `on-disk hash ${d.old_hash} for ${d.file}`,
          got: onDisk,
          remedy: { tool: "se_set_apply", args: { ops, dry_run: true }, note: "state moved between check and write; re-run dry_run" },
          source: SRC,
        });
      }
    }
    if (d.new_content === null) {
      rmSync(abs);
    } else {
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, d.new_content, "utf8");
    }
    files.push(d.file);
  }
  return { applied: true, diff_hash: current, files };
}
