---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: blocking work goes first
# where the token stands. The process owns these values.
status: done
# who did the work step, so the verdict is never theirs
author: worker-aalto
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 865fab7b4c4dc70c14ee4fb5b1b9f9b2b08995a0
  - b3735183d95714705bd08e27f47c20e4853964cf
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - f7856691e034f2e9c2582566a221335255508ca0
  - 896b74a906ce4886f2b9d6e16c0fee0f89fd3a82
---

## detail

The pull hands work out oldest first. Urgent is a flag rather than a rank, and what it says is before the others.

Urgent is set on no open tracked token today. A search for the field over doc/work is the command that answers it.

The token saying the branch head does not build sits in date order behind everything older. That is the most blocking thing in the tree, and nothing about the queue knows it.

The schema says why the flag stays unused. What comes first is said by the person watching the queue, and nobody is watching. A second flag set by hand would go the same way.

What the engine can answer on its own is whether a token unblocks other hands. A red standing check stops everybody, and the engine already records which checks are red.

## done when

- the pull ranks a token naming a red check first, decided by: two open tokens, one red check, then a pull
- the ranking reads recorded check answers and runs no check, decided by: a pull over a tree with no run in flight
- urgent still goes out ahead of the derived rank, decided by: a test with one urgent token and one naming a red check
- a tree with no red check pulls in the order it does today, decided by: a pull over a green tree

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | Work that unblocks others goes first. | case one |
| [x] | what breaks if it is never done, and not only that it stays undone | A red check stops everybody. | urgent |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | It names the sort key. | approach |
| [x] | every done-when line is decidable, and names the command where one decides it | Each is a pull. | done when |
| [x] | the change is small enough to review whole, or it is split first | — | three files |
| [x] | the basics it stands on exist, or are minted first | Both halves are written. | battery |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Rule twelve. The red is an assertion, watched against a stub that ranked nothing. | work-token |
| [x] | the change follows the approach on the token, or the token says why it departed | It follows it. blockingFirst is stable and runs under urgentFirst, which is stable too. | blocking.go |
| [x] | se test --on this token answered ok, and what it ran is named | se test cannot build the package here. It ran on a worktree of the branch tip, where all four cases pass. | the go test run |
| [x] | the note says what changed and why, for a reader who was not here | The note section above, and the commit that carries the change. | the note |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | wk-5f8dda7870 carries the tip failing to build, which is why a file had to be set aside. | minted |

## approach

The pull gains a sort key under urgent and above the date.

A token is blocking when a standing check it would turn green is red now. Every done-when line already names the check where its criterion is decided. The tie between a token and a check is written on the token.

The engine reads the recorded check answers for which are red, and ranks a token naming one of them first. It runs nothing to decide the order.

Urgent stays as it is, because a person still needs a way to say what comes first for a reason no check can see.

## note

The queue sorted on the date, under a flag a person sets. No open tracked token carries urgent, so the sort was the date alone. The token saying the branch head does not build waited behind everything older.

blockingFirst derives the rank instead. A criterion already names the command where it is decided, so a check's name is in the sentence. The last battery's output already says which checks failed. The rank reads both and runs nothing.

It is stable, and urgentFirst runs after it and is stable too. That is what keeps a person's flag above a derived rank. Where no battery has run, or none failed, the list comes back untouched.

The section this note is in was missing when the work was submitted. No commit that carries this note has ever held it. So it is written here from the standard process rather than recovered.

