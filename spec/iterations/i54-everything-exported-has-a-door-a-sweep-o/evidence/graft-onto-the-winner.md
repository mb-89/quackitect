---
form: graft-onto-the-winner
by: agent
signed_off: 2026-08-26T12:54:56.218Z
authors: agent
files: null
---

# Evidence form / graft-onto-the-winner

## current_situation

The winner is declared. No loser beat it on any axis, so the computed row list for this state is empty.

That is not the same as nothing to graft. The M4 gate recorded a strength of a loser that the score table never captured: Biome's suppression syntax makes the reason MANDATORY, which the winner's central list does not.

Three grafts were tried. Two were adopted and one was measured, found to cost three axes, and dropped.

## grafts

| strength | from | verdict | why |
| --- | --- | --- | --- |
| the departure's reason cannot be left empty, because the syntax refuses one that is | cand-buy-the-sweep | adopted | The winner's list takes free-text reasons and nothing forces one. Worse, the refusal's own remedy pre-fills the slot with placeholder text and nothing checks it was replaced - raid-iss-the-refusal-hands-the-author-a-placeholder-where-the-reason-goes. Adopting this costs the winner nothing and removes the tree's easiest non-answer. |
| a test that observes a real red against a violating fixture | cand-buy-the-sweep | adopted | The winner scored 2 on first-green-needs-a-red because its predicate is testable and no red was recorded. A fixture module that violates the rule, asserted to be refused, is a red the rule's first green can rest on. Cheap, and it closes the winner's weakest axis. |
| a departure cites a DECISION NODE instead of carrying prose | cand-buy-the-sweep | incompatible | THE SHAPE IS NOT THIS CANDIDATE'S. It comes from adr-grandfathers-historical at ref v2, and this pick list holds only the three drawn candidates, so it is filed under the nearest one. A clean-context hand scored the design with it: preflight fell 4 to 3, sweep-covers 3 to 2, exactness 3 to 2, against 3 to 4 and 2 to 3 gained. Net minus one. It costs more than it buys, so it is dropped rather than adopted. |
| the departure is declared AT THE SITE rather than in a central list | cand-buy-the-sweep | incompatible | Taking it scatters the departure list across every file that holds one. The winner scores 3 on sweep-covers by answering completeness from one place, and a scattered list turns that into a second sweep to gather what the first sweep must then judge. The trade is coverage for locality, and coverage is what the record was for. |
| the capability is absent unless it is handed, so the illegal reach is unrepresentable | cand-the-handed-capability | incompatible | This is rank 1 on the ranked failure modes and the winner sits at rank 3, so it is the most valuable strength on the chart. Taking it needs 29 composition roots collapsed toward one, measured 2026-08-26, and 29 of the 81 disk-reaching modules ARE those roots. The winner would give up being buildable to gain a rank it cannot enforce. |
| the whole rule costs one configuration stanza and no code anybody here maintains | cand-buy-the-sweep | rejected | It COULD be taken. Biome 2.5.6 is already installed and noRestrictedImports is one stanza away. It should not be, because that rule has no importer axis: every option it takes names what is imported and none names who imports. A door rule that cannot name the door is not cheaper, it is a different rule. |

## rescored

| axis | was | now | what_changed |
| --- | --- | --- | --- |
| req-a-wrong-act-never-passes-silently | 3 | 4 | Graft 1 removes the placeholder that let a reasonless departure be written and then ignored in silence, and graft 3 shows the refusal actually fires, which is par with Biome noRestrictedImports and its refusal of an explanation-free suppression. |
| req-first-green-needs-a-red | 2 | 3 | Graft 3 makes the first green follow an observed refusal of a real violating fixture; it stops at 3 because a negative-case assertion is not a recorded failing run and no named tool offers a red-before-green comparison. |
| req-a-preflight-check-asks-the-reader-where-it-looked | 4 | 4 | Only graft 2 had moved this, so it returns to 4 at par with dependency-cruiser where one config serves every consumer - graft 1 touches only the parser and the remedy text the same module emits. |
| req-sweep-covers-every-drift-class | 3 | 3 | The evasion argument does not survive graft 1 alone, since writing one sentence is too small a toll to push a reach into indirection, and graft 1 removes a silently-ignored class rather than widening what the sweep checks. |
| req-only-a-file-with-its-own-door-is-withheld | 3 | 3 | Neither graft touches what the predicate matches or which files the list can cover, so exactness sits exactly where it started. |

## follow_up

- The grafted winner scores 4, 3, 3, 4, 3, 3 against 3, 2, 3, 4, 3, 3 before. Two axes up, three unchanged, none down. That is what the design milestone should build against, not the candidate as composed.

- Graft 1 has a concrete first task and it is small. deliverable/engine/widgets.ts line 166 stops pre-filling the reason slot, and the exemption reader refuses an empty reason instead of ignoring it. That is the generalised rule's shape corrected before it is generalised.

- The citation graft is dropped and should not be quietly re-proposed. Its measurement is on this form: three axes down, two up, net minus one. A later record wanting it must answer the day-one problem the scorer named, which is that a departure cannot be recorded until a decision document exists.

- raid-iss-the-refusal-hands-the-author-a-placeholder-where-the-reason-goes was minted at this state and graft 1 is its fix. The two should travel together.

## anything_else

### Both scoring rounds are on the record, and the first one is the finding

A CLEAN-CONTEXT HAND SCORED THE DESIGN TWICE. It never saw which grafts anybody wanted.

ROUND ONE, all three grafts adopted:

| axis | was | now |
| --- | --- | --- |
| req-a-wrong-act-never-passes-silently | 3 | 4 |
| req-first-green-needs-a-red | 2 | 3 |
| req-a-preflight-check-asks-the-reader-where-it-looked | 4 | 3 |
| req-sweep-covers-every-drift-class | 3 | 2 |
| req-only-a-file-with-its-own-door-is-withheld | 3 | 2 |

THREE AXES WENT DOWN. Its reasons, in its own words: the citation splits a departure's justification across the list entry and a decision document that does not exist in this tree; a legitimate departure becomes impossible to record until that document exists; and the bootstrap pressure is toward fabricated citations.

ROUND TWO, with the citation dropped, is the table in the rescored field. Nothing goes down.

### Why that matters more than the numbers

THE CITATION GRAFT WAS THE ONE I MOST WANTED. It came from reading a predecessor decision, it was the strongest thing this milestone found, and the declaration and the reverse-sensitivity form both recommend it.

A SECOND HAND MEASURED IT AND IT LOST. The state's guidance says exactly why this step exists: a graft is adopted because it helps on the axis somebody was looking at, and nobody asked what it did to the axes they were not looking at.

THIS IS THAT, HAPPENING. The recommendation is withdrawn on evidence rather than kept because it was well argued.

### What is NOT withdrawn

THE READING OF THE PREDECESSOR STILL STANDS. adr-grandfathers-historical rules that an exemption cites a decision, and it is absent from this tree. That fact is correct and it is what makes the day-one problem real: there are no decision documents to cite yet.

SO THE GRAFT IS DROPPED FOR THIS RECORD, not judged wrong forever. A tree that already carried decision documents would score it differently, and the scorer's own reasons say so.
