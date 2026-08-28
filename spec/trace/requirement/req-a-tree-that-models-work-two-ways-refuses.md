---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-a-tree-that-models-work-two-ways-refuses
type: "[[requirement]]"
statement: If some states in a tree hand out pieces of work while others still hand out evidence forms, then the system shall report the tree as red and shall name the states that have not been converted.
kind: functional
verify_method: test
breaks_if_removed: A count covering half the states looks exactly like a count covering all of them, and a partial count read as a whole one is worse than no count at all.
breaks_how_badly: corrosive
refines:
  - uc-read-what-the-system-owes-and-what-it-is-doing
  - uc-work-a-states-work-tokens-to-completion
source_refs:
  - raid-risk-a-half-migrated-tree-runs-two-systems-at-once
priority: should
weighs_with:
  - none
weighs_against:
  - req-every-place-work-is-modelled-is-named-in-one-list > refusing the second model prevents the divergence; listing where work is modelled only helps somebody find it
  - none
---

## Detail

THE SURFACE ASSUMES TOTALITY. A count of three means three things are owed
here. If some of what is owed still lives in an unconverted form, the count
is quietly wrong and looks right.

THE MIGRATION IS WIDE: every state of every machine, every evidence field in
every form, and every method card with steps in it.

TWO ANSWERS EXIST AND THIS ROW TAKES THE STRONGER ONE. A check that refuses
a mixed tree makes the partial state visible. A count that footnotes what it
does not cover is weaker, because a footnote on a number is read less often
than the number.

ONE ORDINARY EVENT PRODUCES THE MIXED TREE: the round runs out of time with
the engine converted and some method cards not, or the other way round.
