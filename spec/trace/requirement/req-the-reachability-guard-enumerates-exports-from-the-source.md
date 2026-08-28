---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: req-the-reachability-guard-enumerates-exports-from-the-source
type: "[[requirement]]"
statement: The reachability guard shall enumerate every exported entry point from the source tree and shall name each one that no surface reaches.
kind: functional
verify_method: test
breaks_if_removed: The guard keeps walking a hand-written list of two, which is how two working pieces of code came to sit behind no door at all without anybody noticing.
breaks_how_badly: crippling
refines:
  - uc-answer-every-export-with-a-door-or-a-deletion
source_refs:
  - wt-a-guard-checks-that-entry-points-can-be-got-at-and-it-walks-
  - wt-two-working-pieces-of-code-sit-behind-no-door-at-all-one-rep
priority: must
---

## Detail

THE HAND-WRITTEN LIST IS DELETED, not extended. A list somebody maintains is
the defect, and a longer one is the same defect with more entries.

WHAT COUNTS AS REACHED, and the second line is the one that matters.

| reached by | counts as reachable |
| --- | --- |
| a lane verb | yes |
| a surface the product exposes | yes |
| a test only | NO |
| another module only | NO, unless that module is itself reached |

A TEST-ONLY EXPORT IS THE CASE THIS ROW EXISTS FOR. A test proving a
capability works is precisely what makes its absence from every surface worth
reporting rather than harmless. Both pieces already found are of this kind.

THE PASS LINE IS CONCRETE AND CHECKABLE. With the hand-written pair deleted,
the guard still names those same two pieces.

## Behaviour

None. This row states one condition and one response, and a model of that
would restate the statement.
