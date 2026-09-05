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
| [ ] | the ask is small enough to review whole, or it is split first | — |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

