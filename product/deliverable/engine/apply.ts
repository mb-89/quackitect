// se.set.apply — the single write lane (§5, §8).
//
// One mechanism: dry_run computes diff = [(file, old_hash, new_content)];
// diff_hash = hash(diff). Executing with that hash re-walks the list and
// checks every CAS precondition simultaneously. The outer gate cannot
// disagree with the inner ones because it is computed from them.
//
// A bless is bound to a starting state, not just to a change: if anything
// moved underneath, the hash no longer matches and the apply is void.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Rejection } from "./errors.ts";
import { sha256 } from "./hash.ts";
import { EDGE_KIND_NAMES } from "./edges.ts";
import { parseNode, serializeNode, type LedgerNode } from "./node.ts";
import { parseCanvasNode, serializeCanvasNode } from "./canvas.ts";
import { loadLedger } from "./store.ts";
import { replaceSection } from "./sections.ts";
import type { YamliteValue } from "./yamlite.ts";

export type ApplyOp =
  | { op: "create"; id: string; kind: string; statement: string; provenance?: Record<string, string>; breaks_if_removed?: string; extra?: Record<string, YamliteValue>; body?: string }
  | { op: "write_canvas"; id: string; canvas: unknown }
  | { op: "delete"; id: string }
  | { op: "set_field"; id: string; field: string; value: YamliteValue }
  | { op: "replace_section"; id: string; section: string; content: string }
  | { op: "add_edge"; id: string; kind: string; target: string }
  | { op: "remove_edge"; id: string; kind: string; target: string }
  | { op: "add_canvas_node"; id: string; node: unknown }
  | { op: "remove_canvas_node"; id: string; node_id: string }
  | { op: "add_canvas_edge"; id: string; edge: unknown }
  | { op: "remove_canvas_edge"; id: string; edge_id: string }
  | { op: "rename"; id: string; new_id: string }
  | { op: "plan_insert"; entry: PlanEntry; after?: string }
  | { op: "plan_renumber"; id: string; new_id: string };

export interface PlanEntry {
  id: string;
  machine?: string;
  goal?: string;
  depends_on?: string[];
  /** Declared at kickoff; gate_validation's market tier applies only when set. */
  market?: boolean;
  steps?: { text: string; owner?: boolean }[];
}

interface PlanFile {
  iterations: PlanEntry[];
}

/** plan.json sits beside the ledger; its diff entry is raw bytes, not a node. */
const PLAN_REL = "../iterations/plan.json";

/** The node-kind vocabulary; creates and kind-writes outside it refuse.
 *  Pre-vocabulary content is grandfathered - the sweep never rewrites it. */
export const KIND_VOCAB: ReadonlySet<string> = new Set([
  "note", "question", "adr", "decision", "anti_decision", "requirement", "use_case",
  "need", "story", "test", "design", "spike", "machine", "machine_state", "method",
  "vision", "context", "stakeholders", "gloss", "glossary", "guidance", "raid",
  "reference", "rule", "fundamental",
]);

function assertKind(kind: string): void {
  if (KIND_VOCAB.has(kind)) return;
  reject(
    "SE-C-068",
    `a kind from the vocabulary: ${[...KIND_VOCAB].join(", ")}`,
    kind,
    { ops: [], dry_run: true },
    "pick the matching kind; a genuinely new kind enters the vocabulary by decision, never by typo",
  );
}

