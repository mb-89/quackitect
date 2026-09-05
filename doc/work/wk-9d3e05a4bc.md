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
status: open
---

## detail

The pull hands work out oldest first. Urgent is a flag rather than a rank, and what it says is before the others.

Urgent is set on no open tracked token today. A search for the field over doc/work is the command that answers it.

The token saying the branch head does not build sits in date order behind everything older. That is the most blocking thing in the tree, and nothing about the queue knows it.

The schema says why the flag stays unused. What comes first is said by the person watching the queue, and nobody is watching. A second flag set by hand would go the same way.

What the engine can answer on its own is whether a token unblocks other hands. A red standing check stops everybody, and the engine already records which checks are red.

## approach

The pull gains a sort key under urgent and above the date.

A token is blocking when a standing check it would turn green is red now. Every done-when line already names the check where its criterion is decided. The tie between a token and a check is written on the token.

The engine reads the recorded check answers for which are red, and ranks a token naming one of them first. It runs nothing to decide the order.

Urgent stays as it is, because a person still needs a way to say what comes first for a reason no check can see.

## done when

- the pull ranks a token naming a red check first, decided by: two open tokens, one red check, then a pull
- the ranking reads recorded check answers and runs no check, decided by: a pull over a tree with no run in flight
- urgent still goes out ahead of the derived rank, decided by: a test with one urgent token and one naming a red check
- a tree with no red check pulls in the order it does today, decided by: a pull over a green tree

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | the approach names the sort key, where it sits against urgent and the date, and what it reads to decide | the approach section |
| [x] | every done-when line is decidable, and names the command where one decides it | every line by a pull over a tree built for it, and line 3 by a test | the done when section |
| [x] | the change is small enough to review whole, or it is split first | — |  |
| [x] | the basics it stands on exist, or are minted first | the done-when lines already name their checks, and the engine already records check answers |  |
