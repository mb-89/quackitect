---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: format names what changed
# where the token stands. The process owns these values.
status: open
---

## detail

FormatGo in src/engine/format.go runs gofmt -l -w over a folder and, when the run ends badly, does one.Changed, one.Refused = nil, "gofmt could not read ...". gofmt ends badly when any file in the folder will not parse, and it formats every other file all the same. Measured on this box: a folder holding ok.go and an unparseable bad.go answered exit 2, printed bad.go's parse error and the name ok.go together, and rewrote ok.go. So the verb wrote a file and answered changed: [] with a refusal.

The comment above the call says why -l is passed: without it the verb changes files and says nothing, and a reader cannot tell a tree that was already straight from one it just straightened. The nil undoes that on the one run where it matters.

What is gained by doing it is that se format tells the truth about what it wrote when the tree is broken, which is when a reader most needs the list.

What breaks if it is never done is that an agent told by writing-go rule 15 to run se format before every commit gets files rewritten under it with no record, and finds the change only in git status.

## proposed action

Keep the lines gofmt named as changed and put the parse error in Refused beside them, rather than clearing one for the other. The two streams arrive mixed through CombinedOutput, so separate them or take the -l list off stdout alone.

## done when

- a folder holding one unparseable file and one gofmt would change answers with the changed file named and the parse error in refused, decided by: a test that builds both files and reads the answer
- the file gofmt rewrote is named in changed, decided by: the same test reading the answer against the file on disk

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

