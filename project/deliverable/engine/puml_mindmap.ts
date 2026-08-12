// Generic PlantUML mindmap projection helpers.

export interface MindmapNode {
  id: string;
  label: string;
  children: MindmapNode[];
}

export interface MindmapGraphNode {
  id: string;
  label: string;
  parents: string[];
}

function esc(label: string): string {
  return label.replace(/\r?\n/g, " ").replace(/^\s+|\s+$/g, "");
}

function sorted(nodes: MindmapNode[]): MindmapNode[] {
  return nodes.slice().sort((a, b) => a.label.localeCompare(b.label) || a.id.localeCompare(b.id));
}

/** Build a tree from graph edges. Shared children are intentionally duplicated
 *  under each parent, which is what a mindmap reader expects. */
export function buildMindmapTree(source: MindmapGraphNode[], rootId: string): MindmapNode {
  const byId = new Map(source.map((n) => [n.id, n]));
  const children = new Map<string, string[]>();
  for (const n of source) {
    for (const p of n.parents) children.set(p, [...(children.get(p) ?? []), n.id]);
  }

  const visit = (id: string, stack: Set<string>): MindmapNode => {
    const n = byId.get(id);
    const label = n === undefined ? id : n.label;
    if (stack.has(id)) return { id, label: `${label} (cycle)`, children: [] };
    const next = new Set(stack);
    next.add(id);
    const kidIds = (children.get(id) ?? []).slice().sort((a, b) => a.localeCompare(b));
    return {
      id,
      label,
      children: sorted(kidIds.map((kid) => visit(kid, next))),
    };
  };

  return visit(rootId, new Set());
}

/** Emit one PUML mindmap document from a rooted tree. */
export function toPumlMindmap(root: MindmapNode, title = "mindmap"): string {
  const out = ["@startmindmap", `title ${esc(title)}`];
  const walk = (n: MindmapNode, depth: number): void => {
    const stars = "*".repeat(depth);
    out.push(`${stars} ${esc(n.label)}`);
    for (const child of sorted(n.children)) walk(child, depth + 1);
  };
  walk(root, 1);
  out.push("@endmindmap", "");
  return out.join("\n");
}
