---
id: test-ai-provenance
type: test
statement: AI-drafted prose enters and renders with provenance marks that only the user reduces.
class: executed
verify: selftest:ai-drafting provenance-icons
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. The drafting prompt in the method layer mandates graph-context injection and style exemplars; the emitter refuses a prose unit without provenance marks. *(was test-ai-drafting)*
2. An AI-drafted fixture paragraph renders with three marks; a user-reduced value renders reduced; a paragraph can never render more marks than its recorded value. *(was test-provenance-icons)*
