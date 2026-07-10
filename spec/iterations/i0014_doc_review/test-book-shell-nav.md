---
id: test-book-shell-nav
type: test
statement: The book shell organizes navigation - section paging, the deck views listing, and the title card.
class: executed
verify: selftest:deck-views-section section-paging shell-title-card
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. The sidebar views render a slide-decks subsection listing the decks. *(was test-deck-views-section)*
2. The rendered book pages one top-level section at a time. *(was test-section-paging)*
3. The rendered book carries no page header and the title opens the info detail card. *(was test-shell-title-card)*
