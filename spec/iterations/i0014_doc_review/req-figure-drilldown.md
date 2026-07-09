---
id: req-figure-drilldown
type: requirement
depends_on: []
statement: The design chapter shall render the system as a layered onion figure entered by clicking a block, with breadcrumbs back to the top and each leaf linking to its trace item.
class: review
killer: false
phase: [operation]
discipline: [software, design]
quality: [usability]
---
## Rationale (not load-bearing)
field c34 via req-compact-renders; agreed at the bs20 design discussion (2026-07-08). The onion models data flow: inputs enter, travel through the layers, outputs leave; the blocks sit on the rings they work in. Layer membership comes from a small project-supplied map (judgment where a query cannot); everything else (blocks, counts, links, the plot) derives mechanically. Iteration files stay out - the book documents the current design. The fig kind and its guidance live in the template; the project supplies only the map.

Owner draft 2026-07-09 (excalidraw `Drawing 2026-07-09 10.18.07.excalidraw.md`; supersedes the 2026-07-08 c35/c37 layout). The top-level overview stays as is. The drill-down view is a nested onion:

- The layer is a true circle. Never an oval.
- The circle fills the full width. Only a margin for the ports stays free.
- Input ports are boxes on the left, outside the circle.
- Output ports are boxes on the right, outside the circle.
- The center holds a smaller circle labelled with the lower levels. It is plain. A click drills into the next layer. It replaces the core disc.
- Nodes in the input flow sit in the left half.
- Nodes on the output path sit in the right half.
- A direct-throughput node sits in the middle. One box. No two-box duplication.
- An input that feeds the lower levels directly draws an arrow straight to the center circle.
- Nodes start at the vertical middle and fan out from there.
- Infrastructure pills stay below the figure.
- Sectors (pie wedges grouping isolated same-topic subgraphs) are optional and skipped for now. A sector never has a single entry.

Use real inputs and outputs, not invented ones.

Owner rulings 2026-07-09, after two review rounds:

- The layer view renders as a dagre left-to-right GRAPH (cytoscape, the trace chapter's inlined assets). Real edge routing beats any hand-laid layout at 40+ edges. Print-friendliness is explicitly not needed.
- The draft's semantics survive as flow direction: input ports enter on the left, output ports and the outer-layer exchange leave on the right, `lower levels` is the drill node, `uses` edges connect the elements.
- Hovering a node isolates its neighbourhood. A node tap transports to the trace row.
- The overview (level 0) stays the drawn concentric rings.
- The LAYER STRUCTURE itself (what sits in which layer) is not settled - parked for a structure discussion (see the notes inbox).
