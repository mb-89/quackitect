---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: archived tokens come back
# where the token stands. The process owns these values.
status: open
---

## detail

A token submitted done, written into doc/work/archive.jsonl and tagged refs/tags/archive, can still have its note sitting in doc/work. The queue reads the note, sees status open, and hands the finished work to another agent.

wk-43c65d49f6 caught it. It was archived done: a line in doc/work/archive.jsonl, the tag archive/wk-43c65d49f6, the note deleted from git. Yet doc/work/wk-43c65d49f6.md was on disk untracked with status open and blank evidence, so a second worker was handed work already on origin/v4 and spent a turn proving shipped code green.

It is not one stray file. Reading every id out of doc/work/archive.jsonl and asking whether doc/work/id.md exists: 21 of 72 archived ids still have a note on disk. A fifth of the finished work can be handed out twice.

The note reappears untracked, so it is written after the archive removed it, or it survives the removal and is never staged. Either the archive does not delete the note on every path it takes, or something restores doc/work from a stale copy after it.

The archive record and the tag are the truth about a token. The note is not.

## proposed action

Decide who wins between the archive record and the note, then hold it with a check.

The read side is cheap and safe: the queue already knows doc/work/archive.jsonl, so refusing to hand out an id that is in it costs one lookup and cannot lose work. Do that first.

The write side is where the note outlives its archive line. It reappears untracked, which points at a restore from a stale copy rather than at the delete, so look at what rewrites doc/work after an archive as well as at the archive verb.

Then sweep the notes already there, and let the first done-when line measure the sweep.

## done when

- no id in doc/work/archive.jsonl has a note left in doc/work: a check reads the archive, asks for each file, and the count is zero
- a token archived done is never handed out again: a check archives a token, puts its note back on disk with status open, pulls, and the queue does not answer with that id
- the notes already on disk for archived ids are gone, measured by the first line above

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

