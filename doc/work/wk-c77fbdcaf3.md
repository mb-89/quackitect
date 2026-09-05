---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: lock reason speaks code
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-dutilleux
claimed_at: "2026-09-05T16:40:51Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - da137f474878a1c4a9c6ed8191fe7ddbc67953e3
---

## detail

A finding from the verdict on wk-0086ed9e9b, "adapter decides no column".

Moving the ruling into refusedByHand (src/engine/field.go) is right. But three columns fall through to the default at field.go:79 and now show the compiler's sentence in a tooltip:

  this program does not write "subs"

seq, type and subs land there. The editor's list that was deleted said "the engine decides this" for seq and type and "a list is edited in the note" for subs, which is what the token's own detail quotes as the wording being preserved. A person hovering a locked cell now reads a line written for whoever calls WriteFieldBy.

THE CHECK THAT WOULD HAVE CAUGHT IT was loosened in the same commit: render-check.mjs's "a locked cell says why" went from /title="a pull moves this/ to /title="[^"]+"/, so any non-empty string passes.

THE FIX is a case in refusedByHand for seq, type and subs with the words a person needs, and a render-check line that asks a locked cell's reason to be a sentence and not the default.

## done when

- refusedByHand answers seq, type and subs with a reason written for a person, and none of them falls through to the 'this program does not write' default: a Go test asserts the three reasons and that none contains 'this program does not write'
- util/checks/render-check.mjs asserts no locked cell on the drawn page carries a title matching 'this program does not write', and it was seen red against HEAD's field.go first

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | two case labels in field.go, one Go test and one block in render-check | read whole |
| [x] | every done-when line is decidable, and names the command where one decides it | the first names a Go test, the second names render-check. Both were run through the engine's door | ./RUNME.sh test --on wk-c77fbdcaf3 --by worker-dutilleux --propose TestALockedColumnSaysWhyToAPerson |
| [x] | the basics it stands on exist, or are minted first | refusedByHand is the one ruling, viewlocked_test.go already drives it, and render-check already draws the real page. se query takes a view by path, so a page naming the three columns needs no new door | se query --view a base of its own |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token, in the prompt | — |
| [x] | one test was written first and seen red for the reason expected | both were. The Go test: seq falls through to the default and a person reads this program does not write seq. render-check: one reads that sentence, over 483 locked cells | 1 failed each |
| [x] | the same test was seen green after the change, and named | TestALockedColumnSaysWhyToAPerson ok, and render-check's two new lines ok over 477 locked cells | RUNME test |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | seq and type join the engine's-own case, subs the relation case, reusing wording there | git diff |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | my first commit reverted another hand's fix to this file, put back in the next. The engine still drops an empty declared group, and wk-8e9a4d03ac carries that | put back |

