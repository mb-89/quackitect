---
minted_in: i51-work-running-out-of-sight-reports-itself
id: opt-the-answer-names-when-to-ask-again
type: "[[option]]"
statement: the entry says when it is worth asking again, so the interval between asks is decided by the thing that knows how the work is going rather than guessed by the caller
cluster: cluster-the-telling
found_by: transform
source: "SIT Attribute Dependency, via meth-scamper — make the ask interval vary with the reported progress, where the two were independent"
---

## Mechanism

TWO ATTRIBUTES THAT DO NOT VARY TOGETHER TODAY. How much longer the work
needs, and how long the caller waits before asking again.

The second is a guess made by the caller with no information. The first is
computed by the thing that has all of it.

MAKE THEM VARY TOGETHER. The entry carries a next-ask time alongside the
duration, and the caller waits that long.

## Why it is not the same as reporting a duration

A DURATION IS ABOUT THE WORK. A next-ask time is about the ANSWER, and the two
come apart in both directions.

- A job forty seconds from finishing is worth asking about in forty seconds.
- A job two hours from finishing on a stale estimate is worth asking about in
  five minutes, because the estimate itself is what needs refreshing.
- A job that cannot estimate at all still has a sensible next-ask time, and
  that is the case where this option earns everything.

THE NO-ESTIMATE CASE IS THE POINT. `req-a-time-remaining-names-its-basis`
forces an honest "cannot estimate", and an honest answer with no guidance
leaves the caller exactly where it started. A next-ask time gives that caller
something to act on without inventing a duration.

## What it costs

ONE MORE FIELD, AND A RULE FOR COMPUTING IT that is not simply the duration
rounded. A next-ask time that is always the duration has added a field and no
information.

AND IT CAN BE WRONG IN A NEW WAY. A next-ask time that is too long leaves work
finished and unnoticed, which is the failure
`opt-the-account-rides-every-answer` exists to catch. The two are complements
rather than alternatives.

## What it does not do

It does not stop a caller asking sooner. Nothing here refuses an early ask, and
nothing should — a caller with nothing else to do is entitled to look.

## Where the same shape already exists

An HTTP response can say when to retry, and the pattern is old enough to be
unremarkable. What makes it worth minting here is the no-estimate case, which
is ours rather than the pattern's.
