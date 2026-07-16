---
id: test-manifest-render
type: test
statement: Every document renders from manifest nodes: transcluded units at derived depth, deck mode, auto-linked prose, emitted entry files.
class: executed
verify: selftest:agents-emit auto-link book-depth book-manifests deck-mode render-refs
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. The book's agent-guide chapter renders from its manifest source; the hand-authored repo-root AGENTS.md is embedded verbatim, never generated. *(was test-agents-emit)*
2. Prose mentioning a term by alias renders linked; an authored link stays untouched; a longer name wins over its substring; code blocks and headings stay untouched; two notes claiming one alias refuse with an error. *(was test-auto-link)*
3. Depth per node is computed from anatomy; an authored depth tag is refused by the parser. *(was test-book-depth)*
4. A chapter manifest transcludes a node ref at depth and passes inline markdown through; a deck manifest slices units into slides. *(was test-book-manifests)*
5. A deck manifest renders one unit per slide; the same HTML carries the present mode and the print handout path. *(was test-deck-mode)*
6. A render refs view with depth 2 renders each fixture row through the node renderer - statement, state, and children present; Obsidian-shape fallback stays a plain table. *(was test-render-refs)*
