---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-a-surface-silence-is-answered-in-the-record
type: "[[requirement]]"
statement: "While a register entry stands open recording a question the owner's drawing does not answer, the system shall carry that entry as outstanding work on every state whose evidence rests on the surface the question is about."
kind: functional
verify_method: test
breaks_if_removed: "An unanswered question about a drawing sits in the register where nobody working the affected state can see it, the design guesses, and a second source ages on its own — which is the divergent-copy failure this system already hunts."
breaks_how_badly: crippling
refines:
  - uc-work-a-states-work-tokens-to-completion
  - uc-read-what-the-system-owes-and-what-it-is-doing
source_refs:
  - raid-dep-the-editor-s-specification-is-a-drawing-the-owner-owns
  - "owner ruling: a drawing of a surface is that surface's specification, and nobody rewrites it into prose"
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

THIS ROW WAS RESTATED AFTER A SECOND COLD REVIEW. It demanded something of
the RECORD — that a ruling be written down — which is a process demand wearing
a requirement's clothes. A requirement demands of the system.

WHAT THE SYSTEM ACTUALLY OWES is visibility. The question is already in the
register; what was missing is that nobody working the affected state sees it
from where they stand.

SO IT IS NOW DERIVED RATHER THAN CROSS-CUTTING. Working a state's work tokens
to completion cannot finish while work is outstanding, and this row says an
open question about a drawing is such work. Reading what the system owes is
where the person sees it.

SOMEBODY ELSE OWNS THE SPECIFICATION, and that is why the answer cannot be
reasoned out. The design has to ask, and the register entry is the asking.

AN ANSWER GIVEN IN CONVERSATION AND WRITTEN NOWHERE LEAVES THE ENTRY OPEN,
which this row then makes visible on every state that depends on it.

THREE SILENCES ALREADY FOUND, and none is answered yet.

| silence | why it matters |
| --- | --- |
| does a grouping assigned to a state hold that state open | a record's own grouping must gate, or the record finishes with work outstanding |
| what reaches the children's half of a summed count | a machine opens only its own, so the rest is a number nobody can act on from where they stand |
| what happens to the contents when an assigned grouping is deleted | falling back to no home would quietly remove a record's scope |
