---
id: adr-standalone-suite
decided_in: i0011_geronticide
type: adr
adjudicated_by: human
statement: Test nodes may carry suite: never-cached in their frontmatter: the tests-pass battery skips them and the board carries them as their own entry. The parity tamper check moves to this suite. Chosen over a hardcoded name filter (not generic) and over retiring the i3 test node (history churn without benefit).
class: review
killer: false
---
## Rationale (not load-bearing)
The tripwire keeps ALL its teeth - it just stops biting the verification suites for legitimate authoring.
