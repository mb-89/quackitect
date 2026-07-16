---
id: req-connections-lanes
type: requirement
statement: The engine shall store, mint, migrate, and serve trace edges through the spec connections lanes. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When quack connections runs with a node id, the engine shall print every connection touching that id - from the jsonl lane, the note lane, and code-derived implements edges - in deterministic order. *(was req-conn-adjacency)*
2. While edge membership is unchanged, the engine shall compute byte-identical node hashes for frontmatter-stored and connection-stored edges. *(was req-conn-hash-neutral)*
3. When a kind folder under spec/connections holds edges.jsonl, the engine shall load every line as one edge of that kind, and shall refuse a malformed line or an unresolvable endpoint naming the file and line. *(was req-conn-jsonl)*
4. The type layer shall declare the connection-kind vocabulary with each kind's direction and default lane, and the engine shall refuse an unknown kind. *(was req-conn-kinds)*
5. When a kind folder under spec/connections holds a connection note, the engine shall load it as one edge carrying kind, src, dst, and statement, and shall refuse a note missing one of them or naming an endpoint that does not resolve. *(was req-conn-notes)*
6. If one triple of kind, src, and dst appears in both the note lane and the jsonl lane, then the engine shall refuse the graph naming the duplicate. *(was req-conn-one-lane)*
7. The identity root shall cover connection content - an edge change or a connection-prose change shall change the root. *(was req-conn-root)*
8. While spec/project.toml declares edges = connections, the engine shall refuse a legacy edge key in node frontmatter naming the file and key. *(was req-edge-mode)*
9. Where edges are connection-stored, a base query shall resolve an item's edge properties from the graph exactly as if frontmatter-stored. *(was req-virtual-edges)*
10. When quack mint connection runs with a kind, src, and dst, the engine shall create the edge once in the kind's default lane, with a deterministic id, canonical endpoint order for a symmetric kind, and a stamped statement on the note lane. *(was req-mint-connection)*
11. When quack promote connection names a jsonl edge, the engine shall replace the line with a connection note carrying the same triple, and a repeated promote shall change nothing. *(was req-promote-connection)*
12. When quack migrate-edges runs, the engine shall convert every frontmatter edge to the connections home, shall refuse on a duplicate edge entry or a before-and-after adjacency mismatch, and shall write the edges mode flag last. *(was req-migrate-edges)*