export interface DiffEntry {
  /** Ledger-relative file path, `<module>/<localId>.md` or `.canvas`. */
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

function nodeFile(n: LedgerNode): string {
  return `${n.module}/${n.localId}.${n.format === "canvas" ? "canvas" : "md"}`;
}

function serialize(n: LedgerNode): string {
  return n.format === "canvas" ? serializeCanvasNode(n) : serializeNode(n);
}

/** Drawings hold no fields or sections to edit in place; the canvas is the unit. */
function refuseOnCanvas(n: LedgerNode, op: string): void {
  if (n.format === "canvas") {
    reject("SE-C-067", `a markdown node for op ${op}`, `${n.id} is a canvas node`,
      { ops: [{ op: "write_canvas", id: n.id, canvas: "<the full canvas payload>" }], dry_run: true },
      "canvas nodes change as a whole: write_canvas replaces the drawing, delete removes it");
  }
}

/** Pure: compute the diff an op list produces over the current ledger. */
export function computeDiff(ledgerRoot: string, ops: ApplyOp[]): DiffEntry[] {
  const ledger = loadLedger(ledgerRoot);
  const working = new Map<string, LedgerNode>();
  const beforeHash = new Map<string, string>();
  const fileOf = new Map<string, string>();
  for (const [id, n] of ledger.nodes) {
    working.set(id, n);
    beforeHash.set(id, n.hash);
    fileOf.set(id, nodeFile(n));
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

  const reparse = (n: LedgerNode): LedgerNode => parseNode(serializeNode(n), nodeFile(n));

  // Plan mutations accumulate on a working copy; one raw diff entry at the end.
  const planAbs = join(ledgerRoot, PLAN_REL);
  let planRaw: string | null | undefined; // undefined = untouched
  let plan: PlanFile | undefined;
  const loadPlan = (): PlanFile => {
    if (plan !== undefined) return plan;
    planRaw = existsSync(planAbs) ? readFileSync(planAbs, "utf8") : null;
    plan = planRaw === null ? { iterations: [] } : (JSON.parse(planRaw) as PlanFile);
    return plan;
  };

  for (const op of ops) {
    switch (op.op) {
      case "create": {
        assertKind(op.kind);
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
        const node = reparse(draft as LedgerNode);
        working.set(op.id, node);
        fileOf.set(op.id, nodeFile(node));
        break;
      }
      case "write_canvas": {
        const existing = working.get(op.id);
        if (existing !== undefined && !deleted.has(op.id) && existing.format !== "canvas") {
          reject("SE-C-067", "a canvas node (or a fresh id) for write_canvas", `${op.id} exists as markdown`,
            { ops: [], dry_run: true }, "delete the markdown node first, or pick a fresh id");
        }
        let node: LedgerNode;
        try {
          node = parseCanvasNode(JSON.stringify(op.canvas), `${op.id}.canvas`);
        } catch (e) {
          reject("SE-C-066", "a valid Advanced JSON Canvas payload (pinned version, frontmatter id/kind/statement)",
            String((e as Error).message), { ops: [], dry_run: true },
            "fix the canvas payload and re-send");
        }
        if (node.id !== op.id) {
          reject("SE-C-066", `frontmatter id ${op.id}`, node.id, { ops: [], dry_run: true },
            "the canvas frontmatter id must match the op id");
        }
        deleted.delete(op.id);
        working.set(op.id, node);
        fileOf.set(op.id, nodeFile(node));
        break;
      }
      case "delete": {
        mustGet(op.id, "delete");
        deleted.add(op.id);
        break;
      }
      case "set_field": {
        const base = mustGet(op.id, "set_field");
        refuseOnCanvas(base, "set_field");
        const n = { ...base, provenance: { ...base.provenance }, edges: { ...base.edges }, extra: { ...base.extra } };
        if (op.field === "edges" || EDGE_KIND_NAMES.has(op.field)) {
          reject("SE-C-011", "edge writes via add_edge/remove_edge only", `set_field on ${op.field}`,
            { ops: [{ op: "add_edge", id: op.id, kind: op.field, target: "<target-id>" }], dry_run: true },
            "trace links are written only through the declared edge ops");
        }
        if (op.field === "id") {
          reject("SE-C-014", "ids are immutable in place (rename is its own op)", `set_field on id`,
            { ops: [{ op: "rename", id: op.id, new_id: "<new module-qualified id>" }], dry_run: true },
            "the rename op moves the node and rewrites every inbound link in the same apply");
        }
        if (op.field === "statement" && typeof op.value === "string") n.statement = op.value;
        else if (op.field === "kind" && typeof op.value === "string") {
          assertKind(op.value);
          n.kind = op.value;
        } else if (op.field.includes(".")) {
          // Dot paths reach nested frontmatter; missing intermediates are created.
          const parts = op.field.split(".");
          const head = parts[0];
          let cur: Record<string, unknown>;
          if (head === "provenance") cur = n.provenance as Record<string, unknown>;
          else {
            const existing = n.extra[head];
            const obj = typeof existing === "object" && existing !== null && !Array.isArray(existing) ? { ...(existing as Record<string, YamliteValue>) } : {};
            // yamlite nests one level; deeper paths die at serialize, honestly.
            n.extra[head] = obj as unknown as YamliteValue;
            cur = obj;
          }
          for (let i = 1; i < parts.length - 1; i++) {
            const k = parts[i];
            const nested = cur[k];
            cur[k] = typeof nested === "object" && nested !== null && !Array.isArray(nested) ? { ...(nested as Record<string, unknown>) } : {};
            cur = cur[k] as Record<string, unknown>;
          }
          cur[parts[parts.length - 1]] = op.value;
        }
        else if (op.field === "breaks_if_removed" && typeof op.value === "string") n.breaks_if_removed = op.value;
        else if (op.field === "provenance" && typeof op.value === "object" && !Array.isArray(op.value)) n.provenance = { ...(op.value as Record<string, string>) };
        else n.extra = { ...n.extra, [op.field]: op.value };
        working.set(op.id, reparse(n));
        break;
      }
      case "replace_section": {
        const base = mustGet(op.id, "replace_section");
        refuseOnCanvas(base, "replace_section");
        const n = { ...base };
        try {
          n.body = replaceSection(n.body, op.section, op.content);
        } catch {
          reject("SE-C-015", `an existing section in ${op.id}`, `section not found: ${op.section}`,
            { ops: [], dry_run: true }, "read the node with se_get_node mode=outline to see its sections");
        }
        working.set(op.id, reparse(n));
        break;
      }
      case "add_canvas_node":
      case "remove_canvas_node":
      case "add_canvas_edge":
      case "remove_canvas_edge": {
        // Surgical drawing edits: one element moves, never a whole-canvas resend.
        const base = mustGet(op.id, op.op);
        if (base.format !== "canvas") {
          reject("SE-C-067", `a canvas node for op ${op.op}`, `${op.id} is markdown`, { ops: [], dry_run: true },
            "surgical canvas ops apply to drawings only");
        }
        const data = JSON.parse(JSON.stringify(base.canvas)) as { nodes?: { id: string }[]; edges?: { id: string; fromNode?: string; toNode?: string }[] };
        data.nodes ??= [];
        data.edges ??= [];
        if (op.op === "add_canvas_node") data.nodes.push(op.node as { id: string });
        else if (op.op === "remove_canvas_node") {
          data.nodes = data.nodes.filter((n) => n.id !== op.node_id);
          data.edges = data.edges.filter((e) => e.fromNode !== op.node_id && e.toNode !== op.node_id);
        } else if (op.op === "add_canvas_edge") data.edges.push(op.edge as { id: string });
        else data.edges = data.edges.filter((e) => e.id !== op.edge_id);
        let node: LedgerNode;
        try {
          node = parseCanvasNode(JSON.stringify(data), nodeFile(base));
        } catch (e) {
          reject("SE-C-066", "a canvas that still parses after the edit", String((e as Error).message),
            { ops: [], dry_run: true }, "the edit broke the drawing - fix the element and re-send");
        }
        working.set(op.id, node);
        break;
      }
      case "rename": {
        // The refactor lane (req-link-rename): the node moves AND every
        // inbound reference — edges, markdown links incl. #section targets,
        // canvas file refs — rewrites in the same apply.
        const base = mustGet(op.id, "rename");
        if (!/^[a-z][a-z0-9-]*\.[a-z0-9][a-z0-9-]*$/.test(op.new_id)) {
          reject("SE-C-014", "a module-qualified kebab id (the ledger id law)", op.new_id,
            { ops: [], dry_run: true }, "ids are lowercase kebab: <module>.<local-id>");
        }
        if (working.has(op.new_id) && !deleted.has(op.new_id)) {
          reject("SE-C-013", "a fresh id for rename", `node already exists: ${op.new_id}`, { ops: [], dry_run: true },
            "renames never merge nodes; pick an unused id");
        }
        const newModule = op.new_id.slice(0, op.new_id.indexOf("."));
        const newLocal = op.new_id.slice(op.new_id.indexOf(".") + 1);
        const ext = base.format === "canvas" ? "canvas" : "md";
        const oldPath = `${base.module}/${base.localId}.${ext}`;
        const newPath = `${newModule}/${newLocal}.${ext}`;
        const rewrite = (text: string, sameModule: boolean): string => {
          let t = text.replaceAll(oldPath, newPath).replaceAll(op.id, op.new_id);
          // Same-module relative links keep working: (old.md and (old.md#sec
          if (sameModule) t = t.replaceAll(`(${base.localId}.${ext}`, `(${newLocal}.${ext}`);
          return t;
        };
        deleted.add(op.id);
        const moved = { ...base, id: op.new_id, module: newModule, localId: newLocal };
        deleted.delete(op.new_id);
        const movedNode = base.format === "canvas"
          ? parseCanvasNode(rewrite(JSON.stringify({ ...(base.canvas as Record<string, unknown>) }), false), newPath)
          : reparse(moved as LedgerNode);
        working.set(op.new_id, movedNode);
        fileOf.set(op.new_id, newPath);
        for (const [nid, n] of working) {
          if (nid === op.new_id || deleted.has(nid)) continue;
          if (n.format === "canvas") {
            const raw = JSON.stringify(n.canvas);
            const next = rewrite(raw, false);
            if (next !== raw) working.set(nid, parseCanvasNode(next, nodeFile(n)));
            continue;
          }
          const sameModule = n.module === base.module;
          const edges: Record<string, string[]> = {};
          let touched = false;
          for (const [k, targets] of Object.entries(n.edges)) {
            edges[k] = targets.map((t) => (t === op.id ? ((touched = true), op.new_id) : t));
          }
          // Extra fields carry id references too (source_refs and friends).
          const deep = (v: unknown): unknown => {
            if (typeof v === "string") {
              const next = rewrite(v, sameModule);
              if (next !== v) touched = true;
              return next;
            }
            if (Array.isArray(v)) return v.map(deep);
            if (typeof v === "object" && v !== null) {
              return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)]));
            }
            return v;
          };
          const extra = deep(n.extra) as typeof n.extra;
          const body = rewrite(n.body, sameModule);
          const statement = rewrite(n.statement, sameModule);
          if (touched || body !== n.body || statement !== n.statement) {
            working.set(nid, reparse({ ...n, edges, extra, body, statement }));
          }
        }
        break;
      }
      case "plan_insert": {
        const p = loadPlan();
        if (p.iterations.some((it) => it.id === op.entry.id)) {
          reject("SE-C-071", "a fresh planned-iteration id", `${op.entry.id} is already planned`, { ops: [], dry_run: true },
            "renumber or edit the existing entry instead");
        }
        if (existsSync(join(ledgerRoot, "..", "iterations", op.entry.id))) {
          reject("SE-C-071", "an id no started iteration holds", `${op.entry.id} already ran`, { ops: [], dry_run: true },
            "started iterations are frozen history; pick a fresh id");
        }
        const at = op.after === undefined ? p.iterations.length : p.iterations.findIndex((it) => it.id === op.after) + 1;
        if (op.after !== undefined && at === 0) {
          reject("SE-C-012", `an existing plan entry for after`, op.after, { ops: [], dry_run: true },
            "name a planned iteration to insert after, or omit after to append");
        }
        p.iterations.splice(at, 0, op.entry);
        break;
      }
      case "plan_renumber": {
        const p = loadPlan();
        if (existsSync(join(ledgerRoot, "..", "iterations", op.id))) {
          reject("SE-C-071", "a PLANNED iteration (started ids are frozen)", `${op.id} already ran`, { ops: [], dry_run: true },
            "started iterations keep their ids forever; only planned ones renumber");
        }
        const entry = p.iterations.find((it) => it.id === op.id);
        if (entry === undefined) {
          reject("SE-C-012", "an existing plan entry to renumber", op.id, { ops: [], dry_run: true },
            "check plan.json ids with se_file_read");
        }
        if (p.iterations.some((it) => it.id === op.new_id) || existsSync(join(ledgerRoot, "..", "iterations", op.new_id))) {
          reject("SE-C-071", "a fresh id to renumber onto", `${op.new_id} is taken`, { ops: [], dry_run: true },
            "pick an unused iteration id");
        }
        entry.id = op.new_id;
        for (const it of p.iterations) {
          if (it.depends_on !== undefined) it.depends_on = it.depends_on.map((d) => (d === op.id ? op.new_id : d));
        }
        break;
      }
      case "add_edge":
      case "remove_edge": {
        const base = mustGet(op.id, op.op);
        refuseOnCanvas(base, op.op);
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
    diff.push({ file: fileOf.get(id)!, old_hash: beforeHash.get(id) ?? null, new_content: null });
  }
  for (const [id, n] of working) {
    if (deleted.has(id)) continue;
    const before = beforeHash.get(id) ?? null;
    if (before !== n.hash) {
      diff.push({ file: fileOf.get(id)!, old_hash: before, new_content: serialize(n) });
    }
  }
  if (plan !== undefined) {
    const next = JSON.stringify(plan, null, 2) + "\n";
    if (planRaw !== next) {
      diff.push({ file: PLAN_REL, old_hash: planRaw === null ? null : sha256(planRaw!), new_content: next });
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
    // CAS per file, checked again at write time. Raw entries (plan.json)
    // hash bytes; node entries hash canonically.
    if (d.old_hash !== null) {
      const raw = readFileSync(abs, "utf8");
      const onDisk = d.file.startsWith("..")
        ? sha256(raw)
        : (d.file.endsWith(".canvas") ? parseCanvasNode(raw, d.file) : parseNode(raw, d.file)).hash;
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
