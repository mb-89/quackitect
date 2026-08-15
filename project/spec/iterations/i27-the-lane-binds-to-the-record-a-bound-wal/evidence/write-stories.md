---
form: write-stories
by: agent
signed_off: 2026-08-13T19:18:30.829Z
authors: agent
files:
---

# Evidence form / write-stories

## current_situation

map-stakeholders is signed. Four resident roles, no additions, dispositions re-checked.

TWENTY-SIX STORIES ARE RESIDENT and this iteration writes none. The field carries the covering set, one story per value prop, because coverage is over the whole prop set rather than over what changed.

TWO OF THEM ARE ALTERED BY THIS ITERATION, and one documents the very loop it removes. sty-improve-the-machine-mid-walk narrates the escape-edit-return loop as the way method gets fixed mid-walk, with its second slide cited to a real commit. After the fan-out lands that slide is wrong: the edit happens in place and reaches every tree. THE CLAIM SURVIVES AND THE PROOF DOES NOT, which is what a re-check exists to catch.

## stories

- project/spec/trace/story/sty-improve-the-machine-mid-walk.md
- project/spec/trace/story/sty-work-on-two-machines.md
- project/spec/trace/story/sty-hand-over-and-walk-away.md
- project/spec/trace/story/sty-what-a-quality-is.md
- project/spec/trace/story/sty-let-the-system-catch-up.md
- project/spec/trace/story/sty-land-the-work.md
- project/spec/trace/story/sty-look-at-a-closed-record.md
- project/spec/trace/story/sty-vendor-it-into-my-product.md

## follow_up

generalize-use-cases is next and it inherits a covering set of eight, of which two are altered and three more are suspected.

WHAT THE ALTERED STORIES OWE DOWNSTREAM.

sty-improve-the-machine-mid-walk needs its second slide re-proven once the fan-out lands. The claim stays; the proof changes from a step-out to an in-place edit reaching every tree.

sty-work-on-two-machines is the story problem (a) serves. Two machines work one product without colliding, and the ledger keeps half of it today.

WHAT I DID NOT DO, said rather than implied. I opened two stories against the change. THREE MORE ARE LIKELY TOUCHED AND UNOPENED: sty-look-at-a-closed-record, because the archive starts reading through git and a finished record's worktree is deleted; sty-land-the-work, because the commit unit becomes the state; sty-hand-over-and-walk-away, because the walk-back cost is in scope. All three are in the list above for coverage, and none has been re-read against the change.

THE RE-CHECK IS PARTIAL AND THAT IS THE FINDING. write-requirements owes the sweep, because a requirement sourcing to an unchecked story sources to a claim nobody re-read.

## anything_else

ONE OBSERVATION ABOUT THE CHECK ITSELF, worth keeping.

The coverage check demands every value prop be covered by a story named in this field. That is right for a first iteration authoring the set. For an INHERIT iteration it means listing eight stories to say that two changed.

The result is a field where six entries carry no information about this iteration and two do. A later reader cannot tell them apart from the field alone; only the prose says which is which.

NOT A DEFECT, and not filed as one. The alternative - coverage over the CHANGED props only - would let an iteration quietly drop a prop nobody serves any more. The cost is that an inherit state's evidence looks fuller than its work.
