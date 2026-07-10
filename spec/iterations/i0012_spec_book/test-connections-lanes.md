---
id: test-connections-lanes
type: test
statement: Trace edges are stored, minted, migrated, and served through the spec connections lanes.
class: executed
verify: selftest:conn-adjacency conn-hash-neutral conn-jsonl conn-kinds conn-notes conn-one-lane conn-root edge-mode migrate-edges mint-connection promote-connection virtual-edges
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. quack connections on a fixture id prints its jsonl, note, and code-derived implements edges in deterministic order across two runs. *(was test-conn-adjacency)*
2. A fixture graph stored with frontmatter edges and the same graph stored with connection edges produce byte-identical node hashes and identical check states. *(was test-conn-hash-neutral)*
3. A fixture edges.jsonl loads its lines as edges; a malformed line and a dangling endpoint each refuse naming the file and line. *(was test-conn-jsonl)*
4. The type layer's kind vocabulary declares direction and default lane per kind; an unknown kind refuses at load and at mint. *(was test-conn-kinds)*
5. A fixture connection note loads as one edge with kind, src, dst, and statement; a note missing a field and a note with a dangling endpoint each refuse naming the file. *(was test-conn-notes)*
6. A triple present in both lanes refuses the graph naming the duplicate; removing one lane loads clean. *(was test-conn-one-lane)*
7. Editing a jsonl edge line and editing a connection note body each change the identity root; an untouched workspace re-renders byte-identical. *(was test-conn-root)*
8. With edges = connections in project.toml, a node carrying a legacy verifies key refuses naming the file and key; in frontmatter mode it loads. *(was test-edge-mode)*
9. migrate-edges on a fixture converts every edge, prints the audit counts, and refuses on an injected duplicate entry and on an injected adjacency mismatch; the mode flag is written last. *(was test-migrate-edges)*
10. Minting a directed edge creates it in the kind's default lane; minting the same edge again is a no-op; a symmetric kind mints canonical endpoint order; an unknown kind refuses. *(was test-mint-connection)*
11. Promoting a jsonl edge removes the line and creates the note with the same triple; a second promote changes nothing. *(was test-promote-connection)*
12. With connection-stored edges, the vv-matrix fixture query renders the same rows, columns, and groups as with frontmatter edges. *(was test-virtual-edges)*
