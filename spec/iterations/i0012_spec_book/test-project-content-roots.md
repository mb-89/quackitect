---
id: test-project-content-roots
type: test
statement: Glossary and reference content is served from one workspace-spec source.
class: executed
verify: selftest:glossary-shared spec-content-roots
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. Lint and the book emitter read the same glossary file; a term classification change moves both. *(was test-glossary-shared)*
2. Terms, references, fundamentals, and methods load from the workspace spec with aliases readable; quackitect's own glossary resolves from spec; the retired method-layer glossary path no longer loads project terms. *(was test-spec-content-roots)*
