---
kind: [[guidance]]
scope: ["a design review, at design/review of a standard ticket"]
rationale: [[spec/rationales/design-review]]
---

# Actionables

1. Read the approach against the ask, and name each `done_when` line it leaves unmet.
2. Fail an unusable draft: the wrong road, a refusing verb, a rule nothing runs, or a reach past the ask. A fail spends a whole round, so it goes to a fault the implement step cannot fix. *
3. Answer `pass with findings` on any other structural finding, one row a finding, written `- <child-name>: <finding>`. Each row mints a child ticket and the parent goes on, so a gap the parent survives costs no round. *
4. Name each child the way the hand-back takes it. [[spec/design_output/pull#a-finding-rides-out]]
5. Write a local craft finding as a row under a plain `pass`, for the implement step. A craft finding stays local, so the implementer fixes it in passing. *
6. Grade a prose or shape finding as form, and pass: the Problems panel holds it until the push. A review failing on form sends a draft round and round on lines the write door says to leave. *

# Examples

| the rule | do | do not |
|---|---|---|
| 2 | fail on a verb the approach calls and the tree lacks | fail on a wrong caller line the implementer fixes |
| 3 | pass with findings, a child a row | fail on a gap the parent survives |
| 6 | pass, and the warning waits for the push | fail on a sentence past the word cap |
