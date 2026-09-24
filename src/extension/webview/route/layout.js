// The graph the emitter answers, turned into the nodes and edges React Flow
// draws, placed top to bottom by dagre. It reads no page, so a test in node
// drives it the way the page does.
// [[spec/design_output/drawing#the-layout-reads-the-graph]]

import dagre from "@dagrejs/dagre";

// The box a node takes, so dagre places each one before the page measures it. [[spec/design_output/drawing#the-layout-reads-the-graph]]
export const WIDTH = 180;
export const HEIGHT = 44;
const GAP = 36;
const HALF = 2;

// The flags a node carries, each one a class the style sheet reads. [[spec/design_output/drawing#the-layout-reads-the-graph]]
const MARKS = ["at", "person", "dotted", "skipped"];

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

// [[spec/design_output/drawing#the-layout-reads-the-graph]]
export function laidOut(graph) {
  const nodes = graph?.nodes ?? [];
  const edges = graph?.edges ?? [];
  const known = new Set(nodes.map((one) => one.id));
  const kept = edges.filter((one) => known.has(one.from) && known.has(one.to));

  const place = new dagre.graphlib.Graph({ multigraph: true });
  place.setGraph({ rankdir: "TB", nodesep: GAP, ranksep: GAP });
  place.setDefaultEdgeLabel(() => ({}));
  for (const one of nodes) place.setNode(one.id, { width: WIDTH, height: HEIGHT });
  for (const [at, one] of kept.entries())
    place.setEdge(one.from, one.to, {}, String(at));
  dagre.layout(place);

  return {
    nodes: nodes.map((one) => {
      const at = place.node(one.id);
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
