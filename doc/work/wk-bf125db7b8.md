---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: isTheStopVerb has no caller
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
---

## detail

FOUND REVIEWING wk-8863048da6, which deleted the argument over a claim.

isTheStopVerb in src/engine/hook.go has no caller. Its only one was the reset in decidePreToolUse, `forgetRefusedStops(roots, "claimed:"+actor)` under `if !isTheStopVerb(in)`, and wk-8863048da6 deleted that reset with the count it fed.

Twenty-two lines of body survive it, and so does a header that explains a rule the tree no longer has: "Every other call puts the argument back to its start, and counting this one as work reset it between every claim and its own Stop event, so the count never reached three at all." A reader meeting that comment learns a rule that was deleted.

wk-8863048da6 said its own scope was that TheChallenge and claimsBeforeAStopIsGranted go "with their file, because nothing else uses them". This helper is the same case and was missed, because it lives in hook.go rather than in challenge.go.

Go compiles an unreferenced function without a word, so nothing in the build says this.

## proposed action

Delete isTheStopVerb, its header and any import it alone needed.

## approach

Delete the function and its comment from src/engine/hook.go. Nothing else changes: se find over src answers two hits, the header and the definition, and no test names it. Build the engine to prove no import went unused with it.

## done when

- no code names isTheStopVerb, decided by: se find --regex isTheStopVerb --path 'src/**' answering zero hits
- the engine still builds, decided by: go build -C src/engine ./... exiting zero

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
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

