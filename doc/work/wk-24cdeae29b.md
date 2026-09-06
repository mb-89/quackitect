---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: unheld tokens want approaches
# where the token stands. The process owns these values.
status: open
claimed_by: f5927132/worker-tallis
claimed_at: "2026-09-06T12:13:45Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - bf327c608162ac56eafbdb49b8c2fbef6c30a67f
---

## detail

util/checks/open-tokens-carry-their-sections answers 31 failed at d1aa9e3, and every failure is a standard token with no approach chapter. The names are in the check's own output, so they are not copied here and cannot go stale.

Twenty-four are under no claim, and they are what this asks for. One of the twenty-four reads done rather than open, and it gets its approach from what it did.

Seven are held by another box, and they are not this. A holder writes the approach at step 1, which is what the ask activity is for, so a held token clears itself when its holder takes it up. wk-084e23e08b did exactly that today.

An approach is not a thing to invent for work one has not studied. Each token wants its own reading, of its detail and its done-when, and a shape a reader could disagree with before the work. So this may split again, one token per cluster, and its taker should expect that.

It is minted trivial on purpose. Minting it standard would put two more failures on the check it exists to clear. wk-d489a63ae0 is the door that stops the count growing, and this is the backlog behind it.

## proposed action

Read each unheld token the check names, and write an approach onto it from what its own detail and done-when already say.

## done when

- every token the check names that no box holds carries an approach, decided by: node util/checks/open-tokens-carry-their-sections.mjs . and reading claimed_by on each name it still prints
- no approach runs past its bound, decided by: ./RUNME.sh lint naming no doc/work file for an approach section
- each approach is a shape a reader can disagree with rather than the detail restated, decided by: a reader compares each one against its own detail

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

