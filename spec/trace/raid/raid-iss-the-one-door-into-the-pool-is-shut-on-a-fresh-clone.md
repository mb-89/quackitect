---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-iss-the-one-door-into-the-pool-is-shut-on-a-fresh-clone
type: "[[raid]]"
kind: issue
statement: "A work token is minted only by draining a note to backlog. A fresh clone has no notes, so the pool can never be filled from a cloud run."
owner: the maintainer
trigger: every cloud run that wants to park work for later
status: open
impact: "The pool stands at zero tokens today. Work a cloud session defers has nowhere mechanical to go, so it becomes prose in an evidence form that nothing queries."
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - raid-iss-an-ephemeral-box-loses-the-whole-record-of-a-session
  - raid-asm-a-fresh-clone-s-empty-inbox-means-no-local-state
  - tsp-one-door-into-the-pool
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
---

## What was observed

MEASURED 2026-08-19, twice in one iteration.

AT i5's KICKOFF: "se_survey reports 0 pending notes and 0 work tokens, and
.se/notes.jsonl does not exist on this container."

AT i5's RETRO, the same afternoon: `spec/trace/work-token/` holds no
files at all.

BETWEEN THOSE TWO POINTS i5 decided to park two bundle items with ready-when
conditions. Neither became a token. Both are sentences inside signed evidence
forms, which travel, and which nothing queries.

## Why the door is shut and not merely unused

THE MINT IS ON THE DRAIN. `se_note_drain` with disposition backlog is what
writes a token, and draining is legal only in a retro.

A NOTE IS LOCAL. It lives in `.se/notes.jsonl`, which does not survive a
container, so on a fresh clone there is never anything pending to drain.

SO THE ONLY PATH TO THE POOL STARTS AT AN ARTIFACT THAT CANNOT EXIST HERE. It
is not that nobody used the door; the door has no handle on this side.

## What repair consists of

- A retro on a clone with no inbox must still be able to mint a token, from a
  finding it authored rather than from a note it drained.
- The raid register is the workaround this record used, and it is a good one:
  entries are typed, queryable and on trunk. If the pool and the register are
  redundant, say which one wins and retire the other.
- Whatever the answer, a cloud session must have ONE mechanical way to park
  work that another clone will find.
