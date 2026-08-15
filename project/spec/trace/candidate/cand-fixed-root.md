---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: cand-fixed-root
type: "[[candidate]]"
name: "Fixed root"
statement: "the root never moves, a record is a path underneath it, and an undecidable path refuses"
picks:
  - "[[opt-keep-one-root-and-address-the-record-inside-it]]"
  - "[[opt-one-rule-covers-reads-and-writes-alike]]"
  - "[[opt-the-tree-is-an-argument-not-part-of-the-path]]"
  - "[[opt-fan-the-method-out-to-every-tree]]"
  - "[[opt-refuse-an-ambiguous-path-by-default]]"
  - "[[opt-the-claim-file-registers-the-tree]]"
  - "[[opt-one-resolution-seam-not-a-rule-per-tool]]"
  - "[[opt-reload-the-whole-engine]]"
---

## Why this one

A CALL MEANS ONE THING FOR THE WHOLE SESSION. Nothing a person or an agent
reads afterwards depends on knowing what was bound at the time.

It is the direct answer to the probe's finding. The confusion measured on
2026-08-14 is not that the root is wrong; it is that the root changed and no
answer said so. Stopping it changing removes the class rather than reporting
it.

The tree becomes an argument rather than a prefix, so there is no grammar to
parse and a missing tree is a schema refusal.

## What it sheds

The confinement the moving root gives for free. Under a fixed root any path
can reach any record, so the accidental safety of today disappears and the
refusal has to carry the whole load.

It also pays the widest migration on the chart: every call site into a
record's content changes shape, not just its prefix.

## How it works

The lane's root is the repository, always, for the whole session. Binding a
record changes what the walk is DOING and never what a path MEANS.

A record's content is reached through two arguments rather than one string:
`{tree: <record id>, path: "spec/trace/..."}`. There is no prefix to parse,
so there is no parse to get wrong, and a missing tree is a schema refusal the
engine already issues as SE-C-046.

THE SEAM THAT MATTERS IS THE REFUSAL. With a fixed root nothing stops a path
reaching the wrong record, so the whole safety load sits on refusing what is
undecidable rather than resolving it. That refusal must fire before the write,
not after, and it is the only guard in this candidate.

Method needs no special reach because it is fanned out to every tree, so a
walk never has to name another tree to read shared content.

The claim file registers which tree holds each record, which is what makes the
`tree` argument checkable rather than free text.

## What it costs

THE WIDEST MIGRATION ON THE CHART. Every call site into a record's content
changes SHAPE, not just its prefix, and there is no form that keeps working
while the change lands.

Against that, the migration is mechanical and a missed site refuses rather
than guessing - which is the opposite of every other candidate's failure mode.

The fan-out is N writes or a reconcile pass; twenty-seven worktrees stood on
this machine on 2026-08-13, so the number is real.

It gives up the confinement today's moving root provides by accident, and buys
nothing back except clarity.

## What it leans on

- THAT A REFUSAL IS ENOUGH WITHOUT CONFINEMENT. Untested here. Every other
  candidate keeps some structural barrier; this one has only the check.
- THAT AMBIGUITY IS DECIDABLE. The refusal has to tell an undecidable path
  from a legitimate one, and nobody has enumerated the cases. raid-risk names
  four path kinds and says the bug lives at the seams between them.
- THAT THE FAN-OUT LANDS BEFORE ANYBODY READS. A tree that has not caught up
  answers from stale method, and under a fixed root nothing signals which
  copy answered.

## What happens when the engine changes

ADDED 2026-08-14, when the chart gained a row it was not drawn against.

ONE ENGINE, SO ONE RELOAD. The root never moves and the tree is a call
argument, but there is still exactly one process serving every record. An
engine edit takes effect when it restarts, and every open record restarts.

AGAINST req-an-engine-change-applies-in-its-own-record THIS FAILS BOTH
HALVES, for the same reason as the moving-root line: a step-out to reload,
and a change that reaches records that never asked for it.

THE FAN-OUT DOES NOT HELP HERE. Fanning method into every tree moves
content, not running code. The engine is one program however many copies of
the method exist.

## Answers to the demands this record had not addressed

WRITTEN 2026-08-14, when the owner ruled that an unanswered demand is an
incomplete line rather than a weakness. Each answer is what THIS design
gives.

### A resolution is proven by read-back

THE TREE ARGUMENT MAKES THE READ-BACK TRIVIAL. A write names its tree, so the
proving read names the same tree, and there is no ambiguity about where to
look. This line is the easiest on the chart to write that test against.

### Version control resolves like every call

THE ROOT NEVER MOVES, so version control resolves exactly as every other call
does, all session, with no binding to reason about. That is this line's
strongest answer anywhere.

A COMMIT TAKES ITS TREE AS AN ARGUMENT like everything else, so committing to
trunk from inside a record needs no special form at all.

### A surface resolves to what it shows

A SURFACE NAMES THE TREE IT IS SHOWING, because everything does. There is no
ambient binding for a surface to disagree with, so a panel showing one record
while the walk stands in another is expressible and correct rather than a
bug.

THAT IS A REAL ADVANTAGE OF THIS LINE and it has not been credited anywhere
else in this record.

### A method change reaches without a step-out

THE FAN-OUT IS THE ANSWER. Method is written once and landed in trunk and
every open tree in one act, from wherever the walker stands. Nobody steps
out.

WHAT IT COSTS is the drift this line's own text already records: copies in
every tree, and nothing signalling which copy answered.

### An engine change applies where it was made

NO ANSWER WITHOUT BECOMING A DIFFERENT LINE. One process serves every record.
Its code is one thing, changing it changes what every agent runs, and picking
it up needs the process back. That follows from the single process rather
than from anything unwritten.

### Entry levels the record's tree

THE FAN-OUT DOES IT AT ENTRY AS WELL AS AT EVERY WRITE. Entering a record
brings its tree level with trunk's method and commits what it brought, before
the first call.

WHY IT NEEDS ITS OWN ACT DESPITE THE FAN-OUT. The fan reaches trees that are
OPEN at the moment of a write. A record opened afterwards was not there to
receive it, so entry is the moment that catches up everything the fan missed.

THAT CLOSES THE LEAN THIS RECORD ALREADY CARRIES - "a tree that has not caught
up answers from stale method" - for the one case the fan cannot cover.

A PARTIAL LEVELLING IS THE RISK, and it is the same risk the fan carries.
req-a-method-change-reaches-every-tree states it directly - a partial fan is
worse than none, because an unsynced tree is old and self-consistent while a
half-synced one does not compile. Entry either completes and commits, or the
record does not open.

THE CITATION IS THE REQUIREMENT'S, corrected 2026-08-14. An earlier draft of
this paragraph attributed that sentence to this record, and it is not in it.
