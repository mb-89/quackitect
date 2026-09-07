---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: a close hides paths
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
claimed_by: 7e7f0da1/main
claimed_at: "2026-09-07T09:19:16Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 6de37a61fc50e5540f4880a07a4e639eded480f8
---

## detail

A close writes two things and the hand landing it names one. The submit answers settled and says nothing about which paths moved, so the hand lands what it remembers.

MEASURED, 2026-09-07, three times in one session, and caught by the stop hook rather than by anything the engine said. wk-aa9c98250a and wk-0200291ebb both closed, both had their note landed with the evidence, and neither row reached doc/work/archive.jsonl on the branch. The record there read them as still open. One land of that one file put both right.

wk-bf10a262a0 carries the other direction, in its own words: the hand landing a close names doc/work/archive.jsonl and forgets the note it just deleted, because the note is gone and nothing lists it. Same defect, other half.

Nothing catches it. The stop hook says the tree is dirty and names no path, and on this box it is dirty for a reason the owner has to rule on, so it is red on every stop whatever else is true. The one thing that could catch it is the submit, which knows exactly which files it wrote.

## proposed action

Have the submit answer the paths that close wrote, deletions among them, in the settled notice. The engine writes the note, the row and sometimes a deletion, so it is the only thing that knows all three. A hand then lands what it is told rather than what it remembers, and a hand that forgets is answering a list it was given.

## done when

- a settled submit answers the paths that close wrote, and a Go test over a close naming a note and an archive row reads both back
- a close that deletes the note names that path too, and the same test reads it
- the notice a person sees carries the same list, so a hand with no lane can land from it

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

