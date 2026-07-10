---
id: test-reader-structure
type: test
statement: Every chapter leads with its lede and internals stay apart in the guidance chapter.
class: executed
verify: selftest:chapter-tldr guidance-split
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. A chapter manifest without a lede unit is flagged; a rendered chapter opens with its lede before any section. *(was test-chapter-tldr)*
2. Internals live in the guidance chapter; a guidance tag on a content node resolves to it; audience chapters carry no internals prose. *(was test-guidance-split)*
