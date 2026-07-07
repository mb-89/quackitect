---
id: adr-connections-reified
type: adr
kind: architecture
adjudicated_by: user
statement: Semantic relations reify as first-class connections in one home, spec/connections/<kind>/, with a SysML2-aligned kind vocabulary declared in the type layer. The loader reconstructs node adjacency hash-neutrally (blessed history never mass-suspects), connection content joins the identity root, and connections stay off the report graph's node whitelist.
class: review
killer: false
---
## Rationale (not load-bearing)
Owner ruling 2026-07-06: one system for relations - reified edges are addressable (linkable, prose-bearing, queryable), which frontmatter lists can never be. ReqIF SpecRelations, DOORS link modules, and SysML v2 all treat relations as first-class objects. The graph-database lesson (RDF reification) bounds it: reify what carries data, keep the machinery's high-volume edges cheap - hence the lanes decision (adr-connection-lanes) and the scope decision (adr-edges-scope).
