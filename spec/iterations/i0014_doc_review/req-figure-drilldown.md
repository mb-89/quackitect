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

Session refinement 2026-07-08 (c34 c35): the top view is a ROUND whole onion (outer layers touch the world, innermost is the domain kernel). Click a layer to enter it with breadcrumbs; that layer lays out as flow left-to-right - real inputs left, a full-height block standing for the inner layers in the middle, outputs right; blocks sit between input and inner-layer or inner-layer and output, and one block can appear twice if it is in the flow twice. Use real inputs and outputs, not invented ones.
