---
id: test-build-cheap
type: test
statement: quack build and dispatch stay cheap: the compile is skipped when unchanged, verdicts kept surgically.
class: executed
verify: selftest:build-fast-path verdict-surgical
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. A second quack build with unchanged engine source skips the compile; a build after touching a .go file compiles. *(was test-build-fast-path)*
2. After a content-only re-baseline, an unchanged test's verdict is served from cache; a verdict whose node hash or buildID changed is dropped (the i11 stale-FAIL wedge stays dead). *(was test-verdict-surgical)*
