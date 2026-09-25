---
kind: [[guidance]]
scope: ["a design review, at design/review of a standard ticket"]
rationale: [[spec/rationales/design-review]]
---

# Actionables

1. Read the approach against the ask, and name each `done_when` line it leaves unmet.
2. Open every file, function and verb the draft names, and check each claim there. A review trusting the draft passes a mechanism that stands nowhere. *
3. Fail a draft whose approach is unusable: the wrong road, a verb that refuses, a rule that never runs, or a reach wider than the ask. A fail spends a whole round, so it goes to a fault the implement step cannot fix. *
4. Answer `pass with findings` on any other structural finding, one row a finding, written `- <child-name>: <finding>`. Each row mints a child ticket and the parent goes on to implement, so a gap the parent survives costs no round. *
5. Name each child within the `names.words` cap, and pick a name no ticket carries. The hand-back refuses a name past the cap or taken already.
6. Write a local craft finding as a row under a plain `pass`, for the implement step. A craft finding stays local, so the implementer fixes it in passing. *
7. Grade a finding of prose or shape as form, and pass on it: it stands in the Problems panel until the push. A review failing on form sends a draft round and round on lines the write door says to leave. *

# Examples

| the rule | do | do not |
|---|---|---|
| 3 | fail on a verb the approach calls and the tree lacks | fail on a wrong caller line the implementer fixes |
| 4 | pass with findings, a child a row | fail on a gap the parent survives |
| 7 | pass, and the warning waits for the push | fail on a sentence past the word cap |
