---
id: test-spec-content-lint
type: test
statement: quack lint flags spec-content violations - dangling anchors, orphans, external links, bad ids, and meta-term leaks.
class: executed
verify: selftest:anchor-refers book-orphan-lint external-links meta-quarantine quarantine-scope residue-lint
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. A note referring to an existing heading anchor passes lint; the same refer after the heading is renamed flags a dangling referent. *(was test-anchor-refers)*
2. A node in no manifest and without an exclusion record is flagged; an excluded one is not. *(was test-book-orphans)*
3. An http link in a fixture spec note flags a lint violation; the same link inside a reference note passes. *(was test-external-links)*
4. A meta-classified glossary term inside a chapter one-to-six unit is flagged; the same term in the agent guide is not. *(was test-meta-quarantine)*
5. A meta-class term in the rationales chapter flags; the same term in the guidance chapter and the agent guide passes. *(was test-quarantine-scope)*
6. An unfilled slot placeholder in a fixture spec note flags a lint violation; a fill comment alone does not. *(was test-residue-lint)*
