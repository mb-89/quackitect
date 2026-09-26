---
kind: [[guidance]]
scope: ["a design review, at design/review of a standard ticket"]
rationale: [[spec/rationales/design-review]]
---

# Actionables

1. Read the approach against the ask, and name each `done_when` line it leaves unmet.
2. Fail on a fundamental fault alone: a broken approach, an unmet goal, a goal making no sense, a clash. A fail spends a round, so a fault the builder fixes in place rides to the build. *
3. Answer `pass with findings` on any other structural finding, one row a finding, written `- <child-name>: <finding>`. Each row mints a child ticket and the parent goes on, so a gap the parent survives costs no round. *
4. Name each child the way the hand-back takes it. [[spec/design_output/pull#a-finding-rides-out]]
5. Pass with a row for every fault the builder fixes in place, such as a missed caller. The builder stands at that spot anyway, so a round spent on it buys nothing. *
6. Grade a prose or shape finding as form, and pass: the Problems panel holds it until the push. A review failing on form sends a draft round and round on lines the write door says to leave. *
7. Weigh the draft's `size` against the ask, and pass with a row naming each file the ask leaves out. A draft touching many files for one number passes unweighed otherwise. *

# Examples

| the rule | do | do not |
|---|---|---|
| 2 | fail on a verb the approach calls and the tree lacks | fail on a wrong caller line the implementer fixes |
| 3 | pass with findings, a child a row | fail on a gap the parent survives |
| 5 | pass, with a row naming the callers the draft misses | fail, and send the draft round for a caller list |
| 6 | pass, and the warning waits for the push | fail on a sentence past the word cap |
| 7 | pass with a row naming the files past the ask | pass a draft touching many files for one number |
