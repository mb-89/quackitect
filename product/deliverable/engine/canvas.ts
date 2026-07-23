// Advanced JSON Canvas (the Advanced Canvas plugin's format) as a ledger
// node format. The canvas file IS the node: metadata.frontmatter carries
// the envelope, the drawing is the content. The version is pinned — an
// unknown shape refuses loudly, never guesses (§6: a silent misparse means
// the engine computes the wrong `next` confidently).
import { sha256 } from "./hash.ts";
import { EDGE_KIND_NAMES } from "./edges.ts";
import { NodeParseError, ID_RE, type LedgerNode } from "./node.ts";
import type { YamliteMap, YamliteValue } from "./yamlite.ts";

export const CANVAS_VERSION = "1.0-1.0";

export interface CanvasElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  file?: string;
  portal?: boolean;
  text?: string;
  label?: string;
  styleAttributes?: Record<string, unknown>;
}

export interface CanvasEdge {
  id: string;
  fromNode: string;
  toNode: string;
  fromSide?: string;
  toSide?: string;
  label?: string;
  styleAttributes?: Record<string, unknown>;
}

export interface CanvasData {
  metadata: { version: string; frontmatter?: Record<string, YamliteValue> };
  nodes?: CanvasElement[];
  edges?: CanvasEdge[];
}

/** Key-sorted stringify: Obsidian may reorder keys; the hash must not move. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

export function parseCanvasNode(raw: string, file: string): LedgerNode {
  let data: CanvasData;
  try {
    data = JSON.parse(raw) as CanvasData;
  } catch {
    throw new NodeParseError("not valid JSON", file);
  }
  if (typeof data !== "object" || data === null || typeof data.metadata !== "object" || data.metadata === null) {
    throw new NodeParseError("missing metadata (Advanced JSON Canvas)", file);
  }
  if (data.metadata.version !== CANVAS_VERSION) {
    throw new NodeParseError(
      `unsupported canvas version ${JSON.stringify(data.metadata.version)} — pinned to ${CANVAS_VERSION}`,
      file,
    );
  }
  const fm = data.metadata.frontmatter ?? {};
  const id = fm.id;
  if (typeof id !== "string" || !ID_RE.test(id)) {
    throw new NodeParseError(`missing or malformed frontmatter id: ${JSON.stringify(id)}`, file);
  }
  const kind = fm.kind;
  if (typeof kind !== "string" || kind === "") throw new NodeParseError("missing frontmatter kind", file);
  const statement = fm.statement;
  if (typeof statement !== "string" || statement === "") throw new NodeParseError("missing frontmatter statement", file);
  const edges: Record<string, string[]> = {};
  const extra: YamliteMap = {};
  for (const [k, v] of Object.entries(fm)) {
    if (k === "id" || k === "kind" || k === "statement") continue;
    if (EDGE_KIND_NAMES.has(k)) {
      const list = (Array.isArray(v) ? v : [v]).map(String);
      for (const t of list) {
        if (!ID_RE.test(t)) throw new NodeParseError(`edge ${k} targets malformed id: ${t}`, file);
      }
      edges[k] = list;
      continue;
    }
    extra[k] = v;
  }
  const dot = id.indexOf(".");
  return {
    id,
    module: id.slice(0, dot),
    localId: id.slice(dot + 1),
    kind,
    statement,
    provenance: {},
    edges,
    extra,
    body: "",
    format: "canvas",
    canvas: data,
    hash: sha256(canonical(data)),
  };
}

/** Obsidian-style serialization (tab-indented); the envelope syncs back into the frontmatter. */
export function serializeCanvasNode(node: Omit<LedgerNode, "hash">): string {
  const data = structuredClone(node.canvas) as CanvasData;
  const fm: Record<string, YamliteValue> = { id: node.id, kind: node.kind, statement: node.statement };
  for (const [k, targets] of Object.entries(node.edges)) fm[k] = targets;
  for (const [k, v] of Object.entries(node.extra)) fm[k] = v;
  data.metadata = { ...data.metadata, version: CANVAS_VERSION, frontmatter: fm };
  return JSON.stringify(data, null, "\t") + "\n";
}
