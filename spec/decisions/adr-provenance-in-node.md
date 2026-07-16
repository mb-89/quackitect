---
id: adr-provenance-in-node
type: adr
decided_in: i0021_field_ux
adjudicated_by: user
statement: Per-field provenance lives IN THE NODE: a frontmatter provenance block written at mint, one line per schema field naming the value's source. The register derives colors from it, and a veto edit moves value and provenance together under one hash. Datum: a data-home sidecar (D2). The sidecar loses on the repo-self-sufficiency law, since a fresh clone must render true colors, and on hash integrity, since a sidecar edit would not ripple the node. Reverse-sensitivity applies if provenance blocks bloat node files beyond readability at the M5 spike, more than roughly a line per schema field. In that case, move the PROSE to the rationale body and keep only the source tag per field in frontmatter.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
