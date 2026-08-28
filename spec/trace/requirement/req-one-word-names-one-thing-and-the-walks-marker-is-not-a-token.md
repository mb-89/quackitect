---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-one-word-names-one-thing-and-the-walks-marker-is-not-a-token
type: "[[requirement]]"
statement: The system shall use the word token for a piece of work and for nothing else, naming the walk's own marker the position wherever it appears in the engine, the machines, the guidance and the refusal clauses.
kind: constraint
verify_method: inspection
breaks_if_removed: One word names two different things across every surface a reader meets, so a refusal about the walk's marker reads as a refusal about work and neither can be searched for.
breaks_how_badly: corrosive
refines:
  - uc-walk-a-record-on-a-smaller-model
  - uc-take-a-step
source_refs:
  - "record.md lines 67 to 79: the owner ruled it — rename the walk's marker to THE POSITION, and every other use is renamed rather than qualified"
  - SE-C-123 in guidance/refusals.md, which says a three-way join used to be unreachable by a single token
  - req-the-product-name-is-one-fact
priority: should
weighs_with:
  - none
weighs_against:
  - req-a-carrier-grouping-ends-when-it-empties > a word meaning two things misleads every reader of the corpus, where an empty grouping left standing is one stale row
  - none
---

## Detail

WHY THE MARKER WAS CALLED A TOKEN AT ALL. Several agents walking at once were
expected, and the word came from that expectation. The expectation is dropped,
so the name has nothing left holding it.

WHERE THE COLLISION LIVES, and the sweep has to reach all four.

| surface | what carries the old word |
| --- | --- |
| the refusal clauses | SE-C-123 and its neighbours |
| the guidance | the walking card and the contract |
| the machines | state notes and condition notes |
| the engine | the code that moves the marker |

RENAMED RATHER THAN QUALIFIED. Writing work token beside walk token leaves
both words in the reader's way and fixes nothing.

IT IS A CONSTRAINT RATHER THAN A FUNCTION because nothing the system DOES
changes. What changes is what a reader is told, and the failure it prevents
is a reader acting on the wrong meaning.

THE SMALLER-MODEL JOURNEY IS WHY IT IS NOT COSMETIC. That use case turns on
every name in an answer resolving to something real, and a word meaning two
things is exactly the gap a hand that infers nothing falls into.
