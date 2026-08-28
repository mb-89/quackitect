---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-iss-a-functional-requirement-the-design-touches-is-dealt-nowhere
type: "[[raid]]"
status: closed
kind: issue
statement: The architecture milestone deals every quality requirement and no functional one, so a design can contradict a fatal must and no state notices.
grade: fatal
against:
  - req-structure-verdicts-are-mechanical
source_refs:
  - gate-architecture cold review, 2026-08-26
  - deliverable/machines/forms/templates/scenario-deck.md
  - req-archive-shows-it-as-it-closed
---

## CLOSED AS WORK, NOT AS A FINDING — 2026-08-26

THE HOLE IS REAL AND THE FIX IS OURS TO MAKE. A method that deals only quality
requirements can be widened by us, so it is work rather than an issue.

THE SWEEP THIS ENTRY DEMANDED WAS RUN, as a program over all 267 functional
requirements, and its result stands below. That part is done rather than owed.

## What the check actually does

THE DECK IS COMPLETE AND THAT IS NOT THE FINDING. Its template says the cards
are "every requirement with `kind: quality`", and the engine refuses to let the
state leave while one is unruled. It counted 57 and 57 were ruled.

THE HOLE IS WHAT IT NEVER DEALS. A requirement with `kind: functional` enters no
deck at any state of the architecture milestone, whatever its grade and whatever
its priority.

## How it showed up here

THE WINNER DELETES A CLOSED RECORD'S FOLDER FROM THE WORKING TREE. Three
functional requirements are about exactly that, and none was mentioned in the
element matrix, the evaluation, the decision records or the winner's own form.

- [[req-archive-shows-it-as-it-closed]] — `must`, graded FATAL, asking for zero
  states omitted and zero bytes differing.
- [[req-how-a-record-was-worked-survives-its-closing]] — minted by this very
  iteration, and never held against its own design.
- [[req-archive-opens-to-a-person-only]] — `should`, and the graft state DID
  score it, at 2, which is the one of the three that was seen at all.

THE FIRST ONE IS THE SHARP ONE. A must graded fatal that the design appears to
contradict, reaching a gate unmentioned, is the exact failure that a must
outranking a score exists to prevent.

## Why nobody was careless

THE DECK LOOKS LIKE COVERAGE. It is complete, it is mechanical, it refuses when
a row is unruled, and it reports 57 of 57. Every signal it gives says the
requirements were walked.

SO COMPLETENESS OF THE DECK STOOD IN FOR COVERAGE OF THE CORPUS. That is a cheap
proxy passing for the real thing, which is the shape five failed first reviews
at this project have shared.

## What closes it

A SECOND DECK, OR A WIDER ONE. The architecture milestone needs to deal every
requirement the design touches, not every requirement of one kind. Which shape
it takes is the method's decision and not this record's.

AN INTERIM RULE COSTS NOTHING: at the architecture gate, search the requirement
corpus for what the chosen design changes, and rule those rows in the gate form.

RUN IT AS A PROGRAM, NOT BY READING. The by-hand pass at this gate ruled three
rows and missed a fourth, which a review then found. The script is
`scratchpad/sweep-functional-rows-the-fold-touches.mjs` and it took one run.

## The sweep, run properly and as a program

BY HAND IT MISSED ONE, and a review found it. So it was run again as a script
over all 267 functional requirements, which cannot skip one the way reading them
one at a time did.

THE KEYWORD FILTER IS LOOSE ON PURPOSE and its raw count is not a finding. 42
rows mention the archive, a folder or closing. Most of those words are ordinary
English in this corpus, so the list is a candidate set and the judgment is
still a person's.

SEVEN ARE GENUINELY TOUCHED, beyond the four already ruled below.

- [[req-archive-read-only]] — fatal, must. AT RISK. An edit targeting an
  archived record must be refused. The archive used to be a folder and is now a
  file on trunk, so a guard matching a folder path stops matching. The rule is
  unchanged; what it must point at is not.
- [[req-a-records-own-status-decides-whether-it-is-open]] — crippling, must.
  AT RISK. Status is read from the record's own status field, and after the fold
  that field is inside the folded file. It must still be readable without
  unfolding the whole thing.
- [[req-a-shipped-record-is-never-reclaimed]] — crippling, must. AT RISK, and
  for the same reason: it reads status off the record.
- [[req-record-status-comes-from-the-record]] — crippling, must. HOLDS, and it
  is the strongest corpus support the archive decision has. It already says the
  engine shall RESOLVE THE ARCHIVE THROUGH GIT, and that a finished record keeps
  no folder. A blessed must demanding what the winner does, cited nowhere in the
  candidates, the structure or the evaluation until now.
- [[req-every-record-path-resolves-in-one-tree]] — crippling, must. HOLDS. The
  commit read is history rather than a second working tree, so no call selects
  between trees. Worth saying because it reads like a breach and is not.
- [[req-close-refuses-loose-ends]] — fatal, must. HOLDS. Closing gains a step
  after the refusal; the refusal itself is untouched.
- [[req-close-leaves-trunk-clean]] — corrosive, should. HOLDS, and the fold
  helps it. The fold's own commit is what leaves trunk clean.

THREE AT RISK AND FOUR HOLDING. The three share one shape: something that used
to read a folder now has to read a file, and none of them knows it yet.

## What was ruled here, by hand

- [[req-archive-shows-it-as-it-closed]] HOLDS, and only after the fix. The fold
  is now stated lossless and verbatim in the element that owns it. Before that
  edit the corpus said a form "becomes a line in one file", which reads as a
  retelling and fails the row.
- [[req-how-a-record-was-worked-survives-its-closing]] HOLDS. The fold carries
  every settled piece of work, not only the conclusions.
- [[req-archive-opens-to-a-person-only]] IS DEGRADED and nothing addresses it.
  It is `should`, so it does not gate. Its own entry carries the detail.
