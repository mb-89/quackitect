---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: uc-answer-every-export-with-a-door-or-a-deletion
type: "[[use-case]]"
kind: interaction
statement: Answer every exported entry point with a door or a deletion.
actor: stk-newcomer
trigger: the reachability guard is run
precondition: none
guarantee: no exported entry point is reachable from nothing without that being a recorded decision
refines:
  - sty-find-working-code-that-no-surface-can-reach
priority: must
---

## Main scenario

1. The reader runs the reachability guard.
2. The guard enumerates every exported entry point, from the source rather
   than from a maintained list.
3. The guard enumerates every surface that can reach one.
4. The guard reports each export no surface reaches.
5. The reader answers each report with a door or a deletion.
6. A later run reports nothing, or reports only what has been answered since.

## Extensions

2a. AN EXPORT IS REACHED ONLY BY TESTS. It counts as unreachable. A test
proving a capability works is what makes its absence from every surface worth
reporting rather than harmless.

4a. THE REPORT IS EMPTY ON THE FIRST RUN. That would falsify the finding this
record was seeded from, and the two pieces already found say it will not
happen.

4b. THE REPORT IS LONG ENOUGH THAT NOBODY WILL ANSWER IT. The same failure
the exemption hatch has: a list too long to read is a list nobody reads. The
answer is the same one — a narrower rule rather than a longer report.

5a. THE READER CANNOT DECIDE. Neither answer is obvious, so the export gets a
door by default. A door can be removed later; code deleted from a surface
nobody knew existed cannot be missed until it is.
