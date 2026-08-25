---
kind: matrix-row
name: gate-inputs
statement: "GATE inputs: did we understand the users - adjudicated against the M1 frame."
state_kind: gate
busbar: true
filled_by: agent
depends_on:
  - draw-context
  - map-stakeholders
  - generalize-use-cases
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_run
  - se_web_search
  - se_web_fetch
evidence:
  - name: picture_judged
    description: the judgment the counts cannot make — are these the right journeys, and is any one of them wrong?
  - name: unspecified_capability
    description: every lane tool and every offered door, against the use cases — an uncovered capability that is in scope FAILS this gate
  - name: passes_concrete
    description: is every pass written concretely enough to script at M6 — the formulated stage of the example system, which at M2 IS the story slides
major: full
minor: none
patch: none
product: full
specification: tailored
major_note: |
  Applies in full, scoped to the change and everything it invalidated:
  props realized and stories generalized. Roles are covered, and the excluded-use list
  current. The gate's reason is strongest exactly here - system-level
  writing on a wrong user picture is what a major cannot afford.
minor_note: |
  FOLDED INTO THE REQUIREMENTS GATE. With context
  and stakeholders struck at this size, this gate would guard stories and
  use cases alone - and both feed gate-requirements, which reviews them in
  the same breath.

  NOT DROPPED, MOVED. The inputs judgment is made, once, at M3's gate.
patch_note: |
  Does not apply. The user-level picture did not move, so there is nothing
  for the gate to judge. STRIKE PROPOSAL - owner adjudicates.
product_note: |
  The product-level bless of the user picture. Standing obligation: the
  picture stays blessed - an invalidated story or a new unblessed role
  reopens this gate through the suspect path.
specification_note: |
  DOCUMENT FORM: the gate record, as at every gate - filled form plus
  bless, rendered into the derived milestone table. No prose chapter of
  its own.
---

## Guidance

The user-level picture stops here for judgment before any system-level writing starts - requirements written on unblessed stories propagate garbage. Review per [[meth-gate-review]].

THE COUNTS ARE NOT EVIDENCE HERE. Every proposition realized by a story, and every story inside a use case, are COMPUTED - `covers: value-prop` at write-stories and `covers: story` at generalize-use-cases. This gate used to ask for all three in prose, and got a paragraph that agreed with the engine until the day it did not. They are struck. If a coverage rule is red, the feeder state never signed and this gate cannot stamp; there is nothing left for a person to attest.

SO THIS GATE ASKS ONLY WHAT A PERSON CAN SEE AND THE ENGINE CANNOT.

A HOLE FOUND BY JUDGMENT AND LISTED IS A FAIL, NOT A DISCLOSURE.

This is the rule the gate exists for, and it was broken the first time it ran.
Four capabilities with no use case were found by hand and written down, and
the gate recommended pass anyway.

Naming a gap does not close it. Either the capability is genuinely out of
scope, and then it belongs in the non-goals, argued. Or it is in scope, and
the gate FAILS until it has a use case.

WHERE THE UNSPECIFIED LIST COMES FROM. Not from imagination.

The lane's tool list and the machine's offered doors are enumerations the spec
did not write. They can be compared against the use cases mechanically.

Until that check is built (note-9c5253b4da67) it is walked by hand HERE,
against the live tool list and the live doors. The walk is written down so the
next reviewer can repeat it.

PRIOR ART MEANS A COMPARISON, not a citation. Naming Cockburn proves a shape was borrowed. It says nothing about whether this user picture survives against systems people actually use.

EXAMPLES ARE FORMULATED HERE, NEVER EXECUTABLE. The example system has three stages: formulated at M2 and M3, scripted at M6, demonstrated at M8. At this gate the story slides ARE the formulated examples and nothing is runnable yet, which is correct rather than a shortfall. The field asks whether the passes are concrete enough to script later.
