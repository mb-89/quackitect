// The common node envelope (p4-day-one-schemas.md §1–§2).
// One node per markdown file: YAML-subset frontmatter + body.
// File path is ledger/<module>/<localId>.md; id is `<module>.<localId>` —
// the module dimension always exists, presentation may hide it (pillar 4).
import { sha256 } from "./hash.ts";
import { parseYamlite, serializeYamlite, type YamliteMap, type YamliteValue } from "./yamlite.ts";
import { EDGE_KIND_NAMES } from "./edges.ts";

export interface LedgerNode {
  id: string;
  module: string;
  localId: string;
  kind: string;
  statement: string;
  /** Per-field where it matters: who/what set this, incl. AI involvement. */
  provenance: Record<string, string>;
  /** Mandatory on requirements, recommended elsewhere (§9). */
  breaks_if_removed?: string;
  /** Typed link fields — written only via add_edge/remove_edge apply ops. */
  edges: Record<string, string[]>;
  /** Migrated nodes carry the v1 source id. */
  migrated_from_v1?: string;
  /** Kind-specific frontmatter, preserved in order (Pugh fields, floor flags, …). */
  extra: YamliteMap;
  body: string;
  /** Content hash over the serialized file (LF-normalized). */
  hash: string;
  /** Canvas-format nodes (engine/canvas.ts): the parsed Advanced JSON Canvas payload. */
  format?: "canvas";
  canvas?: unknown;
}

export class NodeParseError extends Error {
  readonly file: string;
  constructor(msg: string, file: string) {
    super(`${file}: ${msg}`);
    this.name = "NodeParseError";
    this.file = file;
  }
}

const ENVELOPE_KEYS = new Set(["id", "kind", "statement", "provenance", "breaks_if_removed", "edges", "migrated_from_v1"]);

export const ID_RE = /^[a-z0-9]+(\.[a-z0-9][a-z0-9-]*)+$/;

export function parseNode(raw: string, file: string): LedgerNode {
  const text = raw.replace(/\r\n/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new NodeParseError("missing frontmatter block", file);
  let fm: YamliteMap;
  try {
    fm = parseYamlite(m[1]);
  } catch (e) {
    throw new NodeParseError(String((e as Error).message), file);
  }
  const body = m[2].replace(/^\n+/, "");

  const id = fm.id;
  if (typeof id !== "string" || !ID_RE.test(id)) {
    throw new NodeParseError(`missing or malformed id: ${JSON.stringify(id)}`, file);
  }
  const kind = fm.kind;
  if (typeof kind !== "string" || kind === "") throw new NodeParseError("missing kind", file);
  const statement = fm.statement;
  if (typeof statement !== "string" || statement === "") throw new NodeParseError("missing statement", file);

  const dot = id.indexOf(".");
  const module = id.slice(0, dot);
  const localId = id.slice(dot + 1);

  const provenance: Record<string, string> = {};
  if (fm.provenance !== undefined) {
    if (typeof fm.provenance !== "object" || Array.isArray(fm.provenance)) {
      throw new NodeParseError("provenance must be a map", file);
    }
    for (const [k, v] of Object.entries(fm.provenance)) {
      if (typeof v !== "string") throw new NodeParseError(`provenance.${k} must be a scalar`, file);
      provenance[k] = v;
    }
  }

  const edges: Record<string, string[]> = {};
  if (fm.edges !== undefined) {
    if (typeof fm.edges !== "object" || Array.isArray(fm.edges)) {
      throw new NodeParseError("edges must be a map of kind -> [ids]", file);
    }
    for (const [ek, targets] of Object.entries(fm.edges)) {
      if (!EDGE_KIND_NAMES.has(ek)) throw new NodeParseError(`unknown edge kind: ${ek}`, file);
      const list = Array.isArray(targets) ? targets : [targets];
      for (const t of list) {
        if (!ID_RE.test(t)) throw new NodeParseError(`edge ${ek} targets malformed id: ${t}`, file);
      }
      edges[ek] = list;
    }
  }

  const extra: YamliteMap = {};
  for (const [k, v] of Object.entries(fm)) {
    if (!ENVELOPE_KEYS.has(k)) extra[k] = v;
  }

  const node: LedgerNode = {
    id,
    module,
    localId,
    kind,
    statement,
    provenance,
    edges,
    extra,
    body,
    hash: "",
    ...(typeof fm.breaks_if_removed === "string" ? { breaks_if_removed: fm.breaks_if_removed } : {}),
    ...(typeof fm.migrated_from_v1 === "string" ? { migrated_from_v1: fm.migrated_from_v1 } : {}),
  };
  node.hash = sha256(serializeNode(node));
  return node;
}

/** Canonical form — envelope keys first in fixed order, then extra, then body. */
export function serializeNode(node: Omit<LedgerNode, "hash">): string {
  const fm: YamliteMap = { id: node.id, kind: node.kind, statement: node.statement };
  if (Object.keys(node.provenance).length > 0) fm.provenance = node.provenance;
  if (node.breaks_if_removed !== undefined) fm.breaks_if_removed = node.breaks_if_removed;
  if (Object.keys(node.edges).length > 0) {
    const e: Record<string, string | string[]> = {};
    for (const k of Object.keys(node.edges).sort()) e[k] = node.edges[k];
    fm.edges = e as YamliteValue;
  }
  if (node.migrated_from_v1 !== undefined) fm.migrated_from_v1 = node.migrated_from_v1;
  for (const [k, v] of Object.entries(node.extra)) fm[k] = v;
  const body = node.body.replace(/\r\n/g, "\n").replace(/\n*$/, "\n");
  return `---\n${serializeYamlite(fm)}---\n\n${body}`;
}
