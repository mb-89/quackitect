---
id: req-table-facets
type: requirement
depends_on: []
statement: The book shall filter a reader-facing table by combinable pill facets above it, always including a need facet for trace items and a facet for each meaningful category, and shall not render a pill for every item.
class: review
killer: false
phase: [operation]
discipline: [software, design]
quality: [usability]
---
## Rationale (not load-bearing)
field c30 c32 c33 c37 c41 c45 + owner ch7 (2026-07-08): pills filter by group; a pill per requirement (vv-matrix by "verifies") is pointless. Trace items always belong to a need indirectly, so a need facet always applies; other good categories are extra facets. Facets are combinable.
