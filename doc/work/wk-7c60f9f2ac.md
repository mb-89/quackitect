---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: asked criterion contradicts ruling
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
# true when this waits for a person rather than an agent
needs_human: true
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 6ddd8aba4fd075e70ae7444eaa43c898440245da
  - 212474764f575390299e7de6bf6e913b1c02697d
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 4f772760478d0f4023e09605242b7863697abd8b
  - f555f62e45de4ea49f6b3e8fdde4d6c3e8199e3d
---

## detail

wk-8fa7785eab carries this criterion: a standing claim of asked, made by an actor holding one token, is refused at the first two Stop events and granted at the third. The code does the opposite on purpose. decideStop reads len(held) > 0 and c.Because is not asked, and the comment above it carries the owner's words. If the user tells you that you stop, the sub tokens do not matter. You stop. TestAskedIsGrantedOnTheFirstClaim pins that. So the criterion cannot be made true without undoing a ruling, and it cannot be ticked as written. A person decides which stands. If the ruling stands, the criterion wanted a reason the engine does argue with, such as plan or decision, and the wording is the fix.

## proposed action

Ask the owner. If the ruling stands, reword the criterion on wk-8fa7785eab to name a reason the engine argues with, and leave the code alone.

## done when

- a person says whether asked is argued with over open work, and the answer is written here
- the criterion or the code agrees with the other, and TestAskedIsGrantedOnTheFirstClaim says which

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

