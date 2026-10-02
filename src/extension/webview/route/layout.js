// The graph the emitter answers, turned into the nodes and edges React Flow
// draws, placed by the placer the caller hands it. It reads no page and imports
// no package, so a test in node drives it on a box that installs no Node modules.
// [[spec/design_output/drawing#the-layout-reads-the-graph]]

// The box a node takes, so the placer places each one before the page measures it. [[spec/design_output/drawing#the-layout-reads-the-graph]]
export const WIDTH = 180;
export const HEIGHT = 44;
export const GAP = 36;
const HALF = 2;

// The flags a node carries, each one a class the style sheet reads. [[spec/design_output/drawing#the-layout-reads-the-graph]]
const MARKS = ["at", "person", "dotted", "skipped", "reached"];

// [[spec/design_output/drawing#the-layout-reads-the-graph]]
export function classOf(node) {
  const out = [String(node.kind ?? "leaf")];
  for (const one of MARKS) if (node[one]) out.push(one);
  if (Number(node.returns) > 0) out.push("returns");
  return out.join(" ");
}

// The name, and the returns where a step failed back. [[spec/design_output/drawing#the-layout-reads-the-graph]]
export function labelOf(node) {
  const name = String(node.name ?? node.id);
  return Number(node.returns) > 0 ? `${name} ↺${node.returns}` : name;
}

// [[spec/design_output/drawing#the-layout-reads-the-graph]]
function titleOf(node) {
  return [node.does, node.when && `when ${node.when}`, node.why]
    .filter(Boolean)
    .join(" · ");
}

// The placer answers each node's centre by its id, off the nodes and the edges that reach a node. [[spec/design_output/drawing#the-layout-reads-the-graph]]
export function laidOut(graph, place) {
  const nodes = graph?.nodes ?? [];
  const edges = graph?.edges ?? [];
  const known = new Set(nodes.map((one) => one.id));
  const kept = edges.filter((one) => known.has(one.from) && known.has(one.to));
  const centres = nodes.length ? place(nodes, kept) : new Map();

  return {
    nodes: nodes.map((one) => {
      const at = centres.get(one.id);
      return {
        id: one.id,
        position: { x: at.x - WIDTH / HALF, y: at.y - HEIGHT / HALF },
        data: { label: labelOf(one), title: titleOf(one) },
        className: classOf(one),
        draggable: false,
        connectable: false,
      };
    }),
    edges: kept.map((one) => ({
      id: `${one.kind}:${one.from}:${one.to}`,
      source: one.from,
      target: one.to,
      className: String(one.kind),
      animated: one.kind === "fail",
    })),
  };
}
