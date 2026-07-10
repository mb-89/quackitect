---
id: test-candidate-decisions
type: test
statement: Decisions choosing among rated candidates are modeled and rendered deterministically in their owning chapters.
class: executed
verify: selftest:candidates decision-kinds verdict-order
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. Fixture candidates with ratings render a candidates-against-criteria matrix; a decision's chosen and rejected links derive the candidate status; a rating outside zero to one refuses. *(was test-candidates)*
2. Fixture decisions of the three kinds each render in their owning chapter view - architecture in design output, waiver in verification and validation, project in the project chapter - and an unknown kind refuses. *(was test-decision-kinds)*
3. A candidate claimed by two decisions is a lint finding; the rendered verdict is identical across repeated renders. *(was test-verdict-order)*
